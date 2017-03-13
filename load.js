const fs = require('fs')
const jsonfile = require('jsonfile')

function createLoader (path) {
  const MAX_COUNT = 3000
  return function loader (start = 1, count = MAX_COUNT) {
    const json = {}
    for (let i = start; i < start + count; ++i) {
      const filename = `./${path}/${i}.json`
      if (fs.existsSync(filename)) {
        json[i] = jsonfile.readFileSync(filename)
      }
    }
    return json
  }
}

module.exports = {
  readIssues: createLoader('issues'),
  readPrs: createLoader('prs')
}
