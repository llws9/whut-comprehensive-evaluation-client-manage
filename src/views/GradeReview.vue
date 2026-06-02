<template>
  <div class="grade-review">
    <h1 class="page-title">成绩审核</h1>
    
    <div class="operation-bar">
      <SearchBox @search="handleSearch" />
      
      <div class="action-buttons">
        <el-button 
          v-if="userStore.isSuperAdmin" 
          type="warning" 
          @click="openDeadlineDialog"
        >设置申请截止时间</el-button>
        <el-button 
          v-if="canStopApplication" 
          :type="applicationEnabled ? 'danger' : 'primary'" 
          @click="toggleApplicationStatus"
        >{{ applicationEnabled ? '停止成绩申请' : '开启成绩申请' }}</el-button>
        <el-button 
          v-if="canApproveAll" 
          type="success" 
          @click="handleApproveAll"
        >一键通过</el-button>

        <!-- 新增学年选择器 -->
        <el-select 
          v-model="selectedYear" 
          placeholder="选择学年"
          style="width: 220px; margin-left: 10px;"
          class="styled-select"
          @change="handleYearChange"
        >
          <el-option  
            v-for="item in years" 
            :key="item.value" 
            :label="item.label + '学年'"
            :value="item.value" 
          />

        </el-select>
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
        <el-table-column label="序号" width="60" align="center">
          <template #default="scope">
            {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="100" align="center" />
        <el-table-column label="申请类别" width="120" align="center">
          <template #default="scope">
            <el-tag 
              :type="getCategoryTagType(scope.row.category)" 
              class="category-tag"
            >
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="150" align="left" />
        <el-table-column prop="score" label="分数" width="80" align="center" />
        <el-table-column prop="description" label="申请说明" min-width="200" align="left" />
        <el-table-column prop="applyTime" label="申请时间" width="160" />
        <el-table-column prop="status" label="状态" width="140">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <div class="attachment-row">
                <el-button 
                  v-if="hasAttachments(scope.row)" 
                  type="primary" 
                  link 
                  @click="handleView(scope.row)"
                >查看附件</el-button>
                <el-button 
                  v-else 
                  type="info" 
                  link 
                  disabled
                >无附件</el-button>
              </div>
              <div class="action-row">
                <el-button 
                  v-if="scope.row.status === '待审核' || scope.row.status === '班长已审核'" 
                  type="success" 
                  link 
                  @click="handleApprove(scope.row)"
                >
                  通过
                </el-button>
                <el-button 
                  v-if="scope.row.status === '待审核' || scope.row.status === '班长已审核'" 
                  type="danger" 
                  link 
                  @click="handleReject(scope.row)"
                >
                  驳回
                </el-button>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
    
    <!-- 查看详情弹窗 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      title="成绩详情" 
      width="600px"
    >
      <div v-if="currentRecord" class="detail-content">
        <div class="detail-item">
          <span class="detail-label">姓名：</span>
          <span>{{ currentRecord.name }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">申请类别：</span>
          <span>{{ currentRecord.category }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">内容：</span>
          <span>{{ currentRecord.content }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">分数：</span>
          <span>{{ currentRecord.score }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">申请说明：</span>
          <span>{{ currentRecord.description }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">申请时间：</span>
          <span>{{ currentRecord.applyTime }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态：</span>
          <el-tag :type="getStatusType(currentRecord.status)">{{ currentRecord.status }}</el-tag>
        </div>
        
        <!-- 附件信息 -->
        <div class="detail-item" v-if="currentRecord.fileList && currentRecord.fileList.length > 0">
          <span class="detail-label">附件：</span>
          <div class="file-list">
            <div v-for="(file, index) in currentRecord.fileList" :key="index" class="file-item">
              <el-link :href="file.url" target="_blank" type="primary" :underline="false" class="file-link">
                <el-icon><Document /></el-icon>
                {{ file.name }}
              </el-link>
              <el-button size="small" type="primary" @click="downloadFile(file)" class="download-btn">
                <el-icon><Download /></el-icon> 下载
              </el-button>
            </div>
          </div>
        </div>
        <div class="detail-item" v-else>
          <span class="detail-label">附件：</span>
          <span>无附件</span>
        </div>
      </div>
    </el-dialog>
    
    <!-- 附件预览弹窗 -->
    <el-dialog 
      v-model="attachmentDialogVisible" 
      title="用户附件列表" 
      width="60%"
      top="10vh"
      class="attachment-preview-dialog"
    >
      <div class="dialog-header-actions">
        <el-button type="primary" size="small" @click="downloadAllFiles" v-if="currentRecord && currentRecord.fileList && currentRecord.fileList.length > 0">
          <el-icon><Download /></el-icon> 下载全部附件
        </el-button>
      </div>
      
      <div v-if="currentRecord && currentRecord.fileList && currentRecord.fileList.length > 0" class="attachment-content-simple">
        <div class="attachment-list-simple">
          <h3 class="list-title">附件列表 ({{ currentRecord.fileList.length }}个文件)</h3>
          
          <el-table :data="currentRecord.fileList" border style="width: 100%">
            <el-table-column label="序号" type="index" width="80" align="center" />
            <el-table-column prop="name" label="文件名称" min-width="200">
              <template #default="scope">
                <div class="file-name-cell">
                  <el-icon v-if="getFileIconByName(scope.row.name) === 'Document'"><Document /></el-icon>
                  <el-icon v-else-if="getFileIconByName(scope.row.name) === 'Picture'"><Picture /></el-icon>
                  <el-icon v-else-if="getFileIconByName(scope.row.name) === 'VideoPlay'"><VideoPlay /></el-icon>
                  <el-icon v-else-if="getFileIconByName(scope.row.name) === 'Files'"><Files /></el-icon>
                  <span class="file-name">{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="文件类型" width="120" align="center">
              <template #default="scope">
                <el-tag :type="getFileTagType(scope.row.name)" size="small">
                  {{ getFileType(scope.row.name) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <div class="file-actions">
                  <el-button type="primary" link @click="previewFile(scope.row)">
                    <el-icon><View /></el-icon> 预览
                  </el-button>
                  <el-divider direction="vertical" />
                  <el-button type="success" link @click="downloadFile(scope.row)">
                    <el-icon><Download /></el-icon> 下载
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="attachment-tip">
            <el-alert
              title="附件说明"
              type="info"
              description='点击下载按钮可以将文件保存到本地查看，点击"下载全部附件"可一次性下载所有文件'
              show-icon
              :closable="false"
            />
          </div>
        </div>
      </div>
      
      <div v-else class="no-attachments">
        <el-empty description="没有找到附件" />
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="attachmentDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 驳回原因弹窗 -->
    <el-dialog 
      v-model="rejectDialogVisible" 
      title="驳回申请" 
      width="500px"
    >
      <el-form>
        <el-form-item label="驳回原因" required>
          <el-input 
            v-model="rejectReason" 
            type="textarea" 
            rows="4" 
            placeholder="请输入驳回原因"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReject" :disabled="!rejectReason">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加文件预览对话框 -->
    <el-dialog 
      v-model="previewDialogVisible" 
      :title="currentPreviewFile?.name || '文件预览'"
      width="80%"
      :fullscreen="isFullscreen"
      class="preview-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <template #header="{ titleId, titleClass }">
        <div class="preview-header">
          <h4 :id="titleId" :class="titleClass">{{ currentPreviewFile?.name || '文件预览' }}</h4>
          <div class="header-actions">
            <el-button size="small" type="primary" @click="downloadFile(currentPreviewFile)">
              <el-icon><Download /></el-icon> 下载文件
            </el-button>
          </div>
        </div>
      </template>

      <div class="preview-container" :class="{ 'is-fullscreen': isFullscreen }">
        <!-- 顶部操作栏 -->
        <div class="preview-toolbar">
          <div class="toolbar-actions">
            <el-button type="primary" @click="toggleFullscreen" class="preview-button">
              {{ isFullscreen ? '退出全屏' : '全屏' }}
            </el-button>
            <el-button type="success" @click="downloadFile(currentPreviewFile)" class="preview-button">
              下载
            </el-button>
            <el-button type="danger" @click="previewDialogVisible = false" class="preview-button">
              关闭
            </el-button>
          </div>
        </div>

        <!-- 内容区 -->
        <div class="preview-content">
          <!-- PDF预览 -->
          <iframe 
            v-if="isPreviewablePDF"
            :src="currentPreviewFile?.url"
            class="preview-iframe"
            frameborder="0"
          ></iframe>
          
          <!-- 图片预览 -->
          <el-image
            v-else-if="isPreviewableImage"
            :src="currentPreviewFile?.url"
            fit="contain"
            class="preview-image"
            :preview-src-list="[currentPreviewFile?.url]"
          >
            <template #error>
              <div class="preview-error">
                <el-icon><Picture /></el-icon>
                <p>图片加载失败</p>
              </div>
            </template>
          </el-image>
          
          <!-- 视频预览 -->
          <video
            v-else-if="isPreviewableVideo"
            :src="currentPreviewFile?.url"
            class="preview-video"
            controls
            controlsList="nodownload"
          >
            您的浏览器不支持视频预览
          </video>
          
          <!-- 不支持预览的文件类型 -->
          <div v-else class="preview-unsupported">
            <el-icon><Document /></el-icon>
            <h3>该文件类型暂不支持在线预览</h3>
            <p>您可以点击"下载"按钮将文件下载到本地查看</p>
            <el-button type="primary" @click="downloadFile(currentPreviewFile)">
              <el-icon><Download /></el-icon> 下载文件
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 设置截止时间弹窗 -->
    <el-dialog 
      v-model="deadlineDialogVisible" 
      title="设置申请截止时间" 
      width="500px"
    >
      <el-form>
        <el-form-item label="截止日期" required>
          <el-date-picker
            v-model="deadlineDate"
            type="date"
            placeholder="选择截止日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        <div class="deadline-description">
          <p>说明：</p>
          <ul>
            <li>设置截止日期后，学生将在该日期23:59:59后无法提交新的成绩申请</li>
            <li>如需取消截止时间限制，请将日期留空并点击确认</li>
            <li>当前设置的截止日期：<span class="current-deadline">{{ deadlineDate || '未设置' }}</span></li>
          </ul>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deadlineDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDeadline">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import SearchBox from '../components/common/SearchBox.vue';
import FilterTags from '../components/common/FilterTags.vue';
import Pagination from '../components/common/Pagination.vue';
import { useUserStore } from '../stores/user';
import { Document, Download, FullScreen, Link, Picture, VideoPlay, Files, View, Close } from '@element-plus/icons-vue';
import request from '../utils/request'; // 导入封装好的请求工具
import { years } from '@/data/year.js';


// 获取路由实例
const router = useRouter();
const userStore = useUserStore();

// 页面数据
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const keyword = ref('');

// 附件预览提示信息
const alertMessage = "由于附件存储在阿里云对象存储上，无法直接在页面内嵌预览。请点击\"查看\"在新窗口打开文件，或点击\"下载\"保存到本地查看。";

// 弹窗控制
const detailDialogVisible = ref(false);
const rejectDialogVisible = ref(false);
const attachmentDialogVisible = ref(false);
const deadlineDialogVisible = ref(false);
const currentRecord = ref(null);
const rejectReason = ref('');
const rejectingRecord = ref(null);
const deadlineDate = ref('');

// 预览相关的状态
const previewDialogVisible = ref(false);
const currentPreviewFile = ref(null);
const isFullscreen = ref(false);

// 文件类型判断
const isPreviewablePDF = computed(() => {
  const fileName = currentPreviewFile.value?.name?.toLowerCase() || '';
  return fileName.endsWith('.pdf');
});

const isPreviewableImage = computed(() => {
  const fileName = currentPreviewFile.value?.name?.toLowerCase() || '';
  return /\.(jpg|jpeg|png|gif|bmp|webp)$/.test(fileName);
});

const isPreviewableVideo = computed(() => {
  const fileName = currentPreviewFile.value?.name?.toLowerCase() || '';
  return /\.(mp4|webm|ogg)$/.test(fileName);
});

// 检查当前用户是否可以执行一键通过操作
const canApproveAll = computed(() => {
  return userStore.isSuperAdmin || userStore.isAdmin;
});

// 检查当前用户是否可以执行停止申请操作
const canStopApplication = computed(() => {
  return userStore.isSuperAdmin || userStore.isAdmin;
});

// 新增学年计算逻辑
// const generateAcademicYears = () => {
//   const now = new Date();
//   const currentYear = now.getFullYear();
//   const currentMonth = now.getMonth() + 1; // 1-12
  
// 判断当前是否在9月及之后
//   const baseYear = currentMonth >= 9 ? currentYear : currentYear - 1;
  
//   return [
//     `${baseYear}-${baseYear + 1}`,
//     `${baseYear - 1}-${baseYear}`
//   ];
// };

// 申请状态
const applicationEnabled = ref(true); // 默认为开启状态

// 新增响应式变量
// const academicYears = ref(generateAcademicYears());
// const selectedAcademicYear = ref(academicYears.value[0]);

// 新增：存储动态年级选项
const gradeOptions = ref([]);

// // 当前选中的筛选条件（初始值调整为动态空值，避免固定值干扰）
const selectedFilters = ref(['', '待审核', '智育']); // 初始年级设为空，等待动态数据填充

// 修改：使用computed动态生成filterGroups，确保与gradeOptions实时同步
const filterGroups = computed(() => [
  {
    label: '年级',
    options: gradeOptions.value,  // 直接使用gradeOptions的当前值
    isSingleSelect: true,
    defaultValue: gradeOptions.value.length > 0 ? gradeOptions.value[0].value : ''  // 动态默认值
  },
  {
    label: '状态',
    options: [
      { label: '待审核', value: '待审核' },
      { label: '已驳回', value: '已驳回' },
      { label: '班长已审核', value: '班长已审核' },
      { label: '辅导员已审核', value: '辅导员已审核' }
    ],
    isSingleSelect: true,
    defaultValue: '待审核'
  },
  {
    label: '申请类别',
    options: [
      { label: '智育', value: '智育' },
      { label: '体育与美育', value: '体育与美育' },
      { label: '劳育', value: '劳育' }
    ],
    isSingleSelect: true,
    defaultValue: '智育'
  }
]);


const loadGradeOptionsByAcademicYear = async () => {
  try {
    const gradeResponse = await request.get('/admin/getGrade', {
      params: {
        academicYear: selectedYear.value
      }
    });

    if (gradeResponse.data.code !== 200) {
      gradeOptions.value = [];
      ElMessage.error(`获取年级数据失败: ${gradeResponse.data.msg}`);
      return false;
    }

    const rawData = gradeResponse.data.data;
    if (!Array.isArray(rawData) || rawData.length === 0) {
      gradeOptions.value = [];
      ElMessage.warning('年级数据初始化失败');
      return false;
    }

    gradeOptions.value = Array.from(new Set(rawData)).map(grade => ({
      label: grade,
      value: grade
    }));

    await nextTick();

    selectedFilters.value = [
      gradeOptions.value[0]?.value || '',
      selectedFilters.value[1] || filterGroups.value[1].defaultValue,
      selectedFilters.value[2] || filterGroups.value[2].defaultValue
    ];

    return Boolean(selectedFilters.value[0]);
  } catch (error) {
    gradeOptions.value = [];
    console.error('获取年级数据失败:', error);
    ElMessage.error('获取年级数据失败，请稍后重试');
    return false;
  }
};


const convertStatusToApiValue = (status) => {
  const statusMap = {
    '待审核': 0,
    '已驳回': 1,
    '班长已审核': 2,
    '辅导员已审核': 3
  };
  return statusMap[status] || 0; // 默认为待审核(0)，而不是null
};

const convertCategoryToApiValue = (category) => {
  const categoryMap = {
    '智育': 2,
    '体育与美育': 3,
    '劳育': 4
  };
  return categoryMap[category] || 2; // 默认为智育
};

// 从API值转换为显示值
const convertApiStatusToDisplayValue = (status) => {
  const statusMap = {
    0: '待审核',
    1: '已驳回',
    2: '班长已审核',
    3: '辅导员已审核'
  };
  return statusMap[status] || '未知状态';
};

// 从API值转换为显示值 - 主类别
const convertApiCategoryToDisplayValue = (applicationId) => {
  const categoryMap = {
    2: '智育',
    3: '体育与美育',
    4: '劳育'
  };
  return categoryMap[applicationId] || '未知类别';
};

// 添加新函数：根据主类别和applicationId获取子类别名称
const getSubCategoryName = (mainCategory, subApplicationId) => {
  // 不同主类别下的子类别映射
  const subCategoryMaps = {
    '智育': {
      1: '学习成绩',
      2: '论文',
      3: '专利',
      4: '学术科技竞赛',
      5: '学术活动',
      6: '学术讲座',
      7: '导师评价',
      8: '(未获奖)学术科技竞赛'
    },
    '体育与美育': {
      1: '文体竞赛',
      2: '(未获奖)文体竞赛',
      3: '文艺征稿',
      4: '其他申请'
    },
    '劳育': {
      1: '社会工作',
      2: '社会实践',
      3: '两室文化建设'
    }
  };

  // 获取当前主类别下的子类别映射
  const currentSubCategoryMap = subCategoryMaps[mainCategory] || {};
  
  // 返回子类别名称，如果没有匹配则返回原始id值
  return currentSubCategoryMap[subApplicationId] || `类型-${subApplicationId}`;
};

// 根据状态获取对应的标签类型
const getStatusType = (status) => {
  const statusMap = {
    '待审核': 'info',
    '已驳回': 'danger',
    '班长已审核': 'warning',
    '辅导员已审核': 'success'
  };
  return statusMap[status] || 'info';
};

// 添加新函数：根据子申请类别获取标签类型（颜色）
const getCategoryTagType = (subCategory) => {
  // 智育相关类别
  if (subCategory === '学习成绩') return 'success';
  if (subCategory === '论文') return 'purple';
  if (subCategory === '专利') return 'warning';
  if (subCategory === '学术科技竞赛') return 'danger';
  if (subCategory === '学术活动') return 'info';
  if (subCategory === '学术讲座') return 'secondary';
  if (subCategory === '导师评价') return 'dark';
  if (subCategory === '(未获奖)学术科技竞赛') return 'primary';
  
  // 体育与美育相关类别
  if (subCategory === '文体竞赛') return 'danger';
  if (subCategory === '(未获奖)文体竞赛') return 'primary';
  if (subCategory === '文艺征稿') return 'success';
  if (subCategory === '其他申请') return 'warning';

  // 劳育相关类别
  if (subCategory === '社会工作') return 'primary';
  if (subCategory === '社会实践') return 'warning';
  if (subCategory === '两室文化建设') return 'info';
  
  // 默认返回空字符串，使用默认颜色
  return '';
};


// 处理搜索
const handleSearch = (value) => {
  keyword.value = value;
  currentPage.value = 1;
  fetchData();
};


// 处理筛选变化
// 保持原筛选变化处理逻辑不变
const handleFilterChange = (filters) => {
  selectedFilters.value = filters;
  currentPage.value = 1;
  fetchData();
};

//学年选择
const selectedYear = ref('')
// 获取数据方法
const fetchData = async () => {
  loading.value = true;
  try {
    // 解析学年参数
    // const [startYear] = selectedYear.value.match(/\d+/g);
    // 构建请求参数
    const params = {
      //这里直接传年份字符串就行
      academicYear: selectedYear.value,
      applicationName: keyword.value || null,
      grade: selectedFilters.value[0] || '', // 修复1：添加空值保护
      status: convertStatusToApiValue(selectedFilters.value[1]), 
      applicationId: convertCategoryToApiValue(selectedFilters.value[2]),
      page: currentPage.value,
      pageSize: pageSize.value
    };
    // 调试日志（建议保留用于问题排查）
    console.log('[调试] 当前年级选项:', gradeOptions.value);
    console.log('[调试] 当前筛选条件:', selectedFilters.value);
    console.log('[调试] 传递的年级参数:', params.grade);

    // // 关键参数校验
    // if (!params.grade) { // 修复2：修改校验逻辑
    //   ElMessage.warning('年级参数缺失，请检查筛选条件');
    //   loading.value = false;
    //   return;
    // }

    // 使用request发送API请求
    const response = await request.post('/admin/adminSelectApplication', params);

    // 处理响应数据
    if (response.data.code === 200) {
      const apiData = response.data.data;
      total.value = apiData.total;
      
      // 获取当前选择的主类别
      const currentMainCategory = selectedFilters.value[2]; // 如"智育"、"体育与美育"、"劳育"
      
      // 转换API数据格式为组件所需格式
      tableData.value = apiData.records.map(item => {
        // 获取主类别
        const mainCategory = convertApiCategoryToDisplayValue(params.applicationId);
        
        // 获取子类别名称
        const subCategory = getSubCategoryName(mainCategory, item.applicationId);
        
        return {
          id: item.id,
          name: item.userName,
          studentClass: item.userClass,
          category: subCategory, // 只显示子类别，不带主类别前缀
          content: item.text,
          score: item.mark,
          description: item.text,
          applyTime: new Date(item.createTime).toLocaleString(),
          status: convertApiStatusToDisplayValue(item.status),
          fileList: item.file || [],
          rawData: item // 保存原始数据，以备需要
        };
      });
    } else {
      ElMessage.error(`查询失败: ${response.data.msg}`);
    }
  } catch (error) {
    let errorMessage = '数据获取失败，请稍后重试';
    // 区分不同错误类型提供更具体提示
    if (error.response) {
      // 服务器返回错误状态码（如400/500等）
      errorMessage = `数据获取失败（${error.response.status}）: ${error.response.data.msg || '服务器内部错误'}`;
    } else if (error.request) {
      // 网络请求未收到响应
      errorMessage = '网络连接异常，请检查网络设置';
    } else {
      // 本地逻辑错误（如参数缺失）
      errorMessage = error.message || '数据获取失败，请稍后重试';
    }
    console.error('获取数据失败详情:', error);
    ElMessage.error(errorMessage);
  } finally {
    loading.value = false;
  }
};

// 新增学年选择
const handleYearChange = async () => {
  currentPage.value = 1;
  const hasGrade = await loadGradeOptionsByAcademicYear();
  if (hasGrade) {
    fetchData();
  } else {
    tableData.value = [];
    total.value = 0;
  }
};

//使用onMounted在组件挂载的时候调用获取,默认显示当前年份
onMounted(async () => {
  if (years && years.length > 1) {
    selectedYear.value = years[1].value;
  }

  const hasGrade = await loadGradeOptionsByAcademicYear();
  await fetchApplicationStatus();
  if (hasGrade) {
    fetchData();
  }
});


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

// 检查记录是否有附件
const hasAttachments = (row) => {
  return row.fileList && row.fileList.length > 0;
};

// 查看详情
const handleView = (row) => {
  currentRecord.value = row;
  
  // 检查是否有附件
  if (hasAttachments(row)) {
    attachmentDialogVisible.value = true;
    ElMessage.info('正在加载附件列表');
    // console.log('附件列表:', row.fileList);
  } else {
    ElMessage.warning('该申请没有附件');
  }
};

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

// 修改预览文件方法
const previewFile = (file) => {
  if (!file || !file.url) {
    ElMessage.error('文件链接无效');
    return;
  }
  currentPreviewFile.value = file;
  previewDialogVisible.value = true;
};

// 下载所有文件
const downloadAllFiles = () => {
  if (!currentRecord.value || !currentRecord.value.fileList || currentRecord.value.fileList.length === 0) {
    ElMessage.warning('没有可下载的文件');
    return;
  }
  
  // 遍历并下载所有文件
  const fileList = currentRecord.value.fileList;
  if (fileList.length === 1) {
    // 如果只有一个文件，直接下载
    downloadFile(fileList[0]);
    return;
  }

  // 如果有多个文件，依次下载
  ElMessage.success(`开始下载 ${fileList.length} 个文件`);
  
  // 为避免浏览器拦截，我们使用延迟下载
  fileList.forEach((file, index) => {
    setTimeout(() => {
      if (file && file.url) {
        const link = document.createElement('a');
        link.href = file.url;
        link.setAttribute('download', file.name);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (index === fileList.length - 1) {
          ElMessage.success(`全部 ${fileList.length} 个文件已开始下载`);
        }
      }
    }, index * 800); // 每个文件下载间隔800毫秒，避免浏览器限制
  });
};

// 获取文件类型
const getFileType = (fileName) => {
  if (!fileName) return '未知类型';
  
  const extension = fileName.split('.').pop().toLowerCase();
  
  const fileTypes = {
    // 文档类型
    'doc': '文档',
    'docx': '文档',
    'ppt': '幻灯片',
    'pptx': '幻灯片',
    'xls': '表格',
    'xlsx': '表格',
    'pdf': 'PDF文档',
    'txt': '文本文件',
    
    // 图片类型
    'jpg': '图片',
    'jpeg': '图片',
    'png': '图片',
    'gif': '图片',
    'bmp': '图片',
    'webp': '图片',
    
    // 视频类型
    'mp4': '视频',
    'avi': '视频',
    'mov': '视频',
    'wmv': '视频',
    'flv': '视频',
    
    // 压缩文件
    'zip': '压缩文件',
    'rar': '压缩文件',
    '7z': '压缩文件',
    'tar': '压缩文件',
    'gz': '压缩文件'
  };
  
  return fileTypes[extension] || '其他格式';
};

// 获取文件图标
const getFileIconByName = (fileName) => {
  if (!fileName) return 'Document';
  
  const extension = fileName.split('.').pop().toLowerCase();
  
  // 图片类型
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    return 'Picture';
  }
  
  // 视频类型
  if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) {
    return 'VideoPlay';
  }
  
  // 压缩文件
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return 'Files';
  }
  
  // 默认文档图标
  return 'Document';
};

// 获取文件标签类型
const getFileTagType = (fileName) => {
  if (!fileName) return '';
  
  const extension = fileName.split('.').pop().toLowerCase();
  
  // 文档类型 - 主要
  if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'pdf'].includes(extension)) {
    return 'primary';
  }
  
  // 图片类型 - 成功
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    return 'success';
  }
  
  // 视频类型 - 警告
  if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) {
    return 'warning';
  }
  
  // 压缩文件 - 信息
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return 'info';
  }
  
  // 其他类型 - 默认
  return '';
};

// 通过申请
const handleApprove = (row) => {
  // 检查权限
  if (!userStore.isSuperAdmin && !userStore.isAdmin && !(userStore.isMonitor && row.studentClass === userStore.userClass)) {
    ElMessage.warning('您没有权限执行此操作');
    return;
  }
  
  ElMessageBox.confirm(
    `确定通过 ${row.name} 的申请吗？`,
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 从当前选择的筛选标签获取applicationId
      const selectedCategory = selectedFilters.value[2]; // 当前选择的申请类别标签
      const applicationId = convertCategoryToApiValue(selectedCategory);
      
      // 打印更多信息用于调试
      // console.log('通过申请 - 当前选择的类别标签:', selectedCategory);
      // console.log('通过申请 - 映射后的applicationId:', applicationId);
      
      // 使用当前选择的标签映射的applicationId
      approveApplication(applicationId, row.id);
    })
    .catch(() => {
      ElMessage.info('已取消操作');
    });
};

// API调用 - 通过申请
const approveApplication = async (applicationId, recordId) => {
  try {
    // 记录完整的请求参数
    // console.log('通过申请最终参数：', {
    //   applicationId: applicationId, // 申请类别ID: 2=智育,3=体育与美育,4=劳育
    //   id: recordId,                 // 申请记录ID
    //   isPass: 0                     // 0表示通过
    // });
    
    // 使用request发送API请求
    const response = await request.post('/admin/adminExamineApplication', { 
      applicationId: applicationId, // 申请类别ID
      id: recordId,                 // 申请记录ID
      isPass: 0                     // 0表示通过
    });

    if (response.data.code === 200) {
      ElMessage.success('已通过申请');
      fetchData(); // 刷新数据
    } else {
      ElMessage.error(`操作失败: ${response.data.msg}`);
    }
  } catch (error) {
    // console.error('通过申请失败:', error);
    ElMessage.error('操作失败，请稍后重试');
  }
};

// 驳回申请
const handleReject = (row) => {
  // 检查权限
  if (!userStore.isSuperAdmin && !userStore.isAdmin && !(userStore.isMonitor && row.studentClass === userStore.userClass)) {
    ElMessage.warning('您没有权限执行此操作');
    return;
  }
  
  rejectingRecord.value = row;
  rejectReason.value = '';
  rejectDialogVisible.value = true;
};

// 确认驳回
const confirmReject = async () => {
  if (!rejectReason.value) {
    ElMessage.warning('请输入驳回原因');
    return;
  }
  
  try {
    // 从当前选择的筛选标签获取applicationId
    const selectedCategory = selectedFilters.value[2]; // 当前选择的申请类别标签
    const applicationId = convertCategoryToApiValue(selectedCategory);
    
    // 打印更多信息用于调试
    // console.log('驳回申请 - 当前选择的类别标签:', selectedCategory);
    // console.log('驳回申请 - 映射后的applicationId:', applicationId);
    
    // 记录完整的请求参数
    // console.log('驳回申请最终参数：', {
    //   applicationId: applicationId,
    //   id: rejectingRecord.value.id,
    //   isPass: 1,
    //   reason: rejectReason.value
    // });

    // 使用request发送API请求
    const response = await request.post('/admin/adminExamineApplication', { 
      applicationId: applicationId,         // 从当前选择的标签获取的申请类别ID
      id: rejectingRecord.value.id,         // 申请记录ID
      isPass: 1,                            // 1表示驳回
      reason: rejectReason.value            // 驳回原因
    });

    if (response.data.code === 200) {
      ElMessage.success('已驳回申请');
      rejectDialogVisible.value = false;
      fetchData(); // 刷新数据
    } else {
      ElMessage.error(`操作失败: ${response.data.msg}`);
    }
  } catch (error) {
    // console.error('驳回申请失败:', error);
    ElMessage.error('操作失败，请稍后重试');
  }
};

// 一键通过
const handleApproveAll = () => {
  // 检查权限
  if (!canApproveAll.value) {
    ElMessage.warning('您没有权限执行此操作');
    return;
  }
  
  ElMessageBox.confirm(
    '确定要通过当前筛选条件下的所有待审核申请吗？',
    '一键通过',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 调用批量通过API
      approveAllApplications();
    })
    .catch(() => {
      ElMessage.info('已取消操作');
    });
};

