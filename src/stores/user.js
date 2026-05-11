import { defineStore } from 'pinia';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

// 创建一个axios实例
const apiClient = axios.create({
  baseURL: 'http://8.137.101.41:8088',
  timeout: 10000
});

// 响应拦截器处理token过期情况
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // 如果请求成功但业务状态是token过期
    if (error.response && error.response.status === 200 &&
      error.response.data && error.response.data.code === 400 &&
      error.response.data.msg && error.response.data.msg.includes('token过期')) {

      // 防止死循环
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        // 尝试刷新token
        const userStore = useUserStore();
        const refreshResult = await userStore.refreshAuthToken();

        // 如果刷新成功，重试原请求
        if (refreshResult.success) {
          // 更新原请求的token
          originalRequest.headers['Authorization'] = userStore.token;
          return apiClient(originalRequest);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const useUserStore = defineStore('user', {
  state: () => {
    // 确保正确从localStorage获取数据
    const identity = localStorage.getItem('identity') || '';
    let userInfo = {};
    try {
      userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    } catch (e) {
      console.error('解析用户信息失败:', e);
      userInfo = {};
    }

    return {
      identity,
      userInfo,
      token: localStorage.getItem('token') || '',
      refreshToken: localStorage.getItem('refreshToken') || '',
      isLoggedIn: !!localStorage.getItem('token')
    };
  },

  getters: {
    // 获取用户角色
    userRole: (state) => state.identity,

    // 判断是否是超级管理员
    isSuperAdmin: (state) => state.identity === 'superAdmin',

    // 判断是否是管理员
    isAdmin: (state) => state.identity === 'admin',

    // 判断是否是班长
    isMonitor: (state) => state.identity === 'monitor',

    // 获取用户所属班级
    userClass: (state) => state.userInfo.userClass || '',

    // 获取用户名
    userName: (state) => state.userInfo.userName || '',

    // 获取用户学号/工号
    userNumber: (state) => state.userInfo.userNumber || ''
  },

  actions: {
    // 刷新token的方法
    async refreshAuthToken() {
      try {
        // console.log('Store中开始刷新Token...');

        const response = await axios({
          method: 'post',
          url: 'http://8.137.101.41:8088/user/refresh',
          data: { refreshToken: this.refreshToken },
          timeout: 10000
        });

        // console.log('Store收到刷新token响应:', JSON.stringify(response.data));

        const { code, msg, data } = response.data;

        if (code === 200 && data) {
          let newToken, newRefreshToken;

          // 更清晰的处理嵌套结构
          if (data.token && typeof data.token === 'object') {
            // 处理 data.token 是对象的情况
            // console.log('Token结构是对象类型');
            if (data.token.accessToken) {
              newToken = data.token.accessToken;
            }

            if (data.token.refreshToken) {
              newRefreshToken = data.token.refreshToken;
            }
          } else if (data.accessToken) {
            // 直接在 data 中有 accessToken
            // console.log('Token结构有直接的accessToken');
            newToken = data.accessToken;

            if (data.refreshToken) {
              newRefreshToken = data.refreshToken;
            }
          } else if (typeof data.token === 'string') {
            // data.token 是字符串的情况
            // console.log('Token是字符串类型');
            newToken = data.token;
          }

          // 确保获取到了新的token
          if (!newToken) {
            // console.error('无法从响应中提取新token');
            this.clearUserInfo();
            this.redirectToLogin();
            return { success: false, message: '无法从响应中提取新token' };
          }

          // 更新状态
          this.token = newToken;
          if (newRefreshToken) {
            this.refreshToken = newRefreshToken;
          }

          // 更新本地存储
          localStorage.setItem('token', newToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // console.log('Store: Token已成功刷新');
          return { success: true };
        } else {
          // console.error('Store: 刷新Token失败:', msg);
          // Token刷新失败，执行登出操作
          this.clearUserInfo();
          ElMessage.error('登录已过期，请重新登录');
          this.redirectToLogin();
          return { success: false, message: msg };
        }
      } catch (error) {
        // console.error('Store: 刷新Token请求失败:', error);
        // 请求失败，执行登出操作
        this.clearUserInfo();
        ElMessage.error('登录已过期，请重新登录');
        this.redirectToLogin();
        return { success: false, message: '刷新Token失败，请重新登录' };
      }
    },

    // 重定向到登录页
    redirectToLogin() {
      try {
        // console.log('准备重定向到登录页...');
        if (router && typeof router.push === 'function') {
          router.push({ path: '/login', replace: true }).catch(err => {
            // console.error('路由跳转失败:', err);
            window.location.href = '/login';
          });
        } else {
          // console.error('router未定义，使用location跳转');
          window.location.href = '/login';
        }
      } catch (error) {
        // console.error('重定向到登录页时出错:', error);
        window.location.href = '/login';
      }
    },

    // 清除用户信息（不调用后端）
    clearUserInfo() {
      // 清除内存中的状态
      this.identity = '';
      this.userInfo = {};
      this.token = '';
      this.refreshToken = '';
      this.isLoggedIn = false;

      // 清除本地存储
      localStorage.removeItem('identity');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      // console.log('用户信息已清除');
    },

    // 登录操作
    async login(userNumber, password) {
      try {
        const response = await axios.post('http://8.137.101.41:8088/user/login', {
          userNumber,
          password
        });

        const { code, msg, data } = response.data;

        if (code === 200) {
          this.setUserInfo(data);
          return { success: true, identity: data.identity };
        } else {
          return { success: false, message: msg };
        }
      } catch (error) {
        console.error('登录请求失败:', error);
        return {
          success: false,
          message: '登录失败，请检查网络连接或服务器状态'
        };
      }
    },

    // 设置用户信息
    setUserInfo(data) {
      // 先输出调试信息
      // console.log('正在设置用户信息，身份为:', data.identity);
      // console.log('用户数据结构:', data);

      this.identity = data.identity;
      this.userInfo = data.user;

      // 处理不同的token结构
      if (data.token) {
        if (typeof data.token === 'object') {
          // token是对象的情况
          if (data.token.accessToken) {
            this.token = data.token.accessToken;
          }

          if (data.token.refreshToken) {
            this.refreshToken = data.token.refreshToken;
          }
        } else {
          // token是字符串的情况
          this.token = data.token;
        }
      } else if (data.accessToken) {
        // 直接有accessToken的情况
        this.token = data.accessToken;

        if (data.refreshToken) {
          this.refreshToken = data.refreshToken;
        }
      }

      this.isLoggedIn = true;

      // 将信息存储到本地
      localStorage.setItem('identity', data.identity);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      localStorage.setItem('token', this.token);
      localStorage.setItem('refreshToken', this.refreshToken);

      // console.log('用户信息设置完成，token:', this.token.substring(0, 15) + '...');
    },

    // 注销登录
    async logout() {
      try {
        // console.log('开始注销登录...');
        // 调用后端登出接口
        const response = await axios.post('http://8.137.101.41:8088/user/logout', {}, {
          headers: {
            Authorization: this.token
          }
        });

        const { code, msg } = response.data;

        if (code === 200) {
          // 清除用户信息
          this.clearUserInfo();

          ElMessage.success(msg || '已退出登录');
        } else {
          // console.error('登出失败:', msg);
          ElMessage.error(msg || '退出登录失败');

          // 即使登出API失败，也清除本地信息
          this.clearUserInfo();
        }
      } catch (error) {
        // console.error('登出请求失败:', error);
        ElMessage.error('退出登录失败，请检查网络连接');

        // 即使API调用失败，也清除本地登录状态
        this.clearUserInfo();
      }

      // 尝试跳转到登录页
      try {
        if (router && typeof router.push === 'function') {
          // console.log('尝试跳转到登录页');
          router.push('/login');
        } else {
          // console.error('router未定义或不是函数');
          window.location.href = '/login';
        }
      } catch (routerError) {
        // console.error('跳转到登录页失败:', routerError);
        // 如果路由跳转失败，使用原生跳转
        window.location.href = '/login';
      }
    },

    // 检查用户是否有权限访问某个页面
    hasPermission(route) {
      // 如果路由没有设置权限，则所有人都可以访问
      if (!route.meta || !route.meta.roles) {
        return true;
      }

      // 检查用户角色是否在允许访问的角色列表中
      return route.meta.roles.includes(this.identity);
    },

    // 过滤有权限访问的路由
    filterRoutes(routes) {
      return routes.filter(route => {
        if (this.hasPermission(route)) {
          if (route.children && route.children.length) {
            route.children = this.filterRoutes(route.children);
          }
          return true;
        }
        return false;
      });
    }
  }
});

// 为了在拦截器中使用store，导出一个获取store的方法
export const getStore = () => {
  return useUserStore();
}; 