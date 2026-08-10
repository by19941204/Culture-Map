# Culture Map · 跨文化协作指南

一个基于 Erin Meyer《The Culture Map》（文化地图）框架的跨文化速查应用，
包含 **iOS 手机 app**（`mobile/`，Expo/React Native）和 Web 版（仓库根目录）。
在跨国合作或出国旅行前，选择你的文化背景和对方的文化，即可：

- 📊 在 **8 个文化维度**（沟通方式、评价反馈、说服方式、领导方式、决策方式、信任建立、分歧处理、时间观念）上直观对比两种文化的位置
- 🎯 自动识别**差异最大的维度**，按差距大小排序
- ✅ 针对每个差异，获得**可直接执行的行动建议**（分「工作协作」与「旅行社交」两种场景）
- 🌏 浏览 **40 个国家/地区**的文化画像、商务礼仪与旅行礼仪速查
- 🌗 中英双语界面、浅色/深色主题、移动端适配

> A quick-reference web app based on Erin Meyer's *The Culture Map*. Pick your
> culture and your counterpart's, see where the two differ across 8 dimensions,
> and get concrete, actionable advice for work meetings and travel.

## 📱 iOS 手机 App（推荐）

`mobile/` 目录是 Expo (React Native) 应用，与 Web 版共用同一份数据源。

**在 iPhone 上运行（无需 Mac，无需开发者账号）：**

1. iPhone 的 App Store 安装免费的 **Expo Go**
2. 电脑上运行：
   ```bash
   cd mobile
   npm install
   npx expo start          # 局域网模式；跨网络加 --tunnel
   ```
3. 用 iPhone 相机扫终端里的二维码，应用即在 Expo Go 中打开

**打包成独立 App（TestFlight / App Store，无需 Mac）：**

```bash
cd mobile
npm install -g eas-cli
eas login                  # 免费 Expo 账号
eas build --platform ios   # 云端构建（上架需 Apple Developer 账号，$99/年）
eas submit --platform ios  # 提交 TestFlight / App Store
```

## 🖥 Web 版 Getting started

```bash
npm install
npm run dev       # 开发模式，默认 http://localhost:5173
npm run build     # 生产构建，输出到 dist/
npm run preview   # 预览生产构建
```

Web 版在 iPhone Safari 中也可「分享 → 添加到主屏幕」作为轻量应用使用。

## 技术栈 Tech stack

- **iOS app**: Expo SDK 57 (React Native 0.86) + React Navigation 7 + AsyncStorage
- **Web**: React 19 + Vite 8 + Tailwind CSS 4 + React Router 7
- 数据共享：`src/data/`（40 国 × 8 维度双语数据）与建议引擎 `src/lib/advice.js` 由两端共用（`mobile/metro.config.js` 指向仓库根目录）
- 无后端：所有文化数据打包在应用内，可离线使用（旅行场景友好）

## 数据说明 Data disclaimer

文化维度分值参考 Erin Meyer《The Culture Map》一书中公开的国家相对位置，并结合
Hofstede / GLOBE 等跨文化研究对书中未覆盖的国家做了审慎插值。分值刻画的是**文化
群体的统计倾向，不是对任何个人的预测**——请始终把对面的人当作个体来认识。

Dimension scores approximate the relative country positions published in Erin
Meyer's *The Culture Map*, interpolated for uncovered countries using
cross-cultural research (Hofstede, GLOBE). Scores describe statistical
tendencies of cultures, never individuals.

## 部署 Deployment

- **GitHub Pages**: `vite.config.js` 中 `base` 已设为 `/culture-map/`，`public/404.html` 提供 SPA 路由回退。
- **Railway**: 见 `railway.json`（`npm run build` + `serve dist`）。
