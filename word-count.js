const jsonfile = require('jsonfile')
const load = require('./load.js')
const segment = require('./segment.js')
const { pad, accumulate } = require('./utils.js')

function wordStat (summary, words) {
  if (Array.isArray(words)) {
    words.map(s => s.toLowerCase()).forEach(word => {
      accumulate(summary, word)
    })
  }
}

function wordCount (issues) {
  const summary = {}
  // console.log(issues)
  for (const number in issues) {
    const issue = issues[number]
    if (Number(number) > 10) break
    console.log(`#${pad(number, 5)} ${issue.title}`)
    wordStat(summary, segment(issue.title))
    if (Array.isArray(issue.comments)) {
      issue.comments.forEach(comment => {
        wordStat(summary, segment(comment.body))
      })
    }
  }
  return summary
}

function labelStat (summary, labels, words) {
  if (Array.isArray(labels) && Array.isArray(words)) {
    words.map(s => s.toLowerCase()).forEach(word => {
      labels.forEach(label => {
        summary[label.login] = summary[label.login] || {}
        accumulate(summary[label.login], word)
      })
    })
  }
}

function readSource (filePath) {
  const issues = jsonfile.readFileSync(filePath)
  const summary = {}

  if (Array.isArray(issues) && issues.length) {
    issues.forEach((number, i) => {
      if (i > 5) return
      const issue = jsonfile.readFileSync(`./issues/${number}.json`)
      console.log(`${pad(i+1, 5)}#${pad(number, 5)} ${issue.title}`)

      // stat(summary, segment(issue.title))
      labelStat(summary, issue.assignees, segment(issue.title))

      if (Array.isArray(issue.comments)) {
        issue.comments.forEach(comment => {
          labelStat(summary, issue.assignees, segment(comment.body))
        })
      }
    })
  }

  return summary
}

function record () {
  jsonfile.spaces = 2

  // const wcount = wordCount(load.readIssues())
  // jsonfile.writeFile(`words/issue_word_count.json`, wcount)

  // const summary = readSource(`./summary/issues_with_label.json`)
  // jsonfile.writeFile(`words/issue_with_label_word_count.json`, summary)

  const summary = readSource(`./summary/issues_with_assignee.json`)
  jsonfile.writeFile(`words/issue_with_assignee_word_count.json`, summary)
}

record()
