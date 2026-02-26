// 税务管理云函数
const cloud = require('tcb-admin-node');

exports.main = async (event, context) => {
  const { action } = event;
  const db = cloud.database();
  const _ = db.command;

  try {
    switch (action) {
      case 'list':
        // 获取税务记录列表
        const { page = 1, pageSize = 10, year, status } = event;
        const skip = (page - 1) * pageSize;
        
        let query = { userId: cloud.getCloudContext().OPENID };
        if (year) query.year = year;
        if (status) query.status = status;
        
        const records = await db.collection('tax_records')
          .where(query)
          .skip(skip)
          .limit(pageSize)
          .orderBy('dueDate', 'asc')
          .get();
          
        const total = await db.collection('tax_records').where(query).count();
          
        return { 
          code: 0, 
          data: {
            list: records.data,
            total: total.total,
            page,
            pageSize
          }
        };

      case 'get':
        // 获取税务记录详情
        const record = await db.collection('tax_records').doc(event.taxId).get();
        return { code: 0, data: record.data[0] || null };

      case 'add':
        // 添加税务记录
        const newRecord = await db.collection('tax_records').add({
          userId: cloud.getCloudContext().OPENID,
          propertyId: event.propertyId,
          year: event.year,
          taxType: event.taxType,
          amount: event.amount,
          status: event.status || 'pending',
          dueDate: event.dueDate,
          paidDate: event.paidDate,
          notes: event.notes,
          createdAt: new Date().toISOString()
        });
        return { code: 0, data: { id: newRecord.id } };

      case 'update':
        // 更新税务记录
        const updateData = {
          propertyId: event.propertyId,
          year: event.year,
          taxType: event.taxType,
          amount: event.amount,
          status: event.status,
          dueDate: event.dueDate,
          paidDate: event.paidDate,
          notes: event.notes,
          updatedAt: new Date().toISOString()
        };
        await db.collection('tax_records').doc(event.taxId).update(updateData);
        return { code: 0, data: { success: true } };

      case 'delete':
        // 删除税务记录
        await db.collection('tax_records').doc(event.taxId).remove();
        return { code: 0, data: { success: true } };

      case 'markPaid':
        // 标记为已缴纳
        await db.collection('tax_records').doc(event.taxId).update({
          status: 'paid',
          paidDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return { code: 0, data: { success: true } };

      case 'stats':
        // 税务统计
        const { year: statYear } = event;
        let statQuery = { userId: cloud.getCloudContext().OPENID };
        if (statYear) statQuery.year = statYear;
        
        const allRecords = await db.collection('tax_records').where(statQuery).get();
        
        const pending = allRecords.data.filter(r => r.status === 'pending');
        const paid = allRecords.data.filter(r => r.status === 'paid');
        
        return {
          code: 0,
          data: {
            total: allRecords.data.length,
            pendingCount: pending.length,
            pendingAmount: pending.reduce((sum, r) => sum + (r.amount || 0), 0),
            paidCount: paid.length,
            paidAmount: paid.reduce((sum, r) => sum + (r.amount || 0), 0)
          }
        };

      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (error) {
    return { code: -1, message: error.message };
  }
};
