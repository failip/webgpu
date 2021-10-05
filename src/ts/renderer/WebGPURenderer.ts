import { Renderer } from "./Renderer";

export class WebGPURenderer implements Renderer {

    constructor(canvas) {
        var adapter = await navigator.gpu.requestAdapter();
        var device = await adapter.requestDevice();
        var fragShader = await fetchShader('diffuse.frag.wgsl')
        var vertShader = await fetchShader('basic.vert.wgsl')
    }
}
