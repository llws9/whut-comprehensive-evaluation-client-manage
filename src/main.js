import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import axios from 'axios';

// 配置全局axios默认值
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      // 直接使用token，不添加Bearer前缀
      config.headers.Authorization = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 创建全局axios实例
const app = createApp(App);
app.config.globalProperties.$http = axios;

// 创建并使用Pinia状态管理
const pinia = createPinia();
app.use(pinia);

// 使用ElementPlus
app.use(ElementPlus);

// 注册所有ElementPlus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 使用Router
app.use(router);

// 挂载应用
app.mount('#app'); 