<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  LayoutDashboard, Users, BookOpen, FileCheck, Shield, Settings, Bell, LogOut,
  ChevronRight, User, Upload, Plus, Search, CheckCircle, Edit2
} from 'lucide-vue-next';

const activeMenu = ref('students');
const selectedGrade = ref('');
const selectedRole = ref('');
const searchKeyword = ref('');

const gradeOptions = [
  { value: '', label: '全部年级' },
  { value: '研一', label: '研一' },
  { value: '研二', label: '研二' },
  { value: '研三', label: '研三' }
];

const roleOptions = [
  { value: '', label: '全部权限' },
  { value: '学生', label: '学生' },
  { value: '班长', label: '班长' }
];

const menuItems = [
  { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
  { id: 'students', label: '学生管理', icon: Users },
  { id: 'grades', label: '成绩管理', icon: BookOpen },
  { id: 'review', label: '成绩审核', icon: FileCheck },
  { id: 'permissions', label: '权限管理', icon: Shield },
  { id: 'settings', label: '系统设置', icon: Settings }
];

const students = ref([
  { id: 1, name: '张三', class: '计算机2101', studentId: '2021001', grade: '研一', role: '学生', status: true },
  { id: 2, name: '李四', class: '软件工程2102', studentId: '2021002', grade: '研二', role: '班长', status: true },
  { id: 3, name: '王五', class: '物联网2101', studentId: '2021003', grade: '研一', role: '学生', status: true },
  { id: 4, name: '赵六', class: '计算机2102', studentId: '2021004', grade: '研三', role: '学生', status: false },
  { id: 5, name: '钱七', class: '软件工程2101', studentId: '2021005', grade: '研二', role: '学生', status: true },
  { id: 6, name: '孙八', class: '物联网2102', studentId: '2021006', grade: '研一', role: '学生', status: true }
]);

const filteredStudents = computed(() => {
  return students.value.filter(s => {
    if (selectedGrade.value && s.grade !== selectedGrade.value) return false;
    if (selectedRole.value && s.role !== selectedRole.value) return false;
    if (searchKeyword.value && !s.name.includes(searchKeyword.value)) return false;
    return true;
  });
});

const getRoleTagClass = (role: string) => {
  switch (role) {
    case '班长': return 'bg-red-100 text-red-700';
    default: return 'bg-blue-100 text-blue-700';
  }
};

const getStatusText = (status: boolean) => {
  return status ? '正常' : '禁用';
};

const getStatusClass = (status: boolean) => {
  return status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
};

const toggleStatus = (student: any) => {
  student.status = !student.status;
};

const handleSetMonitor = (student: any) => {
  student.role = '班长';
};

const handleSetAdmin = (student: any) => {
  console.log('Set admin:', student.name);
};

const handleImportStudents = () => {
  console.log('Import students');
};

const handleAddStudent = () => {
  console.log('Add student');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <aside class="fixed left-0 top-0 h-full w-60 bg-gradient-to-b from-blue-800 via-blue-700 to-blue-900 text-white shadow-xl">
      <div class="p-5 border-b border-blue-600/30">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Shield class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="font-bold text-white text-sm">综测管理系统</h1>
            <p class="text-xs text-blue-200">Admin Panel</p>
          </div>
        </div>
      </div>
      
      <nav class="p-3 space-y-1">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="activeMenu = item.id"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
            activeMenu === item.id 
              ? 'bg-white/20 text-white font-medium' 
              : 'text-blue-100 hover:bg-white/10 hover:text-white'
          ]"
        >
          <div :class="[
            'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
            activeMenu === item.id ? 'bg-white/30' : 'bg-white/5'
          ]">
            <component :is="item.icon" class="w-4 h-4" />
          </div>
          <span class="text-sm">{{ item.label }}</span>
          <ChevronRight v-if="activeMenu === item.id" class="ml-auto w-4 h-4 text-blue-200" />
        </button>
      </nav>
      
      <div class="absolute bottom-0 left-0 right-0 p-3 border-t border-blue-600/30">
        <button class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-100 hover:bg-white/10 hover:text-white transition-all">
          <div class="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
            <LogOut class="w-4 h-4" />
          </div>
          <span class="text-sm">退出登录</span>
        </button>
      </div>
    </aside>
    
    <main class="ml-60 p-8">
      <header class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">学生管理</h1>
            <p class="text-gray-500 mt-1">管理学生信息和权限</p>
          </div>
          <div class="flex items-center gap-4">
            <button 
              class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
              @click="handleImportStudents"
            >
              <Upload class="w-4 h-4" />
              <span class="text-sm">导入学生</span>
            </button>
            <button 
              class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
              @click="handleAddStudent"
            >
              <Plus class="w-4 h-4" />
              <span class="text-sm">添加学生</span>
            </button>
            <button class="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all">
              <Bell class="w-5 h-5 text-gray-600" />
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>
      
      <div class="bg-white rounded-2xl card-shadow overflow-hidden">
        <div class="p-6 border-b border-gray-100">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">年级:</span>
              <select 
                v-model="selectedGrade"
                class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm"
              >
                <option v-for="grade in gradeOptions" :key="grade.value" :value="grade.value">{{ grade.label }}</option>
              </select>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">权限:</span>
              <select 
                v-model="selectedRole"
                class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm"
              >
                <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
              </select>
            </div>
            
            <div class="relative ml-auto w-64">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索学生姓名"
                class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">序号</th>
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">班级</th>
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">姓名</th>
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">学号</th>
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">年级</th>
                <th class="text-center py-4 px-6 text-sm font-medium text-gray-500">用户状态</th>
                <th class="text-center py-4 px-6 text-sm font-medium text-gray-500">用户权限</th>
                <th class="text-right py-4 px-6 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(student, index) in filteredStudents" :key="student.id" class="border-b border-gray-50 hover:bg-gray-50">
                <td class="py-4 px-6">{{ index + 1 }}</td>
                <td class="py-4 px-6 text-gray-600">{{ student.class }}</td>
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User class="w-5 h-5 text-gray-500" />
                    </div>
                    <span class="font-medium text-gray-800">{{ student.name }}</span>
                  </div>
                </td>
                <td class="py-4 px-6 text-gray-600">{{ student.studentId }}</td>
                <td class="py-4 px-6 text-gray-600">{{ student.grade }}</td>
                <td class="py-4 px-6 text-center">
                  <button 
                    @click="toggleStatus(student)"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      student.status ? 'bg-green-500' : 'bg-gray-300'
                    ]"
                  >
                    <span 
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        student.status ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                  <span :class="['ml-2 text-sm font-medium', getStatusClass(student.status)]">
                    {{ getStatusText(student.status) }}
                  </span>
                </td>
                <td class="py-4 px-6 text-center">
                  <span :class="['px-3 py-1 rounded-full text-sm font-medium', getRoleTagClass(student.role)]">
                    {{ student.role }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      v-if="student.role !== '班长'"
                      @click="handleSetMonitor(student)"
                      class="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 class="w-4 h-4" />
                      <span class="text-sm">设为班长</span>
                    </button>
                    <button 
                      v-else
                      class="flex items-center gap-1 px-3 py-1.5 text-gray-400 bg-gray-50 rounded-lg"
                      disabled
                    >
                      <CheckCircle class="w-4 h-4" />
                      <span class="text-sm">已是班长</span>
                    </button>
                    <button 
                      v-if="student.role !== '管理员'"
                      @click="handleSetAdmin(student)"
                      class="flex items-center gap-1 px-3 py-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                    >
                      <Edit2 class="w-4 h-4" />
                      <span class="text-sm">设为管理员</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="flex items-center justify-between p-4 border-t border-gray-100">
          <p class="text-sm text-gray-500">显示 1-{{ filteredStudents.length }} 条，共 {{ students.length }} 条</p>
          <div class="flex items-center gap-2">
            <button class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl disabled:opacity-50">上一页</button>
            <button class="px-4 py-2 text-sm bg-blue-500 text-white rounded-xl">1</button>
            <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-xl">2</button>
            <button class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl">下一页</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
