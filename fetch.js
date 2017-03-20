const GitHub = require('github-api/dist/GitHub.js')
const jsonfile = require('jsonfile')

const gh = new GitHub({
  username: 'Hanks10100',
  password: '**********'
})

function getAllIssues (agent) {
  console.log(` => fetching the issue list ...`)
  agent.listIssues({
    state: 'all'
  }, (err, issueList) => {
    if (err) {
      console.log(` => failed to fetch the issue list`)
      return
    }

    const issues = Array.from(issueList).filter(item => !item.pull_request)
    console.log(` => got ${issues.length} issues`)
    issues.forEach(issue => {
      // console.log(` => fetch the comments of ${issue.number}`)
      agent.listIssueComments(issue.number, (error, comments) => {
        if (error) {
          console.log(` => failed to fetch the comments of ${issue.number}`)
        } else {
          // console.log(` => got ${comments.length} comments of  ${issue.number}`)
          issue.comments = comments
          jsonfile.spaces = 2
          jsonfile.writeFile(`issues/${issue.number}.json`, issue, () => {
            // console.log(` => write issues/${issue.number}.json`)
          })
        }
      })
    })
  })
}

getAllIssues(gh.getIssues('alibaba', 'weex'))
