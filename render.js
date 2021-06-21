async function fetchShader(shader_name) {
    const respone = await fetch('./shaders/'+shader_name);
    const shader = await respone.text();
    return shader;
}



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
        size: 3 * 2 * 4 * 4,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true
    });

    new Float32Array(dataBuffer.getMappedRange()).set([
        1, -1, 0, 1,  // position
        1, 0, 0, 1,   // color
        -1, -1, 0, 1, // position
        0, 1, 0, 1,   // color
        0, 1, 0, 1,   // position
        0, 0, 1, 1,   // color
    ]);
    dataBuffer.unmap();

    var vertexState = {
        vertexBuffers: [
            {
                arrayStride: 2 * 4 * 4,
                attributes: [
                    {
                        format: "float32x4",
                        offset: 0,
                        shaderLocation: 0
                    },
                    {
                        format: "float32x4",
                        offset: 4 * 4,
                        shaderLocation: 1
                    }
                ]
            }
        ]
    };

    var swapChainFormat= "bgra8unorm";
    var swapChain = context.configure({
        device: device,
        format: swapChainFormat,
        usage: GPUTextureUsage.OUTPUT_ATTACHMENT
    });

    var vertModule = device.createShaderModule({code: vertShader});
    var vertexStage = {
        module: vertModule, 
        entryPoint: "main", 
        buffers: [
        {
            arrayStride: 2 * 4 * 4,
                attributes: [
            {
                format: "float32x4",
                offset: 0,
                shaderLocation: 0
            },
            {
                format: "float32x4",
                offset: 4 * 4,
                shaderLocation: 1
            },
        ],
    },
],
};

    var fragModule = device.createShaderModule({code: fragShader});
    var fragStage = {module: fragModule, entryPoint: "main", targets: [{format:swapChainFormat}]};


    var renderPipeline = device.createRenderPipeline({
        vertex: vertexStage,
        fragment: fragStage,
        primitiveTopology: 'triangle-list',
        targets: [{
            format: swapChainFormat
        }]
    });


    function frame () {
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        const renderPassDescriptor = {
            colorAttachments: [
              {
                view: textureView,
                loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                storeOp: 'store',
              },
            ],
        };
          const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
          passEncoder.setPipeline(renderPipeline);
          passEncoder.setVertexBuffer(0, dataBuffer);
          passEncoder.draw(3, 1, 0, 0);
          passEncoder.endPass();
          
      
          device.queue.submit([commandEncoder.finish()]);
          window.requestAnimationFrame(frame);
        }
      
        window.requestAnimationFrame(frame);
})();