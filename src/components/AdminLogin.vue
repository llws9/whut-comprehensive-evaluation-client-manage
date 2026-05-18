<script setup lang="ts">
import { ref } from 'vue';
import { User, Lock, Eye, EyeOff, Shield, ArrowRight } from 'lucide-vue-next';

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);

const handleLogin = () => {
  if (!username.value || !password.value) {
    return;
  }
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
    window.location.href = '#admin-home';
  }, 1500);
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl opacity-5"></div>
    </div>
    
    <div class="relative z-10 w-full max-w-md mx-4 animate-fade-in">
      <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
            <Shield class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-white mb-2">综合测评管理系统</h1>
          <p class="text-blue-200">管理员登录</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-white/80">用户名</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User class="w-5 h-5 text-blue-300" />
              </div>
              <input
                v-model="username"
                type="text"
                placeholder="请输入用户名"
                class="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-white/80">密码</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock class="w-5 h-5 text-blue-300" />
              </div>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <Eye v-if="showPassword" class="w-5 h-5 text-blue-300 hover:text-white" />
                <EyeOff v-else class="w-5 h-5 text-blue-300 hover:text-white" />
              </button>
            </div>
          </div>
          
          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="w-4 h-4 rounded border-gray-300 bg-white/10 text-blue-600 focus:ring-blue-500" />
              <span class="text-white/70">记住我</span>
            </label>
            <a href="#" class="text-blue-300 hover:text-white hover:underline">忘记密码?</a>
          </div>
          
          <button
            type="submit"
            :disabled="isLoading || !username || !password"
            class="w-full py-3.5 bg-gradient-primary text-white font-semibold rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isLoading ? '登录中...' : '登 录' }}</span>
            <ArrowRight v-if="!isLoading" class="w-5 h-5" />
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-white/60 text-sm">
            还没有账号? 
            <a href="#" class="text-blue-300 hover:text-white font-medium">联系超级管理员</a>
          </p>
        </div>
      </div>
      
      <div class="text-center mt-6 text-white/40 text-sm">
        © 2024 武汉理工大学 综合测评管理系统
      </div>
    </div>
  </div>
</template>
