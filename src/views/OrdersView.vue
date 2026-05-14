<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { orderApi, type Order } from '@/api/order'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { isCancelError, getErrorMessage } from '@/utils/error'

const { t } = useI18n()
const router = useRouter()

const orders = ref<Order[]>([])
const loading = ref(true)

const statusMap: Record<string, string> = {
  PENDING: 'statusPending',
  PAID: 'statusPaid',
  SHIPPED: 'statusShipped',
  COMPLETED: 'statusCompleted',
  CANCELLED: 'statusCancelled'
}

onMounted(async () => {
  await fetchOrders()
})

async function fetchOrders() {
  loading.value = true
  try {
    const res = await orderApi.getMyOrders()
    orders.value = res.data
  } finally {
    loading.value = false
  }
}

async function handleCancel(orderId: number) {
  try {
    await ElMessageBox.confirm(t('order.confirmCancel'), t('common.confirm'), {
      type: 'warning'
    })
    await orderApi.cancel(orderId)
    ElMessage.success(t('order.cancelled'))
    await fetchOrders()
  } catch (err: unknown) {
    if (!isCancelError(err)) {
      ElMessage.error(getErrorMessage(err, t('order.cancelFailed')))
    }
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString()
}
</script>

<template>
  <div class="orders-page">
    <h1>{{ t('order.title') }}</h1>

    <div v-if="loading" style="text-align: center; padding: 50px">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p>{{ t('common.loading') }}</p>
    </div>

    <el-empty v-else-if="orders.length === 0" :description="t('order.empty')" :image-size="120">
      <el-button type="primary" @click="router.push('/')" size="large">
        🛍️ {{ t('cart.goShopping') }}
      </el-button>
    </el-empty>

    <template v-else>
      <el-table :data="orders" style="width: 100%">
        <el-table-column :label="t('order.orderId')" width="100">
          <template #default="{ row }">#{{ row.orderId }}</template>
        </el-table-column>

        <el-table-column :label="t('order.status')" width="120">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'CANCELLED' ? 'danger' : row.status === 'COMPLETED' ? 'success' : 'warning'"
            >
              {{ t('order.' + statusMap[row.status]) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="t('order.totalAmount')" width="120">
          <template #default="{ row }">${{ row.totalAmount.toLocaleString() }}</template>
        </el-table-column>

        <el-table-column :label="t('order.createdAt')" min-width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>

        <el-table-column :label="t('order.action')" width="120">
          <template #default="{ row }">
            <el-button
              size="small"
              type="danger"
              :icon="Delete"
              v-if="row.status === 'PENDING'"
              @click="handleCancel(row.orderId)"
            >
              {{ t('order.cancel') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </div>
</template>

<style scoped>
.orders-page {
  max-width: 1000px;
  margin: 0 auto;
}
</style>