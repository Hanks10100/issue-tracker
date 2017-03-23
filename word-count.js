const jsonfile = require('jsonfile')
const load = require('./load.js')
const segment = require('./segment.js')
const { pad, accumulate } = require('./utils.js')

function segmentIssue (issue) {
  const words = []

  const titleWords = segment(issue.title)
  for (let i = 0; i < 5; ++i) {
    words.push(...titleWords)
  }

  const bodyWords = segment(issue.body)
  for (let i = 0; i < 2; ++i) {
    words.push(...bodyWords)
  }

  if (Array.isArray(issue.comments)) {
    issue.comments.forEach(comment => {
      words.push(...segment(comment.body))
    })
  }

  return words
}

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
    // if (number > 10) break
    const words = segmentIssue(issue).map(s => s.toLowerCase())

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
  const summary = wordCount(load.readIssues())

  jsonfile.spaces = 2
  jsonfile.writeFile(`counts/words.json`, summary.words)
  jsonfile.writeFile(`counts/labels.json`, summary.labels)
  jsonfile.writeFile(`counts/assignees.json`, summary.assignees)
  jsonfile.writeFile(`counts/label_words.json`, summary.labelWords)
  jsonfile.writeFile(`counts/assignee_words.json`, summary.assigneeWords)
}

record()
