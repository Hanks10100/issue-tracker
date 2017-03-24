const path = require('path')
const jsonfile = require('jsonfile')

jsonfile.spaces = 2

const defaultOptions = {
  spaces: 2,
  basePath: 'db/weex',
}

function filename (name) {
  return path.resolve(__dirname, '..', defaultOptions.basePath, name) + '.json'
}

function config (options = {}) {
  Object.assign(defaultOptions, options)
  jsonfile.spaces = defaultOptions.spaces
}

module.exports = {
  save: (name, data) => jsonfile.writeFile(filename(name), data),
  saveSync: (name, data) => jsonfile.writeFileSync(filename(name), data),
  read: name => jsonfile.readFile(filename(name)),
  readSync: name => jsonfile.readFileSync(filename(name)),
  config
}
