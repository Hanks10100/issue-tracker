const fs = require('fs')
const path = require('path')
const jsonfile = require('jsonfile')

jsonfile.spaces = 2

const defaultOptions = {
  spaces: 2,
  basePath: 'db/weex',
}

function filename (name) {
  const dir = path.resolve(__dirname, '..', defaultOptions.basePath)
  if (!fs.existsSync(dir)) {
    fs.mkdir(dir)
  }
  return path.join(dir, name + '.json')
}

function config (options = {}) {
  Object.assign(defaultOptions, options)
  jsonfile.spaces = defaultOptions.spaces
}

function createLoader (type) {
  const MAX_COUNT = 3000
  return function loader (start = 1, count = MAX_COUNT) {
    const json = {}
    for (let i = start; i < start + count; ++i) {
      const name = filename(path.join(type, String(i)))
      if (fs.existsSync(name)) {
        json[i] = jsonfile.readFileSync(name)
      }
    }
    return json
  }
}

function readIssue (number) {
  const filePath = filename(path.join('issues', String(number)))
  if (fs.existsSync(filePath)) {
    return jsonfile.readFileSync(filePath)
  }
  return null
}

module.exports = {
  save: (name, data) => jsonfile.writeFile(filename(name), data),
  saveSync: (name, data) => jsonfile.writeFileSync(filename(name), data),
  read: name => jsonfile.readFile(filename(name)),
  readSync: name => jsonfile.readFileSync(filename(name)),
  readAllIssues: createLoader('issues'),
  readAllPRs: createLoader('prs'),
  readIssue,
  config
}
