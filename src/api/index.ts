// 导出其他 API
export * from './software'
export * from './version'
export * from './download'
export * from './auth'

// 健康检查接口
export const healthApi = {
  check: async () => {
    try {
      const response = await fetch('/api/health');
      return response.json();
    } catch (error) {
      console.error('健康检查失败:', error);
      throw error;
    }
  }
}; 