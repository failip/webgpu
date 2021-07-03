import { NormalMeshImpl } from "../meshes/NormalMeshImpl";

export async function loadGLTFEmbedded(GLTF_url: string) {
    const response = await fetch(GLTF_url);
    const gltf_description = await response.text();
    const gltf_object = JSON.parse(gltf_description);
    const buffer = gltf_object.buffers[0];
    const byteLength = buffer.byteLength;
    const uri = buffer.uri;
    const blob = await fetch(uri);
    const arrayBuffer = await blob.arrayBuffer();
    return [gltf_object, arrayBuffer];
}

export function createMesh(glTF_object, array_buffer) {
    const primitives = glTF_object.meshes[0].primitives[0];
    const index_buffer_view_index = primitives.indices;
    const accessors = glTF_object.accessors;
    var index_buffer_accessor = null;
    accessors.forEach(element => {
        if (element.bufferView == index_buffer_view_index) {
            index_buffer_accessor = element;
        }
    });
    const index_buffer_view = glTF_object.bufferViews[index_buffer_view_index];
    const buffer_views = glTF_object.bufferViews;
    var index_buffer = createIndexBuffer(index_buffer_accessor, index_buffer_view, array_buffer);
    var vertex_buffer_data = createVertexBuffer(accessors, primitives, buffer_views, array_buffer);
    return new NormalMeshImpl(vertex_buffer_data.positionOffset, vertex_buffer_data.normalOffset, vertex_buffer_data.vertexSize, vertex_buffer_data.vertexCount, vertex_buffer_data.vertexArray, index_buffer);
}

function createIndexBuffer(index_buffer_accessor, index_buffer_view, array_buffer) {
    var component_size = 2;
    if (index_buffer_accessor.componentType != 5123) {
        component_size = 4;
    }
    var index_buffer;
    if (component_size == 2) {
        index_buffer = new Uint16Array(array_buffer.slice(index_buffer_view.byteOffset, index_buffer_view.byteOffset + index_buffer_view.byteLength));
    }
    return index_buffer;
}

function createVertexBuffer(accessors, primitives, buffer_views, buffer) {
    const position_acessor_index = primitives.attributes.POSITION;
    const normal_accessor_index = primitives.attributes.NORMAL;
    const position_accessor = accessors[position_acessor_index];
    const normal_accessor = accessors[normal_accessor_index];
    const position_offset = position_accessor.byteOffset;
    const normal_offset = normal_accessor.byteOffset;
    const buffer_view = buffer_views[position_accessor.bufferView]
    const vertex_array = new Float32Array(buffer.slice(buffer_view.byteOffset, buffer_view.byteOffset + buffer_view.byteLength));
    return { 'positionOffset': position_offset, 'normalOffset': normal_offset, 'vertexArray': vertex_array, 'vertexSize': buffer_view.byteStride, 'vertexCount': position_accessor.count };
}