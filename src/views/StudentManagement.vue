<template>
  <div class="student-management">
    <h1 class="page-title">学生管理</h1>
    
    <div class="operation-bar">
      <SearchBox @search="handleSearch" />
      
      <div class="action-buttons">
        <el-button type="primary" @click="handleImportStudents">导入学生</el-button>
        <el-button type="success" @click="handleAddStudent">添加学生</el-button>
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
        <el-table-column prop="class" label="班级" width="145" align="center" />
        <el-table-column prop="name" label="姓名" width="120" align="center" />
        <el-table-column prop="studentId" label="学号" width="170" align="center" />
        <el-table-column prop="grade" label="年级" width="100" align="center" />
        <el-table-column prop="userStatus" label="用户状态" width="155" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.isActive"
              :active-value="true"
              :inactive-value="false"
              active-text="正常"
              inactive-text="禁用"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="userRole" label="用户权限" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getRoleTagType(scope.row.userRole)">
              {{ scope.row.userRole }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <div class="action-buttons-cell">
              <el-button 
                v-if="scope.row.userRole !== '班长'"
                type="primary" 
                link 
                @click="handleSetMonitor(scope.row)"
              >
                设为班长
              </el-button>
              <el-button 
                v-else
                type="success" 
                link 
                disabled
                class="disabled-button"
              >
                已是班长
              </el-button>
              <el-button
                v-if="scope.row.userRole === '学生' || scope.row.userRole === '班长'"
                type="warning"
                link
                @click="handleSetAdmin(scope.row)"
              >
                设为管理员
              </el-button>
              <el-button
                v-else-if="scope.row.userRole === '管理员'"
                type="warning"
                link
                disabled
                class="disabled-button"
              >
                已是管理员
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
    
    <!-- 添加学生对话框 -->
    <el-dialog
      v-model="addStudentDialogVisible"
      title="添加学生"
      width="500px"
    >
      <el-form :model="studentForm" label-width="100px" ref="studentFormRef" :rules="studentFormRules">
        <el-form-item label="年级" prop="userGrade">
          <el-select 
              v-model="studentForm.userGrade" 
              placeholder="请选择年级"
              @change="(value) => {
                fetchClassesByGrade(value);
                studentForm.userClass = ''; // 清空已选班级
              }"
            >
              <el-option
                v-for="grade in gradeOptions"
                :key="grade.value"
                :label="grade.label"
                :value="grade.value"
              />
            </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="userClass">
          <el-select 
            v-model="studentForm.userClass" 
            placeholder="请选择班级"
            :disabled="!studentForm.userGrade"
          >
            <el-option
              v-for="cls in classOptions"
              :key="cls.value"
              :label="cls.label"
              :value="cls.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名" prop="userName">
          <el-input v-model="studentForm.userName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="学号" prop="userNumber">
          <el-input v-model="studentForm.userNumber" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="studentForm.password" 
            type="password" 
            placeholder="请输入密码" 
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="studentForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码" 
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addStudentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddStudent">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import SearchBox from '../components/common/SearchBox.vue';
import FilterTags from '../components/common/FilterTags.vue';
import Pagination from '../components/common/Pagination.vue';
import request from '../utils/request'; // 导入封装好的请求工具

// 页面数据
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const classes = ['1', '2', '3', '4', '5', '6', '7'];

// 添加学生对话框
const addStudentDialogVisible = ref(false);
const studentFormRef = ref(null);
const studentForm = reactive({
  userClass: '',
  userGrade: 1,
  userName: '',
  password: '',
  confirmPassword: '',
  userNumber: ''
});

// 表单验证规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else {
    if (studentForm.confirmPassword !== '') {
      studentFormRef.value.validateField('confirmPassword');
    }
    callback();
  }
};

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== studentForm.password) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

const studentFormRules = {
  userClass: [{ required: true, message: '请选择班级', trigger: 'change' }],
  userGrade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  userName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [{ required: true, validator: validatePass, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }],
  userNumber: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 6, max: 15, message: '学号长度应在6-15位之间', trigger: 'blur' }
  ]
};
// 新增年级选项
const gradeOptions = ref([]);

