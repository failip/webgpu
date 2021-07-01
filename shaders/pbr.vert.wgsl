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
  [[location(2)]] Normal: vec4<f32>;
};

[[stage(vertex)]]
fn main([[location(0)]] pos: vec4<f32>,
        [[location(1)]] normal: vec4<f32>,
        [[location(2)]] uv: vec2<f32>)
     -> VertexOutput{
       var output : VertexOutput;
       output.Position = (uniforms.projectionMatrix * uniforms.viewMatrix * uniforms.modelMatrix) * pos;
       output.UV = uv;
       output.FragPosition = uniforms.viewMatrix * pos;
  return output;
}
