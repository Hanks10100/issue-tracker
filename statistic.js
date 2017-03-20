const load = require('./load.js')
const { containChinese, alignTime, accumulate, pickTop } = require('./utils.js')

function statistic (issues) {
  const authors = {}
  const commenters = {}
  const openTimeline = {}
  const closeTimeline = {}
  const summary = {
    issueCount: 0, // issue 的数量
    commentCount: 0, // 回复的数量
    enIssueCount: 0, // 英文问题的数量
    zhIssueCount: 0, //
    enCommentCount: 0, //
    zhCommentCount: 0, //
  }

  for (let number in issues) {
    summary.issueCount++

    const issue = issues[number]
    containChinese(issue.body) ? summary.zhIssueCount++ : summary.enIssueCount++

    accumulate(authors, issue.user.login)
    accumulate(openTimeline, alignTime(Date.parse(issue.created_at)))
    if (issue.state === 'closed') {
      accumulate(closeTimeline, alignTime(Date.parse(issue.closed_at)))
    }

    if (Array.isArray(issue.comments)) {
      issue.comments.forEach(comment => {
        summary.commentCount++
        containChinese(comment.body) ? summary.zhCommentCount++ : summary.enCommentCount++
        accumulate(commenters, comment.user.login)
      })
    }
  }

  summary.topAuthor = pickTop(authors, 10)
  summary.topCommenter = pickTop(commenters, 10)
  // summary.openTimeline = pickTop(openTimeline).sort((a, b) => a.timestamp - b.timestamp)
  // summary.closeTimeline = pickTop(closeTimeline).sort((a, b) => a.timestamp - b.timestamp)

  return summary
}

console.log(statistic(load.readIssues()))
// console.log(statistic(load.readPrs()))
