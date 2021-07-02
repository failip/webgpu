[[block]] struct Uniforms {
  modelMatrix : mat4x4<f32>;
  viewMatrix : mat4x4<f32>;
  projectionMatrix: mat4x4<f32>;
  inverseModelMatrix : mat4x4<f32>;
  lightPosition : vec3<f32>;
};
[[binding(0), group(0)]] var<uniform> uniforms : Uniforms;

struct VertexOutput {
  [[builtin(position)]] Position : vec4<f32>;
  [[location(0)]] UV: vec2<f32>;
  [[location(1)]] FragPosition: vec4<f32>;
};

[[stage(vertex)]]
fn main([[location(0)]] pos: vec3<f32>,)
     -> VertexOutput{
       var output : VertexOutput;
       output.Position = uniforms.projectionMatrix * uniforms.viewMatrix * uniforms.modelMatrix * vec4<f32>(pos,1.0);
       output.FragPosition = 0.5 * (vec4<f32>(pos,1.0) + vec4<f32>(1.0, 1.0, 1.0, 1.0));
  return output;
}
