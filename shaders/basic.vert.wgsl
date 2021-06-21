struct VertexOutput {
  [[builtin(position)]] pos : vec4<f32>;
  [[location(0)]] color: vec4<f32>;
};

[[stage(vertex)]]
fn main([[location(0)]] pos: vec4<f32>,
        [[location(1)]] color: vec4<f32>)
     -> VertexOutput{
       var output : VertexOutput;
       output.pos = pos;
       output.color = color;
  return output;
}
