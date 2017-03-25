const db = require('./src/db.js')
const utils = require('./src/utils.js')

let repoName = 'weex'
if (process.argv[2]) {
  repoName = String(process.argv[2])
}

db.config({ basePath: `db/${repoName}` })

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
    if (!Object.keys(issue).length) continue;

    summary.issueCount++
    console.log(`#${pad(number, 5)} ${issue.title}`)

    containChinese(issue.title + issue.body) ? summary.zhIssueCount++ : summary.enIssueCount++

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

  return summary
}

function record () {
  const summary = statistic(db.readAllIssues())

  Promise.all([
    db.save(`summary/issues_with_label`, summary.hasLabel),
    db.save(`summary/issues_with_assignee`, summary.hasAssignee),
    db.save(`summary/top_author`, summary.topAuthor),
    db.save(`summary/top_commenter`, summary.topCommenter),
    db.save(`summary/top_label`, summary.topLabel),
    db.save(`summary/top_assignee`, summary.topAssignees),
    db.save(`summary/statistic`, {
      issueCount: summary.issueCount,
      commentCount: summary.commentCount,
      issueWithLabelCount: summary.issueWithLabelCount,
      labelCount: summary.labelCount,
      enIssueCount: summary.enIssueCount,
      zhIssueCount: summary.zhIssueCount,
      enCommentCount: summary.enCommentCount,
      zhCommentCount: summary.zhCommentCount,
    })
  ]).then(() => {
    console.log('\n => done')
  })

}

record()
