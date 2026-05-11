<template>
  <PageWrapper>
    <div class="workbench">
      <h1 class="page-title">工作台</h1>
      
      <!-- 顶部区域：数据统计和报告状态 -->
      <div class="top-container">
        <!-- 数据统计区域 - 添加点击事件和可点击样式 -->
        <el-card class="stats-card clickable-card" @click="navigateToGradeReview">
          <template #header>
            <div class="card-header">
              <span class="header-title">数据审核记录</span>
              <el-icon class="navigate-icon"><ArrowRight /></el-icon>
            </div>
          </template>

          <div class="data-statistics">
            <div class="data-item">
              <div class="data-value">{{ unapprovedCount }}</div>
              <div class="data-label">待审核记录</div>
            </div>
            <div class="data-item">
              <div class="data-value">{{ approvedByMonitorCount }}</div>
              <div class="data-label">班长已审核记录</div>
            </div>
          </div>
        </el-card>

        <!-- 成绩数据 - 添加点击事件和可点击样式 -->
        <el-card class="grade-card clickable-card" @click="navigateToGradeManagement">
          <template #header>
            <div class="card-header">
              <span class="header-title">已确认成绩学生数量</span>
              <el-icon class="navigate-icon"><ArrowRight /></el-icon>
            </div>
          </template>

          <div class="data-item final-grade-item">
            <div class="final-grade-container">
              <template v-if="Object.keys(gradeSubmitted).length > 0">
                <!-- 改为行内块级元素并排显示 -->
                <div 
                  v-for="([gradeName, count], index) in Object.entries(gradeSubmitted)"
                  :key="gradeName"
                  class="final-grade-item"
                >
                  <div class="data-value">{{ count }}</div>
                  <div class="data-label">{{ gradeName.replace('级', '级 ') }}</div>
                  <!-- 添加间隔线（最后一个不显示） -->
                  <div v-if="index < Object.keys(gradeSubmitted).length - 1" class="divider"></div>
                </div>
              </template>

              <div 
                v-else
                class="empty-tip"
              >
                <el-icon><InfoFilled /></el-icon>
                正在加载年级数据...
              </div>
            </div>
          </div>
        </el-card>

        
        
        <!-- 成绩报告区域 - 新增 -->
        <el-card class="reports-card">
          <div class="reports-header">
            <span class="reports-title">成绩报告</span>
            <el-button 
              v-if="!hasAnyReport" 
              type="primary" 
              size="small" 
              @click="generateAllReports" 
              :loading="generatingReports"
            >
              {{ generatingReports ? '生成中...' : '生成所有报告' }}
            </el-button>
          </div>
          
          <div class="reports-container">
            <!-- 智育成绩报告 -->
            <div class="report-item">
              <el-tooltip content="智育成绩报告" placement="top">
                <el-button
                  :type="reportStatus.intellectual ? 'success' : 'primary'"
                  circle
                  @click="reportStatus.intellectual ? downloadReport('intellectual') : generateReport('intellectual')"
                  :loading="generatingIntellectual"
                >
                  <el-icon>
                    <component :is="reportStatus.intellectual ? 'Document' : 'DocumentAdd'"></component>
                  </el-icon>
                </el-button>
              </el-tooltip>
              <div class="report-label">智育</div>
            </div>
            
            <!-- 体育与美育成绩报告 -->
            <div class="report-item">
              <el-tooltip content="体育与美育成绩报告" placement="top">
                <el-button
                  :type="reportStatus.sports ? 'warning' : 'primary'"
                  circle
                  @click="reportStatus.sports ? downloadReport('sports') : generateReport('sports')"
                  :loading="generatingSports"
                >
                  <el-icon>
                    <component :is="reportStatus.sports ? 'Document' : 'DocumentAdd'"></component>
                  </el-icon>
                </el-button>
              </el-tooltip>
              <div class="report-label">体育与美育</div>
            </div>
            
            <!-- 劳育成绩报告 -->
            <div class="report-item">
              <el-tooltip content="劳育成绩报告" placement="top">
                <el-button
                  :type="reportStatus.labor ? 'danger' : 'primary'"
                  circle
                  @click="reportStatus.labor ? downloadReport('labor') : generateReport('labor')"
                  :loading="generatingLabor"
                >
                  <el-icon>
                    <component :is="reportStatus.labor ? 'Document' : 'DocumentAdd'"></component>
                  </el-icon>
                </el-button>
              </el-tooltip>
              <div class="report-label">劳育</div>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 主要内容区域：图表和词云 -->
      <div class="main-content">
        <!-- 左侧：混合图表展示 -->
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">近一周学生申请数据变化</span>
              <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="header-tabs">
                <el-tab-pane label="全部" name="all"></el-tab-pane>
                <el-tab-pane label="智育" name="intellectual"></el-tab-pane>
                <el-tab-pane label="体育与美育" name="sports_and_aesthetics"></el-tab-pane>
                <el-tab-pane label="劳育" name="labor_education"></el-tab-pane>
              </el-tabs>
            </div>
          </template>
          <div ref="chartRef" class="chart-container"></div>
        </el-card>
        
        <!-- 右侧：词云展示 -->
        <el-card class="wordcloud-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">热门申请 TOP5</span>
            </div>
          </template>
          <div ref="wordcloudRef" class="wordcloud-container"></div>
        </el-card>
      </div>
    </div>
  </PageWrapper>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import { ElMessage } from 'element-plus';
