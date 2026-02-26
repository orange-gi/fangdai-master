// 房产管理云函数
const cloud = require('tcb-admin-node');

exports.main = async (event, context) => {
  const { action } = event;
  const db = cloud.database();
  const _ = db.command;

  try {
    switch (action) {
      case 'list':
        // 获取房产列表
        const { page = 1, pageSize = 10 } = event;
        const skip = (page - 1) * pageSize;
        
        const properties = await db.collection('properties')
          .where({ userId: cloud.getCloudContext().OPENID })
          .skip(skip)
          .limit(pageSize)
          .orderBy('createdAt', 'desc')
          .get();
          
        const total = await db.collection('properties')
          .where({ userId: cloud.getCloudContext().OPENID })
          .count();
          
        return { 
          code: 0, 
          data: {
            list: properties.data,
            total: total.total,
            page,
            pageSize
          }
        };

      case 'get':
        // 获取房产详情
        const property = await db.collection('properties').doc(event.propertyId).get();
        return { code: 0, data: property.data[0] || null };

      case 'add':
        // 添加房产
        const newProperty = await db.collection('properties').add({
          userId: cloud.getCloudContext().OPENID,
          name: event.name,
          address: event.address,
          type: event.type,
          purchaseDate: event.purchaseDate,
          purchasePrice: event.purchasePrice,
          currentValue: event.currentValue || event.purchasePrice,
          images: event.images || [],
          createdAt: new Date().toISOString()
        });
        return { code: 0, data: { id: newProperty.id } };

      case 'update':
        // 更新房产
        const updateData = {
          name: event.name,
          address: event.address,
          type: event.type,
          purchaseDate: event.purchaseDate,
          purchasePrice: event.purchasePrice,
          currentValue: event.currentValue,
          images: event.images,
          updatedAt: new Date().toISOString()
        };
        await db.collection('properties').doc(event.propertyId).update(updateData);
        return { code: 0, data: { success: true } };

      case 'delete':
        // 删除房产
        await db.collection('properties').doc(event.propertyId).remove();
        return { code: 0, data: { success: true } };

      case 'stats':
        // 房产统计
        const allProperties = await db.collection('properties')
          .where({ userId: cloud.getCloudContext().OPENID })
          .get();
        
        const totalValue = allProperties.data.reduce((sum, p) => sum + (p.currentValue || 0), 0);
        const totalPurchase = allProperties.data.reduce((sum, p) => sum + (p.purchasePrice || 0), 0);
        
        return {
          code: 0,
          data: {
            count: allProperties.data.length,
            totalValue,
            totalPurchase,
            totalGain: totalValue - totalPurchase
          }
        };

      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (error) {
    return { code: -1, message: error.message };
  }
};
