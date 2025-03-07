<template>
  <div class="help-center-management">
    <div class="page-header">
      <h2>帮助中心管理</h2>
      <p class="header-desc">管理客户端显示的帮助中心内容</p>
    </div>
    
    <el-tabs v-model="activeTab" class="help-tabs">
      <!-- 联系客服 -->
      <el-tab-pane label="联系客服" name="contact">
        <div class="section-header">
          <h3>联系客服信息</h3>
          <p>设置客户可见的联系方式和客服时间</p>
        </div>
        
        <el-form label-width="120px" class="help-form">
          <el-form-item label="客服热线">
            <el-input v-model="contactInfo.hotline" placeholder="例如：400-123-4567" />
          </el-form-item>
          
          <el-form-item label="电子邮箱">
            <el-input v-model="contactInfo.email" placeholder="例如：support@example.com" />
          </el-form-item>
          
          <el-form-item label="在线客服">
            <el-input v-model="contactInfo.online" placeholder="例如：微信号或QQ号" />
          </el-form-item>
          
          <el-form-item label="工作时间">
            <el-input v-model="contactInfo.workingHours" placeholder="例如：周一至周五 9:00-18:00" />
          </el-form-item>
          
          <el-form-item label="客服说明">
            <el-input 
              v-model="contactInfo.description" 
              type="textarea" 
              rows="4" 
              placeholder="客服服务说明，如响应时间、处理流程等" 
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="saveContactInfo" :loading="saving">保存设置</el-button>
            <el-button @click="resetForm('contact')">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <!-- 常见问题 -->
      <el-tab-pane label="常见问题" name="faq">
        <div class="section-header">
          <h3>常见问题管理</h3>
          <p>添加、编辑或删除客户常见问题</p>
        </div>
        
        <div class="faq-actions">
          <el-button type="primary" @click="addFaqItem">
            <el-icon><Plus /></el-icon>
            添加问题
          </el-button>
        </div>
        
        <el-collapse v-model="activeFaqItem" class="faq-list">
          <el-empty v-if="faqItems.length === 0" description="暂无常见问题，请添加" />
          
          <el-collapse-item
            v-for="(item, index) in faqItems"
            :key="index"
            :name="index"
          >
            <template #title>
              <div class="faq-item-header">
                <span>{{ item.question }}</span>
              </div>
            </template>
            
            <div class="faq-item-content">
              <el-form label-width="80px">
                <el-form-item label="问题">
                  <el-input v-model="item.question" placeholder="输入问题" />
                </el-form-item>
                
                <el-form-item label="回答">
                  <el-input 
                    v-model="item.answer" 
                    type="textarea" 
                    rows="4" 
                    placeholder="输入回答内容" 
                  />
                </el-form-item>
                
                <el-form-item label="分类">
                  <el-select v-model="item.category" placeholder="选择分类">
                    <el-option label="充值相关" value="recharge" />
                    <el-option label="提现相关" value="withdraw" />
                    <el-option label="账户相关" value="account" />
                    <el-option label="其他问题" value="other" />
                  </el-select>
                </el-form-item>
                
                <el-form-item>
                  <el-button type="danger" @click="removeFaqItem(index)">
                    <el-icon><Delete /></el-icon>
                    删除问题
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-collapse-item>
        </el-collapse>
        
        <div class="form-actions">
          <el-button type="primary" @click="saveFaqItems" :loading="saving">保存全部问题</el-button>
          <el-button @click="resetForm('faq')">重置</el-button>
        </div>
      </el-tab-pane>
      
      <!-- 使用教程 -->
      <el-tab-pane label="使用教程" name="tutorials">
        <div class="section-header">
          <h3>使用教程管理</h3>
          <p>管理系统使用教程内容</p>
        </div>
        
        <div class="tutorial-actions">
          <el-button type="primary" @click="addTutorialItem">
            <el-icon><Plus /></el-icon>
            添加教程
          </el-button>
        </div>
        
        <el-table
          :data="tutorialItems"
          border
          class="tutorial-table"
          :empty-text="'暂无教程内容，请添加'"
        >
          <el-table-column label="序号" type="index" width="60" />
          
          <el-table-column label="标题" min-width="150">
            <template #default="scope">
              <el-input v-model="scope.row.title" placeholder="输入教程标题" />
            </template>
          </el-table-column>
          
          <el-table-column label="分类" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.category" placeholder="选择分类">
                <el-option label="充值教程" value="recharge" />
                <el-option label="提现教程" value="withdraw" />
                <el-option label="账户管理" value="account" />
                <el-option label="其他" value="other" />
              </el-select>
            </template>
          </el-table-column>
          
          <el-table-column label="内容" min-width="300">
            <template #default="scope">
              <el-input 
                v-model="scope.row.content" 
                type="textarea" 
                rows="3" 
                placeholder="输入教程内容" 
              />
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button 
                type="danger" 
                size="small" 
                @click="removeTutorialItem(scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="form-actions">
          <el-button type="primary" @click="saveTutorialItems" :loading="saving">保存全部教程</el-button>
          <el-button @click="resetForm('tutorials')">重置</el-button>
        </div>
      </el-tab-pane>
      
      <!-- 预览 -->
      <el-tab-pane label="预览效果" name="preview">
        <div class="section-header">
          <h3>预览效果</h3>
          <p>查看帮助中心在客户端的显示效果</p>
        </div>
        
        <div class="preview-container">
          <el-tabs class="preview-tabs">
            <el-tab-pane label="联系客服" name="contact-preview">
              <el-card class="preview-card">
                <template #header>
                  <div class="card-header">
                    <h4>联系客服</h4>
                  </div>
                </template>
                
                <div class="preview-content">
                  <div class="contact-item">
                    <strong>客服热线：</strong>
                    <span>{{ contactInfo.hotline || '暂无' }}</span>
                  </div>
                  <div class="contact-item">
                    <strong>电子邮箱：</strong>
                    <span>{{ contactInfo.email || '暂无' }}</span>
                  </div>
                  <div class="contact-item">
                    <strong>在线客服：</strong>
                    <span>{{ contactInfo.online || '暂无' }}</span>
                  </div>
                  <div class="contact-item">
                    <strong>工作时间：</strong>
                    <span>{{ contactInfo.workingHours || '暂无' }}</span>
                  </div>
                  <div class="contact-item" v-if="contactInfo.description">
                    <strong>客服说明：</strong>
                    <p>{{ contactInfo.description }}</p>
                  </div>
                </div>
              </el-card>
            </el-tab-pane>
            
            <el-tab-pane label="常见问题" name="faq-preview">
              <el-card class="preview-card">
                <template #header>
                  <div class="card-header">
                    <h4>常见问题</h4>
                  </div>
                </template>
                
                <div class="preview-content">
                  <el-collapse v-if="faqItems.length > 0">
                    <el-collapse-item
                      v-for="(item, index) in faqItems"
                      :key="index"
                      :title="item.question"
                    >
                      <div v-html="item.answer.replace(/\n/g, '<br>')"></div>
                    </el-collapse-item>
                  </el-collapse>
                  <el-empty v-else description="暂无常见问题" />
                </div>
              </el-card>
            </el-tab-pane>
            
            <el-tab-pane label="使用教程" name="tutorials-preview">
              <el-card class="preview-card">
                <template #header>
                  <div class="card-header">
                    <h4>使用教程</h4>
                  </div>
                </template>
                
                <div class="preview-content">
                  <el-collapse v-if="tutorialItems.length > 0">
                    <el-collapse-item
                      v-for="(item, index) in tutorialItems"
                      :key="index"
                      :title="item.title"
                    >
                      <div v-html="item.content.replace(/\n/g, '<br>')"></div>
                    </el-collapse-item>
                  </el-collapse>
                  <el-empty v-else description="暂无使用教程" />
                </div>
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';

