import api from './axiosConfig';

const chatAPI = {
  // Pokoje
  getChatRooms: () => api.get('/chat/rooms/'),
  createChatRoom: (name) => api.post('/chat/rooms/', { name }),
  getChatRoomDetail: (id) => api.get(`/chat/rooms/${id}/`),
  updateChatRoom: (id, data) => api.put(`/chat/rooms/${id}/`, data),
  deleteChatRoom: (id) => api.delete(`/chat/rooms/${id}/`),

  // Wiadomości
  getRoomMessages: (roomId) => api.get(`/chat/rooms/${roomId}/messages/`),
  sendMessage: (roomId, content) => 
    api.post(`/chat/rooms/${roomId}/messages/`, { content }),
  getMessageDetail: (messageId) => api.get(`/chat/messages/${messageId}/`),
  editMessage: (messageId, content) => 
    api.put(`/chat/messages/${messageId}/`, { content }),
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}/`),
  markAsRead: (messageId) => api.post(`/chat/messages/${messageId}/read/`),
};

export default chatAPI;
