<template>
  <div class="pagination-container">
    <div class="pagination-info">
      <span class="total-info">共 <span class="total-count">{{ total }}</span> 条记录</span>
    </div>
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="[10, 20, 50, 100, 400]"
      layout="sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      background
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  total: {
    type: Number,
    required: true
  },
  currentPageProp: {
    type: Number,
    default: 1
  },
  pageSizeProp: {
    type: Number,
    default: 10
  }
});

const emit = defineEmits(['update:page', 'update:pageSize']);

const currentPage = ref(props.currentPageProp);
const pageSize = ref(props.pageSizeProp);

watch(() => props.currentPageProp, (newVal) => {
  currentPage.value = newVal;
});

watch(() => props.pageSizeProp, (newVal) => {
  pageSize.value = newVal;
});

const handleSizeChange = (val) => {
  pageSize.value = val;
  emit('update:pageSize', val);
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  emit('update:page', val);
};
</script>

<style scoped>
.pagination-container {
  margin-top: 20px;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f9fafc;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.pagination-info {
  display: flex;
  align-items: center;
}

.total-info {
  color: #606266;
  font-size: 14px;
}

.total-count {
  color: #409EFF;
  font-weight: bold;
  margin: 0 5px;
}

:deep(.el-pagination) {
  margin-left: auto;
  padding: 0;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #409EFF;
  color: #fff;
  font-weight: bold;
}

:deep(.el-pagination.is-background .el-pager li) {
  background-color: #fff;
  margin: 0 5px;
  border-radius: 4px;
  min-width: 32px;
}

:deep(.el-pagination.is-background .btn-prev, .el-pagination.is-background .btn-next) {
  border-radius: 4px;
  margin: 0 5px;
}

:deep(.el-pagination .el-select .el-input) {
  width: 120px;
}
</style> 