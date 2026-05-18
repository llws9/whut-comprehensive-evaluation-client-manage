<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  LayoutDashboard, Users, BookOpen, FileCheck, Shield, Settings, Bell, LogOut,
  ChevronRight, Plus, Edit2, Trash2, CheckCircle, XCircle, Circle,
  Search, RefreshCw, Lock, Unlock, Save
} from 'lucide-vue-next';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface ScopeRule {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  permissions: string[];
  scopeRule: string;
}

const activeMenu = ref('permissions');
const searchKeyword = ref('');
const editingRole = ref<Role | null>(null);
const showAddRoleModal = ref(false);

const menuItems = [
  { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
  { id: 'students', label: '学生管理', icon: Users },
  { id: 'grades', label: '成绩管理', icon: BookOpen },
  { id: 'review', label: '成绩审核', icon: FileCheck },
  { id: 'permissions', label: '权限管理', icon: Shield },
  { id: 'settings', label: '系统设置', icon: Settings }
];

const allPermissions = ref<Permission[]>([
  { id: 'student_manage', name: '学生管理', description: '管理学生信息' },
  { id: 'grade_manage', name: '成绩管理', description: '管理成绩数据' },
  { id: 'review', name: '成绩审核', description: '审核成绩申请' },
  { id: 'role_manage', name: '角色管理', description: '管理系统角色' },
  { id: 'system_settings', name: '系统设置', description: '系统配置管理' },
  { id: 'grade_query', name: '成绩查询', description: '查询成绩信息' },
  { id: 'application_submit', name: '申请提交', description: '提交成绩申请' },
  { id: 'data_export', name: '数据导出', description: '导出数据报表' }
]);

const scopeRules = ref<ScopeRule[]>([
  { id: 'all', name: '全部数据', description: '可查看和操作所有数据' },
  { id: 'department', name: '本部门', description: '仅可查看和操作本部门数据' },
  { id: 'grade', name: '本年级', description: '仅可查看和操作本年级数据' },
  { id: 'class', name: '本班', description: '仅可查看和操作本班数据' },
  { id: 'personal', name: '个人', description: '仅可查看和操作个人数据' }
]);

const roles = ref<Role[]>([
  { id: 1, name: '超级管理员', description: '拥有系统最高权限', status: 'active', permissions: ['student_manage', 'grade_manage', 'review', 'role_manage', 'system_settings', 'grade_query', 'application_submit', 'data_export'], scopeRule: 'all' },
  { id: 2, name: '管理员', description: '管理学生成绩和审核', status: 'active', permissions: ['grade_manage', 'review', 'grade_query', 'data_export'], scopeRule: 'department' },
  { id: 3, name: '班长', description: '审核本班学生申请', status: 'active', permissions: ['review', 'grade_query'], scopeRule: 'class' },
  { id: 4, name: '学生', description: '查看个人成绩和申请', status: 'active', permissions: ['grade_query', 'application_submit'], scopeRule: 'personal' }
]);

const filteredRoles = computed(() => {
  if (!searchKeyword.value) return roles.value;
  return roles.value.filter(r => r.name.includes(searchKeyword.value));
});

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '启用';
    case 'inactive': return '禁用';
    default: return '未知';
  }
};

const getScopeRuleName = (scopeId: string) => {
  const rule = scopeRules.value.find(s => s.id === scopeId);
  return rule ? rule.name : scopeId;
};

const toggleRoleStatus = (id: number) => {
  const role = roles.value.find(r => r.id === id);
  if (role) {
    role.status = role.status === 'active' ? 'inactive' : 'active';
  }
};

const editRole = (role: Role) => {
  editingRole.value = { ...role, permissions: [...role.permissions] };
};

const saveRole = () => {
  if (!editingRole.value) return;
  const index = roles.value.findIndex(r => r.id === editingRole.value!.id);
  if (index !== -1) {
    roles.value[index] = { ...editingRole.value };
  }
  editingRole.value = null;
};

const cancelEdit = () => {
  editingRole.value = null;
};

const togglePermission = (permissionId: string) => {
  if (!editingRole.value) return;
  const role = editingRole.value;
  const index = role.permissions.indexOf(permissionId);
  if (index === -1) {
    role.permissions.push(permissionId);
  } else {
    role.permissions.splice(index, 1);
  }
};

const deleteRole = (id: number) => {
  roles.value = roles.value.filter(r => r.id !== id);
};

const addRole = () => {
  showAddRoleModal.value = true;
};

const newRole = ref({
  name: '',
  description: '',
  permissions: [] as string[],
  scopeRule: 'personal' as string
});

const submitAddRole = () => {
  if (!newRole.value.name) return;
  roles.value.push({
    id: Date.now(),
    name: newRole.value.name,
    description: newRole.value.description,
    status: 'active',
    permissions: [...newRole.value.permissions],
    scopeRule: newRole.value.scopeRule
  });
  newRole.value = { name: '', description: '', permissions: [], scopeRule: 'personal' };
  showAddRoleModal.value = false;
};

