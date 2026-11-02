// Rasterizes the web app's original vector shield at App Store resolution.
import AppKit

let width = 1024
let context = CGContext(
  data: nil, width: width, height: width, bitsPerComponent: 8, bytesPerRow: width * 4,
  space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
context.scaleBy(x: 2, y: 2)
context.translateBy(x: 0, y: 512)
context.scaleBy(x: 1, y: -1)
func color(_ r: CGFloat, _ g: CGFloat, _ b: CGFloat) -> CGColor {
  CGColor(red: r / 255, green: g / 255, blue: b / 255, alpha: 1)
}
context.setFillColor(color(10, 10, 10))
context.fill(CGRect(x: 0, y: 0, width: 512, height: 512))
let shield = CGMutablePath()
shield.move(to: CGPoint(x: 256, y: 76))
shield.addLine(to: CGPoint(x: 412, y: 136))
shield.addLine(to: CGPoint(x: 412, y: 264))
shield.addCurve(
  to: CGPoint(x: 256, y: 468), control1: CGPoint(x: 412, y: 366), control2: CGPoint(x: 344, y: 436))
shield.addCurve(
  to: CGPoint(x: 100, y: 264), control1: CGPoint(x: 168, y: 436), control2: CGPoint(x: 100, y: 366))
shield.addLine(to: CGPoint(x: 100, y: 136))
shield.closeSubpath()
context.saveGState()
context.addPath(shield)
context.clip()
let gradient = CGGradient(
  colorsSpace: CGColorSpaceCreateDeviceRGB(),
  colors: [color(139, 128, 246), color(97, 85, 238)] as CFArray, locations: [0, 1])!
context.drawLinearGradient(
  gradient, start: CGPoint(x: 100, y: 76), end: CGPoint(x: 412, y: 468), options: [])
context.restoreGState()
context.addPath(shield)
context.setStrokeColor(color(168, 159, 251))
context.setLineWidth(10)
context.setLineJoin(.round)
context.strokePath()
func check(offset: CGFloat, width: CGFloat, color: CGColor) {
  context.beginPath()
  context.move(to: CGPoint(x: 188, y: 262 + offset))
  context.addLine(to: CGPoint(x: 238, y: 312 + offset))
  context.addLine(to: CGPoint(x: 332, y: 204 + offset))
  context.setLineCap(.round)
  context.setLineJoin(.round)
  context.setLineWidth(width)
  context.setStrokeColor(color)
  context.strokePath()
}
check(
  offset: 8, width: 46, color: CGColor(red: 10 / 255, green: 10 / 255, blue: 10 / 255, alpha: 0.35))
check(offset: 0, width: 40, color: color(255, 255, 255))
let bitmap = NSBitmapImageRep(cgImage: context.makeImage()!)
try bitmap.representation(using: .png, properties: [:])!.write(
  to: URL(fileURLWithPath: "AI Fact Checker/Assets.xcassets/AppIcon.appiconset/AppIcon.png"))
