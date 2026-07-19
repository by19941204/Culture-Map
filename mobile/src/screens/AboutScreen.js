import { StyleSheet, Text, View } from 'react-native'
import { Screen, Card } from '../ui'
import { useTheme } from '../theme'
import { useLang } from '../i18n'

export default function AboutScreen() {
  const { colors } = useTheme()
  const { lang, t } = useLang()
  const zh = lang === 'zh'

  const steps = [
    zh
      ? '在「对比」页选择你的文化背景和对方的文化，再选择场景（工作协作 / 旅行社交）。'
      : 'On the Compare page, pick your culture and your counterpart’s, then choose a scenario (work or travel).',
    zh
      ? '看「重点注意的差异」和文化地图，了解双方在哪些维度上距离最远。'
      : 'Check the top differences and the culture map to see where the two cultures sit furthest apart.',
    zh
      ? '按建议行动：每条建议都是当天就能执行的具体行为，很多附带可直接使用的措辞。'
      : 'Act on the advice: every item is a behavior you can execute today, many with ready-to-use phrasing.',
  ]

  return (
    <Screen title={t('about.title')}>
      <Card style={styles.section} testID="about-what">
        <Text style={[styles.heading, { color: colors.ink }]}>
          {zh ? '这是什么' : 'What this is'}
        </Text>
        <Text style={[styles.para, { color: colors.ink2 }]}>
          {zh
            ? '在跨国合作或出国旅行时，最容易踩坑的不是语言，而是看不见的文化默认值：多直接算「直接」？迟到几分钟算「迟到」？会上不反驳是同意还是反对？本应用基于 Erin Meyer 在《The Culture Map》（文化地图）中提出的 8 维度框架，把两种文化放在同一张图上对比，并针对差异最大的地方给出可直接执行的建议。'
            : 'When you work or travel across borders, the traps are rarely the language — they are invisible cultural defaults: how direct is "direct"? How late is "late"? Is silence in a meeting agreement or disagreement? This app uses Erin Meyer’s 8-dimension framework from The Culture Map to put two cultures on one chart and turn the biggest gaps into concrete, executable advice.'}
        </Text>
      </Card>

      <Card style={styles.section} testID="about-how">
        <Text style={[styles.heading, { color: colors.ink }]}>
          {zh ? '怎么用' : 'How to use it'}
        </Text>
        {steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <Text style={[styles.stepNum, { color: colors.ink3 }]}>{i + 1}.</Text>
            <Text style={[styles.para, styles.stepText, { color: colors.ink2 }]}>{step}</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.section} testID="about-data">
        <Text style={[styles.heading, { color: colors.ink }]}>
          {zh ? '数据与局限' : 'Data & limitations'}
        </Text>
        <Text style={[styles.para, { color: colors.ink2 }]}>
          {zh
            ? '各维度分值（0–100）参考《The Culture Map》一书公开的国家相对位置，书中未覆盖的国家结合 Hofstede、GLOBE 等跨文化研究做了审慎插值，仅表示相对位置而非精确测量。'
            : 'Dimension scores (0–100) approximate the relative country positions published in The Culture Map; countries the book does not cover are carefully interpolated from cross-cultural research such as Hofstede and GLOBE. Scores express relative position, not precise measurement.'}
        </Text>
        <Text style={[styles.para, styles.strong, { color: colors.ink }]}>
          {zh
            ? '最重要的提醒：文化分值描述的是群体的统计倾向，不是对任何个人的预测。同一文化内部的个体差异，几乎总是大于文化之间的平均差异。把这张地图当作「第一次见面前的假设」，然后用真实的相处去更新它。'
            : 'The most important caveat: scores describe statistical tendencies of groups, never individuals. Variation within a culture almost always exceeds the average difference between cultures. Treat this map as a set of first-meeting hypotheses — then update them with the real person in front of you.'}
        </Text>
      </Card>

      <Card style={styles.section} testID="about-credits">
        <Text style={[styles.heading, { color: colors.ink }]}>
          {zh ? '致谢' : 'Credits'}
        </Text>
        <Text style={[styles.para, { color: colors.ink2 }]}>
          {zh
            ? '框架来自 Erin Meyer 的著作《The Culture Map: Breaking Through the Invisible Boundaries of Global Business》（2014）。强烈推荐阅读原书。本应用为独立的学习工具，与作者及出版方无关联。'
            : 'The framework comes from Erin Meyer’s book The Culture Map: Breaking Through the Invisible Boundaries of Global Business (2014) — highly recommended reading. This app is an independent learning tool, not affiliated with the author or publisher.'}
        </Text>
        <Text style={[styles.para, { color: colors.ink2 }]}>
          {zh
            ? '本应用不收集任何数据：没有后端、没有统计脚本，你的选择只保存在自己浏览器的本地存储中。'
            : 'This app collects no data: no backend, no analytics. Your selections live only in your browser’s local storage.'}
        </Text>
      </Card>

      <View style={styles.footer} testID="about-footer">
        <Text style={[styles.footerText, { color: colors.ink3 }]}>{t('footer.disclaimer')}</Text>
        <Text style={[styles.footerText, { color: colors.ink3 }]}>{t('footer.credit')}</Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  heading: { fontSize: 15, fontWeight: '700' },
  para: { fontSize: 14, lineHeight: 21 },
  strong: { fontWeight: '500' },
  stepRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  stepNum: { fontSize: 14, lineHeight: 21, fontVariant: ['tabular-nums'] },
  stepText: { flex: 1 },
  footer: { gap: 4, paddingHorizontal: 4 },
  footerText: { fontSize: 11, lineHeight: 16, textAlign: 'center' },
})
