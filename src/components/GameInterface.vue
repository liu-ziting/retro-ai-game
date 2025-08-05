<template>
    <div class="retro-computer">
        <!-- 复古电脑外壳 -->
        <div class="computer-shell">
            <!-- CRT显示器 -->
            <div class="crt-monitor">
                <div class="monitor-bezel">
                    <div class="screen-container">
                        <!-- CRT效果层 -->
                        <div class="crt-effects">
                            <!-- 扫描线效果 - 已移除 -->
                            <!-- <div class="scanlines"></div> -->
                            <!-- 屏幕发光效果 -->
                            <div class="screen-glow"></div>
                            <!-- 闪烁效果 -->
                            <div class="screen-flicker"></div>
                        </div>

                        <!-- 游戏模式选择界面 -->
                        <div v-if="!chatStore.currentGameMode" class="mode-selection-screen">
                            <div class="terminal-header">
                                <div class="terminal-title">
                                    <div class="title-desktop">
                                        ╔══════════════════════════════════════╗<br />
                                        ║ AI GAME TERMINAL ║<br />
                                        ║ SELECT GAME MODE ║<br />
                                        ╚══════════════════════════════════════╝
                                    </div>
                                    <div class="title-mobile">
                                        ┌─ AI GAME TERMINAL ─┐<br />
                                        │ SELECT GAME MODE │<br />
                                        └─────────────────────┘
                                    </div>
                                </div>
                            </div>

                            <div class="game-modes-list">
                                <div v-for="mode in GAME_MODES" :key="mode.id" class="mode-option" @click="selectGameMode(mode)">
                                    <div class="mode-header">
                                        <span class="mode-icon">{{ mode.icon }}</span>
                                        <span class="mode-name">{{ mode.name }}</span>
                                    </div>
                                    <div class="mode-desc">{{ mode.description }}</div>
                                </div>
                            </div>

                            <div class="terminal-prompt">> SELECT A GAME MODE TO BEGIN_</div>
                        </div>

                        <!-- AI对话界面 -->
                        <div v-else class="chat-screen">
                            <!-- 终端头部 -->
                            <div class="terminal-header">
                                <div class="terminal-title">
                                    <div class="title-desktop">
                                        ╔══════════════════════════════════════╗<br />
                                        ║ {{ chatStore.currentGameMode.icon }} {{ chatStore.currentGameMode.name.toUpperCase() }} TERMINAL ║<br />
                                        ╚══════════════════════════════════════╝
                                    </div>
                                    <div class="title-mobile">
                                        ┌─ {{ chatStore.currentGameMode.icon }} {{ chatStore.currentGameMode.name.toUpperCase() }} ─┐<br />
                                        │ TERMINAL │<br />
                                        └─────────────┘
                                    </div>
                                </div>
                                <button class="exit-btn retro-3d-btn" @click="backToModeSelection">×</button>
                            </div>

                            <!-- 消息显示区域 -->
                            <div class="messages-display" ref="messagesContainer">
                                <div
                                    v-for="message in chatStore.messages"
                                    :key="message.id"
                                    class="terminal-message"
                                    :class="{ 'user-msg': message.role === 'user', 'ai-msg': message.role === 'assistant' }"
                                >
                                    <div class="message-prefix">
                                        {{ message.role === 'user' ? '> USER:' : '> AI:' }}
                                    </div>
                                    <div class="message-content">
                                        {{ message.content }}
                                        <!-- 流式输出光标 -->
                                        <span v-if="chatStore.streamingMessageId === message.id && message.content" class="terminal-cursor">█</span>
                                        <!-- 打字指示器 -->
                                        <div v-if="message.role === 'assistant' && chatStore.streamingMessageId === message.id && !message.content" class="typing-dots">
                                            PROCESSING<span class="dots">...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 终端输入提示 -->
                            <div class="terminal-input-line">
                                <span class="input-prompt">> </span>
                                <span class="input-text">{{ userInput }}</span>
                                <span class="terminal-cursor" v-if="!chatStore.isLoading">█</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 显示器控制按钮 -->
                <div class="monitor-controls">
                    <div class="control-knob power-btn retro-3d-knob" :class="{ active: chatStore.currentGameMode }">
                        <div class="knob-label">PWR</div>
                    </div>
                    <div class="control-knob brightness-btn retro-3d-knob">
                        <div class="knob-label">BRT</div>
                    </div>
                    <div class="control-knob contrast-btn retro-3d-knob">
                        <div class="knob-label">CON</div>
                    </div>
                </div>
            </div>

            <!-- 控制面板 -->
            <div class="control-panel">
                <!-- 输入区域 -->
                <div class="input-section">
                    <div class="input-container retro-3d-panel">
                        <input
                            ref="mainInput"
                            v-model="userInput"
                            class="retro-input"
                            :placeholder="getInputPlaceholder()"
                            @keypress.enter="handleSendMessage"
                            :disabled="chatStore.isLoading || !chatStore.currentGameMode"
                        />
                        <button class="send-btn retro-3d-btn" @click="handleSendMessage" :disabled="!userInput.trim() || chatStore.isLoading">
                            <span class="btn-icon">⚡</span>
                            SEND
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 移动端悬浮输入框 -->
        <div class="mobile-input-panel" v-if="chatStore.currentGameMode">
            <div class="mobile-input-container">
                <input
                    ref="mobileInput"
                    v-model="userInput"
                    class="mobile-input"
                    :placeholder="getInputPlaceholder()"
                    @keypress.enter="handleSendMessage"
                    :disabled="chatStore.isLoading"
                />
                <button class="mobile-send-btn" @click="handleSendMessage" :disabled="!userInput.trim() || chatStore.isLoading">
                    <span class="mobile-btn-icon">⚡</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { GAME_MODES } from '@/config/gameMode'
