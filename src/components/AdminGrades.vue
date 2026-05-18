<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  LayoutDashboard, Users, BookOpen, FileCheck, Shield, Settings, Bell, LogOut,
  ChevronRight, User, BarChart3, Download, Upload, Search, Filter, RefreshCw,
  Edit2, Trash2, Eye, ShieldCheck, Calendar, FileText, BookOpenCheck
} from 'lucide-vue-next';

const activeMenu = ref('grades');
const selectedYear = ref('2024-2025');
const selectedGrade = ref('');
const selectedStatus = ref('all');
const searchKeyword = ref('');
const showImportButton = ref(true);
const showExportButton = ref(true);

const years = [
  { value: '2024-2025', label: '2024-2025学年' },
  { value: '2023-2024', label: '2023-2024学年' },
  { value: '2022-2023', label: '2022-2023学年' }
];

const gradeOptions = [
  { value: '', label: '全部年级' },
  { value: '研一', label: '研一' },
  { value: '研二', label: '研二' },
  { value: '研三', label: '研三' }
];

const statusOptions = [
  { id: 'all', label: '全部' },
  { id: 'confirmed', label: '已确认' },
  { id: 'pending', label: '待确认' }
];

const menuItems = [
  { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
  { id: 'students', label: '学生管理', icon: Users },
  { id: 'grades', label: '成绩管理', icon: BookOpen },
  { id: 'review', label: '成绩审核', icon: FileCheck },
  { id: 'permissions', label: '权限管理', icon: Shield },
  { id: 'settings', label: '系统设置', icon: Settings }
];

const grades = ref([
  { id: 1, student: '张三', class: '计算机2101', grade: '研一', intellectual: 92.5, sports: 88.0, labor: 90.0, moral: 95.0, total: 91.4, status: 'confirmed' },
  { id: 2, student: '李四', class: '软件工程2102', grade: '研二', intellectual: 88.0, sports: 90.0, labor: 85.0, moral: 92.0, total: 88.8, status: 'confirmed' },
  { id: 3, student: '王五', class: '物联网2101', grade: '研一', intellectual: 95.0, sports: 85.0, labor: 92.0, moral: 88.0, total: 90.0, status: 'pending' },
  { id: 4, student: '赵六', class: '计算机2102', grade: '研三', intellectual: 85.0, sports: 92.0, labor: 88.0, moral: 90.0, total: 88.8, status: 'confirmed' },
  { id: 5, student: '钱七', class: '软件工程2101', grade: '研二', intellectual: 90.0, sports: 88.0, labor: 95.0, moral: 92.0, total: 91.2, status: 'pending' },
  { id: 6, student: '孙八', class: '物联网2102', grade: '研一', intellectual: 82.0, sports: 95.0, labor: 90.0, moral: 88.0, total: 88.8, status: 'confirmed' }
]);

const getStatusClass = (status: string) => {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-700';
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'confirmed': return '已确认';
    case 'pending': return '待确认';
    default: return '未知';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
};

const filteredGrades = computed(() => {
  return grades.value.filter(g => {
    if (selectedStatus.value !== 'all' && g.status !== selectedStatus.value) return false;
    if (selectedGrade.value && g.grade !== selectedGrade.value) return false;
    if (searchKeyword.value && !g.student.includes(searchKeyword.value)) return false;
    return true;
  });
});

const handleYearChange = () => {
  console.log('Year changed:', selectedYear.value);
};

const handleGetTemplate = () => {
  console.log('Get template clicked');
};

const handleImportLecture = () => {
  console.log('Import lecture clicked');
};

const handleExportGrades = () => {
  console.log('Export grades clicked');
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
            <h1 class="text-2xl font-bold text-gray-800">成绩管理</h1>
            <p class="text-gray-500 mt-1">管理学生综测成绩数据</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="relative">
              <Calendar class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                v-model="selectedYear" 
                @change="handleYearChange"
                class="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option v-for="year in years" :key="year.value" :value="year.value">{{ year.label }}</option>
              </select>
            </div>
            <button 
              v-if="showImportButton" 
              class="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
              @click="handleGetTemplate"
            >
              <FileText class="w-4 h-4" />
              <span class="text-sm">获取导入模板</span>
            </button>
            <button 
              v-if="showImportButton" 
              class="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all"
              @click="handleImportLecture"
            >
              <BookOpenCheck class="w-4 h-4" />
              <span class="text-sm">导入讲座数据</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all">
              <Upload class="w-4 h-4" />
              <span class="text-sm">导入德育成绩</span>
            </button>
            <button 
              v-if="showExportButton" 
              class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
              @click="handleExportGrades"
            >
              <Download class="w-4 h-4" />
              <span class="text-sm">导出成绩</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
              <RefreshCw class="w-4 h-4 text-gray-500" />
              <span class="text-sm text-gray-600">刷新数据</span>
            </button>
            <button class="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all">
              <Bell class="w-5 h-5 text-gray-600" />
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>
      
      <div class="grid grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-2xl p-6 card-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">学生总数</p>
              <p class="text-3xl font-bold text-gray-800">2,456</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 card-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">已确认成绩</p>
              <p class="text-3xl font-bold text-green-600">1,832</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ShieldCheck class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 card-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">待确认成绩</p>
              <p class="text-3xl font-bold text-orange-600">624</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FileCheck class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 card-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">平均成绩</p>
              <p class="text-3xl font-bold text-purple-600">89.5</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <BarChart3 class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl card-shadow overflow-hidden">
        <div class="p-6 border-b border-gray-100">
          <div class="flex flex-wrap items-center gap-4 mb-4">
            <h2 class="font-semibold text-gray-800">成绩列表</h2>
            
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">年级:</span>
              <select 
                v-model="selectedGrade"
                class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm"
              >
                <option v-for="grade in gradeOptions" :key="grade.value" :value="grade.value">{{ grade.label }}</option>
              </select>
            </div>
            
            <div class="flex items-center gap-2 ml-auto">
              <span class="text-sm text-gray-500">状态:</span>
              <div class="flex items-center gap-2">
                <button
                  v-for="status in statusOptions"
                  :key="status.id"
                  @click="selectedStatus = status.id"
                  :class="[
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    selectedStatus === status.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  {{ status.label }}
                </button>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索学生姓名或班级"
                class="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <Filter class="w-4 h-4" />
              <span class="text-sm">高级筛选</span>
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">学生姓名</th>
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">班级</th>
                <th class="text-center py-4 px-6 text-sm font-medium text-gray-500">智育</th>
                <th class="text-center py-4 px-6 text-sm font-medium text-gray-500">体育美育</th>
                <th class="text-center py-4 px-6 text-sm font-medium text-gray-500">劳育</th>
                <th class="text-center py-4 px-6 text-sm font-medium text-gray-500">德育</th>
                <th class="text-center py-4 px-6 text-sm font-medium text-gray-500">总分</th>
                <th class="text-center py-4 px-6 text-sm font-medium text-gray-500">状态</th>
                <th class="text-right py-4 px-6 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="grade in filteredGrades" :key="grade.id" class="border-b border-gray-50 hover:bg-gray-50">
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User class="w-5 h-5 text-gray-500" />
                    </div>
                    <span class="font-medium text-gray-800">{{ grade.student }}</span>
                  </div>
                </td>
                <td class="py-4 px-6 text-gray-600">{{ grade.class }}</td>
                <td class="py-4 px-6 text-center font-semibold" :class="getScoreColor(grade.intellectual)">{{ grade.intellectual }}</td>
                <td class="py-4 px-6 text-center font-semibold" :class="getScoreColor(grade.sports)">{{ grade.sports }}</td>
                <td class="py-4 px-6 text-center font-semibold" :class="getScoreColor(grade.labor)">{{ grade.labor }}</td>
                <td class="py-4 px-6 text-center font-semibold" :class="getScoreColor(grade.moral)">{{ grade.moral }}</td>
                <td class="py-4 px-6 text-center font-bold text-blue-600">{{ grade.total }}</td>
                <td class="py-4 px-6 text-center">
                  <span :class="['px-3 py-1.5 rounded-full text-sm font-medium', getStatusClass(grade.status)]">
                    {{ getStatusText(grade.status) }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <div class="flex items-center justify-end gap-2">
                    <button class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                      <Eye class="w-5 h-5" />
                    </button>
                    <button class="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all">
                      <Edit2 class="w-5 h-5" />
                    </button>
                    <button class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 class="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between p-4 border-t border-gray-100">
          <p class="text-sm text-gray-500">显示 1-6 条，共 2,456 条</p>
          <div class="flex items-center gap-2">
            <button class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl disabled:opacity-50">上一页</button>
            <button class="px-4 py-2 text-sm bg-blue-500 text-white rounded-xl">1</button>
            <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-xl">2</button>
            <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-xl">3</button>
            <button class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl">下一页</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
