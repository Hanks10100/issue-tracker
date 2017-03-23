const jsonfile = require('jsonfile')
const segment = require('./segment')
const { pad, accumulate } = require('./utils.js')

function stat (summary, words) {
  if (Array.isArray(words)) {
    words.map(s => s.toLowerCase()).forEach(word => {
      summary.wordCount++
      if (!summary.words[word]) summary.uniqueWordCount++
      accumulate(summary.words, word)
    })
  }
}

function labelStat (summary, labels, words) {
  if (Array.isArray(labels) && Array.isArray(words)) {
    words.map(s => s.toLowerCase()).forEach(word => {
      labels.forEach(label => {
        summary.labelWords[label.name] = summary.labelWords[label.name] || {}
        accumulate(summary.labelWords[label.name], word)
      })
    })
  }
}

function readSource (filePath) {
  const issues = jsonfile.readFileSync(filePath)
  const summary = {
    source: filePath,
    issueCount: 0,
    commentCount: 0,
    wordCount: 0,
    uniqueWordCount: 0,
    // words: {},
    labelWords: {},
  }
  // console.log(issues)
  if (Array.isArray(issues) && issues.length) {
    issues.forEach((number, i) => {
      // if (i > 5) return
      const issue = jsonfile.readFileSync(`./issues/${number}.json`)
      console.log(`${pad(i+1, 5)}#${pad(number, 5)} ${issue.title}`)

      summary.issueCount++
      // stat(summary, segment(issue.title))
      labelStat(summary, issue.labels, segment(issue.title))

      if (Array.isArray(issue.comments)) {
        issue.comments.forEach(comment => {
          summary.commentCount++
          // stat(summary, segment(comment.body))
          labelStat(summary, issue.labels, segment(comment.body))
        })
      }
    })
  }
  return summary
}

function record () {
  const summary = readSource(`./summary/issues_with_label.json`)
  // console.log(summary)
  jsonfile.spaces = 2
  // jsonfile.writeFile(`words/issue_word_count.json`, summary)
  jsonfile.writeFile(`words/issue_with_label_word_count.json`, summary.labelWords)
}

record()
