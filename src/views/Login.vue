<template>
  <div class="login-container">
    <!-- 添加视频背景 -->
    <video ref="backgroundVideo" class="video-background" autoplay loop muted playsinline>
      <source src="https://f22.whut.edu.cn/2023/HQJN7H5AZBP0WSSA.mp4" type="video/mp4">
    </video>
    
    <div class="login-box">
      <div class="login-header">
        <h2>综测评定</h2>
        <p>Comprehensive Assessment</p>
      </div>
      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules" 
        class="login-form"
      >
        <el-form-item prop="userNumber">
          <el-input 
            v-model="loginForm.userNumber" 
            placeholder="请输入账号"
            prefix-icon="el-icon-user"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
            prefix-icon="el-icon-lock"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            class="login-button" 
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 添加底部备案信息 -->
      <div class="beian-info">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">闽ICP备2025090086号</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import axios from 'axios';
import { useUserStore } from '../stores/user';

const router = useRouter();
const loginFormRef = ref(null);
const loading = ref(false);
const userStore = useUserStore();
const backgroundVideo = ref(null);

// 登录表单数据
const loginForm = reactive({
  userNumber: '',
  password: ''
});

// 表单验证规则
const loginRules = {
  userNumber: [
    { required: true, message: '请输入账号', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
};

// 添加onMounted钩子，用于跳过视频前7秒
onMounted(() => {
  // 设置页面标题
  document.title = '登录-综测评定';
  
  if (backgroundVideo.value) {
    // 创建一个一次性的事件监听器，确保只执行一次
    const handleCanPlay = () => {
      backgroundVideo.value.currentTime = 7;
      backgroundVideo.value.play()
        .catch(err => console.error('视频播放失败:', err));
      // 移除事件监听器，防止重复执行
      backgroundVideo.value.removeEventListener('canplay', handleCanPlay);
    };
    
    // 监听canplay事件
    backgroundVideo.value.addEventListener('canplay', handleCanPlay);
    
    // 如果视频已加载完成，直接设置时间并播放
    if (backgroundVideo.value.readyState >= 3) { // HAVE_FUTURE_DATA or higher
      handleCanPlay();
    }
    
    // 添加一个监听器处理视频卡住的情况
    backgroundVideo.value.addEventListener('stalled', () => {
      console.log('视频卡住了，尝试恢复播放');
      backgroundVideo.value.load(); // 重新加载视频
      setTimeout(() => {
        backgroundVideo.value.currentTime = 7;
        backgroundVideo.value.play()
          .catch(err => console.error('恢复播放失败:', err));
      }, 1000);
    });
  }
});

// 登录处理函数
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) {
      return false;
    }
    
    loading.value = true;
    
    try {
      const response = await axios.post('http://8.137.101.41:8088/user/login', {
        userNumber: loginForm.userNumber,
        password: loginForm.password
      });
      
      const { code, msg, data } = response.data;
      
      if (code === 200) {
        // 登录成功，保存用户信息到localStorage
        // console.log('登录成功，返回的身份信息:', data.identity);
        
        // 保存token和refreshToken
        localStorage.setItem('token', data.token.accessToken);
        localStorage.setItem('refreshToken', data.token.refreshToken);
        
        // 直接使用Pinia存储的setUserInfo方法设置用户信息
        userStore.setUserInfo(data);
        
        ElMessage.success('登录成功');
        
        // 将所有用户都跳转到工作台页面
        router.push('/workbench');
        
        // 原来的代码已注释掉
        /*
        // 根据用户角色跳转到不同的页面
        switch (data.identity) {
          case 'superAdmin':
            router.push('/student-management');
            break;
          case 'admin':
            router.push('/grade-management');
            break;
          case 'monitor':
            router.push('/grade-management');
            break;
          default:
            router.push('/');
        }
        */
      } else {
        ElMessage.error(msg || '登录失败，请检查账号和密码');
      }
    } catch (error) {
      // console.error('登录请求失败:', error);
      ElMessage.error('登录失败，请检查网络连接或服务器状态');
    } finally {
      loading.value = false;
    }
  });
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(45deg, #0d47a1, #1976d2, #0288d1);
  background-size: 600% 600%;
  animation: gradientBackground 15s ease infinite, fadeIn 1s ease-out;
  position: relative;
  overflow: hidden;
}

