import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

// 是否正在刷新token
let isRefreshing = false;
// 重试队列，每一项将是一个待执行的函数形式
let retryRequests = [];

// 创建axios实例
const service = axios.create({
  baseURL: 'http://8.137.101.41:8088', // API 请求的基础路径
  timeout: 10000, // 请求超时时间
});

// 刷新token的函数
const refreshToken = async () => {
  try {
    console.log('====== 开始刷新token流程 ======');
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('当前refreshToken:', refreshToken ? (`${refreshToken.substring(0, 10)}...`) : '不存在');

    if (!refreshToken) {
      console.error('没有找到refreshToken，无法刷新token');
      throw new Error('没有找到refreshToken');
    }

    console.log('准备发送刷新token请求...');

    // 直接使用fetch API发送请求，避免任何axios相关问题
    const response = await fetch('http://8.137.101.41:8088/user/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    // 解析响应JSON
    const responseData = await response.json();
    console.log('收到刷新token响应:', JSON.stringify(responseData));

    if (responseData.code === 200) {
      const data = responseData.data;
      let newToken, newRefreshToken;

      console.log('刷新token成功，解析响应数据结构:', JSON.stringify(data));

      // 处理嵌套结构
      if (data && data.token && typeof data.token === 'object') {
        // 处理 data.token 是对象的情况
        console.log('Token结构是对象类型');
        if (data.token.accessToken) {
          newToken = data.token.accessToken;
          console.log('从data.token.accessToken提取token');
        }

        if (data.token.refreshToken) {
          newRefreshToken = data.token.refreshToken;
          console.log('从data.token.refreshToken提取refreshToken');
        }
      } else if (data && data.accessToken) {
        // 直接在 data 中有 accessToken
        console.log('Token结构有直接的accessToken');
        newToken = data.accessToken;

        if (data.refreshToken) {
          newRefreshToken = data.refreshToken;
        }
      } else if (data && typeof data.token === 'string') {
        // data.token 是字符串的情况
        console.log('Token是字符串类型');
        newToken = data.token;
      } else {
        // 无法识别的结构，尝试直接输出完整数据
        console.error('无法识别的token结构，完整数据:', JSON.stringify(data));
        throw new Error('无法从响应中提取新token');
      }

      // 确保获取到了新的token
      if (!newToken) {
        console.error('无法从响应中提取新token:', JSON.stringify(data));
        throw new Error('无法从响应中提取新token');
      }

      // 更新本地存储的token和refreshToken
      localStorage.setItem('token', newToken);
      console.log('新token已设置（前15字符）:', newToken.substring(0, 15) + '...');

      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
        console.log('新refreshToken已设置');
      }

      console.log('====== Token刷新成功完成 ======');
      return newToken;
    } else {
      console.error('刷新Token失败, 响应码:', responseData.code, '消息:', responseData.msg);
      throw new Error(responseData.msg || 'Token刷新失败');
    }
  } catch (error) {
    console.error('刷新Token请求异常:', error.message);
    if (error.response) {
      console.error('错误响应数据:', error.response.data);
      console.error('错误响应状态:', error.response.status);
    } else if (error.request) {
      console.error('没有收到响应，请求详情:', error.request);
    }
    throw error; // 重新抛出错误，确保外部能捕获到
  }
};

