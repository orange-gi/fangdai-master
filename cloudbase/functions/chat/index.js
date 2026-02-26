// AI 聊天云函数
// 负责对话历史管理，实际AI响应由 LangGraph Agent 处理
const cloud = require('tcb-admin-node');

exports.main = async (event, context) => {
  const { action } = event;
  const db = cloud.database();

  try {
    switch (action) {
      case 'list':
        // 获取对话列表
        const { page = 1, pageSize = 10 } = event;
        const skip = (page - 1) * pageSize;
        
        const chats = await db.collection('chat_history')
          .where({ userId: cloud.getCloudContext().OPENID })
          .skip(skip)
          .limit(pageSize)
          .orderBy('updatedAt', 'desc')
          .get();
          
        const total = await db.collection('chat_history')
          .where({ userId: cloud.getCloudContext().OPENID })
          .count();
          
        return { 
          code: 0, 
          data: {
            list: chats.data,
            total: total.total,
            page,
            pageSize
          }
        };

      case 'get':
        // 获取对话详情
        const chat = await db.collection('chat_history').doc(event.chatId).get();
        return { code: 0, data: chat.data[0] || null };

      case 'create':
        // 创建新对话
        const newChat = await db.collection('chat_history').add({
          userId: cloud.getCloudContext().OPENID,
          title: event.title || '新对话',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return { code: 0, data: { id: newChat.id } };

      case 'addMessage':
        // 添加消息
        const chatDoc = await db.collection('chat_history').doc(event.chatId).get();
        const chatData = chatDoc.data[0];
        
        const newMessage = {
          id: Date.now().toString(),
          role: event.role,
          content: event.content,
          timestamp: new Date().toISOString()
        };
        
        const messages = [...(chatData.messages || []), newMessage];
        
        // 更新对话
        await db.collection('chat_history').doc(event.chatId).update({
          messages,
          updatedAt: new Date().toISOString()
        });
        
        return { code: 0, data: newMessage };

      case 'delete':
        // 删除对话
        await db.collection('chat_history').doc(event.chatId).remove();
        return { code: 0, data: { success: true } };

      case 'clear':
        // 清空历史记录
        const allChats = await db.collection('chat_history')
          .where({ userId: cloud.getCloudContext().OPENID })
          .get();
        
        for (const chat of allChats.data) {
          await db.collection('chat_history').doc(chat._id).remove();
        }
        return { code: 0, data: { success: true } };

      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (error) {
    return { code: -1, message: error.message };
  }
};
