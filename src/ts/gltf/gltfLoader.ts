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