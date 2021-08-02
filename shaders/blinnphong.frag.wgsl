[[block]] struct Uniforms {
  modelMatrix : mat4x4<f32>;
  viewMatrix : mat4x4<f32>;
  projectionMatrix: mat4x4<f32>;
  inverseModelMatrix : mat4x4<f32>;
  lightPosition : vec3<f32>;
};
[[binding(0), group(0)]] var<uniform> uniforms : Uniforms;

let light_color: vec4<f32> = vec4<f32>(1.0, 1.0, 1.0, 1.0);

[[stage(fragment)]]
fn main([[location(0)]] UV: vec2<f32>,
        [[location(1)]] FragPosition: vec4<f32>,
        [[location(2)]] Normal: vec4<f32>,
        ) -> [[location(0)]] vec4<f32> {
    
    var color: vec4<f32> = vec4<f32>(0.5, 0.0, 0.0, 1.0);
    var normal: vec4<f32> = Normal;
    var light_direction: vec4<f32> = normalize(vec4<f32>(uniforms.lightPosition, 1.0));
    var view_direction: vec4<f32> = normalize(FragPosition);
    var halfway_direction: vec4<f32> = normalize(light_direction + view_direction);

    var spec: f32 = pow(max(dot(normal, halfway_direction), 0.0), 40.0);
    var specular: vec4<f32> = light_color * spec;
    specular = specular;

    var ambient_strength: f32 = 0.05;
    var ambient: vec4<f32> = ambient_strength * light_color;

    var diff: f32 = dot(light_direction, normal);
    var diffuse: vec4<f32> = diff * light_color;
    
    var result: vec4<f32> = diffuse + color;
    return result;
}