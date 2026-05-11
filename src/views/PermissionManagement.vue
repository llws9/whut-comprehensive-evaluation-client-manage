<template>
    <div class="permission-management">
      <h1 class="page-title">权限管理</h1>
      
      <div class="operation-bar">
        <SearchBox @search="handleSearch" />
        
        <div class="action-buttons">
          <el-button type="primary" @click="handleAddAdmin">添加管理员</el-button>
        </div>
      </div>
      
      <div class="filter-container">
        <FilterTags 
        :filter-groups="filterGroups"
        @filter-change="handleFilterChange"
      />
      </div>

      
      <el-card class="table-card" shadow="hover">
        <el-table
          v-loading="loading"
          :data="tableData"
          border
          style="width: 100%"
        >
          <el-table-column label="序号" width="80" align="center">
            <template #default="scope">
              {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="username" label="用户名" width="140" align="center" />
          <el-table-column prop="role" label="权限" width="140" align="center">
            <template #default="scope">
              <el-tag :type="getRoleType(scope.row.role)">{{ scope.row.role }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="操作员" width="140" align="center" />
          <el-table-column prop="updateTime" label="更新时间" width="180" align="center" />
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="scope">
              <div class="action-buttons-cell">
                <el-button 
                  :type="scope.row.status === '正常' ? 'danger' : 'success'" 
                  link 
                  @click="handleToggleStatus(scope.row)"
                >
                  {{ scope.row.status === '正常' ? '禁用' : '启用' }}
                </el-button>
                <el-button 
                  type="danger" 
                  size="small"
                  @click="handleDeleteAdmin(scope.row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <Pagination
            :total="total"
            :current-page-prop="currentPage"
            :page-size-prop="pageSize"
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </div>
      </el-card>
      
      <!-- 添加管理员对话框 -->
      <el-dialog
        v-model="addAdminDialogVisible"
        title="添加管理员"
        width="500px"
      >
        <el-form :model="adminForm" label-width="100px" ref="adminFormRef" :rules="adminFormRules">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="adminForm.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="学号/工号" prop="userNumber">
            <el-input v-model="adminForm.userNumber" placeholder="请输入学号/工号" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="adminForm.password" type="password" placeholder="请输入密码" show-password />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="adminForm.confirmPassword" type="password" placeholder="请确认密码" show-password />
          </el-form-item>
          <el-form-item label="权限" prop="role">
            <el-select v-model="adminForm.role" placeholder="请选择权限">
              <el-option label="超级管理员" value="超级管理员" />
              <el-option label="管理员" value="管理员" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="addAdminDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmAddAdmin">确认</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, reactive } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import SearchBox from '../components/common/SearchBox.vue';
  import FilterTags from '../components/common/FilterTags.vue';
  import Pagination from '../components/common/Pagination.vue';
  import request from '../utils/request'; // 导入请求工具
  
  // 页面数据
  const loading = ref(false);
  const tableData = ref([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const keyword = ref('');
  
  // 添加管理员对话框
  const addAdminDialogVisible = ref(false);
  const adminFormRef = ref(null);
  const adminForm = reactive({
    name: '',
    userNumber: '',
    password: '',
    confirmPassword: '',
    role: '管理员'
  });
  
  // 表单验证规则
  const validatePass = (rule, value, callback) => {
    if (value === '') {
      callback(new Error('请输入密码'));
    } else {
      if (adminForm.confirmPassword !== '') {
        adminFormRef.value.validateField('confirmPassword');
      }
      callback();
    }
  };
  
  const validatePass2 = (rule, value, callback) => {
    if (value === '') {
      callback(new Error('请再次输入密码'));
    } else if (value !== adminForm.password) {
      callback(new Error('两次输入密码不一致'));
    } else {
      callback();
    }
  };
  
  const adminFormRules = {
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    userNumber: [{ required: true, message: '请输入学号/工号', trigger: 'blur' }],
    password: [{ required: true, validator: validatePass, trigger: 'blur' }],
    confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }],
    role: [{ required: true, message: '请选择权限', trigger: 'change' }]
  };
  
  // 筛选标签配置
  const filterGroups = reactive([
    {
      label: '用户权限',
      options: [
        { label: '超级管理员', value: '1' },
        { label: '管理员', value: '2' },
        { label: '班长', value: '3' }
      ]
    }
  ]);
  
  // 当前选中的筛选条件
  const selectedFilters = ref([null]);
  
  // 根据角色获取标签类型
  const getRoleType = (role) => {
    switch (role) {
      case '超级管理员':
        return 'danger';
      case '管理员':
        return 'warning';
      case '班长':
        return 'info';
      default:
        return '';
    }
  };
  
  // 将API返回的userType转换为角色名称
  const convertUserTypeToRole = (userType) => {
    switch (userType) {
      case '1': return '超级管理员';
      case '2': return '管理员';
      case '3': return '班长';
      case '4': return '学生';
      default: return '未知角色';
    }
  };
  
  // 将角色名称转换为roleId
  const convertRoleToId = (role) => {
    switch (role) {
      case '超级管理员': return 1;
      case '管理员': return 2;
      case '班长': return 3;
      case '学生': return 4;
      default: return 0;
    }
  };
  
  // 初始化页面数据
  onMounted(() => {
    fetchData();
  });
  
  // 处理搜索
  const handleSearch = (value) => {
    keyword.value = value;
    currentPage.value = 1;
    fetchData();
  };
  
  // 处理筛选变化
  const handleFilterChange = (filters) => {
    selectedFilters.value = filters;
    currentPage.value = 1;
    fetchData();
  };
  
  // 获取数据方法
  const fetchData = async () => {
    loading.value = true;
    try {
      // 构建请求参数
      const params = {
        page: currentPage.value,
        userName: keyword.value || null,
        userType: selectedFilters.value[0] || ""
      };
      
      console.log('查询管理员参数:', params);
      
      // 发送API请求
      const response = await request.post('/admin/role/selectUserRoles', params);
      
      // 处理响应数据
      if (response.data.code === 200) {
        const data = response.data.data;
        
        if (data && data.records) {
          // 转换API数据格式为组件所需格式
          tableData.value = data.records.map(item => {
            return {
              id: item.id,
              username: item.userName,
              role: convertUserTypeToRole(item.userType),
              status: item.status === 0 ? '正常' : '禁用', // 根据status字段确定状态：0为正常，1为禁用
              operator: item.auditor || '系统',
              updateTime: item.updateTime ? new Date(item.updateTime).toLocaleString() : '未知'
            };
          });
          
          // 使用后端返回的总数
          total.value = data.total;
        } else {
          tableData.value = [];
          total.value = 0;
          console.warn('API返回的数据格式不符合预期:', data);
        }
      } else {
        ElMessage.error(`查询失败: ${response.data.msg}`);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      ElMessage.error('数据获取失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  };
  
  // 分页处理
  const handlePageChange = (page) => {
    currentPage.value = page;
    fetchData();
  };
  
  const handlePageSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1;
    fetchData();
  };
  
  // 切换状态
  const handleToggleStatus = (row) => {
    const newStatus = row.status === '正常' ? '禁用' : '正常';
    const actionText = newStatus === '正常' ? '启用' : '禁用';
    const statusValue = newStatus === '正常' ? 0 : 1; // 0表示启用，1表示禁用
    
    ElMessageBox.confirm(
      `确定要${actionText}用户 ${row.username} 吗？`,
      `${actionText}用户`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: newStatus === '正常' ? 'success' : 'warning',
      }
    )
      .then(async () => {
        try {
          // 获取角色对应的roleId
          const roleId = convertRoleToId(row.role);
          
          // 调用API更新用户状态
          const response = await request.put(`/admin/role/disableAdministrator/${row.id}/${statusValue}/${roleId}`);
          
          console.log('状态变更响应:', response.data);
          
          if (response.data.code === 200) {
            // 更新本地状态
            row.status = newStatus;
            row.updateTime = new Date().toLocaleString();
            ElMessage.success(`已${actionText}用户: ${row.username}`);
          } else {
            ElMessage.error(`操作失败: ${response.data.msg}`);
          }
        } catch (error) {
          console.error('更新用户状态失败:', error);
          ElMessage.error('操作失败，请稍后重试');
        }
      })
      .catch(() => {
        ElMessage.info('已取消操作');
      });
  };
  
  // 删除管理员
  const handleDeleteAdmin = (row) => {
    ElMessageBox.confirm(
      `确定要删除用户 ${row.username} 吗？此操作不可恢复！`,
      '删除用户',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        distinguishCancelAndClose: true,
      }
    )
      .then(async () => {
        try {
          // 获取角色对应的roleId
          const roleId = convertRoleToId(row.role);
          const statusValue = 2; // 2表示删除
          
          // 调用相同的API更新用户状态
          const response = await request.put(`/admin/role/disableAdministrator/${row.id}/${statusValue}/${roleId}`);
          
          console.log('删除用户响应:', response.data);
          
          if (response.data.code === 200) {
            ElMessage.success(`已删除用户: ${row.username}`);
            // 刷新数据
            fetchData();
          } else {
            ElMessage.error(`删除失败: ${response.data.msg}`);
          }
        } catch (error) {
          console.error('删除用户失败:', error);
          ElMessage.error('操作失败，请稍后重试');
        }
      })
      .catch(action => {
        // 只有点击取消按钮时才提示
        if (action === 'cancel') {
          ElMessage.info('已取消删除操作');
        }
      });
  };
  
  // 添加管理员
  const handleAddAdmin = () => {
    // 重置表单
    Object.assign(adminForm, {
      name: '',
      userNumber: '',
      password: '',
      confirmPassword: '',
      role: '管理员'
    });
    
    addAdminDialogVisible.value = true;
  };
  
  // 确认添加管理员
  const confirmAddAdmin = async () => {
    if (!adminFormRef.value) return;
    
    await adminFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          // 获取角色对应的roleId
          const roleId = convertRoleToId(adminForm.role);
          
          // 构建请求参数
          const params = {
            userName: adminForm.name,
            userNumber: adminForm.userNumber,
            password: adminForm.password,
            roleId: roleId
          };
          
          // 调用添加管理员API
          const response = await request.post('/admin/role/addAdminRole', params);
          
          console.log('添加管理员响应:', response.data);
          
          if (response.data.code === 200) {
            addAdminDialogVisible.value = false;
            ElMessage.success('管理员添加成功');
            
            // 刷新数据
            fetchData();
          } else {
            ElMessage.error(`添加失败: ${response.data.msg}`);
          }
        } catch (error) {
          console.error('添加管理员失败:', error);
          ElMessage.error('添加失败，请稍后重试');
        }
      } else {
        ElMessage.error('请完善表单信息');
        return false;
      }
    });
  };
  </script>
  
  <style scoped>
  .permission-management {
    padding-bottom: 40px;
  }
  
  .page-title {
    color: #00468C;
    font-size: 1.5rem;
    margin-bottom: 20px;
    padding-left: 10px;
    border-left: 4px solid #00468C;
  }
  
  .operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .action-buttons {
    display: flex;
    gap: 12px;
  }
  
  /* 确保表格容器有足够的高度 */
  .table-card {
    min-height: 65vh;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .table-card .el-card__body {
    padding: 20px;
    display: flex;
    flex-direction: column;
  }
  
  .el-table {
    flex: 1;
    margin-bottom: 20px;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
  
  :deep(.el-table) {
    margin-top: 20px;
    border-radius: 8px;
    overflow: hidden;
  }
  
  :deep(.el-table th) {
    background-color: #f5f7fa;
  }
  
  :deep(.el-table--border, .el-table--group) {
    border-color: #ebeef5;
  }
  
  :deep(.el-table--border th, .el-table--border td) {
    border-right-color: #ebeef5;
  }
  
  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background-color: #fafafa;
  }
  
  /* 改善表格行的悬停状态 */
  :deep(.el-table tr:hover) {
    background-color: #f0f7ff;
  }
  
  /* 确保右侧固定列有良好的阴影效果 */
  :deep(.el-table .is-right-fixed) {
    box-shadow: -3px 0 5px rgba(0, 0, 0, 0.05);
  }
  
  /* 优化表格内容居中和对齐 */
  :deep(.el-table td) {
    padding: 12px 0;
    text-align: center;
  }
  
  :deep(.el-table .cell) {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 0 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* 标签居中显示 */
  :deep(.el-table .el-tag) {
    display: inline-flex;
    justify-content: center;
    min-width: 60px;
  }
  
  :deep(.el-button--primary) {
    background-color: #409EFF;
  }
  
  :deep(.el-button--danger) {
    background-color: #F56C6C;
  }
  
  :deep(.el-button--success) {
    background-color: #67C23A;
  }
  
  :deep(.el-dialog__header) {
    padding: 20px;
    background-color: #f9fafc;
    border-bottom: 1px solid #ebeef5;
  }
  
  :deep(.el-dialog__title) {
    font-weight: 600;
    color: #303133;
  }
  
  :deep(.el-dialog__body) {
    padding: 30px 20px;
  }
  
  :deep(.el-dialog__footer) {
    padding: 15px 20px;
    border-top: 1px solid #ebeef5;
    background-color: #f9fafc;
  }
  
  :deep(.el-form-item__label) {
    font-weight: 500;
  }
  
  :deep(.el-select) {
    width: 100%;
  }
  
  .action-buttons-cell {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 5px;
    width: 100%;
  }

  /* logo背景 */
.filter-container {
  position: relative;
  margin-bottom: 20px;
  border-radius: 8px;
  /* background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); */
}
.filter-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/public/whut-logo.png');
  background-repeat: no-repeat;
  background-position: right center;
  background-size: 400px;
  opacity: 0.05;
  z-index: 0;
  border-radius: 8px;
}
  </style>