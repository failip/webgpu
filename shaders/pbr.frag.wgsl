[[group(0), binding(1)]] var mySampler: sampler;
[[group(0), binding(2)]] var myTexture: texture_2d<f32>;

let light_position: vec3<f32> = vec3<f32>(5.0, 5.0, 1.0);
let light_color: vec3<f32> = vec3<f32>(1.0, 0.2, 0.2);

[[stage(fragment)]]
fn main([[location(0)]] UV: vec2<f32>,
        [[location(1)]] FragPosition: vec4<f32>) -> [[location(0)]] vec4<f32> {
    var light_vector : vec3<f32> =  normalize(light_position);
    var ambient_strength : f32 = 0.5;
    var ambient: vec3<f32> = ambient_strength * light_color;

    return textureSample(myTexture, mySampler, UV) * vec4<f32>(ambient, 1.0);
}