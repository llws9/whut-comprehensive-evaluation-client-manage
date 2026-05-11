import { defineStore } from 'pinia';
import request from '../utils/request';
import { getStore } from './user'; // 导入获取用户 store 的方法

export const useWorkbenchStore = defineStore('workbench', {
  state: () => ({
    // 图表数据
    chartData: {
      allCharData: {},
      zyCharData: {},
      tyCharData: {},
      lyCharData: {}
    },
    
    // 统计数据
    statistics: {
      underReview: 0,        // 待审核记录
      monitorReview: 0,      // 班长已审核记录
      gradeSubmitted: {}, // 初始化为空对象
    },
    
    // 热门申请数据
    hotTopics: {},
    
    // 加载状态
    loading: false,
    
    // 上次更新时间
    lastUpdated: null,
    
    // 是否已初始化
    initialized: false
  }),
  
  getters: {
    // 获取格式化后的日期和数据，用于图表展示
    formattedChartData: (state) => (type = 'all') => {
      // 根据类型选择对应的数据
      let chartData;
      switch (type) {
        case 'intellectual':
          chartData = state.chartData.zyCharData;
          break;
        case 'sports_and_aesthetics':
          chartData = state.chartData.tyCharData;
          break;
        case 'labor_education':
          chartData = state.chartData.lyCharData;
          break;
        case 'all':
        default:
          chartData = state.chartData.allCharData;
          break;
      }
      
      if (!chartData || Object.keys(chartData).length === 0) {
        return { dates: [], applications: [], approvals: [] };
      }
      
      // 处理日期和数值
      const dates = Object.keys(chartData).sort();
      const applications = dates.map(date => chartData[date]);
      
      // 生成审批数据（模拟数据）- 通常审批数量小于申请数量，比例约为0.7
      // 注意：实际项目中，如果后端提供审批数据，应该使用实际数据
      const approvals = applications.map(value => Math.round(value * 0.7));
      
      return {
        dates: dates.map(date => {
          // 格式化日期: '2025-03-17' => '3-17'
          const dateObj = new Date(date);
          if (isNaN(dateObj.getTime())) return date;
          return `${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
        }),
        applications,
        approvals
      };
    },
    
    // 获取格式化后的热门申请数据，用于词云展示
    formattedHotTopics: (state) => {
      if (!state.hotTopics || Object.keys(state.hotTopics).length === 0) {
        return [];
      }
      
      return Object.entries(state.hotTopics).map(([name, value]) => ({
        name,
        value: Number(value)
      }));
    },
    
    // 检查数据是否已经过期（超过5分钟）
    isDataStale: (state) => {
      if (!state.lastUpdated) return true;
      
      const now = new Date();
      const lastUpdated = new Date(state.lastUpdated);
      const diffMinutes = (now - lastUpdated) / (1000 * 60); // 转换为分钟
      
      return diffMinutes > 5; // 超过5分钟视为过期
    }
  },
  
  actions: {
    // 获取工作台数据
    async fetchWorkbenchData() {
      // 如果数据已初始化且未过期，则不重新获取
      if (this.initialized && !this.isDataStale) {
        return true;
      }
      
      this.loading = true;
      
      try {
        // 获取用户 store 以获取当前 token
        const userStore = getStore();
        
        // 使用带有 headers 的请求，确保包含 token
        const response = await request.get('/admin/workbench', {
          headers: {
            'Authorization': userStore.token
          }
        });
        
        // 处理响应
        if (response.data && response.data.code === 200) {
          const apiData = response.data.data || {};
          
          // 更新图表数据
          this.chartData = {
            allCharData: apiData.allCharData || {},
            zyCharData: apiData.zyCharData || {},
            tyCharData: apiData.tyCharData || {},
            lyCharData: apiData.lyCharData || {}
          };
          
          // 修改：正确接收gradeSubmitted字段
          this.statistics = {
            underReview: apiData.underReview || 0,
            monitorReview: apiData.monitorReview || 0,
            gradeSubmitted: apiData.gradeSubmitted || {}  // 直接接收后端返回的gradeSubmitted
          };
          
          // 更新热门申请数据
          this.hotTopics = apiData.hotTopicsMap || {};
          
          // 更新时间戳和初始化状态
          this.lastUpdated = new Date().toISOString();
          this.initialized = true;
          
          return true;
        } else {
          console.error('工作台接口响应异常:', response);
          return false;
        }
      } catch (error) {
        console.error('获取工作台数据失败:', error);
        
        // 检查是否是因为 token 过期导致的错误
        if (error.response && error.response.data && 
            (error.response.data.code === 400 || error.response.data.code === 401) && 
            error.response.data.msg && error.response.data.msg.includes('token过期')) {
            
          // 尝试刷新 token
          const userStore = getStore();
          const refreshResult = await userStore.refreshAuthToken();
          
          // 如果刷新成功，重试获取数据
          if (refreshResult.success) {
            return this.fetchWorkbenchData(); // 递归调用自身重试
          }
        }
        
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 强制刷新数据
    async refreshData() {
      // 重置上次更新时间，强制重新获取
      this.lastUpdated = null;
      return await this.fetchWorkbenchData();
    }
  }
}); 