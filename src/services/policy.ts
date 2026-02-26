import { callFunction } from './cloudbase';
import { PolicyArticle, PolicyCategory } from '../types';

const MOCK_ARTICLES: PolicyArticle[] = [
  {
    id: '1',
    title: '2024年美国房产税新政策解读',
    summary: '美国多个州调整房产税税率，对海外投资者影响深远。本文详细解读最新政策变化及应对策略。',
    content: `2024年，美国多个州对房产税政策进行了重大调整。加州通过了新的房产税评估规则，纽约州调整了非居民房产税扣除标准。

主要变化包括：
1. 加州Proposition 19修正案全面实施，继承房产的税基重新评估
2. 纽约市提高了非居民房产交易附加税至2.5%
3. 佛罗里达州维持低税率政策，吸引海外投资

对中国投资者的影响：
- 持有成本可能增加10-15%
- 建议提前做好税务规划
- 考虑使用LLC等结构持有房产以优化税务

建议措施：
1. 每年定期评估房产税负担
2. 咨询专业的跨境税务顾问
3. 关注当地政策变化及时调整策略`,
    category: 'tax',
    source: '房产大师研究院',
    publishedAt: '2024-03-15',
    createdAt: '2024-03-15',
  },
  {
    id: '2',
    title: '海外华人购房贷款最新指南',
    summary: '各大银行对海外华人的购房贷款政策有所调整，了解最新要求助您顺利购房。',
    content: `海外华人在美国购房贷款的最新要求和流程指南。

申请条件：
1. 有效签证或绿卡
2. 信用评分要求降低至680+
3. 首付比例通常在25-35%
4. 需要提供至少2年的收入证明

推荐银行：
- 华美银行：专为华人提供服务
- 国泰银行：支持海外收入认证
- HSBC：全球账户联动

贷款利率参考：
- 30年固定：6.5-7.2%
- 15年固定：5.8-6.5%
- ARM 5/1：5.5-6.2%`,
    category: 'property',
    source: '海外置业网',
    publishedAt: '2024-02-28',
    createdAt: '2024-02-28',
  },
  {
    id: '3',
    title: 'EB-5投资移民政策2024年更新',
    summary: 'EB-5投资移民项目最低投资额维持不变，但审批流程有新变化。',
    content: `2024年EB-5投资移民政策更新要点。

关键变化：
1. 最低投资额保持80万美元（TEA地区）
2. 直投项目投资额仍为105万美元
3. 审批周期缩短至18-24个月
4. 新增中国大陆申请者的面试豁免条件

注意事项：
- 资金来源证明要求更加严格
- 项目选择需要更加谨慎
- 建议优先考虑有往期成功案例的区域中心

与房产投资的关联：
- 部分EB-5项目涉及房地产开发
- 获得绿卡后购房贷款条件更优
- 可以享受居民税率和房产税优惠`,
    category: 'immigration',
    source: '移民政策通',
    publishedAt: '2024-01-20',
    createdAt: '2024-01-20',
  },
  {
    id: '4',
    title: 'FIRPTA法案对中国卖房者的影响',
    summary: '外国人在美国出售房产需遵守FIRPTA法案，预扣税比例及豁免条件详解。',
    content: `FIRPTA（Foreign Investment in Real Property Tax Act）是海外投资者出售美国房产时必须了解的法律。

核心要点：
1. 卖方为外国人时，买方须预扣成交价的15%
2. 若成交价低于30万美元且买方自住，可豁免预扣
3. 预扣税可在次年报税时申请退还差额

申请减免流程：
1. 提交Form 8288-B申请预扣减免证书
2. IRS审批周期约60-90天
3. 获批后按实际增值部分计税

税务优化建议：
- 出售前咨询专业税务师
- 合理利用成本基础调整
- 考虑1031交换延迟纳税`,
    category: 'law',
    source: '法律观察',
    publishedAt: '2024-04-10',
    createdAt: '2024-04-10',
  },
  {
    id: '5',
    title: '加州房产市场2024年趋势预测',
    summary: '加州房价在2024年预计温和增长3-5%，部分城市可能出现价格回调。',
    content: `加州房产市场2024年展望。

价格趋势：
- 洛杉矶：预计增长4-6%
- 旧金山：预计增长2-4%
- 圣地亚哥：预计增长5-7%

投资机会：
1. 多户型住宅需求持续旺盛
2. 远郊城市发展潜力大
3. 商业地产触底反弹

风险因素：
- 高利率环境可能限制需求
- 保险成本持续上升
- 部分地区面临自然灾害风险

中国投资者关注点：
- 优先选择租金收益率高的区域
- 关注学区房的长期增值潜力
- 注意加州特有的房产税规则`,
    category: 'property',
    source: '房产大师研究院',
    publishedAt: '2024-05-01',
    createdAt: '2024-05-01',
  },
];

const USE_MOCK = true;

export const policyService = {
  async getList(category?: PolicyCategory): Promise<PolicyArticle[]> {
    if (USE_MOCK) {
      let articles = [...MOCK_ARTICLES];
      if (category) {
        articles = articles.filter(a => a.category === category);
      }
      return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }
    const result = await callFunction('policy', { action: 'list', category });
    return (result as { list: PolicyArticle[] }).list;
  },

  async get(id: string): Promise<PolicyArticle | null> {
    if (USE_MOCK) {
      return MOCK_ARTICLES.find(a => a.id === id) || null;
    }
    const result = await callFunction('policy', { action: 'get', articleId: id });
    return result as PolicyArticle | null;
  },

  async search(keyword: string): Promise<PolicyArticle[]> {
    if (USE_MOCK) {
      const kw = keyword.toLowerCase();
      return MOCK_ARTICLES.filter(
        a => a.title.toLowerCase().includes(kw) || a.summary.toLowerCase().includes(kw)
      );
    }
    const result = await callFunction('policy', { action: 'search', keyword });
    return (result as { list: PolicyArticle[] }).list;
  },
};