import { Refresh, Download, Document, DocumentAdd, ArrowRight } from '@element-plus/icons-vue';
import PageWrapper from '../components/common/PageWrapper.vue';
import request from '../utils/request';  // 使用项目中现有的请求工具
import { useWorkbenchStore } from '../stores/workbench'; // 引入工作台 store
import { useRouter } from 'vue-router'; // 导入router

// 获取路由实例
const router = useRouter();

// 图表区域
const chartRef = ref(null);
const activeTab = ref('all');
let chartInstance = null;

// 获取工作台 store
const workbenchStore = useWorkbenchStore();

// 数据统计区域 - 从 store 获取
const unapprovedCount = computed(() => workbenchStore.statistics.underReview);
const approvedByMonitorCount = computed(() => workbenchStore.statistics.monitorReview);
const finalGradesMaster1 = computed(() => workbenchStore.statistics.firstGradeSubmitted);
const finalGradesMaster2 = computed(() => workbenchStore.statistics.secondGradeSubmitted);
// 修复：添加默认值处理
const gradeSubmitted = computed(() => workbenchStore.statistics.gradeSubmitted || {});

// 词云区域
const wordcloudRef = ref(null);
let wordcloudInstance = null;

// 接口返回的原始图表数据 - 现在从 store 获取，仅组件内保留一个副本
const chartRawData = computed(() => workbenchStore.chartData);

// 报告状态 - 修改为多报告类型
const reportStatus = ref({
  intellectual: false, // 智育报告
  sports: false,       // 体育与美育报告
  labor: false,        // 劳育报告
  lastUpdated: null,
  description: '您可以点击按钮生成对应类型的报告',
  type: 'info'
});

// 检查是否有任何报告已生成
const hasAnyReport = computed(() => {
  return reportStatus.value.intellectual || 
         reportStatus.value.sports || 
         reportStatus.value.labor;
});

// 报告生成状态
const generatingReports = ref(false);
const generatingIntellectual = ref(false);
const generatingSports = ref(false);
const generatingLabor = ref(false);

// 处理标签切换
const handleTabClick = (tab) => {
  updateChart(tab.paneName);
};

// 获取工作台所有数据 - 使用 store 的方法
const fetchWorkbenchData = async () => {
  try {
    console.log('正在从 store 获取工作台数据...');
    const success = await workbenchStore.fetchWorkbenchData();
    
    if (success) {
      console.log('工作台数据获取成功');
      
      // 更新图表
      updateChart(activeTab.value);
      
      // 更新词云
      updateWordcloud();
      
      return true;
    } else {
      console.error('工作台数据获取失败');
      ElMessage.error('获取工作台数据失败，请稍后重试');
      return false;
    }
  } catch (error) {
    console.error('获取工作台数据失败:', error);
    ElMessage.error('获取工作台数据失败：' + (error?.message || '请稍后重试'));
    return false;
  }
};