// API调用 - 批量通过申请
const approveAllApplications = async () => {
  try {
    // 从当前选择的筛选标签获取applicationId
    const selectedCategory = selectedFilters.value[2]; // 当前选择的申请类别标签
    const applicationId = convertCategoryToApiValue(selectedCategory);
    
    // 从当前表格数据中收集待审核记录的ID列表
    const idList = tableData.value
      .filter(item => item.status === '待审核' || item.status === '班长已审核')
      .map(item => item.id);
    
    if (idList.length === 0) {
      ElMessage.warning('当前没有可批量通过的记录');
      return;
    }
    
    // console.log('批量通过 - 当前选择的类别标签:', selectedCategory);
    // console.log('批量通过 - 映射后的applicationId:', applicationId);
    // console.log('批量通过 - 待处理记录ID列表:', idList);
    
    // 使用新的接口和参数格式
    const response = await request.post('/admin/adminExamineApplicationList', {
      applicationId: applicationId, // 从当前选择的标签获取的申请类别ID
      idList: idList // 当前表格中待审核记录的ID列表
    });

    if (response.data.code === 200) {
      ElMessage.success('已批量通过申请');
      fetchData(); // 刷新数据
    } else {
      ElMessage.error(`操作失败: ${response.data.msg}`);
    }
  } catch (error) {
    // console.error('批量通过申请失败:', error);
    ElMessage.error('操作失败，请稍后重试');
  }
};

