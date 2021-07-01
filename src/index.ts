import { mat4 as Matrix4, vec3 as Vector3, quat as Quaternion } from 'gl-matrix';
import { TexturedIcosahedron } from './ts/meshes/TexturedIcosahedron';
import { TexturedCube } from './ts/meshes/TexturedCube';
import { fetchShader } from './ts/utility/Fetch';
import { Entity } from './ts/entities/Entity';
import { Transform } from './ts/entities/Transform';
import { Camera } from './ts/renderer/Camera';
import { IndexedTexturedMesh } from './ts/meshes/IndexedTexturedMesh';



(async () => {
    if (!navigator.gpu) {
        alert("WebGPU is not enabled.");
        return;
    }

    var adapter = await navigator.gpu.requestAdapter();
    var device = await adapter.requestDevice();
    var fragShader = await fetchShader('pbr.frag.wgsl')
    var vertShader = await fetchShader('pbr.vert.wgsl')
    var canvas = document.getElementById("webgpu-canvas");
    var context = canvas.getContext("gpupresent");
    let mesh: IndexedTexturedMesh = new TexturedCube("/textures/Cobble.png");
    var entity: Entity = new Entity(new Transform(), mesh);
    var camera: Camera = new Camera(new Transform(Vector3.fromValues(0, 0, -4), Quaternion.fromValues(0, 0, 0, 1), Vector3.fromValues(1.0, 1.0, 1.0)));
    console.log(device);

    var dataBuffer = device.createBuffer({
        size: mesh.vertexArray.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true
    });

    new Float32Array(dataBuffer.getMappedRange()).set(mesh.vertexArray);
    dataBuffer.unmap();

    var indexBuffer = device.createBuffer({
        size: mesh.indexArray.byteLength,
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true
    });

    new Uint16Array(indexBuffer.getMappedRange()).set(mesh.indexArray);
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
                arrayStride: mesh.vertexSize,
                attributes: [
                    {
                        format: "float32x4",
                        offset: mesh.positionOffset,
                        shaderLocation: 0
                    },
                    {
                        format: "float32x2",
                        offset: mesh.UVOffset,
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
            cullMode: 'back',
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

    const sampler = device.createSampler({
        magFilter: 'nearest',
        minFilter: 'nearest',
    });

    const uniformBufferSize = 3 * 4 * 16;
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
            {
                binding: 1,
                resource: sampler,
            },
            {
                binding: 2,
                resource: texture.createView(),
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
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(renderPipeline);
        passEncoder.setBindGroup(0, uniformBindGroup);
        passEncoder.setVertexBuffer(0, dataBuffer);
        passEncoder.setIndexBuffer(indexBuffer, "uint16");
        passEncoder.drawIndexed(mesh.indexArray.length, 1, 0, 0);
        passEncoder.endPass();


        device.queue.submit([commandEncoder.finish()]);
        window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
})();