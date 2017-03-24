const db = require('./src/db.js')
const { segmentWords } = require('./src/segment.js')
const { pad, accumulate } = require('./src/utils.js')

db.config({ basePath: 'db/weex' })

function wordCount (issues) {
  const summary = {
    words: {},
    labels: {},
    assignees: {},
    labelWords: {},
    assigneeWords: {}
  }

  for (const number in issues) {
    const issue = issues[number]
    console.log(`#${pad(number, 5)} ${issue.title}`)
    // if (number > 30) break
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
  }

  return summary
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