import type { GameMode } from '@/config/gameMode'

const chatStore = useChatStore()
const userInput = ref('')
const messagesContainer = ref<HTMLElement>()
const mainInput = ref<HTMLInputElement>()
const mobileInput = ref<HTMLInputElement>()

// 检测是否为移动端
const isMobile = () => {
    return window.innerWidth <= 768
}

// 获取当前应该使用的输入框
const getCurrentInput = () => {
    return isMobile() ? mobileInput.value : mainInput.value
}

// 获取输入框占位符
const getInputPlaceholder = () => {
    if (!chatStore.currentGameMode) return '请先选择游戏模式...'
    return '输入你的消息...'
}

// 初始化
onMounted(() => {
    chatStore.initClient()
    // 自动聚焦输入框
    const currentInput = getCurrentInput()
    if (currentInput) {
        currentInput.focus()
    }
})

// 选择游戏模式
const selectGameMode = async (mode: GameMode) => {
    chatStore.setGameMode(mode)

    // 自动发送"开始游戏"消息
    await chatStore.sendMessage('开始游戏')

    nextTick(() => {
        const currentInput = getCurrentInput()
        if (currentInput) {
            currentInput.focus()
        }
    })
}

// 返回模式选择
const backToModeSelection = () => {
    chatStore.resetGame()
    userInput.value = ''
}

// 发送消息
const handleSendMessage = async () => {
    if (!userInput.value.trim() || chatStore.isLoading) return

    const message = userInput.value.trim()
    userInput.value = ''

    await chatStore.sendMessage(message)

    // 保持输入框聚焦
    const currentInput = getCurrentInput()
    if (currentInput) {
        currentInput.focus()
    }
}

// 滚动到底部
const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}

// 监听消息变化，自动滚动
watch(
    () => chatStore.messages.length,
    () => {
        nextTick(() => {
            scrollToBottom()
        })
    }
)

// 监听消息内容变化（流式更新时），自动滚动
watch(
    () => chatStore.messages.map(m => m.content).join(''),
    () => {
        nextTick(() => {
            scrollToBottom()
        })
    },
    { flush: 'post' }
)
</script>

