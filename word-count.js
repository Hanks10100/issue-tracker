const db = require('./src/db.js')
const { segmentWords } = require('./src/segment.js')
const { pad, accumulate } = require('./src/utils.js')

let repoName = 'weex'
if (process.argv[2]) {
  repoName = String(process.argv[2])
}

db.config({ basePath: `db/${repoName}` })

function pick (object) {
  const available = {}
  for (const key in object) {
    if (key.length > 1 && object[key] >= 2) {
      available[key] = object[key]
    }
  }
  return available
}

function trimResult (summary) {
  const result = {
    labelWords: {},
    assigneeWords: {}
  }
  result.words = pick(summary.words)
  result.labels = pick(summary.labels)
  result.assignees = pick(summary.assignees)
  for (const label in summary.labelWords) {
    if (result.labels[label]) {
      result.labelWords[label] = pick(summary.labelWords[label])
    }
  }
  for (const assignee in summary.assigneeWords) {
    if (result.assignees[assignee]) {
      result.assigneeWords[assignee] = pick(summary.assigneeWords[assignee])
    }
  }
  return result
}

function wordCount (issues) {
  const summary = {
    words: {},
    labels: {},
    assignees: {},
    labelWords: {},
    assigneeWords: {}
  }

  issues.forEach(issue => {
    const number = issue.number
    // if (number < 1100 || number > 1200) return;
    console.log(`#${pad(number, 5)} ${issue.title}`)
    const words = segmentWords(issue, result => {
      db.save(`words/${number}`, result)
    })

    words.forEach(word => accumulate(summary.words, word))

    if (issue.labels.length) {
      issue.labels.forEach(({ name }) => {
        summary.labelWords[name] = {}
        accumulate(summary.labels, name)
        words.forEach(word => accumulate(summary.labelWords[name], word))
      })
    }

    if (issue.assignees.length) {
      issue.assignees.forEach(({ login }) => {
        summary.assigneeWords[login] = {}
        accumulate(summary.assignees, login)
        words.forEach(word => accumulate(summary.assigneeWords[login], word))
      })
    }
  })

  // return summary
  return trimResult(summary)
}

function record () {
  const summary = wordCount(db.readAllIssues())

  Promise.all([
    db.save(`counts/words`, summary.words),
    db.save(`counts/labels`, summary.labels),
    db.save(`counts/assignees`, summary.assignees),
    db.save(`counts/label_words`, summary.labelWords),
    db.save(`counts/assignee_words`, summary.assigneeWords)
  ]).then(() => {
    console.log('\n => done')
  })
}

record()
