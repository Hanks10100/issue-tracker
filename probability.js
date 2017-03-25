const db = require('./src/db.js')
const { pad, accumulate } = require('./src/utils.js')

let repoName = 'weex'
if (process.argv[2]) {
  repoName = String(process.argv[2])
}

db.config({ basePath: `db/${repoName}` })

function pick (summary) {
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

function calc (sum) {
  return toP(pick(sum))
}

function deepCalc (group) {
  let totalCont = 0

  const words = {}
  for (const name in group) {
    const summary = group[name]
    for (const key in summary) {
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
  const label = deepCalc(db.readSync(`counts/label_words`))
  const assignee = deepCalc(db.readSync(`counts/assignee_words`))

  Promise.all([
    db.save(`data/labels`, calc(db.readSync(`counts/labels`))),
    db.save(`data/assignees`, calc(db.readSync(`counts/assignees`))),
    db.save(`data/label_words`, label.words),
    db.save(`data/label_map`, label.result),
    db.save(`data/assignee_words`, assignee.words),
    db.save(`data/assignee_map`, assignee.result)
  ]).then(() => {
    console.log('\n => done')
  })
}

record()