// 获取申请状态
const fetchApplicationStatus = async () => {
  try {
    const response = await request.get('/admin/comprehensiveData/getMenuStatus');
    if (response.data.code === 200) {
      // 根据返回值设置状态：0表示开启，1表示关闭
      applicationEnabled.value = response.data.data === 0;
      // console.log('当前申请状态:', response.data.data);
      // console.log('applicationEnabled值:', applicationEnabled.value);
    } else {
      // console.error('获取申请状态失败:', response.data.msg);
    }
  } catch (error) {
    // console.error('获取申请状态出错:', error);
  }
};

// 切换成绩申请状态
const toggleApplicationStatus = () => {
  // 检查权限
  if (!canStopApplication.value) {
    ElMessage.warning('您没有权限执行此操作');
    return;
  }
  
  const confirmMessage = applicationEnabled.value 
    ? '确定要停止所有成绩申请吗？该操作将影响所有学生申请。'
    : '确定要开启成绩申请功能吗？该操作将允许学生提交成绩申请。';
  
  const confirmTitle = applicationEnabled.value ? '停止成绩申请' : '开启成绩申请';
  const confirmType = applicationEnabled.value ? 'danger' : 'warning';
  
  ElMessageBox.confirm(
    confirmMessage,
    confirmTitle,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: confirmType,
    }
  )
    .then(() => {
      // 调用相应的API
      changeApplicationStatus(!applicationEnabled.value);
    })
    .catch(() => {
      ElMessage.info('已取消操作');
    });
};

