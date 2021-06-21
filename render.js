async function fetchShader(shader_name) {
    const respone = await fetch('./shaders/' + shader_name);
    const shader = await respone.text();
    return shader;
}

const cubeVertexSize = 4 * 10; // Byte size of one cube vertex.
const cubePositionOffset = 0;
const cubeColorOffset = 4 * 4; // Byte offset of cube vertex color attribute.
const cubeUVOffset = 4 * 8;
const cubeVertexCount = 36;

const cubeVertexArray = new Float32Array([
    1, -1, 1, 1, 1, 0, 1, 1, 1, 1,
    -1, -1, 1, 1, 0, 0, 1, 1, 0, 1,
    -1, -1, -1, 1, 0, 0, 0, 1, 0, 0,
    1, -1, -1, 1, 1, 0, 0, 1, 1, 0,
    1, -1, 1, 1, 1, 0, 1, 1, 1, 1,
    -1, -1, -1, 1, 0, 0, 0, 1, 0, 0,

    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, -1, 1, 1, 1, 0, 1, 1, 0, 1,
    1, -1, -1, 1, 1, 0, 0, 1, 0, 0,
    1, 1, -1, 1, 1, 1, 0, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, -1, -1, 1, 1, 0, 0, 1, 0, 0,

    -1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
    1, 1, -1, 1, 1, 1, 0, 1, 0, 0,
    -1, 1, -1, 1, 0, 1, 0, 1, 1, 0,
    -1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
    1, 1, -1, 1, 1, 1, 0, 1, 0, 0,

    -1, -1, 1, 1, 0, 0, 1, 1, 1, 1,
    -1, 1, 1, 1, 0, 1, 1, 1, 0, 1,
    -1, 1, -1, 1, 0, 1, 0, 1, 0, 0,
    -1, -1, -1, 1, 0, 0, 0, 1, 1, 0,
    -1, -1, 1, 1, 0, 0, 1, 1, 1, 1,
    -1, 1, -1, 1, 0, 1, 0, 1, 0, 0,

    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    -1, 1, 1, 1, 0, 1, 1, 1, 0, 1,
    -1, -1, 1, 1, 0, 0, 1, 1, 0, 0,
    -1, -1, 1, 1, 0, 0, 1, 1, 0, 0,
    1, -1, 1, 1, 1, 0, 1, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,

    1, -1, -1, 1, 1, 0, 0, 1, 1, 1,
    -1, -1, -1, 1, 0, 0, 0, 1, 0, 1,
    -1, 1, -1, 1, 0, 1, 0, 1, 0, 0,
    1, 1, -1, 1, 1, 1, 0, 1, 1, 0,
    1, -1, -1, 1, 1, 0, 0, 1, 1, 1,
    -1, 1, -1, 1, 0, 1, 0, 1, 0, 0,
]);


(async () => {
    if (!navigator.gpu) {
        alert("WebGPU is not enabled.");
        return;
    }

    var adapter = await navigator.gpu.requestAdapter();
    var device = await adapter.requestDevice();
    var fragShader = await fetchShader('basic.frag.wgsl')
    var vertShader = await fetchShader('basic.vert.wgsl')
    var canvas = document.getElementById("webgpu-canvas");
    var context = canvas.getContext("gpupresent");
    console.log(device);

    var dataBuffer = device.createBuffer({
        size: cubeVertexArray.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true
    });

    new Float32Array(dataBuffer.getMappedRange()).set(cubeVertexArray);
    dataBuffer.unmap();

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
                arrayStride: cubeVertexSize,
                attributes: [
                    {
                        format: "float32x4",
                        offset: cubePositionOffset,
                        shaderLocation: 0
                    },
                    {
                        format: "float32x2",
                        offset: cubeUVOffset,
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
        size: { width: canvas.width, height: canvas.height },
        format: 'depth24plus',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    const uniformBufferSize = 4 * 16;
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

    const aspect = Math.abs(canvas.width / canvas.height);
    const projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projectionMatrix, (2 * Math.PI) / 5, aspect, 1, 100.0);

    function getTransformationMatrix() {
        const viewMatrix = glMatrix.mat4.create();
        glMatrix.mat4.translate(viewMatrix, viewMatrix, glMatrix.vec3.fromValues(0, 0, -4));
        const now = Date.now() / 1000;
        glMatrix.mat4.rotate(
            viewMatrix,
            viewMatrix,
            4,
            glMatrix.vec3.fromValues(Math.sin(now), Math.cos(now), 0)
        );
        const modelViewProjectionMatrix = glMatrix.mat4.create();
        glMatrix.mat4.multiply(modelViewProjectionMatrix, projectionMatrix, viewMatrix);
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
        const transformationMatrix = getTransformationMatrix();
        device.queue.writeBuffer(
            uniformBuffer,
            0,
            transformationMatrix.buffer,
            transformationMatrix.byteOffset,
            transformationMatrix.byteLength,
        );
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(renderPipeline);
        passEncoder.setBindGroup(0, uniformBindGroup);
        passEncoder.setVertexBuffer(0, dataBuffer);
        passEncoder.draw(cubeVertexCount, 1, 0, 0);
        passEncoder.endPass();


        device.queue.submit([commandEncoder.finish()]);
        window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
})();