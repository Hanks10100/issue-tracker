const fs = require('fs')
const chalk = require('chalk')
const db = require('./src/db.js')
const { segmentIssue } = require('./src/segment.js')
const { pickTop, pad } = require('./src/utils.js')

db.config({ basePath: 'db/weex' })

function judgeWords (words, options) {
  const result = {}
  const PA = db.readSync(options.words)
  // const PB = db.readSync(options.feature)
  const group = db.readSync(options.condition)

  for (const type in group) {
    const PAB = group[type]
    let count = 0
    let sum = 0
    words.forEach(word => {
      if (PA[word] && PAB[word]) {
        count++
        sum += PAB[word] / PA[word]
        // sum += PAB[word] * PB[type] / PA[word]
      }
    })
    result[type] = sum / count
  }

  return pickTop(result, 6)
}

function judge (number) {
  const issue = db.readIssue(number)
  if (issue) {
    console.log(`\n#${pad(issue.number, 5)} ${chalk.cyan(issue.title)}`)

    const words = segmentIssue(issue)

    output('Label', judgeWords(words, {
      words: 'data/label_words',
      feature: 'data/labels',
      condition: 'data/label_map'
    }))

    output('Assignee', judgeWords(words, {
      words: 'data/assignee_words',
      feature: 'data/assignees',
      condition: 'data/assignee_map'
    }))
  } else {
    console.log(`\n => ${chalk.red("No #" + number + ", maybe its a pull request")}`)
  }
}

function output (type, result) {
  if (Array.isArray(result)) {
    const maxLength = result.reduce((count, { name }) => {
      return Math.max(count, name.length)
    }, 0)

    console.log(`\n ${chalk.bold(type)}:\n`)
    result.forEach(({ name, count }) => {
      if (count && count >= 0.000001) {
        let color = chalk.reset
        switch (true) {
          case (count > 0.5): color = x => chalk.bold(chalk.green(x)); break;
          case (count > 0.4): color = chalk.bold; break;
          case (count < 0.15): color = chalk.grey; break;
        }
        console.log(`    ${color(pad(name, maxLength))}  ${color(count.toFixed(6))}`)
      }
    })
  }
}

let issueNumber = 539
if (process.argv[2]) {
  issueNumber = Number(process.argv[2])
}

judge(issueNumber)