// 修改筛选标签配置为computed属性
const filterGroups = computed(() => [
  {
    label: '年级',
    options: gradeOptions.value,
    isSingleSelect: true,
    defaultValue: gradeOptions.value.length > 0 ? gradeOptions.value[0].value : ''
  },
  {
    label: '用户权限',
    options: [
      { label: '学生', value: '学生' },
      { label: '班长', value: '班长' }
    ]
  }
]);

// 当前选中的筛选条件
const selectedFilters = ref(['研一', null]);

// 在onMounted钩子中添加初始化逻辑
onMounted(async () => {
  try {
    // 获取年级数据
    const gradeResponse = await request.get('/admin/getGrade');
    if (gradeResponse.data.code === 200) {
      const rawData = gradeResponse.data.data;
      if (Array.isArray(rawData)) {
        // 去重处理
        gradeOptions.value = Array.from(new Set(rawData))
          .map(grade => ({ label: grade, value: grade }));

        // 设置表单默认值为第一个年级选项的值
        if (gradeOptions.value.length > 0) {
          studentForm.userGrade = gradeOptions.value[0].value;  // 使用动态值
        }
        
        await nextTick();
        
        // 初始化筛选条件
        const newFilters = [
          gradeOptions.value[0]?.value || '', 
          selectedFilters.value[1] // 保留原有用户权限筛选
        ];
        
        selectedFilters.value = newFilters;
        fetchData();
      }
    }
  } catch (error) {
    console.error('获取年级数据失败:', error);
    ElMessage.error('年级数据加载失败');
  }
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

// 修改convertGradeToApiValue函数
const convertGradeToApiValue = (grade) => {
  // 如果后端需要数字类型，根据实际返回的年级值修改此映射
  // 示例：如果年级值为"24级硕士"对应1，"23级硕士"对应2
  return grade; // 假设直接返回年级字符串
};

// 修改fetchData中的参数构建
const fetchData = async () => {
  loading.value = true;
  try {
    // 从筛选条件中获取年级和用户类型参数
    let userGrade = convertGradeToApiValue(selectedFilters.value[0]); // 使用转换后的值
    let usertype = null;
    
    
    // 处理用户类型筛选
    if (selectedFilters.value[1]) {
      if (selectedFilters.value[1] === '学生') {
        usertype = 4;
      } else if (selectedFilters.value[1] === '班长') {
        usertype = 3;
      }
    }
    
    // 构建请求参数，添加分页参数
    const params = {
      userName: keyword.value || null,
      userGrade: userGrade, // 使用转换后的值
      userType: usertype,
      page: currentPage.value,
      pageSize: pageSize.value
    };
    
    console.log('查询学生参数:', params);
    
    // 发送API请求
    const response = await request.post('/admin/user/selectUser', params);
    
    // 处理响应数据
    if (response.data.code === 200) {
      const data = response.data.data;
      
      // 处理新的返回格式，records 包含学生记录
      if (data && data.records) {
        // 转换API数据格式为组件所需格式
        tableData.value = data.records.map(item => {
          return {
            id: item.id,
            name: item.userName,
            class: item.userClass,
            studentId: item.userNumber,
            userRole: convertUserTypeToRole(item.userType),
            isActive: item.status === 0,
            grade: item.userGrade 
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

// 将API返回的userType转换为角色名称
const convertUserTypeToRole = (userType) => {
  switch (userType) {
    case 1: return '超级管理员';
    case 2: return '管理员';
    case 3: return '班长';
    case 4: return '学生';
    default: return '未知';
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

// 导入学生
const handleImportStudents = () => {
  // 创建文件选择框
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 上传文件
      uploadStudentFile(file);
    }
  };
  
  input.click();
};

// 上传学生文件
const uploadStudentFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // 显示上传中提示
    ElMessage.info(`正在导入文件: ${file.name}，请稍候...`);
    
    // 调用新的上传API
    const response = await request.post('/admin/importUser', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('导入学生响应:', response.data);
    
    if (response.data.code === 200) {
      ElMessage.success(`成功导入学生数据: ${file.name}`);
      fetchData(); // 刷新数据
    } else {
      ElMessage.error(`导入失败: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('导入学生数据失败:', error);
    ElMessage.error('导入失败，请确保文件格式正确');
  }
};

// 在脚本部分添加以下内容
const classOptions = ref([]); // 新增班级选项

const fetchClassesByGrade = async (grade) => {
  try {
    const encodedGrade = encodeURIComponent(grade);
    const response = await request.get(
      `/admin/comprehensiveData/getClassesByGrade/${encodedGrade}`
    );
    
    // 直接使用响应数组（根据示例响应格式）
    if (Array.isArray(response.data)) {
      classOptions.value = response.data.map(cls => ({
        label: cls,
        value: cls
      }));
    }
  } catch (error) {
    console.error('获取班级失败:', error);
    ElMessage.error('班级数据加载失败');
  }
};

// 修改添加学生时的重置逻辑
const handleAddStudent = () => {
  addStudentDialogVisible.value = false;

  setTimeout(() => {
    // 重置时使用动态默认值
    studentForm.userGrade = gradeOptions.value.length > 0 
      ? gradeOptions.value[0].value 
      : '';

    // 主动触发获取班级
    if (studentForm.userGrade) {
      fetchClassesByGrade(studentForm.userGrade);
    }
    
    // 保持其他字段重置逻辑
    studentForm.userClass = '';
    studentForm.userName = '';
    studentForm.password = '';
    studentForm.confirmPassword = '';
    studentForm.userNumber = '';

    setTimeout(() => {
      addStudentDialogVisible.value = true;
      if (studentFormRef.value) {
        studentFormRef.value.resetFields();
      }
    }, 100);
  }, 0);
};

// 确认添加学生
const confirmAddStudent = async () => {
  if (!studentFormRef.value) return;
  
  await studentFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 构建请求参数
        const params = {
      userClass: studentForm.userClass,
      userGrade: convertGradeToApiValue(studentForm.userGrade), // 添加转换
      userName: studentForm.userName,
      password: studentForm.password,
      userNumber: studentForm.userNumber
    };
        
        console.log('添加学生参数:', params);
        
        // 发送API请求
        const response = await request.post('/admin/user/add', params);
        
        if (response.data.code === 200) {
          ElMessage.success('学生添加成功');
          addStudentDialogVisible.value = false;
          fetchData(); // 刷新数据
        } else {
          ElMessage.error(`添加失败: ${response.data.msg}`);
        }
      } catch (error) {
        console.error('添加学生失败:', error);
        ElMessage.error('添加失败，请稍后重试');
      }
    } else {
      ElMessage.error('请完善表单信息');
      return false;
    }
  });
};

// 获取用户角色对应的标签类型
const getRoleTagType = (role) => {
  switch (role) {
    case '班长': return 'danger';
    case '管理员': return 'warning';
    case '超级管理员': return 'success';
    default: return 'info'; // 学生
  }
};

// 用户状态变更
const handleStatusChange = async (row) => {
  try {
    const newStatus = row.isActive ? 0 : 1; // 0=正常, 1=禁用
    const statusText = row.isActive ? '启用' : '禁用';
    
    // 使用更新后的API接口更新用户状态
    const response = await request.put(`/admin/user/disabledUser/${row.id}/${newStatus}`);
    
    console.log('状态变更响应:', response.data);
    
    if (response.data.code === 200) {
      ElMessage.success(`已${statusText}用户: ${row.name}`);
    } else {
      // 如果失败，恢复UI状态
      row.isActive = !row.isActive;
      ElMessage.error(`状态更新失败: ${response.data.msg}`);
    }
  } catch (error) {
    // 发生错误时，恢复UI状态
    row.isActive = !row.isActive;
    console.error('更新用户状态失败:', error);
    ElMessage.error('操作失败，请稍后重试');
  }
};

// 设置班长
const handleSetMonitor = (row) => {
  ElMessageBox.confirm(
    `确定要将 ${row.name} 设置为 ${row.class} 的班长吗？这将会取消原班长的身份。`,
    '设置班长',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        // 发送API请求设置班长 - 使用PUT请求和新的API路径
        const response = await request.put(`/admin/setMonitor/${row.id}`);
        
        if (response.data.code === 200) {
          ElMessage.success(`已将 ${row.name} 设置为 ${row.class} 的班长`);
          fetchData(); // 刷新数据
        } else {
          ElMessage.error(`设置班长失败: ${response.data.msg}`);
        }
      } catch (error) {
        console.error('设置班长失败:', error);
        ElMessage.error('操作失败，请稍后重试');
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作');
    });
};

// 设置管理员
const handleSetAdmin = (row) => {
  ElMessageBox.confirm(
    `确定要将 ${row.name} 设置为管理员吗？`,
    '设置管理员',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        // 发送API请求设置管理员
        const params = {
          id: row.id,
          roleId: 2 // 学生只能设置为管理员(roleId=2)
        };
        
        const response = await request.post('/admin/role/setAdminRole', params);
        
        if (response.data.code === 200) {
          ElMessage.success(`已将 ${row.name} 设置为管理员`);
          fetchData(); // 刷新数据
        } else {
          ElMessage.error(`设置管理员失败: ${response.data.msg}`);
        }
      } catch (error) {
        console.error('设置管理员失败:', error);
        ElMessage.error('操作失败，请稍后重试');
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作');
    });
};

// 生成模拟数据
const generateMockData = () => {
  const userRoles = ['学生', '班长'];
  const classList = ['1班', '2班', '3班', '4班', '5班', '6班', '7班'];
  
  // 确保每个班级只有一个班长
  const monitors = {};
  classList.forEach(cls => {
    monitors[cls] = false;
  });
  
  return Array.from({ length: 100 }, (_, i) => {
    const classIndex = i % 7;
    const className = classList[classIndex];
    
    // 决定是否为班长
    let userRole = '学生';
    if (!monitors[className] && Math.random() > 0.9) {
      userRole = '班长';
      monitors[className] = true;
    }
    
    return {
      id: i + 1,
      class: className,
      name: `学生${i + 1}`,
      studentId: `2023${String(i + 1).padStart(4, '0')}`,
      userRole: userRole,
      isActive: Math.random() > 0.1 // 90%的概率为启用状态
    };
  });
};
</script>

<style scoped>
.student-management {
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

/* 确保按钮文字颜色正确 */
.el-button {
  color: #fff;
}

.el-button--text,
.el-button--link {
  color: #409EFF;
}

.el-button--primary {
  background-color: #409EFF;
  color: #fff;
}

.el-button--success {
  background-color: #67C23A;
  color: #fff;
}

.el-button--danger {
  background-color: #F56C6C;
  color: #fff;
}

.el-button--warning {
  background-color: #E6A23C;
  color: #fff;
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

/* 操作栏按钮布局 */
.action-buttons-cell {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 5px;
  width: 100%;
}

/* 标签居中显示 */
:deep(.el-table .el-tag) {
  display: inline-flex;
  justify-content: center;
  min-width: 60px;
}

/* 开关样式 */
:deep(.el-switch__core) {
  background-color: #dcdfe6;
}

:deep(.el-switch.is-checked .el-switch__core) {
  background-color: #409EFF;
}

/* 禁用按钮样式优化 */
:deep(.disabled-button.el-button.is-disabled) {
  opacity: 0.8;
  color: #606266;
  border: 1px dashed #909399;
  background-color: #f4f4f5;
  padding: 2px 8px;
  border-radius: 4px;
}

/* logo背景 */
.filter-container {
  position: relative;
  margin-bottom: 20px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 1);
  /* box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);  */
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
  opacity: 0.08;
  z-index: 0;
  border-radius: 8px;
}
</style> 