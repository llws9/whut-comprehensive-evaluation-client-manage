<template>
  <div class="filter-tags">
    <div v-for="(group, groupIndex) in filterGroups" :key="groupIndex" class="filter-group">
      <span class="filter-label">{{ group.label }}:</span>
      <div class="tags">
        <el-tag
          v-for="(tag, index) in group.options"
          :key="index"
          :type="isSelected(groupIndex, tag.value) ? '' : 'info'"
          :effect="isSelected(groupIndex, tag.value) ? 'dark' : 'plain'"
          class="filter-tag"
          @click="toggleFilter(groupIndex, tag.value, group.isSingleSelect)"
        >
          <el-tooltip 
            :content="tag.label" 
            placement="top" 
            :disabled="!isSelected(groupIndex, tag.value)"
          >
            <span>{{ tag.label }}</span>
          </el-tooltip>
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  filterGroups: {
    type: Array,
    required: true
  }
});

const selectedFilters = ref([]);
const emit = defineEmits(['filter-change']);

// 初始化selectedFilters数组
onMounted(() => {
  initializeFilters();
});

const initializeFilters = () => {
  selectedFilters.value = props.filterGroups.map((group, index) => {
    // 如果有默认值，则使用默认值
    if (group.defaultValue) {
      return group.defaultValue;
    }
    return null;
  });
  
  // 发出初始选择的事件
  emit('filter-change', selectedFilters.value);
};

const isSelected = (groupIndex, value) => {
  return selectedFilters.value[groupIndex] === value;
};

const toggleFilter = (groupIndex, value, isSingleSelect) => {
  if (isSingleSelect) {
    // 如果是必选一项，则直接设置为选中值
    selectedFilters.value[groupIndex] = value;
  } else {
    // 否则按照原来的逻辑，可以取消选择
    if (selectedFilters.value[groupIndex] === value) {
      selectedFilters.value[groupIndex] = null;
    } else {
      selectedFilters.value[groupIndex] = value;
    }
  }
  
  emit('filter-change', selectedFilters.value);
};

watch(() => props.filterGroups, () => {
  initializeFilters();
}, { deep: true });
</script>

<style scoped>
.filter-tags {
  margin: 20px 0;
  background-color: #f9fafc;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.filter-label {
  font-weight: 600;
  margin-right: 15px;
  min-width: 80px;
  color: #606266;
  font-size: 14px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  z-index: 1;
}

.filter-tag {
  margin-right: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  user-select: none;
  padding: 0 12px;
  height: 32px;
  line-height: 30px;
  border-radius: 4px;
  transition: all 0.3s;
}

.filter-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style> 