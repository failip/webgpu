[[block]] struct Uniforms {
  modelViewProjectionMatrix : mat4x4<f32>;
};
[[binding(0), group(0)]] var<uniform> uniforms : Uniforms;

struct VertexOutput {
  [[builtin(position)]] Position : vec4<f32>;
  [[location(0)]] UV: vec2<f32>;
  [[location(1)]] FragPosition: vec4<f32>;
};

[[stage(vertex)]]
fn main([[location(0)]] pos: vec4<f32>,
        [[location(1)]] uv: vec2<f32>)
     -> VertexOutput{
       var output : VertexOutput;
       output.Position = uniforms.modelViewProjectionMatrix * pos;
       output.UV = uv;
       output.FragPosition = 0.5 * (pos + vec4<f32>(1.0, 1.0, 1.0, 1.0));
  return output;
}
