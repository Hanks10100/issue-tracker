const load = require('./load.js')

const summary = {
  topAuthor: [], // 提 issue 最多的人
  // topFixer: [], // 关闭 issue 最多的人
  topCommenter: [], // 回复 issue 最多的人

  issueCount: 0, // issue 的数量
  commentCount: 0, // 回复的数量
  enIssueCount: 0, // 英文问题的数量
  zhIssueCount: 0, //
  enCommentCount: 0, //
  zhCommentCount: 0, //
}

function containChinese (string) {
  return !!/.*[\u4e00-\u9fa5]+.*$/.test(string)
}

function pickTop (array, N = 99999999) {
  const chosen = []

  for (let name in array) {
    let i = chosen.length
    while (i > 0 && chosen[i - 1].count < array[name]) {
      i--
    }
    chosen.splice(i, 0, { name, count: array[name] })
    chosen.length > N && chosen.pop()
  }

  return chosen
}

// function pickTop(A,N){var T=[];for(var n in A){var v=A[n],i=T.length;while(i>0&&T[i-1].count<v)i--;T.splice(i,0,{name:n,count:v});T.length>N&&T.pop()}return T}

function alignTime (timestamp) {
  const unit = 24 * 60 * 60 * 1000
  return Math.floor(parseInt(timestamp, 10) / unit) * unit
}

function accumulate (object, key) {
  object[key] = object[key] || 0
  object[key]++
}

function statistic (issues) {
  const authors = {}
  const commenters = {}
  const openTimeline = {}
  const closeTimeline = {}

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