// 当前激活的标签页
const activeTab = ref('contact');

// 保存状态
const saving = ref(false);

// 联系客服信息
const contactInfo = reactive({
  hotline: '',
  email: '',
  online: '',
  workingHours: '',
  description: ''
});

// FAQ 相关
const faqItems = ref<Array<{question: string, answer: string, category: string}>>([]);
const activeFaqItem = ref<number[]>([]);

// 教程相关
const tutorialItems = ref<Array<{title: string, content: string, category: string}>>([]);

// 从 localStorage 加载数据
const loadHelpCenterData = () => {
  try {
    // 加载联系客服信息
    const savedContactInfo = localStorage.getItem('helpCenter_contact');
    if (savedContactInfo) {
      const parsed = JSON.parse(savedContactInfo);
      Object.assign(contactInfo, parsed);
    }
    
    // 加载常见问题
    const savedFaqItems = localStorage.getItem('helpCenter_faq');
    if (savedFaqItems) {
      faqItems.value = JSON.parse(savedFaqItems);
    }
    
    // 加载使用教程
    const savedTutorialItems = localStorage.getItem('helpCenter_tutorials');
    if (savedTutorialItems) {
      tutorialItems.value = JSON.parse(savedTutorialItems);
    }
  } catch (error) {
    console.error('加载帮助中心数据失败:', error);
    ElMessage.error('加载帮助中心数据失败');
  }
};