// 强制刷新数据
const refreshData = async () => {
  ElMessage.info('正在刷新工作台数据...');
  const success = await workbenchStore.refreshData();
  
  if (success) {
    updateChart(activeTab.value);
    updateWordcloud();
    ElMessage.success('工作台数据已更新');
  } else {
    ElMessage.error('刷新工作台数据失败');
  }
};

// 更新图表，根据类型选择不同的数据源
const updateChart = (type = 'all') => {
  if (!chartInstance) {
    console.warn('图表实例未初始化');
    return;
  }
  
  // 使用 store 的 getter 获取格式化后的图表数据
  const { dates, applications, approvals } = workbenchStore.formattedChartData(type);
  
  if (dates.length === 0 || applications.length === 0) {
    console.warn('图表数据为空，类型:', type);
    return;
  }
  
  console.log(`图表数据(${type}):`, { dates, applications, approvals });
  
  const option = {
    backgroundColor: '#fff',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      confine: true,
      enterable: false,
      hideDelay: 0,
      position: function (pos, params, el, elRect, size) {
        const obj = { top: 10 };
        obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
        return obj;
      },
      extraCssText: 'box-shadow: 0 0 8px rgba(0, 0, 0, 0.3); z-index: 100;'
    },
    animation: false,
    legend: {
      data: ['申请数量', '申请趋势'],
      textStyle: {
        color: '#606266'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 30,
        fontSize: 10,
        color: '#606266'
      },
      axisLine: {
        lineStyle: {
          color: '#dcdfe6'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#606266'
      },
      axisLine: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#ebeef5'
        }
      }
    },
    series: [
      {
        name: '申请数量',
        type: 'bar',
        data: applications,
        itemStyle: {
          color: '#5470C6'
        },
        emphasis: {
          focus: 'series'
        },
        barMaxWidth: 40
      },
      {
        name: '申请趋势',
        type: 'line',
        data: approvals,
        itemStyle: {
          color: '#91CC75'
        },
        emphasis: {
          focus: 'series'
        },
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 2
        }
      }
    ]
  };
  
  try {
    // 清除之前可能存在的tooltip
    chartInstance.dispatchAction({
      type: 'hideTip'
    });
    
    // 应用新配置
    chartInstance.setOption(option, true);
  } catch (error) {
    console.error('更新图表失败:', error);
  }
};

// 将接口返回的词云数据转换为echarts需要的格式
const updateWordcloud = () => {
  if (!wordcloudInstance) {
    console.warn('词云实例未初始化');
    return;
  }
  
  // 使用 store 的 getter 获取格式化后的热门话题数据
  const data = workbenchStore.formattedHotTopics;
  
  if (data.length === 0) {
    console.warn('词云数据为空');
    return;
  }
  
  console.log('词云数据:', data);
  
  try {
    const option = {
      series: [{
        type: 'wordCloud',
        shape: 'circle',
        left: 'center',
        top: 'center',
        width: '90%',
        height: '90%',
        right: null,
        bottom: null,
        sizeRange: [12, 30],
        rotationRange: [-45, 45],
        rotationStep: 15,
        gridSize: 8,
        drawOutOfBound: false,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: function () {
            return 'rgb(' + [
              Math.round(Math.random() * 160 + 20),
              Math.round(Math.random() * 160 + 20),
              Math.round(Math.random() * 160 + 20)
            ].join(',') + ')';
          }
        },
        emphasis: {
          textStyle: {
            shadowBlur: 10,
            shadowColor: '#333'
          }
        },
        data: data
      }]
    };
    
    wordcloudInstance.setOption(option);
  } catch (error) {
    console.error('更新词云失败:', error);
  }
};

// 获取报告状态
const fetchReportStatus = async () => {
  try {
    // 暂时保留模拟数据
    reportStatus.value = {
      intellectual: Math.random() > 0.5,
      sports: Math.random() > 0.7,
      labor: Math.random() > 0.6,
      lastUpdated: new Date().toLocaleString(),
      description: '您可以点击按钮生成对应类型的报告',
      type: 'info'
    };
  } catch (error) {
    console.error('获取报告状态失败:', error);
    ElMessage.error('获取报告状态失败，请稍后重试');
  }
};

