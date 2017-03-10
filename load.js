const fs = require('fs')
const path = require('path')
const jsonfile = require('jsonfile')

const MAX_COUNT = 3000

function readIssues () {
  const issues = {}
  for (let i = 1; i < MAX_COUNT; ++i) {
    const filename = `issues/${i}.json`
    if (fs.existsSync(filename)) {
      issues[i] = jsonfile.readFileSync(filename)
    }
  }
  return issues
}

module.exports = {
  readIssues
}
