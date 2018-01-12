const Jump = require('../')
const path = require('path')

let jump = new Jump({
  adbPath: '/Users/sam/Library/Android/sdk/platform-tools/adb',
  savePath: path.join(__dirname, 'source.png'),
  saveCropPath: path.join(__dirname, 'crop.png')
})
async function run () {
  jump.saveCapture()
  await jump.cropCapture()
  jump.gogogo()
  await new Promise(res=>{
    setTimeout(()=>{res()}, 500)
  })
  run()
}

run()

// todo: chess 定位精确
// todo: 配置化
// bug: chess高于next
