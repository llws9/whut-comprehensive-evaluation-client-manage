<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  LayoutDashboard, Users, BarChart3, Settings, LogOut,
  ChevronRight, Search, Download, AlertTriangle, CheckCircle, XCircle,
  RefreshCw, FileText, Eye
} from 'lucide-vue-next';

const activeMenu = ref('scholarship');
const searchKeyword = ref('');
const selectedCategory = ref('all');
const selectedYear = ref('2024-2025');

const menuItems = [
  { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
  { id: 'grades', label: '成绩管理', icon: BarChart3 },
  { id: 'review', label: '成绩审核', icon: FileText },
  { id: 'scholarship', label: '奖学金资格', icon: AlertTriangle },
  { id: 'users', label: '用户管理', icon: Users },
  { id: 'permissions', label: '权限管理', icon: Settings }
];

const categoryOptions = [
  { id: 'all', label: '全部类别' },
  { id: 'moral', label: '德育' },
  { id: 'intellectual', label: '智育' },
  { id: 'sports', label: '体育与美育' },
  { id: 'labor', label: '劳育' }
];

const years = ['2024-2025', '2023-2024', '2022-2023'];

interface Student {
  id: number;
  name: string;
  class: string;
  studentId: string;
  major: string;
  category: string;
  requirement: string;
  currentValue: string;
  status: 'pass' | 'fail';
  details: { category: string; requirement: string; current: string; status: 'pass' | 'fail' }[];
}

const students = ref<Student[]>([
  {
    id: 1,
    name: '张三',
    class: '2022级硕士1班',
    studentId: '2022001',
    major: '计算机科学与技术',
    category: 'intellectual',
    requirement: '智育：0.4分及以上',
    currentValue: '0.35分',
    status: 'fail',
    details: [
      { category: '德育', requirement: '9分及以上', current: '8.7分', status: 'fail' },
      { category: '智育', requirement: '0.4分及以上', current: '0.35分', status: 'fail' },
      { category: '体育与美育', requirement: '无不及格', current: '合格', status: 'pass' },
      { category: '劳育', requirement: '无特殊要求', current: '合格', status: 'pass' }
    ]
  },
  {
    id: 2,
    name: '李四',
    class: '2022级硕士2班',
    studentId: '2022002',
    major: '软件工程',
    category: 'moral',
    requirement: '德育：9分及以上',
    currentValue: '8.5分',
    status: 'fail',
    details: [
      { category: '德育', requirement: '9分及以上', current: '8.5分', status: 'fail' },
      { category: '智育', requirement: '0.4分及以上', current: '0.8分', status: 'pass' },
      { category: '体育与美育', requirement: '无不及格', current: '合格', status: 'pass' },
      { category: '劳育', requirement: '无特殊要求', current: '合格', status: 'pass' }
    ]
  },
  {
    id: 3,
    name: '王五',
    class: '2022级硕士1班',
    studentId: '2022003',
    major: '计算机科学与技术',
    category: 'intellectual',
    requirement: '智育：0.4分及以上',
    currentValue: '0.2分',
    status: 'fail',
    details: [
      { category: '德育', requirement: '9分及以上', current: '9.2分', status: 'pass' },
      { category: '智育', requirement: '0.4分及以上', current: '0.2分', status: 'fail' },
      { category: '体育与美育', requirement: '无不及格', current: '合格', status: 'pass' },
      { category: '劳育', requirement: '无特殊要求', current: '合格', status: 'pass' }
    ]
  },
  {
    id: 4,
    name: '赵六',
    class: '2022级硕士3班',
    studentId: '2022004',
    major: '人工智能',
    category: 'sports',
    requirement: '无不及格课程',
    currentValue: '有1门不及格',
    status: 'fail',
    details: [
      { category: '德育', requirement: '9分及以上', current: '9.5分', status: 'pass' },
      { category: '智育', requirement: '0.4分及以上', current: '1.2分', status: 'pass' },
      { category: '体育与美育', requirement: '无不及格', current: '1门不及格', status: 'fail' },
      { category: '劳育', requirement: '无特殊要求', current: '合格', status: 'pass' }
    ]
  },
  {
    id: 5,
    name: '孙七',
    class: '2022级硕士2班',
    studentId: '2022005',
    major: '软件工程',
    category: 'moral',
    requirement: '无纪律处分',
    currentValue: '有通报批评',
    status: 'fail',
    details: [
      { category: '德育', requirement: '无纪律处分', current: '有通报批评', status: 'fail' },
      { category: '智育', requirement: '0.4分及以上', current: '0.6分', status: 'pass' },
      { category: '体育与美育', requirement: '无不及格', current: '合格', status: 'pass' },
      { category: '劳育', requirement: '无特殊要求', current: '合格', status: 'pass' }
    ]
  }
]);

const filteredStudents = computed(() => {
  return students.value.filter(student => {
    if (searchKeyword.value && !student.name.includes(searchKeyword.value) && !student.studentId.includes(searchKeyword.value)) {
      return false;
    }
    if (selectedCategory.value !== 'all' && student.category !== selectedCategory.value) {
      return false;
    }
    return true;
  });
});

const getCategoryLabel = (categoryId: string) => {
  const category = categoryOptions.find(c => c.id === categoryId);
  return category ? category.label : '其他';
};

const getStatusClass = (status: string) => {
  return status === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
};

const getStatusText = (status: string) => {
  return status === 'pass' ? '已满足' : '未满足';
};

const showDetailModal = ref(false);
const selectedStudent = ref<Student | null>(null);

const openDetailModal = (student: Student) => {
  selectedStudent.value = student;
  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedStudent.value = null;
};

const statistics = computed(() => {
  const total = students.value.length;
  const moralFail = students.value.filter(s => s.details.some(d => d.category === '德育' && d.status === 'fail')).length;
  const intellectualFail = students.value.filter(s => s.details.some(d => d.category === '智育' && d.status === 'fail')).length;
  const sportsFail = students.value.filter(s => s.details.some(d => d.category === '体育与美育' && d.status === 'fail')).length;
  const laborFail = students.value.filter(s => s.details.some(d => d.category === '劳育' && d.status === 'fail')).length;
  
  return { total, moralFail, intellectualFail, sportsFail, laborFail };
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <aside class="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
      <div class="p-5 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Users class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="font-bold text-gray-800 text-sm">综合测评管理</h1>
            <p class="text-xs text-gray-500">Admin Portal</p>
          </div>
        </div>
      </div>
      
      <nav class="p-4 space-y-1">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="activeMenu = item.id"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
            activeMenu === item.id 
              ? 'bg-blue-50 text-blue-600 font-medium' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
          <ChevronRight v-if="activeMenu === item.id" class="ml-auto w-4 h-4" />
        </button>
      </nav>
      
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
        <button class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
          <LogOut class="w-5 h-5" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
    
    <main class="ml-64 p-8">
      <header class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">奖学金资格审核</h1>
            <p class="text-gray-500 mt-1">查看未满足参评学业奖学金基本要求的学生</p>
          </div>
          <div class="flex items-center gap-3">
            <button class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <RefreshCw class="w-4 h-4" />
              <span class="text-sm">刷新数据</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all">
              <Download class="w-4 h-4" />
              <span class="text-sm">导出列表</span>
            </button>
          </div>
        </div>
      </header>
      
      <div class="grid grid-cols-5 gap-4 mb-8">
        <div class="bg-white rounded-2xl card-shadow p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <AlertTriangle class="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ statistics.total }}</p>
              <p class="text-sm text-gray-500">未达标学生</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl card-shadow p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center">
              <XCircle class="w-7 h-7 text-pink-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ statistics.moralFail }}</p>
              <p class="text-sm text-gray-500">德育未达标</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl card-shadow p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <XCircle class="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ statistics.intellectualFail }}</p>
              <p class="text-sm text-gray-500">智育未达标</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl card-shadow p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
              <XCircle class="w-7 h-7 text-orange-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ statistics.sportsFail }}</p>
              <p class="text-sm text-gray-500">体育美育未达标</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl card-shadow p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <XCircle class="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-800">{{ statistics.laborFail }}</p>
              <p class="text-sm text-gray-500">劳育未达标</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl card-shadow p-6 mb-8">
        <div class="flex flex-wrap items-center gap-4">
          <div class="relative flex-1 min-w-[250px] max-w-md">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索学生姓名或学号"
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">筛选类别:</span>
            <select 
              v-model="selectedCategory"
              class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                {{ category.label }}
              </option>
            </select>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">学年:</span>
            <select 
              v-model="selectedYear"
              class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option v-for="year in years" :key="year" :value="year">{{ year }}学年</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl card-shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">学号</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">姓名</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">班级</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">专业</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">未达标类别</th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-gray-700">要求</th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-gray-700">当前值</th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="student in filteredStudents" 
                :key="student.id"
                class="border-b border-gray-100 hover:bg-gray-50/50 transition-all"
              >
                <td class="px-6 py-4">
                  <span class="font-medium text-gray-800">{{ student.studentId }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="font-medium text-gray-800">{{ student.name }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-gray-600">{{ student.class }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-gray-600">{{ student.major }}</span>
                </td>
                <td class="px-6 py-4">
                  <span :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    student.category === 'moral' ? 'bg-pink-100 text-pink-700' :
                    student.category === 'intellectual' ? 'bg-blue-100 text-blue-700' :
                    student.category === 'sports' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  ]">
                    {{ getCategoryLabel(student.category) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-sm text-gray-600">{{ student.requirement }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-sm font-medium text-red-600">{{ student.currentValue }}</span>
                </td>
                <td class="px-6 py-4">
                  <button 
                    @click="openDetailModal(student)"
                    class="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all"
                  >
                    <Eye class="w-4 h-4" />
                    详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="filteredStudents.length === 0" class="text-center py-16">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle class="w-10 h-10 text-green-500" />
          </div>
          <p class="text-gray-500">所有学生均已满足奖学金申请条件</p>
        </div>
      </div>
    </main>
    
    <Teleport to="body">
      <div v-if="showDetailModal && selectedStudent" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-800">{{ selectedStudent.name }} - 奖学金资格详情</h2>
                <p class="text-sm text-gray-500">{{ selectedStudent.class }} · {{ selectedStudent.studentId }}</p>
              </div>
            </div>
            <button @click="closeDetailModal" class="p-2 hover:bg-gray-100 rounded-xl">
              <XCircle class="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div class="p-6 space-y-6">
            <div class="bg-gray-50 rounded-xl p-4">
              <h3 class="font-medium text-gray-800 mb-4">四类测评资格审核结果</h3>
              <div class="space-y-4">
                <div 
                  v-for="detail in selectedStudent.details" 
                  :key="detail.category"
                  :class="[
                    'p-4 rounded-xl border-2',
                    detail.status === 'pass' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  ]"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <div :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        detail.status === 'pass' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                      ]">
                        <CheckCircle v-if="detail.status === 'pass'" class="w-5 h-5" />
                        <XCircle v-else class="w-5 h-5" />
                      </div>
                      <span class="font-medium text-gray-800">{{ detail.category }}</span>
                    </div>
                    <span :class="['px-3 py-1 rounded-full text-sm font-medium', getStatusClass(detail.status)]">
                      {{ getStatusText(detail.status) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4 text-sm">
                    <span class="text-gray-600">
                      <span class="font-medium">要求：</span>{{ detail.requirement }}
                    </span>
                    <span :class="detail.status === 'pass' ? 'text-green-600' : 'text-red-600'">
                      <span class="font-medium">当前：</span>{{ detail.current }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-blue-50 rounded-xl p-4">
              <div class="flex items-center gap-3">
                <AlertTriangle class="w-6 h-6 text-blue-600" />
                <div>
                  <p class="font-medium text-blue-800">综合评定</p>
                  <p class="text-sm text-blue-600">该学生未满足参评学业奖学金的基本要求，请督促其补充相关材料或整改</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
            <button @click="closeDetailModal" class="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all">
              关闭
            </button>
            <button class="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all">
              导出详情
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
