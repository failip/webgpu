import { mat4 as Matrix4, vec3 as Vector3, quat as Quaternion, vec4 as Vector4 } from 'gl-matrix';
import { TexturedIcosahedron } from './ts/meshes/TexturedIcosahedron';
import { TexturedCube } from './ts/meshes/TexturedCube';
import { fetchShader } from './ts/utility/Fetch';
import { Entity } from './ts/entities/Entity';
import { Transform } from './ts/entities/Transform';
import { Camera } from './ts/renderer/Camera';
import { IndexedTexturedMesh } from './ts/meshes/IndexedTexturedMesh';
import { Light } from './ts/renderer/Light';
import { Cube } from './ts/meshes/Cube';
import { createMesh, loadGLTFEmbedded } from './ts/gltf/gltfLoader';
import { NormalMeshImpl } from './ts/meshes/NormalMeshImpl';
import { Renderer } from './ts/renderer/Renderer';


(async () => {
    var renderer: Renderer;
    if (!navigator.gpu) {
        console.log("WebGPU not enabled in this browser.")
    }
    const gltf_response = await loadGLTFEmbedded('models/sphere.gltf');
    const gltf_object = gltf_response[0];
    const gltf_buffer: ArrayBuffer = gltf_response[1];
    var adapter = await navigator.gpu.requestAdapter();
    var device = await adapter.requestDevice();
    var fragShader = await fetchShader('blinnphong.frag.wgsl')
    var vertShader = await fetchShader('basic.vert.wgsl')
    var canvas = document.getElementById("webgpu-canvas");
    var context = canvas.getContext("webgpu");
    let mesh: IndexedTexturedMesh = new TexturedCube("textures/Bricks071_1K-PNG/Bricks071_1K_Color.png", "textures/Bricks071_1K-PNG/Bricks071_1K_Normal.png");
    var entity: Entity = new Entity(new Transform(), mesh);
    var camera: Camera = new Camera(new Transform(Vector3.fromValues(0, 0, -5), Quaternion.fromValues(0, 0, 0, 1), Vector3.fromValues(1.0, 1.0, 1.0)));
    var light: Light = new Light(new Transform(Vector3.fromValues(10, 10, 10), Quaternion.fromValues(0, 0, 0, 1), Vector3.fromValues(1.0, 1.0, 1.0)));
    console.log(device);
    console.log(gltf_object);
    entity.transform.scale = Vector3.fromValues(2.0, 2.0, 2.0);


    let gltfmesh: NormalMeshImpl = createMesh(gltf_object, gltf_buffer);
    console.log(gltfmesh.vertexArray.length);
    console.log(gltfmesh.indexArray.length);
    var dataBuffer = device.createBuffer({
        size: gltfmesh.vertexArray.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });

    var indexBuffer = device.createBuffer({
        size: gltfmesh.indexArray.byteLength,
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true
    });

    new Float32Array(dataBuffer.getMappedRange()).set(gltfmesh.vertexArray);
    dataBuffer.unmap();
    new Uint16Array(indexBuffer.getMappedRange()).set(gltfmesh.indexArray);
    indexBuffer.unmap();
    var swapChainFormat = "bgra8unorm";
    var swapChain = context.configure({
        device: device,
        format: swapChainFormat,
    });

    var vertModule = device.createShaderModule({ code: vertShader });
    var vertexStage = {
        module: vertModule,
        entryPoint: "main",
        buffers: [
            {
                arrayStride: 24,
                attributes: [
                    {
                        format: "float32x3",
                        offset: 0,
                        shaderLocation: 0
                    },
                    {
                        format: "float32x3",
                        offset: 12,
                        shaderLocation: 1
                    },
                ],
            },
        ],
    };

    var fragModule = device.createShaderModule({ code: fragShader });
    var fragStage = {
        module: fragModule,
        entryPoint: "main",
        targets: [{ format: swapChainFormat }]
    };

    var renderPipeline = device.createRenderPipeline({
        vertex: vertexStage,
        fragment: fragStage,
        primitive:
        {
            topology: 'triangle-list',
        },

        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
        }
    });

    const depthTexture = device.createTexture({
        size: { width: canvas.clientWidth, height: canvas.clientHeight },
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    let texture: GPUTexture;
    {
        const mesh_texture = await mesh.texture;
        texture = device.createTexture({
            size: [mesh_texture.width, mesh_texture.height, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });

        device.queue.copyExternalImageToTexture(
            { source: mesh_texture },
            { texture: texture },
            [mesh_texture.width, mesh_texture.height, 1]
        );
    }

    let normal_map: GPUTexture;
    {
        const mesh_normal = await mesh.normalmap;
        normal_map = device.createTexture({
            size: [mesh_normal.width, mesh_normal.height, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });

        device.queue.copyExternalImageToTexture(
            { source: mesh_normal },
            { texture: normal_map },
            [mesh_normal.width, mesh_normal.height, 1]
        );
    }

    const sampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
    });

    const uniformBufferSize = 4 * 4 * 16 + 2 * 4 * 4;
    const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const uniformBindGroup = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: uniformBuffer,
                },
            },
        ],
    });

    canvas.onpointerdown = function (e) {
        canvas.onpointermove = function (event) {
            Quaternion.fromEuler(entity.transform.rotation, event.offsetY, event.offsetX, 0);
        };
    }

    canvas.onpointerup = function (e) {
        canvas.onpointermove = null;
    }

    canvas.onpointerleave = function (e) {
        canvas.onpointermove = null;
    }



    const aspect = Math.abs(canvas.clientWidth / canvas.clientHeight);
    const projectionMatrix = Matrix4.create();
    Matrix4.perspective(projectionMatrix, (2 * Math.PI) / 5, aspect, 1, 100.0);

    function getTransformationMatrix() {
        let modelViewMatrix = camera.transform.matrix;
        const modelViewProjectionMatrix = Matrix4.create();
        Matrix4.multiply(modelViewMatrix, modelViewMatrix, entity.transform.matrix);
        Matrix4.multiply(modelViewProjectionMatrix, projectionMatrix, modelViewMatrix);
        return modelViewProjectionMatrix;
    };




    function frame() {
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();
        const renderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    loadValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
                    storeOp: 'store',
                },
            ],
            depthStencilAttachment: {
                view: depthTexture.createView(),
                depthLoadValue: 1.0,
                depthStoreOp: 'store',
                stencilLoadValue: 0,
                stencilStoreOp: 'store',
            }
        };
        const modelMatrix = entity.transform.matrix;
        device.queue.writeBuffer(
            uniformBuffer,
            0,
            modelMatrix.buffer,
            modelMatrix.byteOffset,
            modelMatrix.byteLength,
        );
        const viewMatrix = camera.transform.matrix;
        device.queue.writeBuffer(
            uniformBuffer,
            4 * 16,
            viewMatrix.buffer,
            viewMatrix.byteOffset,
            viewMatrix.byteLength,
        );
        device.queue.writeBuffer(
            uniformBuffer,
            2 * 4 * 16,
            projectionMatrix.buffer,
            projectionMatrix.byteOffset,
            projectionMatrix.byteLength,
        )
        var inverseModelMatrix = entity.transform.matrix;
        inverseModelMatrix = Matrix4.multiply(inverseModelMatrix, viewMatrix, inverseModelMatrix);
        inverseModelMatrix = Matrix4.invert(inverseModelMatrix, inverseModelMatrix);
        inverseModelMatrix = Matrix4.transpose(inverseModelMatrix, inverseModelMatrix);
        device.queue.writeBuffer(
            uniformBuffer,
            3 * 4 * 16,
            inverseModelMatrix.buffer,
            inverseModelMatrix.byteOffset,
            inverseModelMatrix.byteLength,
        )
        const lightPosition = Vector4.fromValues(light.transform.position[0], light.transform.position[1], light.transform.position[2], 1.0);
        device.queue.writeBuffer(
            uniformBuffer,
            4 * 4 * 16,
            lightPosition.buffer,
            lightPosition.byteOffset,
            lightPosition.byteLength,
        )
        const viewPosition = Vector4.fromValues(camera.transform.position[0], camera.transform.position[1], camera.transform.position[2], 1.0);
        device.queue.writeBuffer(
            uniformBuffer,
            4 * 4 * 16 + 4 * 4,
            viewPosition.buffer,
            viewPosition.byteOffset,
            viewPosition.byteLength,
        )


        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(renderPipeline);
        passEncoder.setBindGroup(0, uniformBindGroup);
        passEncoder.setVertexBuffer(0, dataBuffer);
        passEncoder.setIndexBuffer(indexBuffer, "uint16");
        passEncoder.drawIndexed(gltfmesh.indexArray.length, 1, 0, 0);
        passEncoder.endPass();

        device.queue.submit([commandEncoder.finish()]);
        window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
})();