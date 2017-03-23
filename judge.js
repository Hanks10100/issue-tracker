const fs = require('fs')
const chalk = require('chalk')
const jsonfile = require('jsonfile')
const segment = require('./segment')
const { pickTop, pad } = require('./utils.js')

function getWords (number) {
  const filename = `./issues/${number}.json`
  if (fs.existsSync(filename)) {
    const issue = jsonfile.readFileSync(filename)
    console.log(`\n#${pad(number, 5)} ${chalk.cyan(issue.title)}`)

    const words = segment(issue.title)
    Array.prototype.push.apply(words, segment(issue.body))
    if (Array.isArray(issue.comments)) {
      issue.comments.forEach(comment => {
        Array.prototype.push.apply(words, segment(comment.body))
      })
    }

    return words
  }
  console.log(`\n => ${chalk.red("No #" + number + ", maybe its a pull request")}`)
  return []
}

// function judgeWords (words, Pbase, Ptag, Ptarget) {
//   const result = {}
//
//   // console.log(words)
//   // console.log(words)
//   // console.log(Ptag)
//   // console.log(Ptarget)
//
//   for (const type in Ptarget) {
//     const group = Ptarget[type]
//     let count = 0
//     let sum = 0
//     words.forEach(word => {
//       if (Pbase[word] && group[word] && Ptag[type]) {
//         // console.log(`${type}: ${Ptag[type]}`)
//         // console.log(`${word}: ${group[word]}`)
//         count++
//         // sum += group[word] / Pbase[word]
//         // sum += group[word] / Pbase[word] / Ptag[type]
//         sum += Ptag[type] * group[word] / Pbase[word]
//       }
//     })
//     result[type] = sum / count
//   }
//
//   return result
// }


function judgeWords (words, options) {
  const PA = jsonfile.readFileSync(options.words)
  // const PB = jsonfile.readFileSync(options.feature)
  const group = jsonfile.readFileSync(options.condition)

  const result = {}

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

  return result
}

function judge (number) {
  const words = getWords(number)
  if (!words.length) return

  const assignees = judgeWords(words, {
    words: './data/assignee_words.json',
    feature: './data/assignees.json',
    condition: './data/assignee_map.json'
  })

  const labels = judgeWords(words, {
    words: './data/label_words.json',
    feature: './data/labels.json',
    condition: './data/label_map.json'
  })

  print('Label', pickTop(labels, 6))
  print('Assignee', pickTop(assignees, 6))
}

function print (type, result) {
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
