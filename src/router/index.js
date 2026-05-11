import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/user';
import GradeReview from '../views/GradeReview.vue';
import GradeManagement from '../views/GradeManagement.vue';
import StudentManagement from '../views/StudentManagement.vue';
import PermissionManagement from '../views/PermissionManagement.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { 
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: 'Home',
    redirect: '/workbench',
    meta: { 
      requiresAuth: true
    }
  },
  {
    path: '/workbench',
    name: 'Workbench',
    component: () => import('../views/Workbench.vue'),
    meta: { 
      title: '工作台',
      requiresAuth: true,
      roles: ['superAdmin', 'admin', 'monitor'] // 所有角色都可访问
    }
  },
  {
    path: '/student-management',
    name: 'StudentManagement',
    component: () => import('../views/StudentManagement.vue'),
    meta: { 
      title: '学生管理',
      requiresAuth: true,
      roles: ['superAdmin'] // 仅超级管理员可访问
    }
  },
  {
    path: '/grade-management',
    name: 'GradeManagement',
    component: () => import('../views/GradeManagement.vue'),
    meta: { 
      title: '成绩管理',
      requiresAuth: true,
      roles: ['superAdmin', 'admin', 'monitor'] // 所有角色都可访问
    }
  },
  {
    path: '/grade-review',
    name: 'GradeReview',
    component: () => import('../views/GradeReview.vue'),
    meta: { 
      title: '成绩审核',
      requiresAuth: true,
      roles: ['superAdmin', 'admin', 'monitor'] // 所有角色都可访问
    }
  },
  {
    path: '/permission-management',
    name: 'PermissionManagement',
    component: () => import('../views/PermissionManagement.vue'),
    meta: { 
      title: '权限管理',
      requiresAuth: true,
      roles: ['superAdmin'] // 仅超级管理员可访问
    }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../views/error/403.vue'),
    meta: { 
      title: '403 禁止访问',
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/error/404.vue'),
    meta: { 
      title: '404 页面不存在',
      requiresAuth: false
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  document.title = to.meta.title ? `${to.meta.title} - 学生成绩管理系统` : '学生成绩管理系统';
  
  // 检查路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  // 如果路由不需要认证，直接放行
  if (!requiresAuth) {
    // 如果已经登录且访问的是登录页，重定向到首页
    if (to.path === '/login' && localStorage.getItem('token')) {
      next({ path: '/' });
    } else {
      next();
    }
    return;
  }
  
  // 检查用户是否已登录
  const token = localStorage.getItem('token');
  if (!token) {
    ElMessage.warning('请先登录');
    next({ path: '/login', query: { redirect: to.fullPath } });
    return;
  }
  
  // 获取用户信息和权限
  const userStore = useUserStore();
  
  // 添加调试信息
  console.log('当前用户权限:', userStore.identity);
  console.log('需要的权限:', to.meta.roles);
  console.log('权限匹配结果:', to.meta.roles && to.meta.roles.includes(userStore.identity));
  
  // 检查用户是否有权限访问该路由
  if (to.meta.roles && !to.meta.roles.includes(userStore.identity)) {
    ElMessage.error(`权限不足，无法访问该页面。当前权限：${userStore.identity}`);
    
    // 添加3秒后自动返回登录页
    setTimeout(() => {
      userStore.logout();
      next({ path: '/login' });
    }, 3000);
    
    return;
  }
  
  // 如果是班长，并且访问的是成绩管理或成绩审核页面，
  // 需要确保他们只能看到自己班级的数据（这部分逻辑在组件内实现）
  next();
});

export default router; 