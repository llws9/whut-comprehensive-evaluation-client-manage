<template>
  <div class="error-container">
    <div class="error-content">
      <div class="whut-logo"></div>
      <h1 class="error-code">403</h1>
      <h2 class="error-title">禁止访问</h2>
      <p class="error-message">很抱歉，您没有权限访问此页面</p>
      <div class="actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
      <div class="whut-slogan">厚德博学，追求卓越</div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// 返回首页
const goHome = () => {
  router.push('/');
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
  position: relative;
  overflow: hidden;
}

.error-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><path d="M200,700 L200,550 L300,500 L400,550 L400,700 Z" fill="%2300468C" opacity="0.1"/><path d="M500,700 L500,500 L600,450 L700,500 L700,700 Z" fill="%2300468C" opacity="0.1"/></svg>');
  background-size: cover;
  background-position: center;
  opacity: 0.1;
  z-index: 0;
}

.error-content {
  text-align: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 70, 140, 0.1);
  max-width: 500px;
  position: relative;
  z-index: 1;
  border-top: 4px solid #00468C;
  animation: fadeIn 0.5s ease;
}

.whut-logo {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%2300468C"/><path d="M30,30 L50,20 L70,30 L70,60 C60,70 40,70 30,60 Z" fill="white"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.error-code {
  font-size: 120px;
  color: #00468C;
  margin: 0;
  line-height: 1.2;
  font-weight: bold;
}

.error-title {
  font-size: 28px;
  color: #303133;
  margin: 10px 0;
}

.error-message {
  font-size: 16px;
  color: #606266;
  margin: 20px 0;
}

.actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.whut-slogan {
  margin-top: 20px;
  font-size: 14px;
  color: #00468C;
  opacity: 0.7;
  font-family: "STKaiti", "楷体", "KaiTi", serif;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.el-button--primary) {
  --el-button-bg-color: #00468C;
  --el-button-border-color: #00468C;
  --el-button-hover-bg-color: #005FB8;
  --el-button-hover-border-color: #005FB8;
  --el-button-active-bg-color: #003A73;
  --el-button-active-border-color: #003A73;
}
</style> 