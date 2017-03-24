function containChinese (string) {
  return !!/.*[\u4e00-\u9fa5]+.*$/.test(string)
}

function pickTop (array, N = 99999999) {
  const chosen = []

  for (const name in array) {
    if (!array[name]) continue
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

function accumulate (object, key, step = 1) {
  object[key] = object[key] || 0
  object[key] += step
}

function alignTime (timestamp) {
  const unit = 24 * 60 * 60 * 1000
  return Math.floor(parseInt(timestamp, 10) / unit) * unit
}

function pad (text, N) {
  let i = String(text).length
  while (i < N) {
    text += ' '
    i++
  }
  return text
}

module.exports = {
  containChinese,
  pickTop,
  alignTime,
  accumulate,
  alignTime,
  pad
}