<style scoped>
.retro-computer {
    width: 100vw;
    height: 100vh;
    height: 100dvh; /* 动态视口高度，更好地处理移动端 */
    background: radial-gradient(ellipse at center, #34495e 0%, #2c3e50 70%, #1a252f 100%), linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Courier New', monospace;
    padding: 20px;
    padding-top: max(20px, env(safe-area-inset-top));
    padding-bottom: max(20px, env(safe-area-inset-bottom));
    padding-left: max(20px, env(safe-area-inset-left));
    padding-right: max(20px, env(safe-area-inset-right));
    box-sizing: border-box;
    /* perspective: 1000px; 移除3D透视 */
}

.computer-shell {
    width: 100%;
    max-width: 1200px;
    background: linear-gradient(145deg, #3d566e, #2c3e50), linear-gradient(45deg, #34495e, #2c3e50);
    border-radius: 25px;
    padding: 35px;
    box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1), 0 25px 50px rgba(0, 0, 0, 0.5), 0 10px 20px rgba(0, 0, 0, 0.3);
    border: 4px solid #1a252f;
    position: relative;
    /* transform: rotateX(5deg); 移除屏幕倾斜 */
}

.computer-shell::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #4a6741, #2c3e50, #4a6741);
    border-radius: 27px;
    z-index: -1;
    opacity: 0.3;
}

/* CRT显示器样式 */
.crt-monitor {
    background: linear-gradient(145deg, #1a252f, #0f1419), radial-gradient(ellipse at center, #1a252f 0%, #0f1419 100%);
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 25px;
    position: relative;
    box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(0, 255, 65, 0.1), 0 15px 30px rgba(0, 0, 0, 0.4), 0 5px 15px rgba(0, 0, 0, 0.3);
    border: 3px solid #0a0f14;
}

.crt-monitor::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: linear-gradient(45deg, #00ff41, #0a0f14, #00ff41);
    border-radius: 23px;
    z-index: -1;
    opacity: 0.2;
}

.monitor-bezel {
    background: radial-gradient(ellipse at center, #111 0%, #000 100%);
    border-radius: 15px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.8), inset 0 0 10px rgba(0, 255, 65, 0.2);
}

.screen-container {
    background: radial-gradient(ellipse at center, #002200 0%, #001100 70%, #000800 100%);
    color: #00ff41;
    min-height: 450px;
    border-radius: 10px;
    position: relative;
    overflow: hidden;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.4;
    padding: 25px;
    box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.9), inset 0 0 20px rgba(0, 255, 65, 0.1);
}

/* CRT效果层 */
.crt-effects {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 10;
}

/* 扫描线效果 - 已移除
.scanlines {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.05) 2px, rgba(0, 255, 65, 0.05) 4px);
    animation: scanlines-move 0.1s linear infinite;
}

@keyframes scanlines-move {
    0% {
        transform: translateY(0px);
    }
    100% {
        transform: translateY(4px);
    }
}
*/

/* 屏幕发光效果 */
.screen-glow {
    position: absolute;
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    background: radial-gradient(ellipse at center, rgba(0, 255, 65, 0.1) 0%, transparent 70%);
    animation: screen-glow-pulse 3s ease-in-out infinite alternate;
}

@keyframes screen-glow-pulse {
    0% {
        opacity: 0.3;
    }
    100% {
        opacity: 0.7;
    }
}

/* 闪烁效果 */
.screen-flicker {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 255, 65, 0.02);
    animation: screen-flicker 0.15s infinite linear alternate;
}

@keyframes screen-flicker {
    0%,
    100% {
        opacity: 1;
    }
    98% {
        opacity: 0.96;
    }
    99% {
        opacity: 0.98;
    }
}

/* 终端样式 */
.terminal-header {
    margin-bottom: 25px;
    position: relative;
    z-index: 5;
}

.terminal-title {
    color: #00ff41;
    font-weight: bold;
    text-align: center;
    margin-bottom: 15px;
}

.title-mobile {
    display: none;
}