/* 视频背景样式 */
.video-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  opacity: 0.85; /* 可以调整透明度 */
}

.login-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path fill="rgba(255,255,255,0.08)" d="M0,0 L100,0 L100,100 L0,100 Z" /></svg>'), 
              url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle fill="rgba(255,255,255,0.05)" r="20" cx="20" cy="20"/><circle fill="rgba(255,255,255,0.05)" r="20" cx="80" cy="60"/></svg>');
  background-size: 100% 100%, 300px 300px;
  opacity: 0.3;
  z-index: 1; /* 确保在视频上方但在内容下方 */
}

@keyframes gradientBackground {
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
}

@keyframes fadeIn {
  0% { 
    opacity: 0;
    transform: translateY(20px);
  }
  100% { 
    opacity: 1;
    transform: translateY(0);
  }
}

.login-box {
  width: 420px;
  padding: 45px 40px;
  background-color: rgba(255, 255, 255, 0.75);
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25), 0 5px 15px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 2; /* 确保在视频和装饰层上方 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
  border: 1px solid rgba(255, 255, 255, 0.8);
  animation: boxAppear 1s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes boxAppear {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-box:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 15px 20px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
  position: relative;
  animation: headerAppear 1.2s ease-out forwards;
  opacity: 0;
}

@keyframes headerAppear {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  60% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header::after {
  content: '';
  display: block;
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #0d47a1, #2196f3);
  margin: 15px auto 0;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.login-header:hover::after {
  width: 120px;
}

.login-header h2 {
  font-size: 32px;
  color: #0d47a1;
  margin-bottom: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.login-header p {
  font-size: 16px;
  color: #1976d2;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.login-form {
  margin-top: 30px;
  animation: formAppear 1.4s ease-out forwards;
  opacity: 0;
}

@keyframes formAppear {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  70% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-button {
  width: 100%;
  height: 46px;
  font-size: 16px;
  margin-top: 20px;
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 1px;
  background: linear-gradient(45deg, #0d47a1, #1976d2);
  border: none;
  box-shadow: 0 4px 10px rgba(13, 71, 161, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.6s ease;
}

.login-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1) translate(-50%, -50%);
  transform-origin: 0 0;
}

.login-button:hover {
  background: linear-gradient(45deg, #1565c0, #1e88e5);
  box-shadow: 0 6px 15px rgba(13, 71, 161, 0.5);
  transform: translateY(-3px);
}

.login-button:hover::before {
  left: 100%;
}

.login-button:active::after {
  animation: ripple 0.8s ease-out;
  opacity: 0;
}

@keyframes ripple {
  0% {
    opacity: 1;
    transform: scale(0) translate(-50%, -50%);
  }
  80% {
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: scale(50) translate(-50%, -50%);
  }
}

:deep(.el-input__wrapper) {
  padding: 0 15px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(25, 118, 210, 0.2);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

:deep(.el-input__wrapper:hover) {
  background-color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(25, 118, 210, 0.3);
  transform: translateY(-2px);
}

:deep(.el-input__wrapper.is-focus) {
  background-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 15px rgba(13, 71, 161, 0.2), inset 0 0 0 2px rgba(25, 118, 210, 0.5);
  transform: translateY(-3px);
}

:deep(.el-input__inner) {
  height: 46px;
  font-size: 15px;
  color: #0d47a1;
}

:deep(.el-input__inner::placeholder) {
  color: #64b5f6;
}

:deep(.el-form-item) {
  margin-bottom: 25px;
  position: relative;
  overflow: hidden;
}

:deep(.el-form-item__error) {
  padding-top: 6px;
  font-size: 13px;
  color: #d32f2f;
  font-weight: 500;
}

:deep(.el-icon) {
  font-size: 18px;
  color: #1976d2;
  margin-right: 8px;
  opacity: 0.9;
  transition: transform 0.3s ease;
}

:deep(.el-input:focus-within .el-icon) {
  transform: scale(1.1);
}

/* 添加备案信息样式 */
.beian-info {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: #909399;
}

.beian-info a {
  color: #909399;
  text-decoration: none;
  transition: color 0.3s;
}

.beian-info a:hover {
  color: #409EFF;
  text-decoration: underline;
}
</style> 