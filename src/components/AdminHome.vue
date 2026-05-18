<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  LayoutDashboard, Users, BookOpen, FileCheck, Shield, Settings, Bell, LogOut,
  ChevronRight, TrendingUp, CheckCircle, Clock, AlertTriangle, User,
  BarChart3, Download, Upload, Search, Filter, RefreshCw, FileText, FilePlus,
  ArrowRight
} from 'lucide-vue-next';

const activeMenu = ref('dashboard');
const generatingReports = ref(false);
const generatingIntellectual = ref(false);
const generatingSports = ref(false);
const generatingLabor = ref(false);

interface ReportStatus {
  intellectual: boolean;
  sports: boolean;
  labor: boolean;
}

const reportStatus = ref<ReportStatus>({
  intellectual: true,
  sports: false,
  labor: false
});

const generateReport = async (type: keyof ReportStatus) => {
  if (type === 'intellectual') generatingIntellectual.value = true;
  else if (type === 'sports') generatingSports.value = true;
  else if (type === 'labor') generatingLabor.value = true;
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  reportStatus.value[type] = true;
  
  if (type === 'intellectual') generatingIntellectual.value = false;
  else if (type === 'sports') generatingSports.value = false;
  else if (type === 'labor') generatingLabor.value = false;
};

const stats = [
  { label: '学生总数', value: '2,456', icon: Users, color: 'bg-blue-100 text-blue-600', trend: '+12%', trendClass: 'text-green-500' },
  { label: '待审核申请', value: '45', icon: Clock, color: 'bg-orange-100 text-orange-600', trend: '+3', trendClass: 'text-orange-500' },
  { label: '已审核通过', value: '1,832', icon: CheckCircle, color: 'bg-green-100 text-green-600', trend: '+8%', trendClass: 'text-green-500' },
  { label: '异常记录', value: '8', icon: AlertTriangle, color: 'bg-red-100 text-red-600', trend: '-2', trendClass: 'text-red-500' }
];

const recentApplications = [
  { id: 1, student: '张三', class: '计算机2101', type: '科技创新', status: 'pending', date: '10分钟前' },
  { id: 2, student: '李四', class: '软件工程2102', type: '社会实践', status: 'pending', date: '25分钟前' },
  { id: 3, student: '王五', class: '物联网2101', type: '体育比赛', status: 'approved', date: '1小时前' },
  { id: 4, student: '赵六', class: '计算机2102', type: '志愿者服务', status: 'rejected', date: '2小时前' }
];

