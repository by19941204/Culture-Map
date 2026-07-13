// TEMP STUB — replaced by generated data
const stub = (id, name) => ({
  id, nameEn: name, nameZh: name,
  taglineZh: 't', taglineEn: 't', lowLabelZh: 'L', lowLabelEn: 'L', highLabelZh: 'H', highLabelEn: 'H',
  descZh: 'd', descEn: 'd',
  lowBehaviorsZh: ['a'], lowBehaviorsEn: ['a'], highBehaviorsZh: ['a'], highBehaviorsEn: ['a'],
  advice: Object.fromEntries(['towardHigh','towardLow','aligned'].map(k => [k, {
    work: { zh: ['w'], en: ['w'] }, travel: { zh: ['t'], en: ['t'] },
  }])),
})
export const dimensions = ['communicating','evaluating','persuading','leading','deciding','trusting','disagreeing','scheduling'].map(d => stub(d, d))
