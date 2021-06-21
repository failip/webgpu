[[stage(fragment)]]
fn main([[location(0)]] UV: vec2<f32>,
        [[location(1)]] FragPosition: vec4<f32>) -> [[location(0)]] vec4<f32> {
  return FragPosition;
}