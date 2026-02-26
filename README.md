# 房产大师 (Fangdai Master)

帮助海外中国人管理房地产和税务的 AI 助手。

## 功能特性

### 1. 税务规划
- 专业的海外房产税务咨询
- 个性化税务方案规划
- 税款计算与预估
- 税务申报指导

### 2. 房产管理
- 多房产统一管理
- 房产信息录入与存档
- 租金收益追踪
- 房产估值分析

### 3. 证件管理
- 房产证件数字化存储
- 证件到期提醒
- 产权信息管理

### 4. 政策解读
- 最新房产政策推送
- 法规解读与分析
- 合规建议

## 技术栈

- **前端**: React Native (Expo)
- **后端**: CloudBase (云开发)
- **AI**: DeepSeek / OpenAI

## 项目结构

```
fangdai-master/
├── App.tsx              # 应用入口
├── src/
│   ├── screens/        # 页面
│   ├── components/     # 组件
│   ├── services/       # API 服务
│   ├── utils/         # 工具函数
│   └── types/         # 类型定义
├── cloudbase/         # 云函数
└── docs/              # 文档
```

## 开始开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npx expo start

# 运行在 iOS 模拟器
npx expo run:ios

# 运行在 Android
npx expo run:android
```

## License

MIT
