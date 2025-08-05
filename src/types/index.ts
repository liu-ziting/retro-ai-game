// 游戏相关类型定义

export interface StyleOption {
    id: string
    name: string
    description?: string
}

export interface GameState {
    dailyUsage: number
    maxDailyUsage: number
    selectedStyle: string
    customPrompt: string
    uploadedFile: File | null
    isProcessing: boolean
    result: string
}

export interface AIResponse {
    success: boolean
    data?: string
    error?: string
    message?: string
}

export interface UploadConfig {
    maxSize: number // MB
    allowedTypes: string[]
}
