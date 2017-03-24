const Segment = require('segment')

function createSegment () {
  return new Segment()
    .useDefault()
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
}

// TODO: pre process the raw text
function preProcess (text) {
  text = text.toLowerCase()

  // trim source code
  text = text.replace(/\s\`{3}[^\`]+\`{3}\s/gi, '\n')

  return text
}

const segment = createSegment()
function doSegment (text) {
  return segment.doSegment(preProcess(text), {
    stripPunctuation: true,
    simple: true
  })
}

function segmentIssue (issue, hook) {
  const result = {}

  result.number = issue.number
  result.title = doSegment(issue.title)
  result.body = doSegment(issue.body)
  if (Array.isArray(issue.comments)) {
    result.comments = issue.comments.map(comment => doSegment(comment.body))
  }

  hook && hook(result)

  return result
}

function segmentWords (issue, hook) {
  const words = []
  const result = segmentIssue(issue, hook)

  words.push(...result.title)
  words.push(...result.body)
  result.comments.forEach(comment => words.push(...comment))

  return words
}

module.exports = {
  segmentIssue,
  segmentWords,
  doSegment,
}
