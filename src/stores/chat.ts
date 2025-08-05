import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import OpenAI from 'openai'
import { getDefaultApiConfig } from '@/config/api'
import type { GameMode } from '@/config/gameMode'

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: number
}

export const useChatStore = defineStore('chat', () => {
    // 状态
    const messages = ref<ChatMessage[]>([])
    const currentGameMode = ref<GameMode | null>(null)
    const isLoading = ref(false)
    const openaiClient = ref<OpenAI | null>(null)
    const streamingMessageId = ref<string | null>(null)

    // 计算属性
    const hasMessages = computed(() => messages.value.length > 0)

    // 初始化OpenAI客户端
    const initClient = () => {
        const config = getDefaultApiConfig()
        openaiClient.value = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseUrl,
            dangerouslyAllowBrowser: true
        })
    }

    // 设置游戏模式
    const setGameMode = (gameMode: GameMode) => {
        currentGameMode.value = gameMode
        messages.value = []

        // 添加系统欢迎消息
        addMessage({
            role: 'assistant',
            content: `欢迎来到${gameMode.name}模式！${gameMode.description}\n\n让我们开始这段精彩的旅程吧！你想要做什么？`
        })
    }

    // 添加消息
    const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            ...message
        }
        messages.value.push(newMessage)
    }

    // 发送消息
    const sendMessage = async (content: string) => {
        if (!openaiClient.value || !currentGameMode.value) {
            console.error('OpenAI client or game mode not initialized')
            return
        }

        // 添加用户消息
        addMessage({ role: 'user', content })

        // 创建助手消息占位符，立即显示在对话中
        const assistantMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: '',
            timestamp: Date.now()
        }
        messages.value.push(assistantMessage)
        streamingMessageId.value = assistantMessage.id

        isLoading.value = true

        try {
            const config = getDefaultApiConfig()

            // 构建消息历史（排除当前正在生成的消息）
            const chatMessages = [
                {
                    role: 'system' as const,
                    content: currentGameMode.value.systemPrompt
                },
                ...messages.value
                    .slice(0, -1)
                    .slice(-10)
                    .map(msg => ({
                        role: msg.role as 'user' | 'assistant',
                        content: msg.content
                    }))
            ]

            // 创建流式响应
            const stream = await openaiClient.value.chat.completions.create({
                model: config.model,
                messages: chatMessages,
                temperature: config.temperature,
                stream: true
            })

            // 处理流式响应
            for await (const chunk of stream) {
                const deltaContent = chunk.choices[0]?.delta?.content || ''
                if (deltaContent) {
                    // 实时更新消息内容，触发响应式更新
                    const messageIndex = messages.value.findIndex(m => m.id === assistantMessage.id)
                    if (messageIndex !== -1) {
                        messages.value[messageIndex].content += deltaContent
                    }

                    // 添加小延迟模拟打字效果
                    await new Promise(resolve => setTimeout(resolve, 30))
                }
            }
        } catch (error) {
            console.error('Error sending message:', error)
            const messageIndex = messages.value.findIndex(m => m.id === assistantMessage.id)
            if (messageIndex !== -1) {
                messages.value[messageIndex].content = '抱歉，发生了一些错误。请稍后再试。'
            }
        } finally {
            isLoading.value = false
            streamingMessageId.value = null
        }
    }

    // 清空对话
    const clearMessages = () => {
        messages.value = []
    }

    // 重置游戏
    const resetGame = () => {
        messages.value = []
        currentGameMode.value = null
        streamingMessageId.value = null
    }

    return {
        // 状态
        messages,
        currentGameMode,
        isLoading,
        streamingMessageId,

        // 计算属性
        hasMessages,

        // 方法
        initClient,
        setGameMode,
        addMessage,
        sendMessage,
        clearMessages,
        resetGame
    }
})
