// CloudBase 服务封装
import cloud from '@cloudbase/adaptor';

const app = cloud.init({
  env: 'your-env-id', // 需要在生产环境配置
});

// 通用请求方法
async function callFunction(name: string, data: Record<string, unknown>) {
  try {
    const result = await app.callFunction({
      name,
      data,
    });
    
    if (result.result && typeof result.result === 'object') {
      const res = result.result as { code: number; message?: string; data?: unknown };
      if (res.code === 0) {
        return res.data;
      }
      throw new Error(res.message || '请求失败');
    }
    
    return result.result;
  } catch (error) {
    console.error(`调用云函数 ${name} 失败:`, error);
    throw error;
  }
}

export { callFunction };
