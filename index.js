const shell = require('shelljs')
const Jimp = require('jimp')

class Jump {
  constructor (options) {
    this.savePath = options.savePath || path.join(__dirname, 'screen.png')
    this.saveCropPath = options.saveCropPath || path.join(__dirname, 'crop.png')
    this.adbPath = options.adbPath || 'adb'
  }

  saveCapture () {
    shell.exec(`${this.adbPath} shell screencap /sdcard/screen.png && exit`, {async:false})
    shell.exec(`${this.adbPath} pull /sdcard/screen.png ${this.savePath}`, {async:false})
    // console.log('Capture saved to ' + this.savePath)
  }

  async cropCapture () {
    let image = await Jimp.read(this.savePath)
    let width = image.bitmap.width
    let height = image.bitmap.height
    let bgTolerance = toleranceN(25)
    let chessTolerance = toleranceN(5)
    let nextFound = false
    let chessFound = false
    let nextBlock = {topX:0, topY:0, idx:0}
    let chess = {topX:0, topY:0, idx:0}
    let chessRefColor = {r:126, g:115, b:158}
    let lastColor = {
      r: image.bitmap.data[0],
      g: image.bitmap.data[1],
      b: image.bitmap.data[2],
      a: image.bitmap.data[3]
    }

    image.crop(0, 0.2 * height, width, 0.7 * height)
    image.scan(0, 0, width, image.bitmap.height, function (x, y, idx) {
      let pixel = {
        r: this.bitmap.data[ idx + 0 ],
        g: this.bitmap.data[ idx + 1 ],
        b: this.bitmap.data[ idx + 2 ],
        a: this.bitmap.data[ idx + 3 ]
      }
      if (!nextFound && !bgTolerance(pixel, lastColor)) {
        lastColor = pixel
        nextBlock.topX = x
        nextBlock.topY = y
        nextBlock.idx = idx
        nextFound = true 
        console.log(`Next block found in (${x}, ${y})`)
      }
      if (!chessFound && chessTolerance(pixel, chessRefColor)){
        chess.topX = x
        chess.topY = y
        chess.idx = idx
        chessFound = true
        console.log(`Chess found in (${x}, ${y})`)
      }
    })
    // 30 deg skew -> Distance = lengthX / cos30deg
    this.distance = Math.abs(nextBlock.topX - chess.topX) / Math.cos(30 * Math.PI / 180) 
    console.log('Distance is ' + this.distance)
    // For debug use
    // await new Promise((res, rej)=>{
    //   image.write(this.saveCropPath, (err, ret)=>{
    //     if (!err) res(ret)
    //   })
    // })
    console.log('Analyse completed.')
  }

  gogogo (duration) { 
    let initRef = {distance: 508.06, duration: 688}
    let touchPos = {x: 250, y:250}
    // NewDistance / NewDuration = initDistance / initDuration
    let dur = duration || parseInt((this.distance * initRef.duration) / initRef.distance)
    console.log(`Jumping with ${dur}ms`)
    shell.exec(`${this.adbPath} shell input swipe 250 250 251 250 ${dur}`, {async:false})
    // shell.exec(`${this.adbPath} shell input swipe 581 1580 580 1580 ${dur}`, {async:false})
  }
}

function toleranceN(n) {
  return function(color1, color2){
    let abs = Math.abs
    return abs(color1.r - color2.r) <= n && abs(color1.g - color2.g) <= n && abs(color1.b - color2.b) <= n
  }
}

module.exports = Jump