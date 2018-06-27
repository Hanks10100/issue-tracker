const GitHub = require('github-api/dist/GitHub.js')

const GitHubAgent = new GitHub({
  username: 'Hanks-bot',
  password: 'Hanks10100'
})
const issueAgent = GitHubAgent.getIssues('Hanks10100', 'meaningless')

const feedbacks = {
  English: {
    action: 'close',
    comment: `Sorry, We don't support **Chinese** issue.\n\n### sub title\n\nPlease use English.`
  }
}

function start () {
  // issueAgent.createIssueComment(1, feedbacks.English.comment, res => {
  //   console.log(res)
  // })

  issueAgent.editIssue(1, {
    state: 'open',
    labels: ['test', 'whatever'],
    assignees: ['Hanks-bot']
  }, res => {
    console.log(res)
  })

  // issueAgent.editIssueComment(338133182, 'Edited.', res => {
  //   console.log(res)
  // })
}

start()
