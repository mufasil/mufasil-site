// Person cutout with edge clean-up: Vision mask -> signed distance -> eroded, feathered alpha,
// and edge colours rebuilt from the interior so no background colour survives on the outline.
import Foundation
import Vision
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let src = args[1], out = args[2]
let cropH = Int(args[3])!            // rows kept from the top (drops the table)
let erode: Float = Float(args[4])!   // px pulled in from the mask edge
let feather: Float = Float(args[5])! // px of soft edge
let cropTop = args.count > 6 ? Int(args[6])! : 0 // empty rows dropped above the head

let isrc = CGImageSourceCreateWithURL(URL(fileURLWithPath: src) as CFURL, nil)!
let cg = CGImageSourceCreateImageAtIndex(isrc, 0, nil)!
let W = cg.width, H = cg.height
var rgba = [UInt8](repeating: 0, count: W * H * 4)
let space = CGColorSpace(name: CGColorSpace.sRGB)!
rgba.withUnsafeMutableBytes { p in
  let ctx = CGContext(data: p.baseAddress, width: W, height: H, bitsPerComponent: 8, bytesPerRow: W * 4, space: space, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.draw(cg, in: CGRect(x: 0, y: 0, width: W, height: H))
}

let handler = VNImageRequestHandler(cgImage: cg, options: [:])
let req = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([req])
guard let obs = req.results?.first else { fatalError("no foreground found") }

func readMask(_ instances: IndexSet) throws -> [Float] {
  let pb = try obs.generateScaledMaskForImage(forInstances: instances, from: handler)
  CVPixelBufferLockBaseAddress(pb, .readOnly)
  defer { CVPixelBufferUnlockBaseAddress(pb, .readOnly) }
  let base = CVPixelBufferGetBaseAddress(pb)!, bpr = CVPixelBufferGetBytesPerRow(pb)
  var m = [Float](repeating: 0, count: W * H)
  for y in 0..<H { let row = base.advanced(by: y * bpr).assumingMemoryBound(to: Float.self); for x in 0..<W { m[y * W + x] = row[x] } }
  return m
}
// Keep only the instance that contains the face and the shirt.
var chosen = IndexSet()
for i in obs.allInstances {
  let m = try readMask(IndexSet(integer: i))
  let face = m[450 * W + 600], shirt = m[900 * W + 600]
  print("instance", i, "face", face, "shirt", shirt)
  if face > 0.5 || shirt > 0.5 { chosen.insert(i) }
}
var mask = try readMask(chosen.isEmpty ? obs.allInstances : chosen)

let Hc = min(cropH, H)
var inside = [Bool](repeating: false, count: W * Hc)
for y in 0..<Hc { for x in 0..<W { inside[y * W + x] = mask[y * W + x] > 0.5 } }
// The wicker chair behind his right arm is not part of him.
for y in 1000..<Hc { for x in 0..<120 { inside[y * W + x] = false } }

// Two-pass 3-4 chamfer distance from every pixel to the nearest pixel of the other set.
func chamfer(_ seedIsZero: (Int) -> Bool) -> [Float] {
  let INF: Float = 1e9
  var d = [Float](repeating: INF, count: W * Hc)
  for i in 0..<(W * Hc) where seedIsZero(i) { d[i] = 0 }
  for y in 0..<Hc { for x in 0..<W {
    let i = y * W + x; var v = d[i]
    if x > 0 { v = min(v, d[i - 1] + 3) }
    if y > 0 { v = min(v, d[i - W] + 3); if x > 0 { v = min(v, d[i - W - 1] + 4) }; if x < W - 1 { v = min(v, d[i - W + 1] + 4) } }
    d[i] = v } }
  for y in stride(from: Hc - 1, through: 0, by: -1) { for x in stride(from: W - 1, through: 0, by: -1) {
    let i = y * W + x; var v = d[i]
    if x < W - 1 { v = min(v, d[i + 1] + 3) }
    if y < Hc - 1 { v = min(v, d[i + W] + 3); if x < W - 1 { v = min(v, d[i + W + 1] + 4) }; if x > 0 { v = min(v, d[i + W - 1] + 4) } }
    d[i] = v } }
  return d.map { $0 / 3 }
}
let dIn = chamfer { !inside[$0] }   // distance to outside, for inside pixels
let dOut = chamfer { inside[$0] }   // distance to inside, for outside pixels
var sd = [Float](repeating: 0, count: W * Hc)
for i in 0..<(W * Hc) { sd[i] = inside[i] ? dIn[i] - 0.5 : -(dOut[i] - 0.5) }

// Rebuild edge colours from the interior, working outward in order of depth.
let core: Float = 7, band: Float = -3
var col = [Float](repeating: 0, count: W * Hc * 3)
var done = [Bool](repeating: false, count: W * Hc)
var queue: [Int] = []
for i in 0..<(W * Hc) {
  if sd[i] >= core { for c in 0..<3 { col[i * 3 + c] = Float(rgba[i * 4 + c]) }; done[i] = true }
  else if sd[i] > band { queue.append(i) }
}
queue.sort { sd[$0] > sd[$1] }
for i in queue {
  let x = i % W, y = i / W
  var acc: (Float, Float, Float, Float) = (0, 0, 0, 0)
  for dy in -1...1 { for dx in -1...1 where !(dx == 0 && dy == 0) {
    let nx = x + dx, ny = y + dy
    if nx < 0 || ny < 0 || nx >= W || ny >= Hc { continue }
    let j = ny * W + nx
    if done[j] && sd[j] > sd[i] { acc.0 += col[j * 3]; acc.1 += col[j * 3 + 1]; acc.2 += col[j * 3 + 2]; acc.3 += 1 }
  } }
  if acc.3 > 0 { col[i * 3] = acc.0 / acc.3; col[i * 3 + 1] = acc.1 / acc.3; col[i * 3 + 2] = acc.2 / acc.3 }
  else { for c in 0..<3 { col[i * 3 + c] = Float(rgba[i * 4 + c]) } }
  done[i] = true
}

func smooth(_ a: Float, _ b: Float, _ x: Float) -> Float { let t = max(0, min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
var outPx = [UInt8](repeating: 0, count: W * Hc * 4)
for i in 0..<(W * Hc) {
  let a = max(0, min(1, (sd[i] - erode) / feather + 0.5))
  if a <= 0 { continue }
  let w = smooth(3, core, sd[i])
  for c in 0..<3 {
    let v = col[i * 3 + c] * (1 - w) + Float(rgba[i * 4 + c]) * w
    outPx[i * 4 + c] = UInt8(max(0, min(255, v.rounded())))
  }
  outPx[i * 4 + 3] = UInt8((a * 255).rounded())
}

let Ho = Hc - cropTop
let provider = CGDataProvider(data: Data(outPx[(cropTop * W * 4)...]) as CFData)!
let img = CGImage(width: W, height: Ho, bitsPerComponent: 8, bitsPerPixel: 32, bytesPerRow: W * 4, space: space,
                  bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.last.rawValue), provider: provider, decode: nil, shouldInterpolate: true, intent: .defaultIntent)!
let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: out) as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(dest, img, nil)
CGImageDestinationFinalize(dest)
print("wrote", out, W, "x", Ho)
