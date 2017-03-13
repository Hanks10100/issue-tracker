const Segment = require('segment')
const load = require('./load.js')
const { containChinese, pad, accumulate, pickTop } = require('./utils.js')

function createSegment () {
  const segment = new Segment()
  segment.useDefault()
  segment
    .use('URLTokenizer')            // URL识别
    .use('WildcardTokenizer')       // 通配符，必须在标点符号识别之前
    .use('PunctuationTokenizer')    // 标点符号识别
    .use('ForeignTokenizer')        // 外文字符、数字识别，必须在标点符号识别之后
    // 中文单词识别
    .use('DictTokenizer')           // 词典识别
    .use('ChsNameTokenizer')        // 人名识别，建议在词典识别之后

    // 优化模块
    .use('EmailOptimizer')          // 邮箱地址识别
    .use('ChsNameOptimizer')        // 人名识别优化
    .use('DictOptimizer')           // 词典识别优化
    .use('DatetimeOptimizer')       // 日期时间识别优化

  return segment
}

const segment = createSegment()

function sum (text, result) {
  const res = segment.doSegment(text, {
    stripPunctuation: true,
    simple: true
  })

  if (Array.isArray(res)) {
    res.forEach(word => accumulate(result, word))
  }
}

function seg (issues) {
  const summary = {
    title: {},
    body: {},
    comment: {},
  }

  for (let number in issues) {
    const issue = issues[number]

    console.log(`#${pad(number, 5)} ${issue.title}`)
    sum(issue.title, summary.title)
    sum(issue.body, summary.body)
    if (Array.isArray(issue.comments)) {
      issue.comments.forEach(comment => {
        sum(comment.body, summary.comment)
      })
    }
  }

  summary.title = pickTop(omit(summary.title), 10)
  summary.body = pickTop(omit(summary.body), 10)
  summary.comment = pickTop(omit(summary.comment), 10)

  return summary
}

function omit (object, count = 5) {
  const newObject = {}
  for (let key in object) {
    if (String(key).length <= 1) continue
    if (object[key] > count) {
      newObject[key] = object[key]
    }
  }
  return newObject
}

console.log(seg(load.readPrs()))
// seg(load.readIssues(990, 20))