.title-desktop {
    display: block;
}

/* 3D按钮样式 */
.retro-3d-btn {
    background: linear-gradient(145deg, #4a6741, #2c3e50), linear-gradient(45deg, #34495e, #2c3e50);
    border: 3px solid #1a252f;
    color: #00ff41;
    padding: 12px 20px;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    font-size: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
}

.retro-3d-btn:hover:not(:disabled) {
    background: linear-gradient(145deg, #5a7751, #3c5a78), linear-gradient(45deg, #4a6741, #34495e);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.4);
}

.retro-3d-btn:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(0, 0, 0, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.1);
}

.retro-3d-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.btn-icon {
    font-size: 14px;
}

.exit-btn {
    position: absolute;
    top: 0;
    right: 0;
    padding: 8px 12px;
    font-size: 10px;
}

/* 游戏模式选择 */
.mode-selection-screen {
    height: 100%;
    display: flex;
    flex-direction: column;
    z-index: 5;
    position: relative;
}

.game-modes-list {
    flex: 1;
    margin: 25px 0;
}

.mode-option {
    display: flex;
    align-items: center;
    padding: 12px 0;
    cursor: pointer;
    border-left: 4px solid transparent;
    transition: all 0.3s;
    position: relative;
}

.mode-option:hover {
    border-left-color: #00ff41;
    background: rgba(0, 255, 65, 0.1);
    padding-left: 15px;
}

.mode-header {
    display: flex;
    align-items: center;
}

.mode-icon {
    margin-right: 15px;
    font-size: 18px;
}

.mode-name {
    font-weight: bold;
    margin-right: 20px;
}

.mode-desc {
    color: #888;
    font-size: 12px;
}

.terminal-prompt {
    color: #ffff00;
    margin-top: 25px;
    animation: blink 1s infinite;
}

/* 对话界面 */
.chat-screen {
    height: 100%;
    display: flex;
    flex-direction: column;
    z-index: 5;
    position: relative;
}

.messages-display {
    flex: 1;
    overflow-y: auto;
    margin: 25px 0;
    max-height: 320px;
    /* 隐藏滚动条但保持滚动功能 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
}

.messages-display::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}

.terminal-message {
    margin-bottom: 18px;
}

.message-prefix {
    color: #ffff00;
    font-weight: bold;
    margin-bottom: 8px;
}

.user-msg .message-prefix {
    color: #00ffff;
}

.message-content {
    color: #00ff41;
    white-space: pre-wrap;
    word-wrap: break-word;
    padding-left: 25px;
    text-shadow: none !important;
}

.terminal-input-line {
    display: flex;
    align-items: center;
    color: #00ff41;
    border-top: 2px solid #333;
    padding-top: 15px;
}

.input-prompt {
    color: #ffff00;
    margin-right: 8px;
}

.input-text {
    flex: 1;
}

.terminal-cursor {
    animation: blink 1s infinite;
    color: #00ff41;
}

.typing-dots .dots {
    animation: dots 1.5s infinite;
}

@keyframes blink {
    0%,
    50% {
        opacity: 1;
    }
    51%,
    100% {
        opacity: 0;
    }
}

@keyframes dots {
    0%,
    20% {
        content: '';
    }
    40% {
        content: '.';
    }
    60% {
        content: '..';
    }
    80%,
    100% {
        content: '...';
    }
}

/* 显示器控制按钮 */
.monitor-controls {
    position: absolute;
    bottom: 15px;
    right: 25px;
    display: flex;
    gap: 15px;
}

.retro-3d-knob {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #555, #333, #222);
    border: 3px solid #1a1a1a;
    cursor: pointer;
    position: relative;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3);
    transition: all 0.3s;
}

.retro-3d-knob:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.4);
}

.retro-3d-knob:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(0, 0, 0, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.1);
}

