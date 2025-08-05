# AI 游戏对话网站

一个基于 Vue3 + TypeScript 的复古风格 AI 对话游戏网站。

## 功能特点

-   🎮 多种游戏模式选择（冒险探索、推理解谜、奇幻世界等）
-   🤖 基于 OpenAI API 的流式对话
-   🎨 复古像素风格界面设计
-   📱 响应式设计，支持移动端

## 技术栈

-   Vue 3 + TypeScript
-   Pinia 状态管理
-   OpenAI API
-   Vite 构建工具

## 项目结构

```
src/
├── components/          # Vue组件
│   └── GameInterface.vue
├── config/             # 配置文件
│   ├── api.ts          # API配置
│   └── gameMode.ts     # 游戏模式配置
├── stores/             # Pinia状态管理
│   └── chat.ts         # 聊天状态管理
├── types/              # TypeScript类型定义
│   └── index.ts
├── App.vue
├── main.ts
└── style.css           # 全局样式
```

## 开发运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 游戏模式

1. **冒险探索** - 在神秘的世界中展开冒险
2. **推理解谜** - 化身侦探，解开复杂的谜题
3. **奇幻世界** - 进入魔法世界，体验奇幻冒险
4. **科幻未来** - 探索未来世界，体验科技碰撞
5. **浪漫恋爱** - 体验甜蜜的恋爱故事
6. **恐怖惊悚** - 在黑暗中寻找真相

## API 配置

项目使用智谱 AI 的 GLM-4 模型，配置在 `src/config/api.ts` 中。
