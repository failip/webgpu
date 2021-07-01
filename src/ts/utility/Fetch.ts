export async function fetchImage(image_location: string): Promise<ImageBitmap> {
    const img = document.createElement('img');
    img.src = image_location;
    await img.decode();
    const imageBitmap = await createImageBitmap(img);
    return imageBitmap;
}

export async function fetchShader(shader_name: string): Promise<string> {
    const respone = await fetch('./shaders/' + shader_name);
    const shader = await respone.text();
    return shader;
}