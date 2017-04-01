const FEATURE_COUNT = 32 // N

// 特征向量
function Vector (array) {
  const vector = new Float32Array(FEATURE_COUNT)
  for (let i = 0; i < FEATURE_COUNT; ++i) {
    vector[i] = array[i] || 1e-10
  }
  return vector
}

// 特征矩阵 M * N
function FeatureMatrix (matrix) {
  //
}

// 求样本平均值
function getMean (samples) {
  const N = samples.length
  let sum = 0
  for (let i = 0; i < N; ++i) {
    sum += samples[i]
  }
  return sum / N
}

// 求样本标准差 Standard Deviation
function getSD (samples) {
  const N = samples.length
  const mean = getMean(samples)
  let variance = 0
  for (let i = 0; i < N; ++i) {
    variance += (samples[i] - mean) * (samples[i] - mean)
  }
  return Math.sqrt(variance / N)
}

// 获取正态分布的密度函数
function gaussian (μ, σ) {
  return function f (x) {
    return Math.pow(Math.E, (x - μ) * (μ - x) / (2 * σ * σ)) / (σ * Math.sqrt(2 * Math.PI))
  }
}