// API调用 - 更改申请状态
const changeApplicationStatus = async (isEnabled) => {
  try {
    // isEnabled为true表示要开启申请通道，对应status=0
    // isEnabled为false表示要关闭申请通道，对应status=1
    const status = isEnabled ? 0 : 1;
    // console.log(`设置成绩申请状态 - 调用接口: /admin/comprehensiveData/changeMenuStatus`);
    // console.log(`参数 status=${status}，${status === 0 ? '开启' : '关闭'}申请通道`);
    
    // 使用request发送GET请求
    const response = await request.get('/admin/comprehensiveData/changeMenuStatus', {
      params: {
        status: status
      }
    });

    if (response.data.code === 200) {
      applicationEnabled.value = isEnabled; // 更新本地状态
      ElMessage.success(`已${isEnabled ? '开启' : '停止'}成绩申请功能`);
      fetchData(); // 刷新数据
    } else {
      ElMessage.error(`操作失败: ${response.data.msg}`);
    }
  } catch (error) {
    // console.error(`${isEnabled ? '开启' : '停止'}申请失败:`, error);
    ElMessage.error('操作失败，请稍后重试');
  }
};

// 登录成功后的处理
const handleLoginSuccess = (response) => {
  // 保存token到localStorage
  const token = response.data.token; // 确保键名与后端返回的一致
  localStorage.setItem('token', token);
  console.log('保存的token:', token);
  
  // 保存用户信息
  userStore.setUserInfo({
    // 根据实际返回数据填写
    userName: response.data.userName,
    userNumber: response.data.userNumber,
    identity: response.data.identity,
    // 其他信息...
  });
  
  // 跳转到成绩审核页面
  router.push('/grade-review');
};