// 生成单个报告
const generateReport = async (type) => {
  // 设置对应类型的加载状态
  if (type === 'intellectual') {
    generatingIntellectual.value = true;
  } else if (type === 'sports') {
    generatingSports.value = true;
  } else if (type === 'labor') {
    generatingLabor.value = true;
  }
  
  try {
    // 模拟接口调用
    // await request.post(`http://8.137.101.41:8088/generate-report/${type}`);
    
    // 模拟生成报告过程
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 更新报告状态
    reportStatus.value[type] = true;
    reportStatus.value.lastUpdated = new Date().toLocaleString();
    
    ElMessage.success(`${getReportTypeName(type)}报告生成成功`);
  } catch (error) {
    console.error(`生成${type}报告失败:`, error);
    ElMessage.error(`生成${getReportTypeName(type)}报告失败，请稍后重试`);
  } finally {
    // 重置加载状态
    if (type === 'intellectual') {
      generatingIntellectual.value = false;
    } else if (type === 'sports') {
      generatingSports.value = false;
    } else if (type === 'labor') {
      generatingLabor.value = false;
    }
  }
};

// 生成所有报告
const generateAllReports = async () => {
  generatingReports.value = true;
  
  try {
    // 模拟接口调用
    // await request.post('http://8.137.101.41:8088/generate-all-reports');
    
    // 模拟生成报告过程
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // 更新所有报告状态
    reportStatus.value.intellectual = true;
    reportStatus.value.sports = true;
    reportStatus.value.labor = true;
    reportStatus.value.lastUpdated = new Date().toLocaleString();
    
    ElMessage.success('所有报告生成成功');
  } catch (error) {
    console.error('生成所有报告失败:', error);
    ElMessage.error('生成所有报告失败，请稍后重试');
  } finally {
    generatingReports.value = false;
  }
};

// 下载报告
const downloadReport = (type) => {
  ElMessage.success(`${getReportTypeName(type)}报告下载已开始`);
  // 实际项目中应该调用下载接口
  // window.open(`http://8.137.101.41:8088/download-report/${type}`, '_blank');
};

// 获取报告类型名称
const getReportTypeName = (type) => {
  switch (type) {
    case 'intellectual':
      return '智育成绩';
    case 'sports':
      return '体育与美育成绩';
    case 'labor':
      return '劳育成绩';
    default:
      return '';
  }
};

// 定时刷新数据的定时器
let refreshTimer = null;

// 使用单个resize事件处理器以优化性能
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
  if (wordcloudInstance) {
    wordcloudInstance.resize();
  }
};

// 处理滚动事件，确保tooltip不会残留
const handleScroll = () => {
  if (chartInstance) {
    // 当页面滚动时，隐藏所有tooltip
    chartInstance.dispatchAction({
      type: 'hideTip'
    });
    
    // 强制重绘图表，清除可能的视觉残留
    chartInstance.resize();
  }
};

// 鼠标离开图表的处理函数
const handleChartMouseLeave = () => {
  if (chartInstance) {
    chartInstance.dispatchAction({
      type: 'hideTip'
    });
  }
};

// 定义自动查询方法
const fetchDashboardData = async () => {
  try {
    // 这里编写您的查询逻辑
    // 例如：获取用户统计数据、最近活动、待处理任务等
    
    // 调用API示例
    // const response = await request.get('http://8.137.101.41:8088/dashboard/stats');
    // dashboardData.value = response.data.data;
    
    console.log('自动查询工作台数据');
  } catch (error) {
    console.error('查询工作台数据失败:', error);
  }
};

// 添加导航方法
const navigateToGradeReview = () => {
  router.push('/grade-review');
};

const navigateToGradeManagement = () => {
  router.push('/grade-management');
};