// 保存联系客服信息
const saveContactInfo = async () => {
  saving.value = true;
  try {
    localStorage.setItem('helpCenter_contact', JSON.stringify(contactInfo));
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟API调用
    ElMessage.success('联系客服信息保存成功');
  } catch (error) {
    console.error('保存联系客服信息失败:', error);
    ElMessage.error('保存联系客服信息失败');
  } finally {
    saving.value = false;
  }
};

// 添加FAQ项目
const addFaqItem = () => {
  faqItems.value.push({
    question: '',
    answer: '',
    category: 'other'
  });
  
  // 自动展开新添加的项目
  activeFaqItem.value = [faqItems.value.length - 1];
};

// 删除FAQ项目
const removeFaqItem = (index: number) => {
  ElMessageBox.confirm('确定要删除这个问题吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    faqItems.value.splice(index, 1);
    ElMessage.success('问题已删除');
  }).catch(() => {});
};

// 保存FAQ项目
const saveFaqItems = async () => {
  // 验证数据
  const emptyQuestions = faqItems.value.some(item => !item.question.trim());
  if (emptyQuestions) {
    ElMessage.warning('问题标题不能为空，请检查');
    return;
  }
  
  saving.value = true;
  try {
    localStorage.setItem('helpCenter_faq', JSON.stringify(faqItems.value));
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟API调用
    ElMessage.success('常见问题保存成功');
  } catch (error) {
    console.error('保存常见问题失败:', error);
    ElMessage.error('保存常见问题失败');
  } finally {
    saving.value = false;
  }
};

// 添加教程项目
const addTutorialItem = () => {
  tutorialItems.value.push({
    title: '',
    content: '',
    category: 'other'
  });
};

// 删除教程项目
const removeTutorialItem = (index: number) => {
  ElMessageBox.confirm('确定要删除这个教程吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tutorialItems.value.splice(index, 1);
    ElMessage.success('教程已删除');
  }).catch(() => {});
};

// 保存教程项目
const saveTutorialItems = async () => {
  // 验证数据
  const emptyTitles = tutorialItems.value.some(item => !item.title.trim());
  if (emptyTitles) {
    ElMessage.warning('教程标题不能为空，请检查');
    return;
  }
  
  saving.value = true;
  try {
    localStorage.setItem('helpCenter_tutorials', JSON.stringify(tutorialItems.value));
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟API调用
    ElMessage.success('使用教程保存成功');
  } catch (error) {
    console.error('保存使用教程失败:', error);
    ElMessage.error('保存使用教程失败');
  } finally {
    saving.value = false;
  }
};

// 重置表单
const resetForm = (type: string) => {
  ElMessageBox.confirm('确定要重置吗？未保存的更改将丢失', '重置确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if (type === 'contact') {
      loadHelpCenterData(); // 重新加载联系人信息
    } else if (type === 'faq') {
      const savedFaqItems = localStorage.getItem('helpCenter_faq');
      if (savedFaqItems) {
        faqItems.value = JSON.parse(savedFaqItems);
      } else {
        faqItems.value = [];
      }
    } else if (type === 'tutorials') {
      const savedTutorialItems = localStorage.getItem('helpCenter_tutorials');
      if (savedTutorialItems) {
        tutorialItems.value = JSON.parse(savedTutorialItems);
      } else {
        tutorialItems.value = [];
      }
    }
    ElMessage.success('已重置');
  }).catch(() => {});
};

// 生命周期钩子
onMounted(() => {
  loadHelpCenterData();
});
</script>

<style scoped>
.help-center-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.header-desc {
  margin: 8px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.help-tabs {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.section-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.section-header h3 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 18px;
}

.section-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.help-form {
  max-width: 800px;
}

.faq-actions, .tutorial-actions {
  margin-bottom: 20px;
}

.faq-list {
  margin-bottom: 20px;
}

.faq-item-header {
  display: flex;
  align-items: center;
}

.faq-item-content {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

.tutorial-table {
  margin-bottom: 20px;
}

/* 预览部分样式 */
.preview-container {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
}

.preview-card {
  margin-bottom: 20px;
}

.preview-card .card-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.preview-content {
  padding: 10px 0;
}

.contact-item {
  margin-bottom: 12px;
}

.contact-item strong {
  color: #606266;
}

.contact-item p {
  margin: 8px 0 0 0;
  white-space: pre-line;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .help-tabs {
    padding: 10px;
  }
  
  .preview-container {
    padding: 10px;
  }
  
  .help-form {
    max-width: 100%;
  }
  
  :deep(.el-form-item__label) {
    float: none;
    display: block;
    text-align: left;
    margin-bottom: 8px;
  }
  
  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}
</style> 