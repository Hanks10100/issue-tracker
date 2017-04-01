const Segment = require('segment')

function createSegment () {
  return new Segment()
    .useDefault()
    .loadStopwordDict('./stopword.txt')

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

function isAvailable (pair) {
  const word = String(pair.w)
  if (word.length <= 1 || Number(word)) return false
  switch (pair.p) {
    // case 0x40000000: return false; // 形容词 形容素
    // case 0x20000000: return false; // 区别词 区别语素
    case 0x10000000: return false; // 连词 连语素

    // case 0x08000000: return false; // 副词 副语素
    // case 0x04000000: return false; // 叹词 叹语素
    // case 0x02000000: return false; // 方位词 方位语素
    // case 0x01000000: return false; // 成语
    // // case 0x00800000: return false; // 习语
    // case 0x00400000: return false; // 数词 数语素
    // case 0x00200000: return false; // 数量词
    // // case 0x00100000: return false; // 名词 名语素
    // case 0x00080000: return false; // 拟声词
    // case 0x00040000: return false; // 介词
    // case 0x00020000: return false; // 量词 量语素
    // case 0x00010000: return false; // 代词 代语素
    // case 0x00008000: return false; // 处所词
    // case 0x00004000: return false; // 时间词
    // case 0x00002000: return false; // 助词 助语素
    // case 0x00001000: return false; // 动词 动语素
    // // case 0x00000400: return false; // 非语素字
    // case 0x00000200: return false; // 语气词 语气语素
    // case 0x00000100: return false; // 状态词
    // // case 0x00000080: return false; // 人名
    // case 0x00000040: return false; // 地名
    // case 0x00000020: return false; // 机构团体
    // case 0x00000010: return false; // 外文字符
    // case 0x00000008: return false; // 其他专名
    // case 0x00000004: return false; // 前接成分
    // case 0x00000002: return false; // 后接成分
    // case 0x00000000: return false; // 未知词性
    case 0x00000001: return false; // 网址、邮箱地址
  }

  return true
}

const segment = createSegment()
function doSegment (text) {
  return segment.doSegment(preProcess(text), {
    stripPunctuation: true,
    // simple: true
  }).filter(isAvailable).map(x => x.w)
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