onMounted(async () => {
  try {
    console.log('工作台组件开始初始化...');
    
    // 初始化图表
    if (chartRef.value) {
      console.log('初始化图表实例...');
      const chartDom = chartRef.value;
      
      // 使用特定的渲染模式初始化
      chartInstance = echarts.init(chartDom, null, {
        renderer: 'canvas',
        useDirtyRect: false
      });
      
      // 等待DOM更新
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('图表实例已创建');
    } else {
      console.warn('图表DOM元素不存在');
    }
    
    // 初始化词云
    if (wordcloudRef.value) {
      console.log('初始化词云实例...');
      wordcloudInstance = echarts.init(wordcloudRef.value);
      console.log('词云实例已创建');
      
      // 为词云也添加同样的鼠标离开事件
      wordcloudRef.value.addEventListener('mouseleave', () => {
        if (wordcloudInstance) {
          wordcloudInstance.dispatchAction({
            type: 'hideTip'
          });
        }
      });
    } else {
      console.warn('词云DOM元素不存在');
    }
    
    // 使用单个事件监听器处理resize
    window.addEventListener('resize', handleResize);
    
    // 添加滚动事件监听器 - 使用捕获阶段和被动监听
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    
    // 添加点击事件监听器，确保点击页面其他区域时tooltip消失
    document.addEventListener('click', (event) => {
      if (chartRef.value && !chartRef.value.contains(event.target)) {
        if (chartInstance) {
          chartInstance.dispatchAction({
            type: 'hideTip'
          });
        }
      }
    });
    
    if (chartRef.value) {
      // 添加鼠标离开图表时隐藏tooltip的事件
      chartRef.value.addEventListener('mouseleave', handleChartMouseLeave);
      
      // 添加鼠标移动事件，确保tooltip正确显示
      chartRef.value.addEventListener('mousemove', (event) => {
        // 重新触发tooltip
        const rect = chartRef.value.getBoundingClientRect();
        if (event.clientX > rect.left && event.clientX < rect.right &&
            event.clientY > rect.top && event.clientY < rect.bottom) {
          // 鼠标在图表区域内，确保tooltip正确显示
        } else {
          // 鼠标不在图表区域，隐藏tooltip
          handleChartMouseLeave();
        }
      });
    }
    
    // 获取初始数据
    console.log('开始获取工作台数据...');
    const success = await fetchWorkbenchData();
    if (success) {
      console.log('工作台数据获取成功');
    } else {
      console.error('工作台数据获取失败');
    }
    
    await fetchReportStatus();
    
    // 设置定时刷新数据 - 使用 store 的数据过期检查，仅在需要时刷新
    refreshTimer = setInterval(async () => {
      if (workbenchStore.isDataStale) {
        console.log('数据已过期，正在刷新...');
        await fetchWorkbenchData();
      }
    }, 60 * 1000); // 每分钟检查一次
    
    // 自动触发查询
    fetchDashboardData();
    
    console.log('工作台组件初始化完成');
  } catch (error) {
    console.error('初始化工作台组件失败:', error);
    ElMessage.error('加载工作台数据失败，请刷新页面重试');
  }
});

onUnmounted(() => {
  // 销毁图表实例
  if (chartInstance) {
    // 先隐藏tooltip，避免残留
    chartInstance.dispatchAction({
      type: 'hideTip'
    });
    chartInstance.dispose();
    chartInstance = null;
  }
  
  // 销毁词云实例
  if (wordcloudInstance) {
    wordcloudInstance.dispose();
    wordcloudInstance = null;
  }
  
  // 清除定时器
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  
  // 移除事件监听器
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll, { capture: true });
  
  // 移除DOM事件监听器
  if (chartRef.value) {
    chartRef.value.removeEventListener('mouseleave', handleChartMouseLeave);
    // 移除其他可能添加的事件监听器
    chartRef.value.removeEventListener('mousemove', () => {});
  }
  
  if (wordcloudRef.value) {
    wordcloudRef.value.removeEventListener('mouseleave', () => {});
  }
  
  document.removeEventListener('click', () => {});
});
</script>

<style scoped>
.workbench {
  padding-bottom: 40px;
  position: relative;
  z-index: 1;
}

.page-title {
  color: #00468C;
  font-size: 1.5rem;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #00468C;
}

/* 顶部容器 */
.top-container {
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
  display: flex;
  gap: 20px;
}

/* 数据统计卡片 */
.stats-card {
  flex: 3;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
}

/* 成绩卡片 */
.grade-card{
  flex: 4;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
}

