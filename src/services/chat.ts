import { ChatMessage, ChatHistory } from '../types';

const MOCK_HISTORIES: ChatHistory[] = [];

let messageIdCounter = 100;

const AI_RESPONSES: Record<string, string> = {
  '税': '关于海外房产税务，以下是一些常见建议：\n\n1. **房产税**：美国各州税率不同，通常为房产评估价值的0.5%-2.5%\n2. **所得税**：租金收入需要申报，可以扣除维护、折旧等费用\n3. **资本利得税**：出售时需缴纳，持有超过1年按长期资本利得税率\n\n建议您咨询专业的跨境税务顾问，根据您的具体情况制定最优方案。\n\n需要我详细解释某个方面吗？',
  '房产': '关于海外房产管理，以下是一些建议：\n\n1. **定期维护**：建议每季度检查一次房产状况\n2. **保险更新**：确保房屋保险覆盖范围充足\n3. **租赁管理**：如果出租，建议使用专业物业管理公司\n4. **市场跟踪**：定期了解当地房产市场走势\n\n您有具体的房产管理问题需要咨询吗？',
  '政策': '近期海外房产相关政策变化：\n\n1. **美国**：部分州调整了外国人购房限制\n2. **加拿大**：外国买家禁令延期至2027年\n3. **澳大利亚**：提高了外国投资审查费用\n\n建议密切关注您持有房产所在国家的政策变化。需要我详细解读某个国家的政策吗？',
  '贷款': '关于海外购房贷款，以下是最新信息：\n\n1. **利率参考**：30年固定约6.5-7.2%，15年固定约5.8-6.5%\n2. **首付要求**：外国人通常需要25-35%首付\n3. **信用要求**：建议信用评分680+\n4. **收入证明**：需要2年以上收入记录\n\n不同银行政策差异较大，建议多比较几家。需要推荐适合华人的银行吗？',
};

const DEFAULT_RESPONSE = '感谢您的提问！作为您的房产税务AI助手，我可以帮助您：\n\n1. 🏠 房产管理和估值分析\n2. 💰 税务规划和优化建议\n3. 📄 证件管理和到期提醒\n4. 📚 最新政策解读\n\n请告诉我您想了解哪方面的信息，我会为您提供专业的建议。';

function generateAIResponse(userMessage: string): string {
  for (const [keyword, response] of Object.entries(AI_RESPONSES)) {
    if (userMessage.includes(keyword)) {
      return response;
    }
  }
  return DEFAULT_RESPONSE;
}

const USE_MOCK = true;

export const chatService = {
  async getHistories(): Promise<ChatHistory[]> {
    if (USE_MOCK) {
      return [...MOCK_HISTORIES].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }
    return [];
  },

  async getHistory(id: string): Promise<ChatHistory | null> {
    if (USE_MOCK) {
      return MOCK_HISTORIES.find(h => h.id === id) || null;
    }
    return null;
  },

  async createChat(): Promise<ChatHistory> {
    const now = new Date().toISOString();
    const chat: ChatHistory = {
      id: Date.now().toString(),
      userId: 'mock-user',
      title: '新对话',
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    if (USE_MOCK) {
      MOCK_HISTORIES.push(chat);
    }
    return chat;
  },

  async sendMessage(chatId: string, content: string): Promise<ChatMessage> {
    const userMsg: ChatMessage = {
      id: (++messageIdCounter).toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    if (USE_MOCK) {
      const chat = MOCK_HISTORIES.find(h => h.id === chatId);
      if (chat) {
        chat.messages.push(userMsg);
        if (chat.messages.length === 1) {
          chat.title = content.slice(0, 20) + (content.length > 20 ? '...' : '');
        }
        chat.updatedAt = new Date().toISOString();
      }
    }

    return userMsg;
  },

  async getAIResponse(chatId: string, userMessage: string): Promise<ChatMessage> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const aiMsg: ChatMessage = {
      id: (++messageIdCounter).toString(),
      role: 'assistant',
      content: generateAIResponse(userMessage),
      timestamp: new Date().toISOString(),
    };

    if (USE_MOCK) {
      const chat = MOCK_HISTORIES.find(h => h.id === chatId);
      if (chat) {
        chat.messages.push(aiMsg);
        chat.updatedAt = new Date().toISOString();
      }
    }

    return aiMsg;
  },

  async deleteChat(chatId: string): Promise<void> {
    if (USE_MOCK) {
      const index = MOCK_HISTORIES.findIndex(h => h.id === chatId);
      if (index !== -1) MOCK_HISTORIES.splice(index, 1);
    }
  },
};
