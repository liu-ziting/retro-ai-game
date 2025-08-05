# 🎮 复古 AI 游戏对话平台

一个基于 Vue 3 + TypeScript 构建的沉浸式 AI 角色扮演游戏平台，提供多种游戏模式和复古像素风格的交互体验。

## ✨ 核心特性

-   🎯 **六大游戏模式** - 冒险探索、推理解谜、奇幻世界、科幻未来、浪漫恋爱、恐怖惊悚
-   🤖 **智能 AI 对话** - 基于智谱 AI GLM-4 模型的流式对话系统
-   🎨 **复古像素风格** - 精心设计的复古游戏界面和视觉效果
-   📱 **响应式设计** - 完美适配桌面端和移动端设备
-   ⚡ **实时交互** - 流畅的对话体验和即时反馈
-   🎲 **游戏机制** - 每种模式都有独特的游戏规则和进度系统

## 🛠️ 技术架构

### 前端技术栈

-   **Vue 3** - 渐进式 JavaScript 框架
-   **TypeScript** - 类型安全的 JavaScript 超集
-   **Pinia** - Vue 3 官方状态管理库
-   **Vite** - 下一代前端构建工具
-   **VueUse** - Vue 组合式 API 工具集

### AI 集成

-   **智谱 AI GLM-4** - 高性能大语言模型
-   **流式响应** - 实时对话体验
-   **上下文管理** - 智能对话记忆

## 📁 项目结构

```
retro-ai-game/
├── public/                 # 静态资源
├── src/
│   ├── components/         # Vue组件
│   │   └── GameInterface.vue
│   ├── config/            # 配置文件
│   │   ├── api.ts         # API配置和接口
│   │   └── gameMode.ts    # 游戏模式定义
│   ├── stores/            # Pinia状态管理
│   │   └── chat.ts        # 聊天状态管理
│   ├── types/             # TypeScript类型定义
│   │   └── index.ts       # 全局类型声明
│   ├── App.vue            # 根组件
│   ├── main.ts            # 应用入口
│   └── style.css          # 全局样式
├── index.html             # HTML模板
├── package.json           # 项目依赖
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite构建配置
└── netlify.toml           # Netlify部署配置
```

## 🚀 快速开始

### 环境要求

-   Node.js >= 18.0.0
-   npm >= 8.0.0

### 安装与运行

```bash
# 克隆项目
git clone <repository-url>
cd retro-ai-game

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

开发服务器将在 `http://localhost:8963` 启动

## 🎮 游戏模式详解

### 🗺️ 冒险探索

-   **核心机制**: 体力值、背包系统、命运骰子
-   **特色功能**: 随机事件、稀有道具收集、Boss 战
-   **游戏目标**: 探索神秘世界，收集传说道具

### 🔍 推理解谜

-   **核心机制**: 线索收集、推理点数、嫌疑人询问
-   **特色功能**: 证据组合、谎言识破、开庭审判
-   **游戏目标**: 解开复杂案件，找出真相

### 🧙‍♂️ 奇幻世界

-   **核心机制**: 法术系统、元素克制、腐化值
-   **特色功能**: 多种族声望、区域探索、古龙召唤
-   **游戏目标**: 掌握魔法，成为传奇法师

### 🚀 科幻未来

-   **核心机制**: 能源管理、护盾系统、AI 副官
-   **特色功能**: 星际跃迁、外交谈判、道德选择
-   **游戏目标**: 探索宇宙，维护星际和平

### 💕 浪漫恋爱

-   **核心机制**: 好感度系统、时段选择、礼物赠送
-   **特色功能**: 心动事件、情话挑战、多结局
-   **游戏目标**: 培养感情，获得真爱结局

### 👻 恐怖惊悚

-   **核心机制**: 恐惧值、光源管理、房间探索
-   **特色功能**: 随机事件、躲藏机制、净化仪式
-   **游戏目标**: 在恐怖中生存，揭开真相

## ⚙️ 配置说明

### API 配置

项目使用智谱 AI 的 GLM-4 模型，配置文件位于 `src/config/api.ts`：

```typescript
export interface ApiConfig {
    apiKey: string // API密钥
    baseUrl: string // API基础URL
    model: string // 使用的模型
    temperature: number // 生成温度
    systemPrompt: string // 系统提示词
}
```

### 游戏模式配置

每个游戏模式的详细配置在 `src/config/gameMode.ts` 中定义，包括：

-   游戏规则和机制
-   系统提示词
-   视觉样式配置

## 🌐 部署

### Netlify 部署

项目已配置 Netlify 自动部署：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 手动部署

```bash
# 构建项目
npm run build

# 部署dist目录到你的服务器
```

## 📄 开源协议

本项目采用 MIT 协议 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

-   [Vue 3 文档](https://vuejs.org/)
-   [TypeScript 文档](https://www.typescriptlang.org/)
-   [智谱 AI API](https://open.bigmodel.cn/)
-   [Vite 文档](https://vitejs.dev/)

---

**享受你的 AI 游戏之旅！** 🎮✨
