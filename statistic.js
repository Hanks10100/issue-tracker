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

function isChinese (string) {
  return !!/.*[\u4e00-\u9fa5]+.*$/.test(string)
}

function pickTop (lists, N = 99999999) {
  const chosen = [];
  let min = 9999999;

  for (let key in lists) {
    const item = { name: key, count: lists[key] }
    if (lists[key] <= min) {
      if (chosen.length <= N) {
        min = lists[key]
        chosen.push(item)
      }
    } else {
      for (let i = chosen.length - 2; i >= 0; --i) {
        if (chosen[i].count >= lists[key]) {
          chosen.splice(i + 1, 0, item)
          break
        }
        if (i === 0) {
          chosen.splice(i, 0, item)
        }
      }
      if (chosen.length > N) {
        chosen.pop()
        min = chosen[chosen.length - 1].count
      }
    }
  }

  return chosen
}

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
    isChinese(issue.body) ? summary.zhIssueCount++ : summary.enIssueCount++

    accumulate(authors, issue.user.login)
    accumulate(openTimeline, alignTime(Date.parse(issue.created_at)))
    if (issue.state === 'closed') {
      accumulate(closeTimeline, alignTime(Date.parse(issue.closed_at)))
    }

    if (Array.isArray(issue.comments)) {
      issue.comments.forEach(comment => {
        summary.commentCount++
        isChinese(comment.body) ? summary.zhCommentCount++ : summary.enCommentCount++
        accumulate(commenters, comment.user.login)
      })
    }
  }

  summary.topAuthor = pickTop(authors, 10)
  summary.topCommenter = pickTop(commenters, 10)
  summary.openTimeline = pickTop(openTimeline).sort((a, b) => a.timestamp - b.timestamp)
  summary.closeTimeline = pickTop(closeTimeline).sort((a, b) => a.timestamp - b.timestamp)

  return summary
}

console.log(statistic(load.readIssues()))