.power-btn.active {
    background: radial-gradient(circle at 30% 30%, #00ff41, #00cc33, #009922);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.3);
}

.knob-label {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 8px;
    color: #666;
    font-weight: bold;
}

/* 控制面板 */
.control-panel {
    background: linear-gradient(145deg, #2c3e50, #1a252f), linear-gradient(45deg, #34495e, #2c3e50);
    border-radius: 15px;
    padding: 25px;
    box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.1), 0 10px 20px rgba(0, 0, 0, 0.3);
    border: 2px solid #1a252f;
}

.input-section {
    margin-top: 0;
}

.retro-3d-panel {
    background: linear-gradient(145deg, #1a252f, #0f1419), linear-gradient(45deg, #2c3e50, #1a252f);
    border: 3px solid #0a0f14;
    border-radius: 10px;
    padding: 20px;
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(0, 255, 65, 0.1), 0 5px 10px rgba(0, 0, 0, 0.3);
}

.input-container {
    display: flex;
    gap: 15px;
    align-items: center;
}

.retro-input {
    flex: 1;
    background: linear-gradient(145deg, #2c3e50, #1a252f);
    border: 2px solid #34495e;
    color: #00ff41;
    padding: 15px 20px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    border-radius: 8px;
    box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.retro-input:focus {
    outline: none;
    border-color: #4a6741;
    box-shadow: inset 0 0 25px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(0, 0, 0, 0.4);
}

.retro-input::placeholder {
    color: rgba(0, 255, 65, 0.4);
}

.send-btn {
    padding: 15px 25px;
    font-size: 14px;
    white-space: nowrap;
}

/* 移动端悬浮输入框 */
.mobile-input-panel {
    display: none; /* 默认隐藏，只在移动端显示 */
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.mobile-input-container {
    display: flex;
    gap: 8px;
    align-items: center;
    background: linear-gradient(145deg, #2c3e50, #1a252f);
    border: 2px solid #34495e;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
    position: relative;
}

.mobile-input {
    flex: 1;
    background: linear-gradient(145deg, #1a252f, #0f1419);
    border: 2px solid #34495e;
    color: #00ff41;
    padding: 14px 18px;
    font-family: 'Courier New', monospace;
    font-size: 16px; /* 防止iOS缩放 */
    border-radius: 8px;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
}

.mobile-input:focus {
    outline: none;
    border-color: #4a6741;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(0, 0, 0, 0.4);
}

.mobile-input::placeholder {
    color: rgba(0, 255, 65, 0.4);
}

.mobile-send-btn {
    background: linear-gradient(145deg, #4a6741, #2c3e50);
    border: 2px solid #34495e;
    color: #00ff41;
    padding: 14px 18px;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    font-size: 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 56px;
}

.mobile-send-btn:hover:not(:disabled) {
    background: linear-gradient(145deg, #5a7751, #3c5a78);
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.4);
}

.mobile-send-btn:active {
    transform: translateY(1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(0, 0, 0, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.1);
}

.mobile-send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.mobile-btn-icon {
    font-size: 18px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    position: relative;
    z-index: 1;
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
    .mode-option {
        -webkit-tap-highlight-color: rgba(0, 255, 65, 0.2);
    }

    .retro-3d-btn {
        -webkit-tap-highlight-color: rgba(0, 255, 65, 0.2);
        min-height: 44px; /* iOS推荐的最小触摸目标 */
    }

    .retro-input {
        -webkit-appearance: none;
        appearance: none;
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .retro-computer {
        padding: 8px;
        padding-top: max(5px, env(safe-area-inset-top));
        padding-bottom: max(80px, env(safe-area-inset-bottom)); /* 为悬浮输入框留出空间 */
        padding-left: max(5px, env(safe-area-inset-left));
        padding-right: max(5px, env(safe-area-inset-right));
        height: 100vh;
        height: 96dvh;
        align-items: stretch;
    }
    .computer-shell {
        padding: 12px;
        max-width: none;
        height: 100%;
        display: flex;
        flex-direction: column;
        border-radius: 15px;
    }

    .crt-monitor {
        padding: 12px;
        margin-bottom: 12px;
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .monitor-bezel {
        padding: 12px;
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .screen-container {
        font-size: 13px;
        min-height: auto;
        padding: 15px;
        flex: 1;
        display: flex;
        flex-direction: column;
        max-height: calc(100dvh - 160px); /* 确保不会超出屏幕 */
    }

    .terminal-title {
        font-size: 8px;
        line-height: 1;
        margin-bottom: 5px;
    }

    .title-desktop {
        display: none;
    }

    .title-mobile {
        display: block;
        font-size: 10px;
    }

    .mode-selection-screen {
        flex: 1;
    }

    .game-modes-list {
        margin: 15px 0;
        flex: 1;
    }

    .mode-option {
        padding: 15px 10px;
        margin-bottom: 8px;
        border-radius: 8px;
        border: 1px solid #333;
        background: rgba(0, 0, 0, 0.3);
        flex-direction: column;
        align-items: stretch;
    }

    .mode-option:hover {
        padding-left: 10px;
        border-color: #00ff41;
        background: rgba(0, 255, 65, 0.15);
    }

    .mode-header {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .mode-icon {
        font-size: 20px;
        margin-right: 12px;
        flex-shrink: 0;
    }

    .mode-name {
        font-size: 14px;
        min-width: auto;
        margin-right: 0;
        font-weight: bold;
    }

    .mode-desc {
        font-size: 11px;
        color: #999;
        margin-top: 0;
        padding-left: 32px;
        line-height: 1.3;
    }

    .terminal-prompt {
        font-size: 12px;
        margin-top: 15px;
    }

    .chat-screen {
        flex: 1;
    }

    .messages-display {
        margin: 8px 0;
        flex: 1;
        max-height: calc(100dvh - 200px); /* 为悬浮输入框留出空间 */
        min-height: 120px;
        overflow-y: auto;
        /* 隐藏滚动条但保持滚动功能 */
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
    }

    .messages-display::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
    }

    .terminal-message {
        margin-bottom: 15px;
    }

    .message-prefix {
        font-size: 12px;
        margin-bottom: 5px;
    }

    .message-content {
        font-size: 13px;
        padding-left: 15px;
        line-height: 1.4;
        text-shadow: none !important;
    }

    .terminal-input-line {
        padding-top: 10px;
        font-size: 13px;
    }

    .control-panel {
        display: none; /* 在移动端隐藏桌面版控制面板 */
    }

    /* 显示移动端悬浮输入框 */
    .mobile-input-panel {
        display: block;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 12px;
        padding-bottom: max(12px, env(safe-area-inset-bottom));
        background: linear-gradient(180deg, transparent 0%, rgba(26, 37, 47, 0.8) 20%, rgba(26, 37, 47, 0.95) 100%);
        backdrop-filter: blur(20px) saturate(1.2);
        z-index: 1000;
        /* border-top: 1px solid rgba(74, 103, 65, 0.3); */
        box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.3), 0 -2px 8px rgba(0, 0, 0, 0.2);
    }

    .exit-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        padding: 4px 8px;
        font-size: 9px;
        margin: 0;
        min-height: auto;
        z-index: 10;
    }

    .monitor-controls {
        display: none; /* 在移动端隐藏装饰性控制按钮 */
    }
}

@media (max-width: 480px) {
    .retro-computer {
        padding: 5px;
        padding-bottom: max(70px, env(safe-area-inset-bottom));
    }

    .computer-shell {
        padding: 8px;
        border-radius: 12px;
    }

    .crt-monitor {
        padding: 8px;
        margin-bottom: 8px;
        border-radius: 10px;
    }

    .monitor-bezel {
        padding: 8px;
        border-radius: 8px;
    }

    .screen-container {
        font-size: 12px;
        padding: 12px;
        border-radius: 6px;
        max-height: calc(90dvh - 120px);
    }

    .terminal-title {
        font-size: 7px;
        line-height: 1;
        margin-bottom: 4px;
    }

    .mode-option {
        padding: 12px 8px;
        margin-bottom: 6px;
    }

    .mode-header {
        margin-bottom: 6px;
    }

    .mode-icon {
        font-size: 18px;
        margin-right: 10px;
    }

    .mode-name {
        font-size: 13px;
    }

    .mode-desc {
        font-size: 10px;
        padding-left: 28px;
    }

    .terminal-prompt {
        font-size: 11px;
        margin-top: 12px;
    }

    .messages-display {
        margin: 6px 0;
        min-height: 100px;
        max-height: calc(100dvh - 180px);
        overflow-y: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .messages-display::-webkit-scrollbar {
        display: none;
    }

    .message-prefix {
        font-size: 11px;
    }

    .message-content {
        font-size: 12px;
        padding-left: 12px;
    }

    .terminal-input-line {
        font-size: 12px;
    }

    .control-panel {
        display: none;
    }

    .mobile-input-panel {
        padding: 8px;
        padding-bottom: max(8px, env(safe-area-inset-bottom));
    }

    .mobile-input-container {
        padding: 10px;
        border-radius: 14px;
    }

    .mobile-input {
        padding: 12px 15px;
        font-size: 16px;
        border-radius: 10px;
    }

    .mobile-send-btn {
        padding: 12px 15px;
        font-size: 13px;
        min-width: 50px;
        border-radius: 10px;
    }

    .exit-btn {
        position: absolute;
        top: 3px;
        right: 3px;
        padding: 3px 6px;
        font-size: 8px;
        margin: 0;
        min-height: auto;
        z-index: 10;
    }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
    .retro-computer {
        padding: 3px;
        padding-bottom: max(60px, env(safe-area-inset-bottom));
    }

    .computer-shell {
        padding: 6px;
    }

    .crt-monitor {
        padding: 6px;
        margin-bottom: 6px;
    }

    .monitor-bezel {
        padding: 6px;
    }

    .screen-container {
        font-size: 11px;
        padding: 8px;
        max-height: calc(100dvh - 100px);
    }

    .terminal-title {
        font-size: 6px;
        margin-bottom: 6px;
    }

    .mode-option {
        padding: 10px 6px;
        margin-bottom: 4px;
    }

    .mode-header {
        margin-bottom: 4px;
    }

    .mode-name {
        font-size: 12px;
    }

    .mode-desc {
        font-size: 9px;
        padding-left: 24px;
    }

    .messages-display {
        margin: 5px 0;
        min-height: 80px;
        max-height: calc(100dvh - 160px);
        overflow-y: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .messages-display::-webkit-scrollbar {
        display: none;
    }

    .message-content {
        font-size: 11px;
        padding-left: 10px;
    }

    .control-panel {
        display: none;
    }

    .mobile-input-panel {
        padding: 6px;
        padding-bottom: max(6px, env(safe-area-inset-bottom));
    }

    .mobile-input-container {
        padding: 8px;
        border-radius: 12px;
        gap: 6px;
    }

    .mobile-input {
        padding: 10px 12px;
        font-size: 16px;
        border-radius: 8px;
    }

    .mobile-send-btn {
        padding: 10px 12px;
        font-size: 12px;
        min-width: 44px;
        border-radius: 8px;
    }

    .mobile-btn-icon {
        font-size: 16px;
    }
}

/* 横屏模式优化 */
@media (max-width: 768px) and (orientation: landscape) {
    .retro-computer {
        padding: 5px;
        padding-bottom: max(60px, env(safe-area-inset-bottom));
    }

    .computer-shell {
        padding: 8px;
        flex-direction: column; /* 保持垂直布局 */
        gap: 8px;
    }

    .crt-monitor {
        flex: 1;
        margin-bottom: 0;
    }

    .control-panel {
        display: none; /* 横屏模式也使用悬浮输入框 */
    }

    .messages-display {
        min-height: 80px;
        max-height: calc(100dvh - 120px);
        overflow-y: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .messages-display::-webkit-scrollbar {
        display: none;
    }

    .exit-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        margin-top: 0;
    }
}
</style>
