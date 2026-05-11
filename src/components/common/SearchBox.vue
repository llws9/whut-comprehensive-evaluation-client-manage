<template>
  <div class="search-box">
    <el-input
      v-model="keyword"
      placeholder="请输入搜索关键词"
      clearable
      @keyup.enter="handleSearch"
    >
      <template #append>
        <el-button :icon="Search" @click="handleSearch"></el-button>
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';

const keyword = ref('');
const emit = defineEmits(['search']);

const handleSearch = () => {
  emit('search', keyword.value);
};
</script>

<style scoped>
.search-box {
  display: flex;
  align-items: center;
  width: 300px;
}
</style> 