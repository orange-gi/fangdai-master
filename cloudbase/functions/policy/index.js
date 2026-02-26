// 政策资讯云函数
const cloud = require('tcb-admin-node');

exports.main = async (event, context) => {
  const { action } = event;
  const db = cloud.database();

  try {
    switch (action) {
      case 'list':
        // 获取政策列表
        const { page = 1, pageSize = 10, category } = event;
        const skip = (page - 1) * pageSize;
        
        let query = {};
        if (category) query.category = category;
        
        const articles = await db.collection('policy_articles')
          .where(query)
          .skip(skip)
          .limit(pageSize)
          .orderBy('publishedAt', 'desc')
          .get();
          
        const total = await db.collection('policy_articles').where(query).count();
          
        return { 
          code: 0, 
          data: {
            list: articles.data,
            total: total.total,
            page,
            pageSize
          }
        };

      case 'get':
        // 获取文章详情
        const article = await db.collection('policy_articles').doc(event.articleId).get();
        return { code: 0, data: article.data[0] || null };

      case 'latest':
        // 获取最新政策（首页用）
        const latest = await db.collection('policy_articles')
          .orderBy('publishedAt', 'desc')
          .limit(5)
          .get();
        return { code: 0, data: latest.data };

      case 'search':
        // 搜索政策
        const keyword = event.keyword || '';
        const searchResults = await db.collection('policy_articles')
          .where({
            title: db.RegExp({ regexp: keyword, options: 'i' })
          })
          .limit(20)
          .get();
        return { code: 0, data: searchResults.data };

      default:
        return { code: -1, message: '未知操作' };
    }
  } catch (error) {
    return { code: -1, message: error.message };
  }
};
