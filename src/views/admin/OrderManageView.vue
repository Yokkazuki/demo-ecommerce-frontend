<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { orderApi, type Order } from '@/api/order'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getErrorMessage } from '@/utils/error'

const { t } = useI18n()

const orders = ref<Order[]>([])
const loading = ref(true)
const totalElements = ref(0)
const totalPages = ref(0)
const currentPage = ref(1)

const searchKeyword = ref('')
const searchStatus = ref('')

const nextStatus: Record<string, string> = {
  PENDING: 'PAID',
  PAID: 'SHIPPED',
  SHIPPED: 'COMPLETED'
}

const nextStatusLabel: Record<string, string> = {
  PENDING: 'nextStatus',
  PAID: 'nextStatusPaid',
  SHIPPED: 'nextStatusShipped'
}

const statusMap: Record<string, string> = {
  PENDING: 'statusPending',
  PAID: 'statusPaid',
  SHIPPED: 'statusShipped',
  COMPLETED: 'statusCompleted',
  CANCELLED: 'statusCancelled'
}

// 讓 statusOptions 跟隨語言變化
import { computed } from 'vue'

const statusOpts = computed(() => [
  { value: '', label: t('order.statusAll') },
  { value: 'PENDING', label: t('order.statusPending') },
  { value: 'PAID', label: t('order.statusPaid') },
  { value: 'SHIPPED', label: t('order.statusShipped') },
  { value: 'COMPLETED', label: t('order.statusCompleted') },
  { value: 'CANCELLED', label: t('order.statusCancelled') }
])

onMounted(() => fetchOrders())

async function fetchOrders(page: number = 0) {
  loading.value = true
  try {
    const res = await orderApi.getAllOrders(searchKeyword.value, searchStatus.value, page)
    orders.value = res.data.content
    totalElements.value = res.data.page.totalElements
    totalPages.value = res.data.page.totalPages
    currentPage.value = res.data.page.number + 1
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  fetchOrders(0)
}

function handlePageChange(page: number) {
  fetchOrders(page - 1)
}

async function handleUpdateStatus(orderId: number, currentStatus: string) {
  const next = nextStatus[currentStatus]
  if (!next) return
  try {
    await orderApi.updateStatus(orderId, next)
    ElMessage.success(`${t('order.status')} → ${t('order.' + statusMap[next])}`)
    await fetchOrders(currentPage.value - 1)
  } catch (err: unknown) {
    ElMessage.error(getErrorMessage(err, t('order.updateStatusFailed')))
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString()
}

function formatAmount(amount: number): string {
  return amount.toLocaleString()
}
</script>

<template>
  <div class="admin-page">
    <h1>{{ t('admin.orderManage') }}</h1>

    <div class="toolbar">
      <div class="search-group">
        <el-input
          v-model="searchKeyword"
          :placeholder="t('order.orderId')"
          clearable
          style="width: 180px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select
          v-model="searchStatus"
          :placeholder="t('order.status')"
          clearable
          style="width: 140px"
          @change="handleSearch"
        >
          <el-option
            v-for="opt in statusOpts"
            :key="opt.value"
            :value="opt.value"
            :label="opt.label"
          />
        </el-select>
      </div>
    </div>

    <el-table :data="orders" v-loading="loading" style="width: 100%">
      <el-table-column :label="t('order.orderId')" width="80">
        <template #default="{ row }">#{{ row.orderId }}</template>
      </el-table-column>

      <el-table-column :label="t('order.user')" width="100">
        <template #default="{ row }">{{ row.username }}</template>
      </el-table-column>

      <el-table-column :label="t('order.status')" width="100">
        <template #default="{ row }">
          <el-tag
            :type="row.status === 'CANCELLED' ? 'danger' : row.status === 'COMPLETED' ? 'success' : 'warning'"
            size="small"
          >
            {{ t('order.' + statusMap[row.status]) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="t('order.totalAmount')" width="130" align="right">
        <template #default="{ row }">${{ formatAmount(row.totalAmount) }}</template>
      </el-table-column>

      <el-table-column :label="t('order.createdAt')" min-width="160">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>

      <el-table-column :label="t('order.action')" width="130">
        <template #default="{ row }">
          <el-button
            v-if="nextStatus[row.status]"
            size="small"
            type="primary"
            @click="handleUpdateStatus(row.orderId, row.status)"
          >
            {{ t('order.' + nextStatusLabel[row.status]) }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="totalPages > 1" style="text-align: center; margin-top: 20px">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalElements"
        :page-size="10"
        v-model:current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  max-width: 1100px;
}

h1 {
  font-size: var(--font-h1);
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-group {
  display: flex;
  gap: 8px;
}

:deep(.el-table) {
  font-size: var(--font-body);
}
</style>