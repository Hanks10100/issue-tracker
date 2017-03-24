const fs = require('fs')
const path = require('path')
const jsonfile = require('jsonfile')

jsonfile.spaces = 2

const defaultOptions = {
  spaces: 2,
  basePath: 'db/weex',
}

function filename (name) {
  const fname = path.resolve(__dirname, '..', defaultOptions.basePath, name + '.json')
  const dir = path.dirname(fname)
  if (!fs.existsSync(dir)) {
    fs.mkdir(dir)
  }
  return fname
}

function config (options = {}) {
  Object.assign(defaultOptions, options)
  jsonfile.spaces = defaultOptions.spaces
}

function readAllType (type = 'issues') {
  const typePath = path.resolve(__dirname, '..', defaultOptions.basePath, type)
  return fs.readdirSync(typePath).map(file => {
    return jsonfile.readFileSync(path.join(typePath, file))
  })
}

function readType (type, number) {
  const filePath = filename(path.join(type, String(number)))
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
  readAllIssues: () => readAllType('issues'),
  readAllPRs: () => readAllType('prs'),
  readIssue: number => readType('issues', number),
  readPR: number => readType('prs', number),
  config
}
