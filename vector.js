const db = require('./src/db.js')
const { segmentWords } = require('./src/segment.js')
const { pad, accumulate, pickTop } = require('./src/utils.js')


// 求样本平均值
function average (samples) {
  const N = samples.length
  let sum = 0
  for (let i = 0; i < N; ++i) {
    sum += samples[i]
  }
  return sum / N
}


/**
 * 矩阵转置
 * @param {Array<Float32Array>} matrix
 * @return {Array<Float32Array>}
 */
function transpose (matrix) {
  const M = matrix.length
  const N = matrix[0].length
  const result = []
  for (let j = 0; j < N; j++) {
    result[j] = []
    for (let i = 0; i < M; i++) {
      result[j][i] = matrix[i][j]
    }
  }
  return result
}

function timeToNumber (date) {
  return parseInt(Date.parse(date), 10) / 1000 / 60
}

// 统计特征值

// + [0]  作者给当前仓库提过的 issue 总条数
// + [1]  作者在当前仓库 issue 中回复的总条数
// + [2]  作者给当前仓库提过的 PR 总条数
// + [3]  作者给当前仓库提交的 commit 的总数
// + [4]  问题是否已经关闭
// + [5]  问题标题的字符长度
// + [6]  问题内容的字符长度
// + [7]  问题回复的条数
// + [8]  标题 + 问题 + 回复的总字符数
// + [9]  作者在回复中的字符数占总字符数的比例
// + [10] 提问的时间戳
// + [11] 从提出问题到最后一条回复的时间跨度
// + [12] 问题回复时间间隔的平均时长
//
// + [31] X 关键字在问题中的出现次数

// 一共 32 个特征值

// alias
// 安卓 -> android
// err -> error

// 19 组关键字（人肉分类）
// 关键字分类越规范越好
const featureWords = [
  ['android', '安卓', 'apk', '三星', '小米', '红米', '华为', '魅族', 'oppo'], // java
  ['ios', '苹果', 'iphone', 'ipad'],
  ['js', 'javascript', 'web', '浏览器', 'browser', 'html', 'render', '渲染'],
  ['js', 'javascript', 'runtime', '运行时', 'framework', 'jsfm', '框架', 'bridge', 'callnative', 'instance'],
  ['native', '客户端', '移动端', 'pad', '平板', 'sdk'],
  ['pc', '桌面', '桌面端', '操作系统', 'windows', 'mac', 'os', 'platform', '平台'],
  ['需求', '建议', 'advice', 'request', 'proposal'],
  ['动画', '交互', 'animation', 'animate', 'ui', 'ux'],
  ['version', '版本'],
  ['playground', '扫码', '二维码'],
  ['devtools', 'tools', 'toolkit', 'node', 'npm', 'weexpack', 'webpack', '工具', '编译', '打包', 'npm', 'debug'],
  ['css', 'style', 'color', 'layout', 'class', 'display', 'border', 'font', 'background', '字体', '背景', '样式', '效果', '颜色', '布局', 'px', 'height', 'width', '宽度', '高度'],
  ['error', 'err', 'bug', 'crash', 'failed', 'problem', '问题', '错误', '异常', '故障', '失败', '瘫痪', '不支持'],
  ['module', '模块', 'stream', 'picker', 'navigator'],
  ['组件', 'component', 'slider', '图片', 'text', 'scroller', 'indicator', 'input', 'video'],
  ['we', '.we', 'legacy', '旧版', 'syntax', '语法', 'transformer'],
  ['vue', '.vue', 'vuex', 'vueify', 'vuejs'],
  ['question', 'help', 'how', '问题', '求助', '怎样', '疑问', '如何', '指教', 'when', 'where', 'what', 'which'],
  ['文档', 'doc', '说明', '网站', '官网', '介绍', '教程', '社区', 'apache']
]

function parseIssue (issue) {
  if (!issue) return null

  const vector = []

  // 0: 作者给当前仓库提过的 issue 总条数
  vector[0] = Number(db.readSync('summary/authors')[issue.user.login]) || 0

  // 1: 作者在当前仓库 issue 中回复的总条数
  vector[1] = Number(db.readSync('summary/commenters')[issue.user.login]) || 0

  // 2: 作者给当前仓库提过的 PR 总条数
  vector[2] = 0 // TODO

  // 3: 作者给当前仓库提交的 commit 的总数
  vector[3] = 0 // TODO

  // 4: 问题是否已经关闭
  vector[4] = !!issue.closed_at ? 1 : 0

  // 5: 问题标题的字符长度
  vector[5] = issue.title.length

  // 6: 问题内容的字符长度
  vector[6] = issue.body.length

  // 7: 问题回复的条数
  vector[7] = issue.comments.length

  // 8: 标题 + 问题 + 回复的总字符数（加权）
  const commentWordLength = issue.comments.reduce((sum, { body }) => sum + body.length, 0)
  vector[8] = 0.6 * vector[5]
    + 0.3 * vector[6]
    + 0.1 * commentWordLength

  // 9: 作者在回复中的字符数占总字符数的比例
  const authorCommentWordLength = issue.comments.reduce((sum, comment) => {
    if (comment.login === issue.user.login) {
      return sum + comment.body.length
    }
    return sum
  }, 0)
  vector[9] = (vector[5] + vector[6] + authorCommentWordLength) / (vector[5] + vector[6] + commentWordLength)

  // 10: 提问的时间戳，保留分钟
  vector[10] = timeToNumber(issue.created_at)

  // 11: 从提出问题到最后一条回复的时间跨度
  vector[11] = (issue.comments.length > 0)
    ? timeToNumber(issue.comments[issue.comments.length - 1].updated_at) - vector[10]
    : 0

  // 12: 问题回复时间间隔的平均时长
  if (issue.comments.length > 1) {
    const timeGap = []
    issue.comments.reduce((A, B) => {
      timeGap.push(timeToNumber(B.updated_at) - timeToNumber(A.updated_at))
      return B
    })
    vector[12] = average(timeGap) || 0
  } else {
    vector[12] = 0
  }

  // TODO: X 关键字在问题中的出现次数
  const issueWords = {}
  segmentWords(issue).forEach(word => accumulate(issueWords, word))
  featureWords.forEach((words, i) => {
    const index = 0 + i
    vector[index] = 0
    words.forEach(word => {
      vector[index] += issueWords[word] || 0
    })
  })

  return vector
}

function record () {
  const issues = db.readAllIssues()
  const numbers = issues.map(issue => issue.number)
  const features = issues.map(issue => {
    console.log('#', issue.number, issue.title)
    return parseIssue(issue)
  })

  // const values = db.readAllIssues().map(parseIssue)
  const matrix = transpose(transpose(features).map(normalize))

  db.save('features/features', features)
  db.save('features/matrix', matrix)
  db.save('features/numbers', numbers)
  console.log('\n => done')
}


// 把样本中的数据值域映射到 [0, 1) 之间
// 前提：假设所有样本值都是正实数
function normalize (samples) {
  let min = Number.MAX_VALUE
  let max = Number.MIN_VALUE
  for (let i = 0; i < samples.length; ++i) {
    min = Math.min(min, samples[i])
    max = Math.max(max, samples[i])
  }

  const range = (max + min / samples.length) * 1.00000001
  return samples.map(x => (x) / (range))
}

// console.log(normalize([1, 0, 0, 1]))
// console.log(normalize([1, 2, 4, 1]))
// console.log(normalize([10, 20, 40, 10]))
// console.log(normalize([100, 200, 400, 100]))

record()
