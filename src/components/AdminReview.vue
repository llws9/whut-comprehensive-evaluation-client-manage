<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  LayoutDashboard, Users, BookOpen, FileCheck, Shield, Settings, Bell, LogOut,
  ChevronRight, User, CheckCircle, XCircle, Clock, Eye,
  Search, Calendar, Zap
} from 'lucide-vue-next';

interface Application {
  id: number;
  student: string;
  class: string;
  grade: string;
  category: string;
  type: string;
  score: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  documents: string[];
}

const activeMenu = ref('review');
const selectedApplication = ref<Application | null>(null);
const selectedYear = ref('2024-2025');
const selectedGrade = ref('');
const selectedCategory = ref('');
const searchKeyword = ref('');

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

const categoryOptions = [
  { value: '', label: '全部类别' },
  { value: '智育', label: '智育' },
  { value: '体育与美育', label: '体育与美育' },
  { value: '劳育', label: '劳育' }
];

const statusOptions = [
  { id: 'all', label: '全部' },
  { id: 'pending', label: '待审核' },
  { id: 'approved', label: '已通过' },
  { id: 'rejected', label: '已拒绝' }
];

const activeStatusFilter = ref('all');
const isSuperAdmin = ref(true);
const applicationEnabled = ref(true);

const menuItems = [
  { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
  { id: 'students', label: '学生管理', icon: Users },
  { id: 'grades', label: '成绩管理', icon: BookOpen },
  { id: 'review', label: '成绩审核', icon: FileCheck },
  { id: 'permissions', label: '权限管理', icon: Shield },
  { id: 'settings', label: '系统设置', icon: Settings }
];

const applications = ref<Application[]>([
  { id: 1, student: '张三', class: '计算机2101', grade: '研一', category: '智育', type: '科技创新竞赛', score: '+5.0', date: '2024-03-18', status: 'pending', description: '参加省级科技创新竞赛，获得二等奖', documents: ['获奖证书.pdf', '项目报告.docx'] },
  { id: 2, student: '李四', class: '软件工程2102', grade: '研二', category: '劳育', type: '社会实践', score: '+4.0', date: '2024-03-17', status: 'pending', description: '参加暑期社会实践活动，服务社区居民', documents: ['实践证明.pdf'] },
  { id: 3, student: '王五', class: '物联网2101', grade: '研一', category: '体育与美育', type: '体育比赛', score: '+3.0', date: '2024-03-16', status: 'approved', description: '参加校运动会，获得男子100米第三名', documents: ['获奖证书.pdf'] },
  { id: 4, student: '赵六', class: '计算机2102', grade: '研三', category: '劳育', type: '志愿者服务', score: '+3.0', date: '2024-03-15', status: 'pending', description: '参加校园志愿者服务活动，累计服务20小时', documents: ['服务证明.pdf'] },
  { id: 5, student: '钱七', class: '软件工程2101', grade: '研二', category: '智育', type: '学术论文', score: '+6.0', date: '2024-03-14', status: 'rejected', description: '发表SCI论文一篇，影响因子3.5', documents: ['论文.pdf', '录用通知.pdf'] }
]);

const getStatusClass = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-700';
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'approved': return '已通过';
    case 'pending': return '待审核';
    case 'rejected': return '已拒绝';
    default: return '草稿';
  }
};

const approveApplication = (id: number) => {
  const app = applications.value.find(a => a.id === id);
  if (app) {
    app.status = 'approved';
  }
};

const rejectApplication = (id: number) => {
  const app = applications.value.find(a => a.id === id);
  if (app) {
    app.status = 'rejected';
  }
};

const viewDetail = (app: Application) => {
  selectedApplication.value = { ...app };
};

const closeModal = () => {
  selectedApplication.value = null;
};

const approveAll = () => {
  applications.value.forEach(app => {
    if (app.status === 'pending') {
      app.status = 'approved';
    }
  });
};

