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

export function createBuffers(glTF_object, array_buffer) {
    const primitives = glTF_object.meshes[0].primitives[0];
    const index_buffer_view_index = primitives.indices;
    const accessors = glTF_object.accessors;
    var index_buffer_accessor = null;
    accessors.forEach(element => {
        if (element.bufferView == index_buffer_view_index) {
            index_buffer_accessor = element;
        }
    });
    var index_buffer_view = glTF_object.bufferViews[index_buffer_view_index];
    var index_buffer = createIndexBuffer(index_buffer_accessor, index_buffer_view, array_buffer);
    return index_buffer;
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