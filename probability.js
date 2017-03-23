const jsonfile = require('jsonfile')
const { pad, accumulate } = require('./utils.js')

function pick (summary) {
  // return summary
  const available = {}
  for (const key in summary) {
    if (isAvailable(key, summary[key])) {
      available[key] = summary[key]
    }
  }
  return available
}

function isAvailable (word, count) {
  return String(word).length > 1
    && !Number(word)
    && !String(word).match(/^https?:\/\//i)
    && count >= 1
}

function check (P) {
  let sum = 0
  for (const key in P) {
    sum += P[key]
  }
  return Math.abs(sum - 1) < 1e-5
}

function toP (summary) {
  let sum = 0
  for (const key in summary) {
    sum += Number(summary[key])
  }

  const P = {}
  for (const key in summary) {
    P[key] = Number(summary[key]) / sum
  }
  // console.log(` => ${check(P)}`)
  return P
}

function calc (filePath) {
  const P = toP(pick(jsonfile.readFileSync(filePath)))
  console.log(` => ${filePath} ${check(P)}`)
  return P
}

function deepCalc (filePath) {
  const group = jsonfile.readFileSync(filePath)
  console.log(` => ${filePath}`)
  let totalCont = 0

  const words = {}
  for (const name in group) {
    const summary = group[name]
    for (const key in summary) {
      // accumulate(words, key)
      words[key] = words[key] || 0
      words[key] += summary[key]
      totalCont += summary[key]
    }
  }

  const result = {}
  for (const name in group) {
    const summary = pick(group[name])
    result[name] = {}

    for (const key in summary) {
      result[name][key] = summary[key] / totalCont
    }
  }

  return {
    words: toP(pick(words)),
    result
  }
}

function record () {
  jsonfile.spaces = 2

  // jsonfile.writeFile(`./data/words.json`, calc(`./counts/words.json`))
  jsonfile.writeFile(`./data/labels.json`, calc(`./counts/labels.json`))
  jsonfile.writeFile(`./data/assignees.json`, calc(`./counts/assignees.json`))

  const label = deepCalc(`./counts/label_words.json`)
  jsonfile.writeFile(`./data/label_words.json`, label.words)
  jsonfile.writeFile(`./data/label_map.json`, label.result)

  const assignee = deepCalc(`./counts/assignee_words.json`)
  jsonfile.writeFile(`./data/assignee_words.json`, assignee.words)
  jsonfile.writeFile(`./data/assignee_map.json`, assignee.result)
}

record()
