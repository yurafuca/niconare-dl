const axios = require('axios')
const fs = require('fs')
const path = require('path')

const optionDefinitions = [
  { name: 'url', type: String, multiple: true, defaultOption: true }
]

const download = async endpoints => {
  for (const url of endpoints) {
    const response = await axios({
      url: url,
      method: 'GET'
    })
    const json = response.data
    console.log(json.title)
    console.log(url)
    await downloadSlides(json)
  }
}

const downloadSlides = async json => {
  const urls = json.thumbnails.map(thumb => thumb.image_urls)
  const slideUrls = urls.map(url => url.original)
  for (const slide of slideUrls) {
    const response = await axios({
      url: slide,
      method: 'GET',
      responseType: 'stream'
    })
    const name = slide.split('/').pop()
    const location = path.resolve(__dirname, `../slides/${json.title}`)
    if (!fs.existsSync(location)) {
      fs.mkdirSync(location)
    }
    const writer = fs.createWriteStream(path.resolve(location, name))
    response.data.pipe(writer)
    console.log(slide)
    await sleep(1000)
  }
}

const sleep = time => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions)
const prefixedIds = options.url.map(url => url.split('/').pop())
const ids = prefixedIds.map(prefixed => prefixed.replace('kn', ''))
const endpoints = ids.map(id => `https://api.niconare.nicovideo.jp/api/v2/works/${id}`);
(async () => {
  await download(endpoints)
  console.log('done.')
})()
