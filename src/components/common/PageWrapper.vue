<template>
  <div class="page-wrapper">
    <div class="page-header-gradient"></div>
    <div class="page-content">
      <slot></slot>
    </div>
    <div class="page-footer-spacer"></div>
    <div class="page-footer-gradient"></div>
  </div>
</template>

<script setup>
// PageWrapper组件用于包装页面内容，确保正确的布局和滚动行为
</script>

<style scoped>
.page-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0; /* 重要：允许内容收缩 */
  padding: 0 10px;
  position: relative;
}

.page-header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, 
    rgba(245, 247, 250, 0.9), 
    rgba(245, 247, 250, 0.4), 
    rgba(245, 247, 250, 0));
  pointer-events: none;
  z-index: 2;
}

.page-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding-bottom: 40px; /* 为分页控件提供底部空间 */
  position: relative;
  padding-top: 10px;
}

.page-content::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to bottom, 
    rgba(245, 247, 250, 0), 
    rgba(245, 247, 250, 0.8), 
    rgba(245, 247, 250, 1));
  pointer-events: none;
}

.page-footer-spacer {
  height: 20px;
  position: relative;
  z-index: 1;
}

.page-footer-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(to bottom, 
    rgba(245, 247, 250, 1), 
    rgba(0, 70, 140, 0.05));
  pointer-events: none;
  z-index: 1;
}
</style> 