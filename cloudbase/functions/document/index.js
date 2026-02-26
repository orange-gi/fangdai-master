// 证件管理云函数
const cloud = require('tcb-admin-node');

exports.main = async (event, context) => {
  const { action } = event;
  const db = cloud.database();

  try {
    switch (action) {
      case 'list':
        // 获取证件列表
        const { page = 1, pageSize = 10, propertyId, type } = event;
        const skip = (page - 1) * pageSize;
        
        let query = { userId: cloud.getCloudContext().OPENID };
        if (propertyId) query.propertyId = propertyId;
        if (type) query.type = type;
        
        const documents = await db.collection('documents')
          .where(query)
          .skip(skip)
          .limit(pageSize)
          .orderBy('expiryDate', 'asc')
          .get();
          
        const total = await db.collection('documents').where(query).count();
          
        return { 
          code: 0, 
          data: {
            list: documents.data,
            total: total.total,
            page,
            pageSize
          }
        };

      case 'get':
        // 获取证件详情
        const document = await db.collection('documents').doc(event.documentId).get();
        return { code: 0, data: document.data[0] || null };

      case 'add':
        // 添加证件
        const newDoc = await db.collection('documents').add({
          userId: cloud.getCloudContext().OPENID,
          propertyId: event.propertyId || '',
          type: event.type,
          name: event.name,
          number: event.number,
          issueDate: event.issueDate,
          expiryDate: event.expiryDate,
          imageUrl: event.imageUrl,
          notes: event.notes,
          createdAt: new Date().toISOString()
        });
        return { code: 0, data: { id: newDoc.id } };

      case 'update':
        // 更新证件
        const updateData = {
          propertyId: event.propertyId,
          type: event.type,
          name: event.name,
          number: event.number,
          issueDate: event.issueDate,
          expiryDate: event.expiryDate,
          imageUrl: event.imageUrl,
          notes: event.notes,
          updatedAt: new Date().toISOString()
        };
        await db.collection('documents').doc(event.documentId).update(updateData);
        return { code: 0, data: { success: true } };

      case 'delete':
        // 删除证件
        await db.collection('documents').doc(event.documentId).remove();
        return { code: 0, data: { success: true } };

      case 'expiring':
        // 获取即将过期的证件（30天内）
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
        
        const expiringDocs = await db.collection('documents')
          .where({
            userId: cloud.getCloudContext().OPENID,
            expiryDate: db.command.lte(thirtyDaysLater.toISOString().split('T')[0])
          })
          .get();
          
        return { code: 0, data: expiringDocs.data };

      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (error) {
    return { code: -1, message: error.message };
  }
};