const filteredApplications = computed(() => {
  return applications.value.filter(app => {
    if (selectedYear.value && !app.date.startsWith(selectedYear.value.split('-')[0])) return false;
    if (selectedGrade.value && app.grade !== selectedGrade.value) return false;
    if (selectedCategory.value && app.category !== selectedCategory.value) return false;
    if (activeStatusFilter.value !== 'all' && app.status !== activeStatusFilter.value) return false;
    if (searchKeyword.value && !app.student.includes(searchKeyword.value)) return false;
    return true;
  });
});

const pendingCount = computed(() => applications.value.filter(a => a.status === 'pending').length);
const approvedCount = computed(() => applications.value.filter(a => a.status === 'approved').length);
const rejectedCount = computed(() => applications.value.filter(a => a.status === 'rejected').length);
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
            <h1 class="text-2xl font-bold text-gray-800">成绩审核</h1>
            <p class="text-gray-500 mt-1">审核学生的综合素质评价申请</p>
          </div>
          <div class="flex items-center gap-4">
            <button 
              v-if="isSuperAdmin"
              class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
            >
              <Calendar class="w-4 h-4" />
              <span class="text-sm">设置申请截止时间</span>
            </button>
            <button 
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-xl transition-all',
                applicationEnabled 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              ]"
            >
              <Zap class="w-4 h-4" />
              <span class="text-sm">{{ applicationEnabled ? '停止成绩申请' : '开启成绩申请' }}</span>
            </button>
            <button 
              v-if="pendingCount > 0"
              class="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
              @click="approveAll"
            >
              <CheckCircle class="w-4 h-4" />
              <span class="text-sm">一键通过</span>
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
              <p class="text-gray-500 text-sm mb-1">待审核</p>
              <p class="text-3xl font-bold text-orange-600">{{ pendingCount }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 card-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">已通过</p>
              <p class="text-3xl font-bold text-green-600">{{ approvedCount }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 card-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">已拒绝</p>
              <p class="text-3xl font-bold text-red-600">{{ rejectedCount }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle class="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 card-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">总申请</p>
              <p class="text-3xl font-bold text-gray-800">{{ applications.length }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileCheck class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl card-shadow overflow-hidden">
        <div class="p-6 border-b border-gray-100">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500">学年:</span>
              <select 
                v-model="selectedYear"
                class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm"
              >
                <option v-for="year in years" :key="year.value" :value="year.value">{{ year.label }}</option>
              </select>
            </div>
            
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
              <span class="text-sm text-gray-500">申请类别:</span>
              <select 
                v-model="selectedCategory"
                class="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer text-sm"
              >
                <option v-for="category in categoryOptions" :key="category.value" :value="category.value">{{ category.label }}</option>
              </select>
            </div>
            
            <div class="flex items-center gap-2 ml-auto">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  v-model="searchKeyword"
                  type="text"
                  placeholder="搜索学生姓名"
                  class="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-2 mt-4">
            <span class="text-sm text-gray-500">状态:</span>
            <button
              v-for="status in statusOptions"
              :key="status.id"
              @click="activeStatusFilter = status.id"
              :class="[
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                activeStatusFilter === status.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ status.label }}
            </button>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">序号</th>
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">学生姓名</th>
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">班级</th>
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">年级</th>
                <th class="text-center py-4 px-6 text-sm font-medium text-gray-500">申请类别</th>
                <th class="text-center py-4 px-6 text-sm font-medium text-gray-500">申请类型</th>
                <th class="text-center py-4 px-6 text-sm font-medium text-gray-500">加分</th>
                <th class="text-center py-4 px-6 text-sm font-medium text-gray-500">申请时间</th>
                <th class="text-center py-4 px-4 text-sm font-medium text-gray-500 w-24">状态</th>
                <th class="text-right py-4 px-6 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(app, index) in filteredApplications" :key="app.id" class="border-b border-gray-50 hover:bg-gray-50">
                <td class="py-4 px-6">{{ index + 1 }}</td>
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User class="w-5 h-5 text-gray-500" />
                    </div>
                    <span class="font-medium text-gray-800">{{ app.student }}</span>
                  </div>
                </td>
                <td class="py-4 px-6 text-gray-600">{{ app.class }}</td>
                <td class="py-4 px-6 text-gray-600">{{ app.grade }}</td>
                <td class="py-4 px-6 text-center">
                  <span :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    app.category === '智育' ? 'bg-blue-100 text-blue-700' :
                    app.category === '体育与美育' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  ]">
                    {{ app.category }}
                  </span>
                </td>
                <td class="py-4 px-6 text-center text-gray-600">{{ app.type }}</td>
                <td class="py-4 px-6 text-center font-semibold text-green-600">{{ app.score }}</td>
                <td class="py-4 px-6 text-center text-gray-500">{{ app.date }}</td>
                <td class="py-4 px-4 text-center">
                  <span :class="['inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-medium min-w-[80px]', getStatusClass(app.status)]">
                    {{ getStatusText(app.status) }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      @click="viewDetail(app)" 
                      class="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Eye class="w-4 h-4" />
                      <span class="text-sm">查看</span>
                    </button>
                    <button 
                      v-if="app.status === 'pending'"
                      @click="approveApplication(app.id)" 
                      class="flex items-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                    >
                      <CheckCircle class="w-4 h-4" />
                      <span class="text-sm">通过</span>
                    </button>
                    <button 
                      v-if="app.status === 'pending'"
                      @click="rejectApplication(app.id)" 
                      class="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <XCircle class="w-4 h-4" />
                      <span class="text-sm">拒绝</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="flex items-center justify-between p-4 border-t border-gray-100">
          <p class="text-sm text-gray-500">显示 1-{{ filteredApplications.length }} 条，共 {{ applications.length }} 条</p>
          <div class="flex items-center gap-2">
            <button class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl disabled:opacity-50">上一页</button>
            <button class="px-4 py-2 text-sm bg-blue-500 text-white rounded-xl">1</button>
            <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-xl">2</button>
            <button class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl">下一页</button>
          </div>
        </div>
      </div>
    </main>
    
    <Teleport to="body">
      <div v-if="selectedApplication" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-800">申请详情</h2>
            <button @click="closeModal" class="p-2 hover:bg-gray-100 rounded-xl">
              <XCircle class="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div class="p-6 space-y-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <User class="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-800">{{ selectedApplication.student }}</h3>
                <p class="text-gray-500">{{ selectedApplication.class }} · {{ selectedApplication.grade }}</p>
              </div>
              <span :class="['ml-auto px-4 py-2 rounded-xl text-sm font-medium', getStatusClass(selectedApplication.status)]">
                {{ getStatusText(selectedApplication.status) }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">申请类别</p>
                <p class="font-medium text-gray-800">{{ selectedApplication.category }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">申请类型</p>
                <p class="font-medium text-gray-800">{{ selectedApplication.type }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">加分分值</p>
                <p class="font-medium text-green-600">{{ selectedApplication.score }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-sm text-gray-500 mb-1">申请时间</p>
                <p class="font-medium text-gray-800">{{ selectedApplication.date }}</p>
              </div>
            </div>
            
            <div>
              <p class="text-sm text-gray-500 mb-2">申请描述</p>
              <p class="text-gray-700">{{ selectedApplication.description }}</p>
            </div>
            
            <div>
              <p class="text-sm text-gray-500 mb-3">附件材料</p>
              <div class="space-y-2">
                <div 
                  v-for="doc in selectedApplication.documents" 
                  :key="doc"
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all"
                >
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileCheck class="w-5 h-5 text-blue-600" />
                  </div>
                  <span class="text-gray-700">{{ doc }}</span>
                  <Eye class="ml-auto w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
            <button 
              v-if="selectedApplication.status === 'pending'"
              @click="rejectApplication(selectedApplication.id); closeModal()" 
              class="flex items-center gap-2 px-6 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all"
            >
              <XCircle class="w-4 h-4" />
              拒绝申请
            </button>
            <button 
              v-if="selectedApplication.status === 'pending'"
              @click="approveApplication(selectedApplication.id); closeModal()" 
              class="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
            >
              <CheckCircle class="w-4 h-4" />
              审核通过
            </button>
            <button 
              v-else
              @click="closeModal" 
              class="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