const menuItems = [
  { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
  { id: 'students', label: '学生管理', icon: Users },
  { id: 'grades', label: '成绩管理', icon: BookOpen },
  { id: 'review', label: '成绩审核', icon: FileCheck },
  { id: 'scholarship', label: '奖学金资格', icon: AlertTriangle },
  { id: 'permissions', label: '权限管理', icon: Shield },
  { id: 'settings', label: '系统设置', icon: Settings }
];

const gradeSubmitted = ref({
  '2021级': 324,
  '2022级': 456,
  '2023级': 512,
  '2024级': 623
});

const hotTopics = ref([
  { name: '科技创新竞赛', value: 128 },
  { name: '社会实践', value: 96 },
  { name: '体育比赛', value: 85 },
  { name: '志愿者服务', value: 72 },
  { name: '学术论文', value: 64 }
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

const hasAnyReport = computed(() => {
  return reportStatus.value.intellectual || reportStatus.value.sports || reportStatus.value.labor;
});

const generateAllReports = async () => {
  generatingReports.value = true;
  await new Promise(resolve => setTimeout(resolve, 2500));
  reportStatus.value.intellectual = true;
  reportStatus.value.sports = true;
  reportStatus.value.labor = true;
  generatingReports.value = false;
};

const downloadReport = (type: string) => {
  const typeNames: Record<string, string> = {
    intellectual: '智育成绩',
    sports: '体育与美育成绩',
    labor: '劳育成绩'
  };
  console.log(`下载 ${typeNames[type]} 报告`);
};

const handleMenuClick = (menuId: string) => {
  activeMenu.value = menuId;
  const pageMap: Record<string, string> = {
    dashboard: 'admin-home',
    students: 'admin-students',
    grades: 'admin-grades',
    review: 'admin-review',
    scholarship: 'admin-scholarship',
    permissions: 'admin-permissions',
    settings: 'admin-settings'
  };
  window.location.hash = pageMap[menuId] || 'admin-home';
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
          @click="handleMenuClick(item.id)"
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
          <ChevronRight v-if="activeMenu === item.id" class="ml-auto w-4 h-4 text-blue-200 animate-pulse" />
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
            <h1 class="text-2xl font-bold text-gray-800">工作台</h1>
            <p class="text-gray-500 mt-1">欢迎回来，管理员 · 今天是 2024年3月18日</p>
          </div>
          
          <div class="flex items-center gap-4">
            <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
              <RefreshCw class="w-4 h-4 text-gray-500" />
              <span class="text-sm text-gray-600">刷新数据</span>
            </button>
            <button class="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all">
              <Bell class="w-5 h-5 text-gray-600" />
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div class="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <User class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">管理员</p>
                <p class="text-xs text-gray-500">超级管理员</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div class="grid grid-cols-4 gap-6 mb-8">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="bg-white rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 cursor-pointer group"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-gray-500 text-sm mb-1">{{ stat.label }}</p>
              <p class="text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {{ stat.value }}
              </p>
            </div>
            <div :class="['p-3 rounded-xl', stat.color]">
              <component :is="stat.icon" class="w-6 h-6" />
            </div>
          </div>
          <div :class="['flex items-center gap-1 mt-3 text-sm', stat.trendClass]">
            <TrendingUp class="w-4 h-4" />
            <span>{{ stat.trend }}</span>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 cursor-pointer group">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800">数据审核记录</h3>
            <ChevronRight class="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-4 bg-orange-50 rounded-xl">
              <p class="text-3xl font-bold text-orange-600">45</p>
              <p class="text-sm text-gray-500 mt-1">待审核</p>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-xl">
              <p class="text-3xl font-bold text-green-600">128</p>
              <p class="text-sm text-gray-500 mt-1">班长已审核</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 cursor-pointer group">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800">已确认成绩学生数量</h3>
            <ChevronRight class="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>
          <div class="flex items-center justify-around">
            <div v-for="([grade, count]) in Object.entries(gradeSubmitted)" :key="grade" class="text-center">
              <p class="text-xl font-bold text-blue-600">{{ count }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ grade }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-2xl p-6 card-shadow">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800">成绩报告</h3>
            <button v-if="!hasAnyReport" @click="generateAllReports" :disabled="generatingReports" class="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50">
              {{ generatingReports ? '生成中...' : '生成所有' }}
            </button>
          </div>
          <div class="flex items-center justify-around">
            <div class="text-center">
              <button @click="reportStatus.intellectual ? downloadReport('intellectual') : generateReport('intellectual')" :disabled="generatingIntellectual" :class="['w-14 h-14 rounded-2xl flex items-center justify-center transition-all', reportStatus.intellectual ? 'bg-green-100 text-green-600' : 'bg-blue-500 text-white hover:bg-blue-600']">
                <FileText v-if="reportStatus.intellectual" class="w-7 h-7" />
                <FilePlus v-else class="w-7 h-7" />
              </button>
              <p class="text-sm text-gray-500 mt-2">智育</p>
            </div>
            <div class="text-center">
              <button @click="reportStatus.sports ? downloadReport('sports') : generateReport('sports')" :disabled="generatingSports" :class="['w-14 h-14 rounded-2xl flex items-center justify-center transition-all', reportStatus.sports ? 'bg-orange-100 text-orange-600' : 'bg-blue-500 text-white hover:bg-blue-600']">
                <FileText v-if="reportStatus.sports" class="w-7 h-7" />
                <FilePlus v-else class="w-7 h-7" />
              </button>
              <p class="text-sm text-gray-500 mt-2">体育美育</p>
            </div>
            <div class="text-center">
              <button @click="reportStatus.labor ? downloadReport('labor') : generateReport('labor')" :disabled="generatingLabor" :class="['w-14 h-14 rounded-2xl flex items-center justify-center transition-all', reportStatus.labor ? 'bg-red-100 text-red-600' : 'bg-blue-500 text-white hover:bg-blue-600']">
                <FileText v-if="reportStatus.labor" class="w-7 h-7" />
                <FilePlus v-else class="w-7 h-7" />
              </button>
              <p class="text-sm text-gray-500 mt-2">劳育</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-3 gap-6 mb-8">
        <div class="col-span-2 bg-white rounded-2xl p-6 card-shadow">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-semibold text-gray-800">近一周学生申请数据变化</h3>
            <div class="flex items-center gap-2">
              <button v-for="tab in ['全部', '智育', '体育美育', '劳育']" :key="tab" :class="['px-4 py-2 rounded-xl text-sm font-medium transition-all', activeMenu === tab.toLowerCase().replace(' ', '-') ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
                {{ tab }}
              </button>
            </div>
          </div>
          <div class="h-72 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center">
            <div class="text-center">
              <BarChart3 class="w-20 h-20 text-blue-300 mx-auto mb-4" />
              <p class="text-gray-400 text-lg">申请数据趋势</p>
              <p class="text-sm text-gray-400 mt-1">可视化图表展示区域</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-2xl p-6 card-shadow">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-semibold text-gray-800">热门申请 TOP5</h3>
          </div>
          <div class="space-y-4">
            <div v-for="(topic, index) in hotTopics" :key="topic.name" class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div class="flex items-center gap-3">
                <span :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold', index === 0 ? 'bg-yellow-400 text-yellow-900' : index === 1 ? 'bg-gray-300 text-gray-700' : index === 2 ? 'bg-orange-300 text-orange-800' : 'bg-gray-200 text-gray-600']">
                  {{ index + 1 }}
                </span>
                <span class="text-sm font-medium text-gray-700">{{ topic.name }}</span>
              </div>
              <span class="text-sm font-semibold text-blue-600">{{ topic.value }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl card-shadow overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 class="font-semibold text-gray-800">待审核申请</h3>
          <div class="flex items-center gap-3">
            <button class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <Filter class="w-4 h-4" />
              <span class="text-sm">筛选</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <Search class="w-4 h-4" />
              <span class="text-sm">搜索</span>
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">学生姓名</th>
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">班级</th>
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">申请类型</th>
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">状态</th>
                <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">提交时间</th>
                <th class="text-right py-4 px-6 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in recentApplications" :key="app.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User class="w-5 h-5 text-gray-500" />
                    </div>
                    <span class="font-medium text-gray-800">{{ app.student }}</span>
                  </div>
                </td>
                <td class="py-4 px-6 text-gray-600">{{ app.class }}</td>
                <td class="py-4 px-6 text-gray-600">{{ app.type }}</td>
                <td class="py-4 px-6">
                  <span :class="['px-3 py-1.5 rounded-full text-sm font-medium', getStatusClass(app.status)]">
                    {{ getStatusText(app.status) }}
                  </span>
                </td>
                <td class="py-4 px-6 text-gray-500 text-sm">{{ app.date }}</td>
                <td class="py-4 px-6">
                  <div class="flex items-center justify-end gap-2">
                    <button class="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-xl transition-all">通过</button>
                    <button class="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all">拒绝</button>
                    <button class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-all">详情</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between p-4 border-t border-gray-100">
          <p class="text-sm text-gray-500">显示 1-4 条，共 45 条</p>
          <div class="flex items-center gap-2">
            <button class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl disabled:opacity-50">上一页</button>
            <button class="px-4 py-2 text-sm bg-blue-500 text-white rounded-xl">1</button>
            <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-xl">2</button>
            <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-xl">3</button>
            <button class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl">下一页</button>
          </div>
        </div>
      </div>
      
      <div class="mt-6 grid grid-cols-2 gap-6">
        <button class="flex items-center gap-4 p-6 bg-gradient-primary text-white rounded-2xl hover:opacity-90 transition-all text-left group">
          <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Upload class="w-7 h-7" />
          </div>
          <div>
            <p class="text-lg font-semibold">导入成绩</p>
            <p class="text-blue-100 text-sm">批量导入学生成绩数据</p>
          </div>
          <ArrowRight class="ml-auto w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button class="flex items-center gap-4 p-6 bg-gradient-accent text-white rounded-2xl hover:opacity-90 transition-all text-left group">
          <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Download class="w-7 h-7" />
          </div>
          <div>
            <p class="text-lg font-semibold">导出数据</p>
            <p class="text-green-100 text-sm">导出综测成绩报表</p>
          </div>
          <ArrowRight class="ml-auto w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </main>
  </div>
</template>
