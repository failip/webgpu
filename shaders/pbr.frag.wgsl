[[block]] struct Uniforms {
  modelMatrix : mat4x4<f32>;
  viewMatrix : mat4x4<f32>;
  projectionMatrix: mat4x4<f32>;
  inverseModelMatrix : mat4x4<f32>;
  lightPosition : vec3<f32>;
};
[[binding(0), group(0)]] var<uniform> uniforms : Uniforms;
[[group(0), binding(1)]] var mySampler: sampler;
[[group(0), binding(2)]] var myTexture: texture_2d<f32>;
[[group(0), binding(3)]] var normal_map: texture_2d<f32>;
let light_color: vec4<f32> = vec4<f32>(1.0, 0.5, 0.8, 1.0);

[[stage(fragment)]]
fn main([[location(0)]] UV: vec2<f32>,
        [[location(1)]] FragPosition: vec4<f32>,
        [[location(2)]] Normal: vec4<f32>,
        ) -> [[location(0)]] vec4<f32> {

    var ambient_strength: f32 = 0.4;
    var ambient: vec4<f32> = ambient_strength * light_color;

    var norm: vec4<f32> = normalize(uniforms.inverseModelMatrix * textureSample(normal_map, mySampler, UV));
    var lightDir: vec4<f32> = normalize(uniforms.viewMatrix * vec4<f32>(uniforms.lightPosition,1.0) - FragPosition);
    var diff: f32 = max(dot(lightDir, norm), 0.0);
    var diffuse: vec4<f32> = diff * light_color;
    
    var result: vec4<f32> = (ambient + diffuse) * textureSample(myTexture, mySampler, UV);
    return result;
}