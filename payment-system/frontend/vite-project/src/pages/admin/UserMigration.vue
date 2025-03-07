<template>
  <div class="user-migration-page">
    <div class="page-header">
      <h2>用户数据迁移</h2>
      <p class="header-description">将localStorage中的用户数据迁移到MySQL数据库</p>
    </div>
    
    <el-card class="migration-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>迁移操作</span>
        </div>
      </template>
      
      <div class="migration-content">
        <div class="info-section">
          <h3>迁移说明</h3>
          <div class="info-content">
            <p>本工具用于将原有存储在浏览器localStorage中的用户数据迁移到MySQL数据库。</p>
            <p>迁移过程将：</p>
            <ul>
              <li>将localStorage中的所有用户数据读取并转换为适合MySQL的格式</li>
              <li>为密码添加安全哈希处理</li>
              <li>保持原有用户ID、用户名、角色和创建时间</li>
              <li>显示详细的迁移结果报告</li>
            </ul>
            <el-alert
              title="迁移后的用户账号需要在登录页面使用原来的用户名和密码登录，迁移不会影响现有登录状态"
              type="info"
              :closable="false"
              show-icon
            />
          </div>
        </div>
        
        <div class="current-data-section">
          <h3>当前用户数据</h3>
          <el-descriptions v-if="localUsers.length > 0" border>
            <el-descriptions-item label="用户总数">{{ localUsers.length }}</el-descriptions-item>
            <el-descriptions-item label="管理员用户">{{ adminCount }}</el-descriptions-item>
            <el-descriptions-item label="客户用户">{{ clientCount }}</el-descriptions-item>
          </el-descriptions>
          
          <el-empty v-else description="未找到本地用户数据" />
          
          <div class="users-preview" v-if="localUsers.length > 0">
            <h4>用户预览：</h4>
            <el-table :data="localUsers.slice(0, 5)" style="width: 100%">
              <el-table-column prop="id" label="ID" width="60" />
              <el-table-column prop="username" label="用户名" width="120" />
              <el-table-column prop="role" label="角色" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'success'">
                    {{ scope.row.role === 'admin' ? '管理员' : '客户' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" />
            </el-table>
            <p v-if="localUsers.length > 5" class="more-users">
              (共{{ localUsers.length }}个用户, 仅显示前5个)
            </p>
          </div>
        </div>
        
        <div class="migration-actions">
          <el-button type="primary" @click="startMigration" :loading="migrating" :disabled="localUsers.length === 0">
            开始迁移
          </el-button>
        </div>
        
        <div class="migration-results" v-if="migrationResults">
          <h3>迁移结果</h3>
          <el-result
            :icon="migrationResults.success > 0 ? 'success' : 'warning'"
            :title="migrationResults.success > 0 ? '迁移成功' : '迁移失败'"
            :sub-title="`成功: ${migrationResults.success} | 失败: ${migrationResults.failed}`"
          >
            <template #extra>
              <el-button type="primary" @click="goToUserManagement">查看用户管理</el-button>
            </template>
          </el-result>
          
          <div class="results-details">
            <h4>详细结果：</h4>
            <el-table :data="migrationResults.details" style="width: 100%">
              <el-table-column prop="username" label="用户名" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
                    {{ scope.row.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="reason" label="原因" />
            </el-table>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const localUsers = ref<any[]>([])
const migrating = ref(false)
const migrationResults = ref<any>(null)

// 计算管理员和客户数量
const adminCount = computed(() => 
  localUsers.value.filter(user => user.role === 'admin').length
)

const clientCount = computed(() => 
  localUsers.value.filter(user => user.role === 'client').length
)

// 加载本地用户数据
const loadLocalUsers = () => {
  try {
    const storedUsers = localStorage.getItem('users')
    if (storedUsers) {
      const users = JSON.parse(storedUsers)
      if (Array.isArray(users)) {
        localUsers.value = users
      }
    }
  } catch (error) {
    console.error('加载本地用户数据失败:', error)
    ElMessage.error('加载本地用户数据失败')
  }
}

// 开始迁移
const startMigration = async () => {
  if (localUsers.value.length === 0) {
    ElMessage.warning('没有本地用户数据可迁移')
    return
  }
  
  try {
    // 确认迁移
    await ElMessageBox.confirm(
      '确定要将所有用户数据迁移到MySQL数据库吗？已存在的用户名将被跳过。',
      '迁移确认',
      {
        confirmButtonText: '确认迁移',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    migrating.value = true
    
    // 使用Store中的方法进行迁移
    const result = await userStore.migrateLocalUsers()
    migrationResults.value = result.results
    
    ElMessage.success(`迁移完成：成功${result.results.success}个，失败${result.results.failed}个`)
    
  } catch (error: any) {
    if (error === 'cancel') return
    
    console.error('迁移失败:', error)
    ElMessage.error(userStore.error || '迁移失败，请稍后再试')
  } finally {
    migrating.value = false
  }
}

// 跳转到用户管理页面
const goToUserManagement = () => {
  router.push('/admin/customers')
}

// 页面加载时获取本地用户数据
onMounted(() => {
  loadLocalUsers()
})
</script>

<style scoped>
.user-migration-page {
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

.header-description {
  margin: 8px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.migration-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.migration-content {
  padding: 10px 0;
}

.info-section, .current-data-section, .migration-results {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #ebeef5;
}

.info-section h3, .current-data-section h3, .migration-results h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #303133;
}

.info-content {
  color: #606266;
  line-height: 1.6;
}

.info-content ul {
  padding-left: 20px;
  margin: 10px 0;
}

.info-content p {
  margin: 8px 0;
}

.users-preview {
  margin-top: 15px;
}

.users-preview h4, .results-details h4 {
  margin: 10px 0;
  font-size: 16px;
  color: #606266;
}

.more-users {
  margin: 10px 0 0 0;
  color: #909399;
  font-size: 13px;
  text-align: right;
}

.migration-actions {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.results-details {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .user-migration-page {
    padding: 10px;
  }
  
  .page-header h2 {
    font-size: 20px;
  }
}
</style> 