const toggleNewRolePermission = (permissionId: string) => {
  const index = newRole.value.permissions.indexOf(permissionId);
  if (index === -1) {
    newRole.value.permissions.push(permissionId);
  } else {
    newRole.value.permissions.splice(index, 1);
  }
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
            <h1 class="text-2xl font-bold text-gray-800">权限管理</h1>
            <p class="text-gray-500 mt-1">管理系统角色、权限和可见范围</p>
          </div>
          <div class="flex items-center gap-4">
            <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
              <RefreshCw class="w-4 h-4 text-gray-500" />
              <span class="text-sm text-gray-600">刷新数据</span>
            </button>
            <button 
              class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
              @click="addRole"
            >
              <Plus class="w-4 h-4" />
              <span class="text-sm">添加角色</span>
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
          <div class="relative w-64">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索角色"
              class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div class="divide-y divide-gray-50">
          <div
            v-for="role in filteredRoles"
            :key="role.id"
            class="p-6"
          >
            <div v-if="editingRole && editingRole.id === role.id" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">角色名称</label>
                <input
                  v-model="editingRole.name"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">角色描述</label>
                <input
                  v-model="editingRole.description"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">可见范围</label>
                <div class="flex flex-wrap gap-3">
                  <button
                    v-for="scope in scopeRules"
                    :key="scope.id"
                    @click="editingRole.scopeRule = scope.id"
                    :class="[
                      'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                      editingRole.scopeRule === scope.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    ]"
                  >
                    {{ scope.name }}
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">权限列表</label>
                <div class="grid grid-cols-4 gap-3">
                  <button
                    v-for="permission in allPermissions"
                    :key="permission.id"
                    @click="togglePermission(permission.id)"
                    :class="[
                      'p-3 rounded-xl text-left transition-all border-2',
                      editingRole.permissions.includes(permission.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    ]"
                  >
                    <div :class="['flex items-center gap-2 mb-1', editingRole.permissions.includes(permission.id) ? 'text-blue-700' : 'text-gray-700']">
                      <CheckCircle v-if="editingRole.permissions.includes(permission.id)" class="w-4 h-4" />
                      <Circle v-else class="w-4 h-4" />
                      <span class="font-medium text-sm">{{ permission.name }}</span>
                    </div>
                    <p class="text-xs text-gray-500">{{ permission.description }}</p>
                  </button>
                </div>
              </div>
              <div class="flex justify-end gap-3">
                <button @click="cancelEdit" class="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all">
                  取消
                </button>
                <button @click="saveRole" class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all">
                  <Save class="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>
            
            <div v-else class="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 hover:shadow-md transition-all duration-300">
              <div class="flex items-start gap-5">
                <div :class="[
                  'w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0',
                  role.status === 'active' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                ]">
                  <Shield class="w-8 h-8 text-white" />
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="font-bold text-lg text-gray-800">{{ role.name }}</h3>
                    <span :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      role.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    ]">
                      {{ getStatusText(role.status) }}
                    </span>
                  </div>
                  <p class="text-gray-600 mb-4">{{ role.description }}</p>
                  <div class="flex flex-wrap items-center gap-4">
                    <div class="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                      <Eye class="w-4 h-4 text-blue-500" />
                      <span class="text-sm text-blue-700">{{ getScopeRuleName(role.scopeRule) }}</span>
                    </div>
                    <div class="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                      <Shield class="w-4 h-4 text-purple-500" />
                      <span class="text-sm text-purple-700">{{ role.permissions.length }} 个权限</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button 
                    @click="toggleRoleStatus(role.id)" 
                    :class="[
                      'p-3 rounded-xl transition-all',
                      role.status === 'active' 
                        ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    ]"
                    :title="role.status === 'active' ? '禁用角色' : '启用角色'"
                  >
                    <Unlock v-if="role.status === 'active'" class="w-5 h-5" />
                    <Lock v-else class="w-5 h-5" />
                  </button>
                  <button 
                    @click="editRole(role)" 
                    class="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                    title="编辑角色"
                  >
                    <Edit2 class="w-5 h-5" />
                  </button>
                  <button 
                    @click="deleteRole(role.id)" 
                    class="p-3 bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                    title="删除角色"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <Teleport to="body">
      <div v-if="showAddRoleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-800">添加新角色</h2>
            <button @click="showAddRoleModal = false" class="p-2 hover:bg-gray-100 rounded-xl">
              <XCircle class="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div class="p-6 space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">角色名称 *</label>
              <input
                v-model="newRole.name"
                type="text"
                placeholder="请输入角色名称"
                class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">角色描述</label>
              <input
                v-model="newRole.description"
                type="text"
                placeholder="请输入角色描述"
                class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">可见范围</label>
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="scope in scopeRules"
                  :key="scope.id"
                  @click="newRole.scopeRule = scope.id"
                  :class="[
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    newRole.scopeRule === scope.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  {{ scope.name }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">权限列表</label>
              <div class="grid grid-cols-4 gap-3">
                <button
                  v-for="permission in allPermissions"
                  :key="permission.id"
                  @click="toggleNewRolePermission(permission.id)"
                  :class="[
                    'p-3 rounded-xl text-left transition-all border-2',
                    newRole.permissions.includes(permission.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  ]"
                >
                  <div :class="['flex items-center gap-2 mb-1', newRole.permissions.includes(permission.id) ? 'text-blue-700' : 'text-gray-700']">
                    <CheckCircle v-if="newRole.permissions.includes(permission.id)" class="w-4 h-4" />
                    <Circle v-else class="w-4 h-4" />
                    <span class="font-medium text-sm">{{ permission.name }}</span>
                  </div>
                  <p class="text-xs text-gray-500">{{ permission.description }}</p>
                </button>
              </div>
            </div>
          </div>
          <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
            <button @click="showAddRoleModal = false" class="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all">
              取消
            </button>
            <button 
              @click="submitAddRole" 
              :disabled="!newRole.name"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-xl transition-all',
                newRole.name 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              ]"
            >
              <Plus class="w-4 h-4" />
              添加角色
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
