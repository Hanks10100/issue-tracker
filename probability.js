const jsonfile = require('jsonfile')
const segment = require('./segment')
const { pad, accumulate } = require('./utils.js')

function pick (labels, count = 5) {
  const useful = {}
  for (const label in labels) {
    const words = labels[label]
    useful[label] = useful[label] || {}
    for (const word in words) {
      // skip the single word
      if (String(word).length <= 1) continue
      if (Number(word)) continue
      if (String(word).match(/^https?:\/\//i)) continue
      if (words[word] >= count) {
        useful[label][word] = words[word]
      }
    }
  }
  return useful
}

function readWordCount (filePath) {
  const labels = pick(jsonfile.readFileSync(filePath), 2)
  const PLabelWord = {}

  let totalWordCount = 0

  for (const label in labels) {
    for (const word in labels[label]) {
      totalWordCount += labels[label][word]
    }
  }

  for (const label in labels) {
    PLabelWord[label] = {}
    for (const word in labels[label]) {
      PLabelWord[label][word] = labels[label][word] / totalWordCount
    }
  }
  console.log(checkAll(PLabelWord))
  return PLabelWord
}

function check (P) {
  let sum = 0
  for (const key in P) {
    sum += P[key]
  }
  return Math.abs(sum - 1) < 1e-10
}

function checkAll (P) {
  let sum = 0
  for (const label in P) {
    for (const key in P[label]) {
      sum += P[label][key]
    }
  }
  return Math.abs(sum - 1) < 1e-10
}

function record () {
  const summary = readWordCount('./words/issue_with_label_word_count.json')
  // console.log(summary)
  jsonfile.spaces = 2
  jsonfile.writeFile(`words/issue_label_words_probability.json`, summary)
}

record()
