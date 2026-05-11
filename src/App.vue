<template>
  <div class="app-container" v-if="isLoggedIn">
    <el-container class="container">
      <!-- 侧边导航 -->
      <el-aside width="220px" class="aside">
        <div class="logo">
          <div class="whut-logo"></div>
          <h1>信息工程学院综合测评管理系统</h1>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="menu"
          background-color="#034694"
          text-color="#fff"
          active-text-color="#333"
          router
        >
          <el-menu-item index="/workbench" class="menu-item">
            <el-icon class="menu-icon"><DataAnalysis /></el-icon>
            <span>工作台</span>
          </el-menu-item>
          
          <el-menu-item index="/grade-review" class="menu-item">
            <el-icon class="menu-icon"><Check /></el-icon>
            <span>成绩审核</span>
          </el-menu-item>
          
          <el-menu-item index="/grade-management" class="menu-item">
            <el-icon class="menu-icon"><Document /></el-icon>
            <span>成绩管理</span>
          </el-menu-item>
          
          <el-sub-menu v-if="userStore.isSuperAdmin" index="1" class="menu-submenu">
            <template #title>
              <el-icon class="menu-icon"><User /></el-icon>
              <span>用户管理</span>
              <!-- <el-icon class="arrow-icon"><arrow-right /></el-icon> -->
            </template>
            <el-menu-item index="/student-management" class="submenu-item">学生管理</el-menu-item>
            <el-menu-item index="/permission-management" class="submenu-item">权限管理</el-menu-item>
          </el-sub-menu>
        </el-menu>
        <div class="whut-building"></div>
      </el-aside>

      <!-- 内容区域 -->
      <el-container class="main-container">
        <!-- 顶部导航 -->
        <el-header class="header">
          <div class="header-left">
            <span class="page-title">{{ currentPageTitle }}</span>
          </div>
          <div class="header-center">
            <div class="center-content">
              <img src="/whut.png" alt="院徽" class="academy-logo">
              <a href="https://stu.whut.asia" target="_blank" class="artistic-text-link">
                <div class="artistic-text">"信"火相传</div>
              </a>
            </div>
          </div>
          <div class="header-right">
            <a href="https://zhlgd.whut.edu.cn" target="_blank" class="slogan-link">
              <div class="whut-slogan">厚德博学，追求卓越</div>
            </a>
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar size="small" class="avatar">{{ userInitial }}</el-avatar>
                <span class="username">{{ userName }}</span>
                <el-icon><CaretBottom /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主要内容 -->
        <el-main class="main">
          <router-view />
        </el-main>
        
        <!-- 页脚 -->
        <el-footer class="footer">
          <div class="footer-content">
            <p>武汉理工大学 成绩管理系统 &copy; {{ new Date().getFullYear() }}</p>
          </div>
        </el-footer>
      </el-container>
    </el-container>
    
    <!-- 个人信息对话框 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="个人信息"
      width="400px"
      align-center
      :destroy-on-close="true"
      class="profile-dialog"
    >
      <div class="profile-content">
        <div class="profile-header">
          <el-avatar :size="80" class="profile-avatar" :style="{ backgroundColor: avatarColor }">
            {{ userInitial }}
          </el-avatar>
          <h2 class="profile-name">{{ userStore.userName }}</h2>
          <el-tag :type="roleTagType" effect="dark" class="role-tag">{{ userStore.identity }}</el-tag>
        </div>
        
        <div class="profile-info">
          <div class="info-item">
            <div class="info-label">
              <el-icon><User /></el-icon>
              <span>账号</span>
            </div>
            <div class="info-value">{{ userStore.userNumber }}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">
              <el-icon><Document /></el-icon>
              <span>班级</span>
            </div>
            <div class="info-value">{{ userStore.userClass || '暂无班级信息' }}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">
              <el-icon><Lock /></el-icon>
              <span>权限</span>
            </div>
            <div class="info-value">{{ userStore.identity }}</div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="profileDialogVisible = false">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
  <router-view v-else />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from './stores/user';
import { ElMessageBox } from 'element-plus';
import { User, Document, Check, Lock, CaretBottom, ArrowRight, DataAnalysis } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 个人信息对话框控制
const profileDialogVisible = ref(false);

// 检查是否已登录
const isLoggedIn = computed(() => userStore.isLoggedIn);

// 计算当前激活的菜单项
const activeMenu = computed(() => route.path);

// 获取当前页面标题
const currentPageTitle = computed(() => {
  return route.meta.title || '成绩管理系统';
});

