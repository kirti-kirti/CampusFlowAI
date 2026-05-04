import api from './api';

export const chatbotService = {
  chat: async (message) => {
    const response = await api.post('/chat/ask', { query: message });
    return response.data;
  }
};

export default chatbotService;