// 请求拦截器 - 添加token到请求头
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理token过期
service.interceptors.response.use(
  response => {
    // 检查业务状态码，处理token过期的情况
    // 即使HTTP状态是200，业务码可能是400表示token过期
    if (response.data && response.data.code === 400 &&
      response.data.msg && response.data.msg.includes('token过期')) {

      // console.log('检测到token过期情况，具体响应:', JSON.stringify(response.data));

      // 不要直接reject，而是尝试刷新token
      const originalRequest = response.config;

      // 如果已经尝试过重试，则不再尝试
      if (originalRequest._retry) {
        // console.log('已经尝试过重试请求，不再重试');
        // 创建一个错误对象，附加特殊标记和原始响应数据
        const tokenExpiredError = new Error(response.data.msg);
        tokenExpiredError.response = response;
        tokenExpiredError.isTokenExpired = true;
        tokenExpiredError.originalData = response.data;
        return Promise.reject(tokenExpiredError);
      }

      // 标记请求已尝试重试
      originalRequest._retry = true;

      // 立即执行刷新token逻辑
      // console.log('开始同步刷新token流程');

      if (isRefreshing) {
        // 如果已经在刷新，则将请求加入队列
        // console.log('正在刷新token中，将当前请求加入队列');
        return new Promise(resolve => {
          retryRequests.push(() => {
            originalRequest.headers.Authorization = localStorage.getItem('token');
            resolve(service(originalRequest));
          });
        });
      }

      isRefreshing = true;

      // 返回刷新token并重试的Promise
      return refreshToken()
        .then(newToken => {
          // console.log('成功获取新token，重试原始请求');
          // 更新当前请求的Authorization头
          originalRequest.headers.Authorization = newToken;

          // 执行队列中的请求
          retryRequests.forEach(cb => cb());
          // 清空队列
          retryRequests = [];

          // 重试原始请求
          return service(originalRequest);
        })
        .catch(refreshError => {
          // console.error('刷新Token失败，错误详情:', refreshError);

          // 清除用户登录信息
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('identity');

          // 显示错误消息
          ElMessage.error('登录已过期，请重新登录');

          // 跳转到登录页
          if (router && typeof router.push === 'function') {
            router.push('/login').catch(() => {
              window.location.href = '/login';
            });
          } else {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    // 如果返回的状态码为200，并且业务码也是成功的，说明接口请求成功
    if (response.status === 200) {
      return response;
    }

    // 否则抛出错误
    return Promise.reject(new Error('请求失败'));
  },
  async error => {
    // 没有原始请求，直接抛出
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // 如果已经尝试过重试，则不再尝试
    if (originalRequest._retry) {
      // console.log('已经尝试过重试请求，不再重试');
      return Promise.reject(error);
    }

    // 判断是否是token过期错误 (现在处理三种情况)
    const isTokenExpired = error.isTokenExpired || // 我们自己标记的
      error.response?.status === 401 ||
      (error.response?.data &&
        (error.response.data.code === 401 || error.response.data.code === 400) &&
        (error.response.data.msg &&
          (error.response.data.msg.includes('token过期') ||
            error.response.data.msg.includes('认证失败'))));

    if (isTokenExpired) {
      // console.log('确认token过期，准备刷新, 错误详情:', error.message);

      if (isRefreshing) {
        // 如果已经在刷新，则将请求加入队列
        // console.log('正在刷新token中，将当前请求加入队列');
        return new Promise(resolve => {
          retryRequests.push(() => {
            originalRequest.headers.Authorization = localStorage.getItem('token');
            resolve(service(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 刷新token
        // console.log('开始刷新token...');
        const newToken = await refreshToken();
        // console.log('刷新token成功，重试原始请求');

        // 更新当前请求的Authorization头
        originalRequest.headers.Authorization = newToken;

        // 执行队列中的请求
        retryRequests.forEach(cb => cb());
        // 清空队列
        retryRequests = [];

        // 重试原始请求
        return service(originalRequest);
      } catch (refreshError) {
        // console.error('刷新Token失败，错误详情:', refreshError);

        // 清除用户登录信息
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('identity'); // 确保清除所有用户信息

        // 显示错误消息
        ElMessage.error('登录已过期，请重新登录');

        // 确保router能正确导入，避免undefined错误
        if (router && typeof router.push === 'function') {
          // console.log('准备跳转到登录页...');
          try {
            // 立即跳转到登录页，不使用setTimeout
            router.push({ path: '/login', replace: true }).catch(err => {
              // console.error('路由跳转失败:', err);
              // 如果路由跳转失败，尝试直接修改location
              window.location.href = '/login';
            });
          } catch (routerError) {
            // console.error('路由跳转出错:', routerError);
            window.location.href = '/login';
          }
        } else {
          // console.error('router未定义或不是函数，尝试直接修改location');
          // 如果router不可用，使用原生跳转
          window.location.href = '/login';
        }

        // 确保请求被拒绝，不会继续执行
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 对于其他错误，直接返回
    return Promise.reject(error);
  }
);

export default service; 