// 获取用户名
const userName = computed(() => userStore.userName || '未登录');

// 获取用户名首字母头像
const userInitial = computed(() => {
  const name = userStore.userName || '';
  return name.charAt(0).toUpperCase();
});

// 根据用户角色生成不同的头像背景色
const avatarColor = computed(() => {
  const colors = {
    '超级管理员': '#00468C',
    '管理员': '#0066CC',
    '班长': '#0099FF',
    '学生': '#00B9F2'
  };
  return colors[userStore.identity] || '#00468C';
});

// 根据用户角色获取标签类型
const roleTagType = computed(() => {
  const types = {
    '超级管理员': 'danger',
    '管理员': 'warning',
    '班长': 'primary',
    '学生': 'success'
  };
  return types[userStore.identity] || 'info';
});

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      // 显示个人信息对话框
      profileDialogVisible.value = true;
      break;
    case 'logout':
      // 确认退出
      ElMessageBox.confirm(
        '确定要退出登录吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 执行退出操作
        userStore.logout();
        router.push('/login');
      }).catch(() => {});
      break;
  }
};

// 监听登录状态变化
watch(() => userStore.isLoggedIn, (newVal) => {
  if (!newVal && route.meta.requiresAuth) {
    router.push('/login');
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #f5f7fa;
}

.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.container {
  height: 100%;
}

.aside {
  height: 100%;
  background-color: #034694;
  background-image: linear-gradient(to bottom, #023570, #034694, #034694); 
  color: #fff;
  overflow: visible;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 10;
  border-bottom-left-radius: 20px;
  border-top-right-radius: 10px;
}

.logo {
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #023570;
  background-image: linear-gradient(to bottom, #012758, #023570);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-direction: column;
  padding: 15px 10px;
  position: relative;
  border-top-right-radius: 10px;
}

.whut-logo {
  width: 60px;
  height: 60px;
  background-image: url('/public/whut.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: #fff;
  border-radius: 50%;
  margin-bottom: 24px;
}

.logo:hover .whut-logo {
  transform: rotate(360deg);
}

.logo h1 {
  font-size: 13px;
  font-weight: bold;
  margin: 0;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  text-align: center;
  line-height: 1.3;
}

.menu {
  border-right: none;
  flex: 1;
}

.menu:not(.el-menu--collapse) {
  width: 100%;
}

/* 菜单项样式 */
.menu-item {
  margin: 8px 0;
  padding-left: 20px;
  height: 50px;
  line-height: 50px;
  transition: all 0.3s ease;
  border-radius: 0 25px 25px 0;
  margin-right: 15px;
  position: relative;
  overflow: hidden;
}

.menu-item:hover {
  background: linear-gradient(90deg, #034694, #0A59C0) !important;
  padding-left: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.menu-icon {
  margin-right: 10px;
  font-size: 18px;
  transition: all 0.3s ease;
}

.menu-item:hover .menu-icon {
  transform: scale(1.2);
}

/* 子菜单样式 */
.menu-submenu {
  margin: 8px 0;
}

.el-sub-menu__title {
  padding-left: 20px !important;
  height: 50px !important;
  line-height: 50px !important;
  transition: all 0.3s ease !important;
  border-radius: 0 25px 25px 0 !important;
  margin-right: 15px !important;
  position: relative;
  overflow: hidden;
}

.el-sub-menu__title:hover {
  background: linear-gradient(90deg, #034694, #0A59C0) !important;
  padding-left: 25px !important;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.el-sub-menu__title:hover .menu-icon {
  transform: scale(1.2);
}

.arrow-icon {
  position: absolute;
  right: 20px;
  transition: transform 0.3s ease;
}

.el-sub-menu.is-opened .arrow-icon {
  transform: rotate(90deg);
}

.submenu-item {
  background-color: rgba(2, 35, 70, 0.7) !important;
  margin: 5px 15px 5px 10px !important;
  height: 40px !important;
  line-height: 40px !important;
  border-radius: 20px !important;
  transition: all 0.3s ease !important;
}

.submenu-item:hover {
  background-color: rgba(10, 89, 192, 0.6) !important;
  transform: translateX(5px);
}

.submenu-item.is-active {
  background-color: #ffffff !important;
  color: #034694 !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.whut-building {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 150px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><path d="M10,100 L10,70 L25,60 L40,70 L40,100 Z" fill="%23002A54"/><path d="M50,100 L50,60 L70,45 L90,60 L90,100 Z" fill="%23002A54"/><path d="M100,100 L100,65 L120,50 L140,65 L140,100 Z" fill="%23002A54"/><path d="M150,100 L150,75 L165,65 L180,75 L180,100 Z" fill="%23002A54"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom center;
  opacity: 0.2;
  pointer-events: none;
  border-bottom-left-radius: 20px;
}

/* 修改菜单项选中样式 */
.el-menu-item.is-active {
  background: linear-gradient(90deg, #ffffff, #f0f0f0) !important;
  color: #034694 !important;
  position: relative;
  z-index: 2;
  border-top-right-radius: 25px;
  border-bottom-right-radius: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-right: 10px; /* 添加一点右边距，使圆角效果更明显 */
  font-weight: bold;
  transform: translateX(5px);
}

/* 菜单选中状态指示器 */
.el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background-color: #F6C95E;
  border-radius: 0 2px 2px 0;
  z-index: 3;
  box-shadow: 0 0 10px rgba(246, 201, 94, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(246, 201, 94, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(246, 201, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(246, 201, 94, 0);
  }
}

/* 点击动画 */
.el-menu-item:active, .el-sub-menu__title:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}

/* 子菜单展开/折叠动画 */
.el-menu--collapse .el-sub-menu__title span,
.el-menu--collapse .el-menu-item span {
  height: 0;
  width: 0;
  overflow: hidden;
  visibility: hidden;
  display: inline-block;
}

.el-menu-item-group__title {
  padding: 0;
}

.el-sub-menu.is-active .el-sub-menu__title {
  color: #ffffff !important;
  background: linear-gradient(90deg, #034694, #0A59C0) !important;
}

/* 子菜单过渡动画 */
.el-menu-item,
.el-sub-menu__title {
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) !important;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .menu-item, .el-sub-menu__title {
    margin-right: 5px;
  }
}

.header {
  background-color: #ffffff;
  color: #333;
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #dcdfe6;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #034694;
}

.header-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.center-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.academy-logo {
  height: 40px;
  width: auto;
  margin-right: 10px;
  object-fit: contain;
}

.artistic-text-link {
  text-decoration: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border-radius: 5px;
  transition: transform 0.3s;
  display: block;
}

.artistic-text-link:hover {
  transform: translateY(-2px);
}

.artistic-text-link:active {
  transform: translateY(1px);
}

.artistic-text {
  font-size: 36px;
  font-weight: 700;
  font-family: "STXingkai", "华文行楷", cursive;
  letter-spacing: 2px;
  padding: 0 15px;
  position: relative;
  z-index: 1;
  background: linear-gradient(120deg, #034694, #4a9bff, #034694);
  background-size: 300% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: liquidFlow 8s ease-in-out infinite alternate, glow 2s ease-in-out infinite alternate;
}

@keyframes liquidFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes glow {
  from {
    text-shadow: 0 0 5px rgba(74, 155, 255, 0.3), 0 0 10px rgba(74, 155, 255, 0.2);
  }
  to {
    text-shadow: 0 0 10px rgba(74, 155, 255, 0.5), 0 0 20px rgba(74, 155, 255, 0.3);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.slogan-link {
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s;
  display: block;
}

.slogan-link:hover {
  transform: translateY(-2px);
}

.slogan-link:active {
  transform: translateY(1px);
}

.whut-slogan {
  margin-right: 10px;
  position: relative;
}

.whut-slogan:after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: #00468C;
  transition: width 0.3s ease;
}

.slogan-link:hover .whut-slogan:after {
  width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.avatar {
  margin-right: 8px;
  background-color: #034694;
  color: #fff;
}

.username {
  margin-right: 5px;
  font-size: 14px;
}

.main-container {
  height: 100%;
  background-color: #f5f7fa;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: none;
  margin-left: 0;
  padding-left: 0;
}

.main-container::before {
  display: none;
}

.main {
  padding: 20px;
  background-color: #f5f7fa;
  background-image: linear-gradient(to bottom, #f8fafd, #f5f7fa);
  overflow-y: auto;
  position: relative;
  flex: 1;
  padding-bottom: 60px; /* 为页脚腾出空间 */
  display: flex;
  flex-direction: column;
  border-left: none; /* 移除左侧边框，使融合更自然 */
}

.main .el-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main .el-card__body {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.content-container {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.profile-dialog .el-dialog__body {
  padding-top: 10px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.profile-avatar {
  margin-bottom: 10px;
}

.profile-name {
  margin: 10px 0 5px;
  font-size: 18px;
}

.role-tag {
  margin-bottom: 10px;
}

.profile-info {
  width: 100%;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  width: 80px;
  display: flex;
  align-items: center;
  color: #909399;
}

.info-label .el-icon {
  margin-right: 5px;
}

.info-value {
  flex: 1;
  color: #303133;
}

.dialog-footer {
  text-align: center;
  margin-top: 10px;
}

.el-main {
  --el-main-padding: 20px;
}

.footer {
  height: 40px;
  background-color: #00468C;
  background-image: linear-gradient(to bottom, #ffffff, #00468C);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  font-size: 12px;
  width: 100%;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
}

.footer::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  pointer-events: none;
}

.footer-content {
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 覆盖Element Plus默认样式 */
.el-button--primary {
  --el-button-bg-color: #00468C;
  --el-button-border-color: #00468C;
  --el-button-hover-bg-color: #005FB8;
  --el-button-hover-border-color: #005FB8;
  --el-button-active-bg-color: #003A73;
  --el-button-active-border-color: #003A73;
}

.el-pagination {
  --el-pagination-button-bg-color: #00468C;
  --el-pagination-hover-color: #00468C;
}

/* 修改菜单项选中样式 */
.el-menu-item.is-active {
  background-color: #ffffff !important;
  color: #333 !important;
  position: relative;
  z-index: 2;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 5px 0 10px -5px rgba(0, 0, 0, 0.1);
  margin-right: 3px; /* 添加一点右边距，使圆角效果更明显 */
}

/* 移除凹槽效果 */
.el-menu-item.is-active::after {
  display: none;
}

.el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background-color: #F6C95E;
  border-radius: 0 2px 2px 0;
  z-index: 3;
}

.el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  margin-right: 3px;
}

/* 保持子菜单项的样式一致 */
.el-sub-menu .el-menu-item.is-active {
  background-color: #ffffff !important;
  color: #333 !important;
  position: relative;
  z-index: 2;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 5px 0 10px -5px rgba(0, 0, 0, 0.1);
  margin-right: 3px; /* 添加一点右边距，使圆角效果更明显 */
}

/* 移除凹槽效果 */
.el-sub-menu .el-menu-item.is-active::after {
  display: none;
}

.el-sub-menu .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background-color: #F6C95E;
  border-radius: 0 2px 2px 0;
  z-index: 3;
}

.el-sub-menu__title:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  margin-right: 3px;
}

/* 操作按钮样式 */
.el-button.pass-button {
  color: #67C23A !important;
  background-color: rgba(103, 194, 58, 0.05) !important;
  border: 1px solid rgba(103, 194, 58, 0.2) !important;
  transition: all 0.3s ease;
}

.el-button.pass-button:hover {
  background-color: rgba(103, 194, 58, 0.15) !important;
  border-color: rgba(103, 194, 58, 0.4) !important;
  box-shadow: 0 2px 6px rgba(103, 194, 58, 0.2);
}

.el-button.reject-button {
  color: #F56C6C !important;
  background-color: rgba(245, 108, 108, 0.05) !important;
  border: 1px solid rgba(245, 108, 108, 0.2) !important;
  transition: all 0.3s ease;
}

.el-button.reject-button:hover {
  background-color: rgba(245, 108, 108, 0.15) !important;
  border-color: rgba(245, 108, 108, 0.4) !important;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.2);
}

.table-operations {
  display: flex;
  gap: 8px;
  padding: 4px;
  border-radius: 6px;
  background: linear-gradient(to right, rgba(245, 247, 250, 0.5), rgba(245, 247, 250, 0));
}

.table-operations .el-button {
  padding: 4px 8px;
  border-radius: 4px;
}

/* 添加响应式样式 */
@media screen and (max-width: 768px) {
  .aside {
    width: 60px !important;
    overflow: visible;
  }
  
  .logo h1 {
    display: none;
  }
  
  .logo {
    padding: 10px 0;
    height: 60px;
  }
  
  .whut-building {
    display: none;
  }
  
  .header {
    padding: 0 10px;
  }
  
  .username {
    display: none;
  }
  
  .whut-slogan {
    display: none;
  }
}

/* 添加动画效果 */
.el-menu-item, .el-sub-menu__title {
  transition: all 0.3s ease;
}

.main {
  position: relative;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 添加过渡动画 */
.el-menu-item {
  transition: all 0.3s ease;
  position: relative;
}

.el-sub-menu__title {
  transition: all 0.3s ease;
  position: relative;
}

.el-sub-menu .el-menu-item {
  transition: all 0.3s ease;
  position: relative;
}

/* 添加计算属性来获取当前选中菜单项的位置 */
</style> 