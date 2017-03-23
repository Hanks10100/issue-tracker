const jsonfile = require('jsonfile')
const segment = require('./segment')
const { pad, accumulate } = require('./utils.js')

function pick (labels, count = 5) {
  const useful = {}
  for (const label in labels) {
    const words = labels[label]
    useful[label] = useful[label] || {}
    for (const word in words) {
      if (isUseful(word, words[word])) {
        useful[label][word] = words[word]
      }
    }
  }
  return useful
}

function isUseful (word, count) {
  return String(word).length > 1
    && !Number(word)
    && !String(word).match(/^https?:\/\//i)
    && count >= 5
}

function readWordCount (filePath) {
  const words = jsonfile.readFileSync(filePath)
  const P = {}
  let totalWordCount = 0

  for (const word in words) {
    if (isUseful(word, words[word])) {
      totalWordCount += words[word]
    }
  }

  for (const word in words) {
    if (isUseful(word, words[word])) {
      P[word] = words[word] / totalWordCount
    }
  }

  console.log(check(P))
  return P
}

function getTagP (filePath) {
  const labels = pick(jsonfile.readFileSync(filePath), 2)
  const P = {}
  let totalWordCount = 0

  for (const label in labels) {
    for (const word in labels[label]) {
      totalWordCount += labels[label][word]
    }
  }

  for (const label in labels) {
    P[label] = {}
    for (const word in labels[label]) {
      P[label][word] = labels[label][word] / totalWordCount
    }
  }
  console.log(checkAll(P))
  return P
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
  jsonfile.spaces = 2

  const wcount = readWordCount('./words/issue_word_count.json')
  jsonfile.writeFile(`words/issue_words_probability.json`, wcount)

  // console.log(summary)
  // const summary = getTagP('./words/issue_with_label_word_count.json')
  // jsonfile.writeFile(`words/issue_label_words_probability.json`, summary)

  // const summary = getTagP('./words/issue_with_assignee_word_count.json')
  // jsonfile.writeFile(`words/issue_assignee_words_probability.json`, summary)
}

record()
