export interface ApiConfig {
    apiKey: string
    baseUrl: string
    model: string
    temperature: number
    systemPrompt: string
    systemPromptType: string
}

const DEFAULT_SYSTEM_PROMPT = `你是一个智能AI助手，请根据用户选择的游戏模式进行对话。保持友好、有趣的对话风格。`

/** 获取默认API配置 */
export function getDefaultApiConfig(): ApiConfig {
    return {
        apiKey: 'a835b9f6866d48ec956d341418df8a50.NuhlKYn58EkCb5iP',
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4/',
        model: 'glm-4-flash-250414',
        temperature: 0.7,
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        systemPromptType: 'default'
    }
}
