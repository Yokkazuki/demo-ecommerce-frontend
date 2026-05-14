<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { dashboardApi, type DashboardStats } from '@/api/dashboard'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const stats = ref<DashboardStats | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await dashboardApi.getStats()
    stats.value = res.data
  } finally {
    loading.value = false
  }
})

function statusLabel(key: string): string {
  const map: Record<string, string> = {
    PENDING: t('order.statusPending'),
    PAID: t('order.statusPaid'),
    SHIPPED: t('order.statusShipped'),
    COMPLETED: t('order.statusCompleted'),
    CANCELLED: t('order.statusCancelled')
  }
  return map[key] || key
}
</script>

<template>
  <div class="dashboard">
    <h1>{{ t('admin.dashboard') }}</h1>

    <div v-if="loading" style="text-align: center; padding: 80px">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
    </div>

    <template v-else-if="stats">
      <!-- 統計卡片 -->
      <el-row :gutter="20" class="stat-cards">
        <el-col :xs="12" :sm="6">
          <el-card class="stat-card">
            <div class="stat-icon revenue">💰</div>
            <div class="stat-value">${{ stats.totalRevenue.toLocaleString() }}</div>
            <div class="stat-label">{{ t('admin.totalRevenue') }}</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card class="stat-card">
            <div class="stat-icon orders">📦</div>
            <div class="stat-value">{{ stats.totalOrders }}</div>
            <div class="stat-label">{{ t('admin.totalOrders') }}</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card class="stat-card">
            <div class="stat-icon products">🛍️</div>
            <div class="stat-value">{{ stats.activeProducts }} / {{ stats.totalProducts }}</div>
            <div class="stat-label">{{ t('admin.activeProducts') }}</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card class="stat-card">
            <div class="stat-icon users">👥</div>
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">{{ t('admin.totalUsers') }}</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 訂單狀態統計 -->
      <el-card style="margin-top: 24px">
        <template #header>
          <span>{{ t('admin.orderStatusStats') }}</span>
        </template>
        <el-row :gutter="16">
          <el-col :xs="12" :sm="4" v-for="(count, key) in stats.orderStatusCounts" :key="key">
            <div class="status-item">
              <div class="status-count">{{ count }}</div>
              <div class="status-name">{{ statusLabel(key) }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1100px;
}

h1 {
  font-size: var(--font-h1);
  margin-bottom: 24px;
}

.stat-cards {
  margin-bottom: 8px;
}

.stat-card {
  text-align: center;
  margin-bottom: 16px;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: var(--font-price-lg);
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: var(--font-small);
  color: #909399;
  margin-top: 4px;
}

.status-item {
  text-align: center;
  padding: 16px 0;
}

.status-count {
  font-size: var(--font-price);
  font-weight: bold;
  color: #409eff;
}

.status-name {
  font-size: var(--font-small);
  color: #909399;
  margin-top: 4px;
}
</style>