// 下载文件方法
const downloadFile = (file) => {
  if (!file || !file.url) {
    ElMessage.error('文件链接无效');
    return;
  }

  try {
    // 创建一个临时的a标签来触发下载
    const link = document.createElement('a');
    link.href = file.url;
    link.setAttribute('download', file.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ElMessage.success('文件下载已开始');
  } catch (error) {
    console.error('文件下载失败:', error);
    ElMessage.error('文件下载失败');
  }
};

// 在新标签页打开链接
const openInNewTab = (url) => {
  window.open(url, '_blank');
};

// 打开设置截止时间对话框
const openDeadlineDialog = () => {
  // 检查权限
  if (!userStore.isSuperAdmin) {
    ElMessage.warning('只有超级管理员才能设置申请截止时间');
    return;
  }
  
  // 获取当前截止日期（如果有）
  fetchCurrentDeadline();
  
  deadlineDialogVisible.value = true;
};

// 获取当前截止日期
const fetchCurrentDeadline = async () => {
  try {
    const response = await request.get('/admin/comprehensiveData/getMenuDDL');
    if (response.data.code === 200) {
      deadlineDate.value = response.data.data || '';
      // console.log('当前截止日期:', deadlineDate.value);
    } else {
      // console.error('获取截止日期失败:', response.data.msg);
    }
  } catch (error) {
    // console.error('获取截止日期出错:', error);
  }
};

// 提交设置截止时间
const submitDeadline = async () => {
  try {
    // 如果deadlineDate为空，表示要清除截止时间
    const message = deadlineDate.value ? 
      `设置截止日期为: ${deadlineDate.value}` : 
      '清除截止日期限制';
    // console.log(message);
    
    // 使用request发送请求，根据API文档使用正确的端点
    const response = await request.post('/admin/comprehensiveData/timedMenuDDL', null, {
      params: {
        ddl: deadlineDate.value || '' // 如果值为空，传递空字符串
      }
    });

    if (response.data.code === 200) {
      ElMessage.success(deadlineDate.value ? 
        '已成功设置申请截止时间' : 
        '已清除申请截止时间限制');
      deadlineDialogVisible.value = false;
    } else {
      ElMessage.error(`操作失败: ${response.data.msg}`);
    }
  } catch (error) {
    // console.error('设置截止日期失败:', error);
    ElMessage.error('操作失败，请稍后重试');
  }
};
</script>

<style scoped>

.styled-select {
  border-radius: 4px;
  transition: all 0.3s ease;
}

.styled-select:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.styled-select:deep(.el-input__inner) {
  height: 32px;
  line-height: 32px;
  padding: 0 15px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.styled-select:deep(.el-input__inner:focus) {
  border-color: #409EFF;
}

.styled-select:deep(.el-input__suffix) {
  display: flex;
  align-items: center;
  right: 8px;
}

.grade-review {
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

.filters {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 10px;
  font-weight: 500;
  color: #606266;
}

.filter-buttons {
  display: flex;
  gap: 10px;
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

.detail-content {
  padding: 15px;
}

.detail-item {
  margin-bottom: 18px;
  display: flex;
  align-items: flex-start;
}

.detail-label {
  font-weight: bold;
  min-width: 120px;
  color: #606266;
}

.operation-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-row, .action-row {
  display: flex;
  gap: 8px;
}

.action-row {
  justify-content: flex-start;
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

.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  width: 100%;
}

.file-link {
  word-break: break-all;
  margin-right: 12px;
  max-width: 70%;
}

.download-btn {
  white-space: nowrap;
  min-width: 70px;
  background-color: #409EFF !important;
  color: white !important;
  font-weight: 500;
  border: none;
}

.download-btn:hover {
  background-color: #337ecc !important;
}

.dialog-header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}

.attachment-content-simple {
  padding: 0 0 20px 0;
}

.attachment-list-simple {
  width: 100%;
}

.list-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name-cell .el-icon {
  color: #409EFF;
  font-size: 20px;
}

.file-name {
  word-break: break-all;
  font-weight: 500;
  color: #303133;
}

.file-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.attachment-tip {
  margin-top: 20px;
}

:deep(.el-alert) {
  margin: 0;
  border-radius: 4px;
}

:deep(.el-alert__title) {
  font-size: 14px;
  font-weight: 600;
}

:deep(.el-alert__description) {
  margin: 5px 0 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.no-attachments {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  color: #909399;
  font-size: 16px;
}

.dialog-header-actions .el-button {
  font-weight: 600;
  padding: 8px 16px;
}

:deep(.attachment-preview-dialog .el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
  padding: 15px 20px;
}

:deep(.attachment-preview-dialog .el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

:deep(.attachment-preview-dialog .el-dialog__body) {
  padding: 20px;
}

:deep(.attachment-preview-dialog .el-dialog__footer) {
  border-top: 1px solid #ebeef5;
  padding: 15px 20px;
  background-color: #f9fafc;
}

:deep(.attachment-preview-dialog .el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.attachment-preview-dialog .el-table td) {
  padding: 12px 0;
}

:deep(.attachment-preview-dialog .el-button--default) {
  border-color: #dcdfe6;
  background-color: #fff;
  color: #606266;
}

:deep(.attachment-preview-dialog .el-button--default:hover) {
  border-color: #c6e2ff;
  background-color: #ecf5ff;
  color: #409EFF;
}

:deep(.el-divider--vertical) {
  height: 1em;
  margin: 0 4px;
}

.preview-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.preview-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 500px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.preview-container {
  height: 70vh;
  position: relative;
  background-color: #f5f7fa;
  border-radius: 0 0 4px 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-container.is-fullscreen {
  height: calc(100vh - 120px);
}

.preview-toolbar {
  background-color: white;
  padding: 8px 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-button {
  color: white !important;
  font-weight: 400;
  padding: 8px 16px;
  border: none;
}

.preview-button:hover {
  opacity: 0.9;
}

.preview-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-image {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
}

.preview-video {
  width: 100%;
  height: 100%;
  background-color: #000;
}

.preview-error,
.preview-unsupported {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  gap: 16px;
}

.preview-error .el-icon,
.preview-unsupported .el-icon {
  font-size: 48px;
}

.preview-unsupported h3 {
  margin: 0;
  font-size: 18px;
  color: #606266;
}

.preview-unsupported p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

:deep(.el-image__inner) {
  max-height: 100%;
  max-width: 100%;
}

:deep(.el-dialog__body) {
  padding: 0;
}

/* 截止时间设置相关样式 */
.deadline-description {
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-radius: 6px;
  border-left: 4px solid #409EFF;
}

.deadline-description p {
  margin: 0 0 10px 0;
  font-weight: bold;
  color: #606266;
}

.deadline-description ul {
  margin: 0;
  padding-left: 20px;
}

.deadline-description li {
  margin-bottom: 5px;
  color: #606266;
  font-size: 14px;
}

.current-deadline {
  font-weight: 600;
  color: #409EFF;
}

:deep(.el-date-editor.el-input) {
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
  opacity: 0.08;
  z-index: 0;
  border-radius: 8px;
}

:deep(.category-tag) {
  transform: scale(1.03);
  margin: 2px 0;
  font-size: 14px;
  padding: 0 10px;
  height: 28px;
  line-height: 26px;
}
</style>
