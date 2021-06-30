[[group(0), binding(1)]] var mySampler: sampler;
[[group(0), binding(2)]] var myTexture: texture_2d<f32>;

[[stage(fragment)]]
fn main([[location(0)]] UV: vec2<f32>,
        [[location(1)]] FragPosition: vec4<f32>) -> [[location(0)]] vec4<f32> {
  return textureSample(myTexture, mySampler, UV) * FragPosition;
}