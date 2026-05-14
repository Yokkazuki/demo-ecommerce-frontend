<script setup lang="ts">
import { onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { Delete } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getFullErrorMessage } from '@/utils/error'

const { t } = useI18n()
const cartStore = useCartStore()
const router = useRouter()

onMounted(() => {
  cartStore.fetchCart()
})

async function handleQuantityChange(itemId: number, quantity: number) {
  if (quantity < 1) return
  try {
    await cartStore.updateCartItem(itemId, quantity)
  } catch (err: unknown) {
    ElMessage.error(getFullErrorMessage(err, t('cart.updateFailed')))
    await cartStore.fetchCart()
  }
}

async function handleRemove(itemId: number) {
  try {
    await cartStore.removeCartItem(itemId)
    ElMessage.success(t('cart.removed'))
  } catch (err: unknown) {
    ElMessage.error(getFullErrorMessage(err, t('cart.removeFailed')))
  }
}
function handleCheckout() {
  router.push('/checkout')
}
</script>

<template>
  <div class="cart-page">
    <h1>{{ t('cart.title') }}</h1>

    <div v-if="cartStore.loading" style="text-align: center; padding: 50px">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
    </div>

    <el-empty v-else-if="!cartStore.cart || cartStore.cart.items.length === 0" :description="t('cart.empty')" :image-size="120">
      <el-button type="primary" @click="router.push('/')" size="large">
        🛍️ {{ t('cart.goShopping') }}
      </el-button>
    </el-empty>

    <template v-else>
      <el-table :data="cartStore.cart.items" style="width: 100%">
        <el-table-column :label="t('cart.product')" min-width="250">
          <template #default="{ row }">
            <span>{{ row.productName }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="t('cart.unitPrice')" width="120">
          <template #default="{ row }">
            <span>${{ row.price }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="t('cart.quantity')" width="160">
          <template #default="{ row }">
            <el-input-number
              v-model="row.quantity"
              :min="1"
              :max="99"
              :disabled="cartStore.updatingMap[row.id]"
              @change="handleQuantityChange(row.id, row.quantity)"
            />
          </template>
        </el-table-column>

        <el-table-column :label="t('cart.subtotal')" width="120">
          <template #default="{ row }">
            <span class="subtotal">${{ row.subtotal.toLocaleString() }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="t('cart.action')" width="80">
          <template #default="{ row }">
            <el-button
              type="danger"
              :icon="Delete"
              circle
              :disabled="cartStore.updatingMap[row.id]"
              @click="handleRemove(row.id)"
            />
          </template>
        </el-table-column>
      </el-table>

      <div class="checkout-bar">
        <span class="total">{{ t('cart.total') }}：<strong>${{ cartStore.totalAmount.toLocaleString() }}</strong></span>
        <el-button type="primary" size="large" @click="handleCheckout">
          {{ t('cart.checkout') }}
        </el-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cart-page {
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 24px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.subtotal {
  color: #f56c6c;
  font-weight: bold;
  font-size: var(--font-body);
}

.checkout-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 16px;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.total {
  font-size: var(--font-h3);
}

.total strong {
  color: #f56c6c;
  font-size: var(--font-price-lg);
}

:deep(.el-table) {
  font-size: var(--font-body);
}
</style>