<template>
  <div class="grade-management">
    <h1 class="page-title">成绩管理</h1>
    
    <div class="operation-bar">
      <SearchBox @search="handleSearch" />
      
      <div class="action-buttons">
        <!-- 新增获取导入模板按钮 -->
        <el-button 
          v-if="showImportButton" 
          type="info" 
          @click="() => getTemplateDialogVisible = true"
        >获取导入模板</el-button>
        
        <!-- 新增导入讲座数据按钮 -->
        <el-button 
          v-if="showImportButton" 
          type="warning" 
          @click="() => importLectureDialogVisible = true"
        >导入讲座数据</el-button>
        
        <el-button 
          v-if="showImportButton" 
          type="primary" 
          @click="handleImportGrades"
        >导入德育成绩</el-button>
        
        <el-button 
          v-if="showExportButton" 
          type="success" 
          @click="handleExportGrades"
        >导出成绩</el-button>
        
        <!-- 新增学年选择器 -->
        <el-select 
          v-model="selectedYear" 
          placeholder="选择学年"
          style="width: 220px; margin-right: 10px;"
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
        @sort-change="handleSortChange"
      >
        <el-table-column label="序号" width="60" align="center">
          <template #default="scope">
            {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="学生姓名" width="100" />
        <el-table-column prop="userClass" label="班级" width="100" />
        <el-table-column prop="userNumber" label="学号" width="120" />
        <el-table-column prop="gradeDisplay" label="年级" width="90" />
        <el-table-column prop="dy" label="德育成绩" width="100" align="center" sortable />
        <el-table-column prop="zy" label="智育成绩" width="100" align="center" sortable />
        <el-table-column prop="ty" label="体育与美育成绩" width="140" align="center" sortable />
        <el-table-column prop="ly" label="劳育成绩" width="100" align="center" sortable />
        <el-table-column prop="totalScore" label="总分" width="100" align="center" sortable />
        <el-table-column prop="submitTime" label="提交时间" width="160" />
        <el-table-column prop="confirmStatus" label="确认状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.confirmStatus === '已确认' ? 'success' : 'info'">
              {{ scope.row.confirmStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleExportAttachments(scope.row.userId)">导出附件</el-button>
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
    
    <!-- 导入讲座数据对话框 -->
    <el-dialog
      v-model="importLectureDialogVisible"
      title="导入讲座数据"
      width="600px"
      class="import-lecture-dialog"
    >
      <el-form :model="lectureForm" label-width="100px" style="padding-top: 20px;">
        <el-form-item label="讲座学年" required>
          <el-select 
          v-model="selectedYear" 
          placeholder="选择学年"
          style="width: 220px;"
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
        </el-form-item>
        <el-form-item label="讲座主题" required>
          <el-input v-model="lectureForm.title" placeholder="请输入讲座主题" />
        </el-form-item>
        <el-form-item label="讲座时间" required>
          <el-date-picker
            v-model="lectureForm.dateTime"
            type="datetime"
            placeholder="选择讲座时间"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="Excel文件" required>
          <el-upload class="custom-upload"
            :action="uploadUrl"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            :file-list="fileList"
            list-type="text"
            accept=".xlsx,.xls"
          >
            <el-button type="primary" size="small">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">仅支持.xlsx/.xls格式文件</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="cancel-btn" @click="importLectureDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImportLectureSubmit" :disabled="!validateForm()">导入</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 获取模板对话框 -->
<el-dialog
  v-model="getTemplateDialogVisible"
  title="选择导入模板"
  width="600px"
  class="get-template-dialog"
>
  <div class="template-buttons" style="padding: 20px; text-align: center;">
    <el-button type="primary" style="margin-right: 20px;" @click="handleDownloadGradeTemplate">成绩导入模板</el-button>
    <el-button type="success" style="margin-right: 20px;" @click="handleDownloadLectureTemplate">讲座导入模板</el-button>
    <el-button type="info" @click="handleDownloadStudentTemplate">用户导入模板</el-button>
  </div>
  <template #footer>
    <span class="dialog-footer">
      <el-button @click="getTemplateDialogVisible = false" style="color: black;">关闭</el-button>
    </span>
  </template>
</el-dialog>

<!-- 导出成绩对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="选择要导出的班级"
      width="600px"
      class="export-dialog"
    >
      <div class="class-selection-container">
        <div class="class-selection-header">
          <span class="selection-label">学年选择</span>
        </div>
        <div class="class-checkbox-wrapper">
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
      <div class="class-selection-container">
        <div class="class-selection-header">
          <span class="selection-label">班级选择</span>
          <el-button 
            type="primary" 
            size="small" 
            @click="handleToggleSelectAllClasses"
          >
            {{ isAllClassesSelected ? '取消全选' : '全选' }}
          </el-button>
        </div>
        <div class="class-checkbox-wrapper">
          <el-checkbox-group v-model="selectedClasses" class="class-checkbox-group">
            <el-checkbox v-for="cls in availableClasses" :key="cls" :label="cls">{{ cls }}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="cancel-button" @click="exportDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="confirmExport" 
            :disabled="selectedClasses.length === 0"
          >
            确认导出
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 附件预览弹窗 -->
    <el-dialog 
      v-model="attachmentDialogVisible" 
      title="用户附件列表" 
      width="65%"
      top="5vh"
      class="attachment-preview-dialog"
    >
      <div class="dialog-header-actions">
        <el-button type="primary" size="small" @click="downloadAllAttachments" v-if="currentAttachments && hasAnyAttachments">
          <el-icon><Download /></el-icon> 下载全部附件
        </el-button>
      </div>

      <div v-if="!currentAttachments || !hasAnyAttachments" class="no-attachments">
        <el-empty description="该用户没有任何附件" />
      </div>
      
      <div v-else class="attachment-content">
        <!-- 智育附件 -->
        <div v-if="hasZyAttachments" class="attachment-section">
          <div class="section-header">
            <el-icon class="section-icon"><Collection /></el-icon>
            <h3 class="section-title">智育附件</h3>
            <el-tag type="primary" size="small" class="count-tag">{{ currentAttachments.zyAttachment.length }}个文件</el-tag>
            <div class="section-actions">
              <el-button type="primary" size="small" @click="downloadCategoryAttachments('zyAttachment')" class="category-download-btn">
                <el-icon><Download /></el-icon> 下载此类别
              </el-button>
            </div>
          </div>
          
          <el-table :data="currentAttachments.zyAttachment" border style="width: 100%; margin-bottom: 20px;">
            <el-table-column label="序号" type="index" width="60" align="center" />
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
                  <el-button type="primary" link @click="previewAttachment(scope.row)">
                    <el-icon><View /></el-icon> 预览
                  </el-button>
                  <el-divider direction="vertical" />
                  <el-button type="success" link @click="downloadAttachment(scope.row)">
                    <el-icon><Download /></el-icon> 下载
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 体育与美育附件 -->
        <div v-if="hasTyAttachments" class="attachment-section">
          <div class="section-header">
            <el-icon class="section-icon"><Trophy /></el-icon>
            <h3 class="section-title">体育与美育附件</h3>
            <el-tag type="success" size="small" class="count-tag">{{ currentAttachments.tyAttachment.length }}个文件</el-tag>
            <div class="section-actions">
              <el-button type="primary" size="small" @click="downloadCategoryAttachments('tyAttachment')" class="category-download-btn">
                <el-icon><Download /></el-icon> 下载此类别
              </el-button>
            </div>
          </div>
          
          <el-table :data="currentAttachments.tyAttachment" border style="width: 100%; margin-bottom: 20px;">
            <el-table-column label="序号" type="index" width="60" align="center" />
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
                  <el-button type="primary" link @click="previewAttachment(scope.row)">
                    <el-icon><View /></el-icon> 预览
                  </el-button>
                  <el-divider direction="vertical" />
                  <el-button type="success" link @click="downloadAttachment(scope.row)">
                    <el-icon><Download /></el-icon> 下载
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 劳育附件 -->
        <div v-if="hasLyAttachments" class="attachment-section">
          <div class="section-header">
            <el-icon class="section-icon"><OfficeBuilding /></el-icon>
            <h3 class="section-title">劳育附件</h3>
            <el-tag type="warning" size="small" class="count-tag">{{ currentAttachments.lyAttachment.length }}个文件</el-tag>
            <div class="section-actions">
              <el-button type="primary" size="small" @click="downloadCategoryAttachments('lyAttachment')" class="category-download-btn">
                <el-icon><Download /></el-icon> 下载此类别
              </el-button>
            </div>
          </div>
          
          <el-table :data="currentAttachments.lyAttachment" border style="width: 100%; margin-bottom: 20px;">
            <el-table-column label="序号" type="index" width="60" align="center" />
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
                  <el-button type="primary" link @click="previewAttachment(scope.row)">
                    <el-icon><View /></el-icon> 预览
                  </el-button>
                  <el-divider direction="vertical" />
                  <el-button type="success" link @click="downloadAttachment(scope.row)">
                    <el-icon><Download /></el-icon> 下载
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="attachment-tip">
          <el-alert
            title="附件说明"
            type="info"
            description='点击"下载"按钮保存文件到本地，或使用"下载全部附件"和"下载此类别"功能批量下载文件'
            show-icon
            :closable="false"
          />
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="attachmentDialogVisible = false">关闭</el-button>
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
            <el-button size="small" type="primary" @click="downloadAttachment(currentPreviewFile)">
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
            <el-button type="success" @click="downloadAttachment(currentPreviewFile)" class="preview-button">
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
            <el-button type="primary" @click="downloadAttachment(currentPreviewFile)">
              <el-icon><Download /></el-icon> 下载文件
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import SearchBox from '../components/common/SearchBox.vue';
import FilterTags from '../components/common/FilterTags.vue';
import Pagination from '../components/common/Pagination.vue';
import { useUserStore } from '../stores/user';
import { Document, Download, Collection, Trophy, OfficeBuilding, Picture, VideoPlay, Files, View, Close } from '@element-plus/icons-vue';
import request from '../utils/request'; // 导入封装好的请求工具
import { years } from '@/data/year.js';



// 获取用户Store
const userStore = useUserStore();

// 页面数据
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const keyword = ref('');

// 导入讲座数据对话框
const importLectureDialogVisible = ref(false);
// 获取模板对话框
const getTemplateDialogVisible = ref(false);

// 下载成绩导入模板
const handleDownloadGradeTemplate = async () => {
  try {
    const response = await request.get('/demo/GradeDemo.xlsx', { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '成绩导入模板.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    ElMessage.error('下载模板失败：' + error.message);
  }
};

// 下载讲座导入模板
const handleDownloadLectureTemplate = async () => {
  try {
    const response = await request.get('/demo/LectureDemo.xlsx', { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '讲座导入模板.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    ElMessage.error('讲座模板下载失败：' + error.message);
  }
};

// 下载用户导入模板
const handleDownloadStudentTemplate = async () => {
  try {
    const response = await request.get('/demo/StudentDemo.xlsx', { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '用户导入模板.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    ElMessage.error('用户模板下载失败：' + error.message);
  }
};
const lectureForm = ref({ title: '', dateTime: '' });
const fileList = ref([]);
const uploadUrl = ref(''); // 后端上传接口地址

// 导出成绩对话框
const exportDialogVisible = ref(false);
const selectedClasses = ref([]);
const availableClasses = ref([]); // 改为ref，将从API动态获取

// 是否显示导出按钮
const showExportButton = computed(() => {
  // 只有班长、管理员和超级管理员可以看到导出按钮
  return ['monitor', 'admin', 'superAdmin'].includes(userStore.userRole);
});;;


const showImportButton = computed(() => {
  // 确保用户角色已加载且是管理员或超级管理员
  return userStore.userRole && ['admin', 'superAdmin'].includes(userStore.userRole);
});

// 检查是否启用导出功能
const enableExport = computed(() => {
  // The following line is just cosmetic; true enables export for all users, false disables it for all.
  return true;
});


// 新增学年生成函数（需要放在变量定义之前）
// const generateAcademicYears = () => {
//   const now = new Date();
//   const currentYear = now.getFullYear();
//   const currentMonth = now.getMonth() + 1;
//   const baseYear = currentMonth >= 9 ? currentYear : currentYear - 1;
//   return [
//     `${baseYear}学年~${baseYear + 1}学年`,
//     `${baseYear - 1}学年~${baseYear}学年`
//   ];
// };

// 新增响应式变量
// const academicYears = ref(generateAcademicYears());
// const selectedAcademicYear = ref(academicYears.value[0]);

// 处理文件选择
const handleFileChange = (file) => {
  fileList.value = [file];
};

// 文件上传前校验
const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (!isExcel) {
    ElMessage.error('仅支持Excel文件上传');
    return false;
  }
  return true;
};

// 校验表单
const validateForm = () => {
  return lectureForm.value.title && lectureForm.value.dateTime && fileList.value.length > 0;
};

// 导入讲座数据提交
const handleImportLectureSubmit = async () => {
  if (!validateForm()) return;
  try {
    loading.value = true;
    const formData = new FormData();
    formData.append('academicYear', selectedYear.value);
    formData.append('title', lectureForm.value.title);
    formData.append('dateTime', lectureForm.value.dateTime);
    formData.append('file', fileList.value[0].raw);
    const response = await request.post('/admin/comprehensiveData/importLectureDataData', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    // 增强业务状态码检查（兼容可能的undefined情况）
    const businessCode = response?.data?.code;
    if (businessCode !== 200) {
      const errorMsg = response?.data?.msg || (businessCode ? `讲座导入失败（错误码：${businessCode}）` : '讲座导入失败：无有效错误信息');
      throw new Error(errorMsg);
    }
    
    ElMessage.success('讲座数据导入成功');
    importLectureDialogVisible.value = false;
    fetchData(); // 刷新表格数据
  } catch (error) {
    // 处理业务错误和网络错误
    const errorMessage = error.response?.data?.msg || // 业务错误消息
                         error.message ||              // 网络错误消息
                         '导入失败：未知错误';
    ElMessage.error('导入失败：' + errorMessage);
  } finally {
    loading.value = false;
  }
};  



// 删除原有的硬编码filterGroups
const gradeOptions = ref([]);

// 修改：使用computed动态生成filterGroups
const filterGroups = computed(() => [
  {
    label: '年级',
    options: gradeOptions.value,
    isSingleSelect: true,
    defaultValue: gradeOptions.value.length > 0 ? gradeOptions.value[0].value : ''
  },
  // 保持原有的状态筛选配置不变...
  {
    label: '状态',
    options: [
      { label: '未确认', value: '未确认' },
      { label: '已确认', value: '已确认' }
    ],
    isSingleSelect: true,
    defaultValue: '未确认'
  }
]);


// 当前选中的筛选条件
const selectedFilters = ref(['研一', '未确认']);

// 修改convertGradeToApiValue函数
const convertGradeToApiValue = (grade) => {
  // 如果后端需要数字类型，可以在此添加转换逻辑
  return grade; // 假设直接返回年级字符串
};

const convertStatusToApiValue = (status) => {
  return status === '未确认' ? 0 : 1;
};

// 从API值转换为显示值
const convertApiGradeToDisplayValue = (grade) => {
  return grade ;
};

const convertApiStatusToDisplayValue = (status) => {
  return status === 0 ? '未确认' : '已确认';
};

// 附件预览弹窗控制
const attachmentDialogVisible = ref(false);
const currentAttachments = ref(null);
const currentStudentId = ref(null);
const currentStudentName = ref('');

// 计算属性 - 是否有任何附件
const hasAnyAttachments = computed(() => {
  if (!currentAttachments.value) return false;
  
  return (
    (currentAttachments.value.zyAttachment && currentAttachments.value.zyAttachment.length > 0) ||
    (currentAttachments.value.tyAttachment && currentAttachments.value.tyAttachment.length > 0) ||
    (currentAttachments.value.lyAttachment && currentAttachments.value.lyAttachment.length > 0)
  );
});

// 计算属性 - 是否有智育附件
const hasZyAttachments = computed(() => {
  return currentAttachments.value && 
         currentAttachments.value.zyAttachment && 
         currentAttachments.value.zyAttachment.length > 0;
});

// 计算属性 - 是否有体育与美育附件
const hasTyAttachments = computed(() => {
  return currentAttachments.value && 
         currentAttachments.value.tyAttachment && 
         currentAttachments.value.tyAttachment.length > 0;
});

// 计算属性 - 是否有劳育附件
const hasLyAttachments = computed(() => {
  return currentAttachments.value && 
         currentAttachments.value.lyAttachment && 
         currentAttachments.value.lyAttachment.length > 0;
});

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

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

// 预览附件
const previewAttachment = (file) => {
  if (!file || !file.url) {
    ElMessage.error('文件链接无效');
    return;
  }
  currentPreviewFile.value = file;
  previewDialogVisible.value = true;
};

// 修改onMounted钩子
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
        
        await nextTick();
        
        // 初始化筛选条件
        const newFilters = [
          gradeOptions.value[0]?.value || '',
          filterGroups.value[1].defaultValue
        ];
        
        if (newFilters[0]) {
          selectedFilters.value = newFilters;
          fetchData();
        }
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

//学年选择
const selectedYear = ref('')
// 获取数据方法
const fetchData = async () => {
  loading.value = true;
  try {
    // 解析学年参数
    // const [startYear] = selectedAcademicYear.value.match(/\d+/g);

    // 构建请求参数
    const params = {
    //这里直接传年份字符串就行
    academicYear: selectedYear.value,
    studentName: keyword.value || null,
    grade: selectedFilters.value[0], // 直接使用选中的年级值
    status: convertStatusToApiValue(selectedFilters.value[1]),
    page: currentPage.value,
    pageSize: pageSize.value,
    order: `${sortField.value} ${sortOrder.value}` // 新增排序参数
  };

    console.log('查询综测数据参数:', params);

    // 使用request发送API请求
    const response = await request.post('/admin/comprehensiveData/selectUnsubmittedStudent', params);
    console.log(response.data);

    // 处理响应数据
    if (response.data.code === 200) {
      const apiData = response.data.data;
      total.value = apiData.total;
      
    // 转换API数据格式为组件所需格式
      tableData.value = apiData.records.map(item => {
    // 计算总分 (如果有值才相加)
        const dy = parseFloat(item.dy) || 0;
        const zy = parseFloat(item.zy) || 0;
        const ty = parseFloat(item.ty) || 0;
        const ly = parseFloat(item.ly) || 0;
        const totalScore = dy + zy + ty + ly;

        return {
          userId: item.userId,
          userNumber: item.userNumber,
          userName: item.userName,
          userClass: item.userClass,
          gradeDisplay: item.grade ? convertApiGradeToDisplayValue(item.grade) : '未知',
          dy: dy.toFixed(1),
          zy: zy.toFixed(3),
          ty: ty.toFixed(1),
          ly: ly.toFixed(3),
          totalScore: totalScore.toFixed(3),
          submitTime: item.submitTime ? new Date(item.submitTime).toLocaleString() : '-',
          confirmStatus: convertStatusToApiValue(selectedFilters.value[1]) === 1 ? '已确认' : '未确认',
        };
      });
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

// 处理表格排序变化
// 排序字段，默认按总分排序
const sortField = ref('totalScore');
// 排序方向，默认降序（DESC）
const sortOrder = ref('DESC');

const handleSortChange = (column) => {
  // column.prop 是当前排序的字段（如 'dy'、'totalScore'）
  // column.order 是排序方向（'ascending' 为升序，'descending' 为降序）
  sortField.value = column.prop;
  sortOrder.value = column.order === 'ascending' ? 'ASC' : 'DESC';
  // 重新请求数据，携带新的排序参数
  fetchData();
};

// 新增学年变化处理
const handleYearChange = () => {
  currentPage.value = 1;
  fetchData();
};

//使用onMounted在组件挂载的时候调用获取,默认显示当前年份
onMounted(() => {
  if (years && years.length > 1) {
    selectedYear.value = years[1].value;
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

// 导入德育成绩
const handleImportGrades = () => {
  // 模拟文件选择
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 这里应该调用导入API
      uploadMoralScores(file);
    }
  };
  
  input.click();
};

// 上传德育成绩文件
const uploadMoralScores = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // 调用上传API
    const response = await request.post('/admin/comprehensiveData/importExcelData', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data.code === 200) {
      ElMessage.success(`成功导入德育成绩: ${file.name}`);
      fetchData(); // 刷新数据
    } else {
      ElMessage.error(`导入失败: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('导入德育成绩失败:', error);
    ElMessage.error('导入失败，请确保文件格式正确');
  }
};

// 导出成绩
const handleExportGrades = async () => {
  // 判断用户权限
  if (userStore.userRole === 'monitor') {
    // 班长直接调用专用的导出接口，不需要选择班级
    exportMonitorScores();
    console.log('班长直接导出成绩');
  } else if (userStore.userRole === 'admin' || userStore.userRole === 'superAdmin') {
    try {
      // 先获取当前筛选选中的年级
      const gradeFilter = selectedFilters.value[0];
      const grade = convertGradeToApiValue(gradeFilter); // 转换为API使用的年级值
      
      // 显示加载提示
      loading.value = true;
      
      // 调用API获取班级信息
      const response = await request.get(`/admin/comprehensiveData/getClassesByGrade/${grade}`);
      
      // 直接使用返回的数组数据，不需要检查code
      if (Array.isArray(response.data)) {
        // 更新可用班级列表
        availableClasses.value = response.data;
        // 清空之前选择的班级
        selectedClasses.value = []; 
        // 显示选择对话框
        exportDialogVisible.value = true;
        console.log('获取到班级列表：', availableClasses.value);
      } else {
        ElMessage.error('获取班级信息格式不正确');
      }
    } catch (error) {
      console.error('获取班级信息失败:', error);
      ElMessage.error('获取班级信息失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  } else {
    // 其他角色不应有导出权限
    ElMessage.warning('您没有导出成绩的权限');
  }
};

// 班长导出成绩（不需要选择班级）
const exportMonitorScores = async () => {
  try {

    // 解析当前选中的学年（新增）
    // const [startYear] = selectedAcademicYear.value.match(/\d+/g);
    // 调用班长专用的导出API
    const response = await request.get('/admin/comprehensiveData/monitorExport', {
      params: {
        academicYear: selectedYear.value // 新增学年参数
      },
      responseType: 'blob'
    });
    
    // 处理下载文件
    downloadExcelFile(response.data, '班级成绩');
    
    ElMessage.success('已成功导出您班级的成绩数据');
  } catch (error) {
    console.error('导出成绩失败:', error);
    ElMessage.error('导出失败，请稍后重试');
  }
};

// 创建下载文件的辅助函数
const downloadExcelFile = (data, fileNamePrefix) => {
  // 创建下载链接
  const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // 生成文件名
  const now = new Date();
  const fileName = `${fileNamePrefix}_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.xlsx`;
  
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 确认导出（管理员选择班级后）
const confirmExport = async () => {
  if (selectedClasses.value.length === 0) {
    ElMessage.warning('请选择至少一个班级');
    return;
  }
  
  try {
    
    // 直接使用从API获取的班级名称，不需要额外转换
    const classNames = selectedClasses.value;
    
    // 获取当前选中的年级值（研一=1，研二=2）
    const userGrade = convertGradeToApiValue(selectedFilters.value[0]);
    
    console.log('导出班级:', classNames, '年级:', userGrade);
    
    // 解析学年参数（新增）
    // const [startYear] = selectedAcademicYear.value.match(/\d+/g);

    // 调用管理员导出API
    const response = await request.get('/admin/comprehensiveData/adminExport', {
      params: {
        classes: classNames,
        userGrade: userGrade,
        academicYear: selectedYear.value // 新增学年参数
      },
      responseType: 'blob', // 指定响应类型为blob
      paramsSerializer: params => {
        // 确保数组正确序列化为后端能接收的格式
        return Object.keys(params).map(key => {
          if (Array.isArray(params[key])) {
            return params[key].map(val => `${key}=${encodeURIComponent(val)}`).join('&');
          }
          return `${key}=${encodeURIComponent(params[key])}`;
        }).join('&');
      }
    });
    
    // 处理下载文件
    downloadExcelFile(response.data, '综测成绩');
    
    const classText = selectedClasses.value.join('、');
    ElMessage.success(`已成功导出 ${classText} 班级的成绩数据`);
    exportDialogVisible.value = false;
  } catch (error) {
    console.error('导出成绩失败:', error);
    ElMessage.error('导出失败，请稍后重试');
  }
};

// 导出附件
const handleExportAttachments = async (userId) => {
  try {
    if (!userId) {
      ElMessage.warning('未找到用户ID，无法导出附件');
      return;
    }
    
    ElMessage.info('正在获取附件信息...');
    
    // 查找学生姓名
    const student = tableData.value.find(item => item.userId === userId);
    currentStudentName.value = student ? student.userName : '未知用户';
    currentStudentId.value = userId;
    
    // 调用导出附件API，传递用户ID作为路径参数
    const response = await request.get(`/admin/exportAttachment/${userId}`);
    
    if (response.data.code === 200) {
      // 保存附件数据
      currentAttachments.value = response.data.data;
      
      // 显示对话框
      attachmentDialogVisible.value = true;
      
      // 检查是否有附件
      if (!hasAnyAttachments.value) {
        ElMessage.warning('该用户没有任何附件可以导出');
      } else {
        ElMessage.success(`已成功加载 ${currentStudentName.value} 的附件数据`);
      }
    } else {
      ElMessage.error(`获取附件失败: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('导出附件失败:', error);
    ElMessage.error('获取附件信息失败，请稍后重试');
  }
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

// 下载单个附件
const downloadAttachment = (file) => {
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

// 下载某一类别的所有附件
const downloadCategoryAttachments = (category) => {
  if (!currentAttachments.value || !currentAttachments.value[category] || currentAttachments.value[category].length === 0) {
    ElMessage.warning('没有可下载的文件');
    return;
  }
  
  const fileList = currentAttachments.value[category];
  
  // 如果只有一个文件，直接下载
  if (fileList.length === 1) {
    downloadAttachment(fileList[0]);
    return;
  }
  
  // 如果有多个文件，依次下载
  const categoryNames = {
    'zyAttachment': '智育',
    'tyAttachment': '体育与美育',
    'lyAttachment': '劳育'
  };
  
  ElMessage.success(`开始下载 ${categoryNames[category]} 类别的 ${fileList.length} 个文件`);
  
  // 为避免浏览器拦截，使用延迟下载
  fileList.forEach((file, index) => {
    setTimeout(() => {
      if (file && file.url) {
        const link = document.createElement('a');
        link.href = file.url;
        link.setAttribute('download', file.name);
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

// 下载所有附件
const downloadAllAttachments = () => {
  if (!currentAttachments.value || !hasAnyAttachments.value) {
    ElMessage.warning('没有可下载的文件');
    return;
  }
  
  // 收集所有类别的附件到一个数组
  const allFiles = [];
  
  if (hasZyAttachments.value) {
    allFiles.push(...currentAttachments.value.zyAttachment);
  }
  
  if (hasTyAttachments.value) {
    allFiles.push(...currentAttachments.value.tyAttachment);
  }
  
  if (hasLyAttachments.value) {
    allFiles.push(...currentAttachments.value.lyAttachment);
  }
  
  // 如果只有一个文件，直接下载
  if (allFiles.length === 1) {
    downloadAttachment(allFiles[0]);
    return;
  }
  
  // 如果有多个文件，依次下载
  ElMessage.success(`开始下载所有 ${allFiles.length} 个附件`);
  
  // 为避免浏览器拦截，使用延迟下载
  allFiles.forEach((file, index) => {
    setTimeout(() => {
      if (file && file.url) {
        const link = document.createElement('a');
        link.href = file.url;
        link.setAttribute('download', file.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (index === allFiles.length - 1) {
          ElMessage.success(`全部 ${allFiles.length} 个文件已开始下载`);
        }
      }
    }, index * 800); // 每个文件下载间隔800毫秒，避免浏览器限制
  });
};

// 添加一个新的计算属性判断是否全选
const isAllClassesSelected = computed(() => {
  return availableClasses.value.length > 0 && 
         selectedClasses.value.length === availableClasses.value.length;
});

// 替换原来的全选函数为切换功能
const handleToggleSelectAllClasses = () => {
  if (isAllClassesSelected.value) {
    // 如果已经全选，则取消全选
    selectedClasses.value = [];
  } else {
    // 如果未全选，则全选
    selectedClasses.value = [...availableClasses.value];
  }
};
</script>

<style scoped>
.cancel-btn {
  background-color: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
}
.custom-upload {
  background: #f5f5f5;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
}
.custom-upload::before {
  content: '+';
  font-size: 24px;
  color: #909399;
  margin-bottom: 8px;
  display: inline-block;
}
.custom-upload .el-upload__text {
  margin-top: 8px;
  color: #606266;
}
</style>

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

.grade-management {
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

.select-all-button {
  margin-bottom: 12px;
}

.select-all-container {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-start;
}

.class-checkbox-group {
  margin-top: 10px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9fafc;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
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

.detail-content {
  padding: 15px;
}

.el-dialog {
  width: 400px;
  margin-top: 5vh;
  top: 5vh;
}

.el-dialog__header {
  padding: 20px;
  background-color: #f9fafc;
  border-bottom: 1px solid #ebeef5;
}

.el-dialog__title {
  font-weight: 600;
  color: #303133;
}

.el-dialog__body {
  padding: 20px;
}

.el-dialog__footer {
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
  background-color: #f9fafc;
}

.el-checkbox-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

/* 附件预览对话框样式 */
.attachment-content {
  padding: 0 0 20px 0;
}

.attachment-section {
  margin-bottom: 25px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.section-icon {
  font-size: 22px;
  margin-right: 10px;
  color: #409EFF;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.count-tag {
  margin-left: 10px;
}

.section-actions {
  margin-left: auto;
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
}

.attachment-tip {
  margin-top: 20px;
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

.dialog-header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
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

/* 新增的按钮专用样式 */
.category-download-btn {
  white-space: nowrap;
  padding: 6px 12px;
  height: auto;
  min-width: 120px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #fff !important;
}

/* 确保按钮文字颜色正确 */
.el-button--primary {
  background-color: #409EFF;
  color: #fff !important;
}

/* 文件预览对话框样式 */
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

/* 更新导出对话框样式 */
.export-dialog :deep(.el-dialog__body) {
  padding: 20px;
  max-height: 65vh;
  overflow-y: auto;
}

.class-selection-container {
  padding: 10px 20px;
}

.class-selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.selection-label {
  font-weight: 600;
  font-size: 15px;
  color: #606266;
}

.class-checkbox-wrapper {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9fafc;
}

.class-checkbox-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

/* 确保对话框中的复选框样式正确 */
.class-checkbox-group :deep(.el-checkbox) {
  margin-right: 0;
  margin-bottom: 0;
  height: 32px;
}

/* 移除原来的表单和表单项目样式影响 */
.export-dialog :deep(.el-form-item) {
  margin-bottom: 0;
}

/* 添加取消按钮的样式 */
.cancel-button {
  background-color: transparent;
  border-color: #dcdfe6;
  color: #f56c6c !important; /* 使用红色文字 */
}

.cancel-button:hover {
  background-color: #fef0f0;
  border-color: #f56c6c;
  color: #f56c6c !important;
}
</style>