// 用户管理云函数
const cloud = require('tcb-admin-node');

exports.main = async (event, context) => {
  const { action } = event;
  const db = cloud.database();
  const _ = db.command;

  try {
    switch (action) {
      case 'getUser':
        // 获取用户信息
        const user = await db.collection('users').where({
          openid: cloud.getCloudContext().OPENID
        }).get();
        return { code: 0, data: user.data[0] || null };

      case 'updateUser':
        // 更新用户信息
        const { nickname, avatar } = event;
        const result = await db.collection('users').where({
          openid: cloud.getCloudContext().OPENID
        }).update({
          nickname,
          avatar,
          updatedAt: new Date().toISOString()
        });
        return { code: 0, data: result };

      case 'register':
        // 用户注册
        const newUser = await db.collection('users').add({
          openid: cloud.getCloudContext().OPENID,
          nickname: event.nickname || '新用户',
          avatar: '',
          createdAt: new Date().toISOString()
        });
        return { code: 0, data: { id: newUser.id } };

      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (error) {
    return { code: -1, message: error.message };
  }
};