/* 报告卡片 */
.reports-card {
  flex: 3;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.reports-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.reports-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.report-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.report-label {
  font-size: 12px;
  color: #606266;
}

/* 主内容区域 - 使用Flex布局 */
.main-content {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

/* 图表卡片 - 占据左侧70% */
.chart-card {
  flex: 7; /* 占据70% */
  border-radius: 10px;
  overflow: hidden;
  position: relative; /* 确保内部元素定位正确 */
  isolation: isolate; /* 创建新的层叠上下文 */
  transform: translate3d(0, 0, 0); /* 强制硬件加速，减少视觉故障 */
  will-change: transform; /* 提示浏览器该元素将会改变 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 完全重新设计图表容器，隔离层叠上下文 */
.chart-container {
  height: 400px;
  width: 100%;
  position: relative; /* 确保tooltip相对于这个容器定位 */
  z-index: 1; /* 确保正确的层叠顺序 */
  background-color: #fff; /* 确保有背景色 */
  transform: translateZ(0); /* 创建独立的层叠上下文 */
  backface-visibility: hidden; /* 减少渲染问题 */
  -webkit-backface-visibility: hidden;
  -webkit-transform: translateZ(0) scale(1.0, 1.0);
  overflow: hidden; /* 确保内容不溢出 */
}

/* 添加一个清除浮动的伪元素，防止高度塌陷 */
.chart-container::after {
  content: '';
  display: block;
  clear: both;
}

/* 添加一个覆盖层，防止互动问题 */
.chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0; /* 正常情况下不显示 */
  background-color: rgba(255, 255, 255, 0.01);
  pointer-events: none;
  z-index: 3;
  transition: height 0.2s;
}

/* 在滚动时显示覆盖层 */
.workbench:has(.chart-card:hover) .chart-card::before {
  height: 0; /* 保持不显示 */
}

/* 词云卡片 - 占据右侧30% */
.wordcloud-card {
  flex: 3; /* 占据30% */
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  transform: translate3d(0, 0, 0);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.wordcloud-container {
  height: 400px; /* 与图表保持相同高度 */
  width: 100%;
  position: relative;
  z-index: 1;
  background-color: #fff;
  transform: translateZ(0);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.header-title {
  font-weight: bold;
  color: #303133;
}

.header-tabs {
  margin-left: auto;
}

/* 数据统计样式 */
.data-statistics {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
}

.data-item {
  text-align: center;
  flex: 1;
}

/* 新增 - 最终成绩项样式 */
.final-grade-item {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
}

/* 修改容器样式 */
.final-grade-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  overflow-x: auto; /* 允许横向滚动 */
  white-space: nowrap;
  gap: 40px;
  padding: 10px 0;
}

/* 移除原有框样式 */
.final-grade-item {
  display: inline-block;
  text-align: center;
  padding: 0 15px;
}

/* 调整数据样式 */
.data-value {
  font-size: 24px;
  color: #00468C;
}

.data-label {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

/* 优化空状态显示 */
.empty-tip {
  width: 100%;
  text-align: center;
  padding: 20px 0;
}


.data-value {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
  line-height: 1.2;
}

.data-label {
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .top-container {
    flex-direction: column;
  }
  
  .main-content {
    flex-direction: column;
  }
  
  .chart-card, .wordcloud-card {
    width: 100%;
  }
  
  .wordcloud-container {
    height: 300px;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .final-grade-container {
    gap: 20px;
    justify-content: center;
  }
  
  .final-grade-section {
    min-width: 100px;
    padding: 8px;
  }
}

@media (max-width: 768px) {
  .data-statistics,
  .reports-container {
    flex-wrap: wrap;
  }
  
  .data-item,
  .report-item {
    width: 50%;
    margin-bottom: 15px;
  }
}

/* 添加可点击卡片的样式 */
.clickable-card {
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.clickable-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.clickable-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  transform: scaleX(0);
  transition: transform 0.3s;
  transform-origin: left;
}

.clickable-card:hover::after {
  transform: scaleX(1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.navigate-icon {
  color: #909399;
  transition: all 0.3s;
  opacity: 0.5;
}

.clickable-card:hover .navigate-icon {
  color: #409EFF;
  transform: translateX(5px);
  opacity: 1;
}
</style> 