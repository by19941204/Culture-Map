// TEMP STUB — replaced by generated data
export const regions = { anglo: { nameZh: '英语国家', nameEn: 'Anglosphere' }, 'east-asia': { nameZh: '东亚', nameEn: 'East Asia' } }
export const regionOrder = ['east-asia', 'anglo']
const scores = Object.fromEntries(['communicating','evaluating','persuading','leading','deciding','trusting','disagreeing','scheduling'].map((d, i) => [d, 20 + i * 8]))
const mk = (code, nameEn, nameZh, flag, region) => ({
  code, nameEn, nameZh, flag, region, holistic: false, scores,
  noteZh: 'n', noteEn: 'n', travelTipsZh: ['t'], travelTipsEn: ['t'], workTipsZh: ['w'], workTipsEn: ['w'],
})
export const countries = [mk('CN','China','中国','🇨🇳','east-asia'), mk('US','United States','美国','🇺🇸','anglo')]
