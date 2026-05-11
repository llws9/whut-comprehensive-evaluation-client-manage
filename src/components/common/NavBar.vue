<template>
  <div class="navbar">
    <div class="logo">
      <h2>学生成绩管理系统</h2>
    </div>
    <el-menu
      :default-active="activeIndex"
      class="nav-menu"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      unique-opened
      router
    >
      <el-menu-item index="/workbench">
        <el-icon><DataAnalysis /></el-icon>
        <span>工作台</span>
      </el-menu-item>
      
      <el-menu-item index="/grade-review">
        <el-icon><Document /></el-icon>
        <span>成绩审核</span>
      </el-menu-item>
      
      <el-menu-item index="/grade-management">
        <el-icon><Histogram /></el-icon>
        <span>成绩管理</span>
      </el-menu-item>
      
      <el-sub-menu index="3">
        <template #title>
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </template>
        <el-menu-item index="/student-management">
          <el-icon><UserFilled /></el-icon>
          <span>学生管理</span>
        </el-menu-item>
        <el-menu-item index="/permission-management">
          <el-icon><Setting /></el-icon>
          <span>权限管理</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Document, Histogram, User, UserFilled, Setting, DataAnalysis } from '@element-plus/icons-vue';

const route = useRoute();
const activeIndex = ref('');

onMounted(() => {
  activeIndex.value = route.path;
});
</script>

<style scoped>
.navbar {
  width: 220px;
  height: 100%;
  background-color: #304156;
  color: #fff;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #263445;
  color: #fff;
}

.logo h2 {
  font-size: 18px;
  font-weight: 600;
}

.nav-menu {
  border-right: none;
  height: calc(100% - 60px);
}

.el-menu-item, .el-sub-menu__title {
  height: 50px;
  line-height: 50px;
}
</style> 