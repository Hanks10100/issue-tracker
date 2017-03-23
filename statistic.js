const jsonfile = require('jsonfile')
const load = require('./load.js')
const utils = require('./utils.js')

function statistic (issues) {
  const { accumulate, containChinese, pad, alignTime, pickTop } = utils

  const authors = {}
  const commenters = {}
  const assignees = {}
  const openTimeline = {}
  const closeTimeline = {}
  const labels = {}
  const summary = {
    hasLabel: [],
    hasAssignee: [],
    issueCount: 0, // issue 的数量
    commentCount: 0, // 回复的数量
    issueWithLabelCount: 0, // 回复的数量
    labelCount: 0, // 回复的数量
    enIssueCount: 0, // 英文问题的数量
    zhIssueCount: 0, //
    enCommentCount: 0, //
    zhCommentCount: 0, //
  }

  for (let number in issues) {
    const issue = issues[number]
    summary.issueCount++

    console.log(`#${pad(number, 5)} ${issue.title}`)

    containChinese(issue.body) ? summary.zhIssueCount++ : summary.enIssueCount++

    accumulate(authors, issue.user.login)
    accumulate(openTimeline, alignTime(Date.parse(issue.created_at)))
    if (issue.state === 'closed') {
      accumulate(closeTimeline, alignTime(Date.parse(issue.closed_at)))
    }

    if (issue.labels.length) {
      summary.issueWithLabelCount++
      summary.labelCount += issue.labels.length
      summary.hasLabel.push(number)
      // console.log(` => [${number}] label: ${issue.labels.map(x => x.name).join(', ')}`)
      issue.labels.forEach(label => {
        accumulate(labels, label.name)
      })
    }

    if (issue.assignees.length) {
      summary.hasAssignee.push(number)
      issue.assignees.forEach(user => {
        accumulate(assignees, user.login)
      })
    }

    if (Array.isArray(issue.comments)) {
      issue.comments.forEach(comment => {
        summary.commentCount++
        containChinese(comment.body) ? summary.zhCommentCount++ : summary.enCommentCount++
        accumulate(commenters, comment.user.login)
      })
    }
  }

  summary.topAuthor = pickTop(authors)
  summary.topCommenter = pickTop(commenters)
  summary.topLabel = pickTop(labels)
  summary.topAssignees = pickTop(assignees)
  // summary.openTimeline = pickTop(openTimeline).sort((a, b) => a.timestamp - b.timestamp)
  // summary.closeTimeline = pickTop(closeTimeline).sort((a, b) => a.timestamp - b.timestamp)

  return summary
}

// console.log(statistic(load.readIssues()))
// console.log(statistic(load.readPrs()))

function record () {
  const summary = statistic(load.readIssues())
  // console.log(summary)
  jsonfile.spaces = 2
  jsonfile.writeFile(`summary/issues_with_label.json`, summary.hasLabel)
  jsonfile.writeFile(`summary/issues_with_assignee.json`, summary.hasAssignee)
  jsonfile.writeFile(`summary/top_author.json`, summary.topAuthor)
  jsonfile.writeFile(`summary/top_commenter.json`, summary.topCommenter)
  jsonfile.writeFile(`summary/top_label.json`, summary.topLabel)
  jsonfile.writeFile(`summary/top_assignee.json`, summary.topAssignees)
  jsonfile.writeFile(`summary/statistic.json`, {
    issueCount: summary.issueCount,
    commentCount: summary.commentCount,
    issueWithLabelCount: summary.issueWithLabelCount,
    labelCount: summary.labelCount,
    enIssueCount: summary.enIssueCount,
    zhIssueCount: summary.zhIssueCount,
    enCommentCount: summary.enCommentCount,
    zhCommentCount: summary.zhCommentCount,
  })
}

record()
