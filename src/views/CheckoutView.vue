<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { orderApi, couponApi } from '@/api/order'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getErrorMessage } from '@/utils/error'

const { t } = useI18n()
const router = useRouter()
const cartStore = useCartStore()

const couponCode = ref('')
const appliedCoupon = ref('')
const discount = ref(0)
const loading = ref(false)
const applyingCoupon = ref(false)

onMounted(() => {
  cartStore.fetchCart()
})

async function applyCoupon() {
  const code = couponCode.value.trim().toUpperCase()
  if (!code) {
    ElMessage.warning(t('order.couponRequired'))
    return
  }

  applyingCoupon.value = true
  try {
    const res = await couponApi.validate(code, cartStore.totalAmount)
    discount.value = res.data.discount
    appliedCoupon.value = res.data.code
    ElMessage.success(t('order.couponApplied', { code: appliedCoupon.value, discount: discount.value }))
  } catch (err: unknown) {
    discount.value = 0
    appliedCoupon.value = ''
    ElMessage.error(getErrorMessage(err, t('order.couponInvalid')))
  } finally {
    applyingCoupon.value = false
  }
}

function removeCoupon() {
  discount.value = 0
  appliedCoupon.value = ''
  couponCode.value = ''
}

const finalAmount = computed(() => {
  return Math.max(0, cartStore.totalAmount - discount.value)
})

async function submitOrder() {
  if (!cartStore.cart || cartStore.cart.items.length === 0) {
    ElMessage.warning(t('cart.empty'))
    return
  }

  loading.value = true
  try {
    await orderApi.create(appliedCoupon.value || undefined)
    ElMessage.success(t('order.orderSuccess'))
    await cartStore.fetchCart()
    router.push('/orders')
  } catch (err: unknown) {
    ElMessage.error(getErrorMessage(err, t('order.orderFailed')))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="checkout-page">
    <h1>{{ t('order.checkoutTitle') }}</h1>

    <el-empty v-if="!cartStore.cart || cartStore.cart.items.length === 0" :description="t('cart.empty')">
      <el-button type="primary" @click="router.push('/')">{{ t('cart.goShopping') }}</el-button>
    </el-empty>

    <template v-else>
      <el-table :data="cartStore.cart.items" style="width: 100%; margin-bottom: 20px">
        <el-table-column :label="t('cart.product')" min-width="300">
          <template #default="{ row }">{{ row.productName }}</template>
        </el-table-column>
        <el-table-column :label="t('cart.unitPrice')" width="120">
          <template #default="{ row }">${{ row.price }}</template>
        </el-table-column>
        <el-table-column :label="t('cart.quantity')" width="100">
          <template #default="{ row }">{{ row.quantity }}</template>
        </el-table-column>
        <el-table-column :label="t('cart.subtotal')" width="120">
          <template #default="{ row }">${{ row.subtotal }}</template>
        </el-table-column>
      </el-table>

      <el-card style="margin-bottom: 20px">
        <template v-if="appliedCoupon">
          <div class="coupon-applied">
            <el-tag type="success" size="large">🎫 {{ appliedCoupon }}</el-tag>
            <span>{{ t('order.discount') }}：-${{ discount }}</span>
            <el-button type="danger" size="small" text @click="removeCoupon">{{ t('order.removeCoupon') }}</el-button>
          </div>
        </template>
        <template v-else>
          <div class="coupon-row">
            <span>{{ t('order.couponCode') }}：</span>
            <el-input v-model="couponCode" :placeholder="t('order.couponPlaceholder')" style="width: 200px" clearable />
            <el-button type="success" :loading="applyingCoupon" @click="applyCoupon">
              {{ t('order.apply') }}
            </el-button>
          </div>
        </template>
      </el-card>

      <el-card style="margin-bottom: 20px">
        <div class="amount-row">
          <span>{{ t('order.originalAmount') }}：</span>
          <span>${{ cartStore.totalAmount.toLocaleString() }}</span>
        </div>
        <div v-if="discount > 0" class="amount-row discount">
          <span>{{ t('order.discount') }}：</span>
          <span>-${{ discount.toLocaleString() }}</span>
        </div>
        <el-divider />
        <div class="amount-row total">
          <span>{{ t('order.finalAmount') }}：</span>
          <span>${{ finalAmount.toLocaleString() }}</span>
        </div>
      </el-card>

      <el-button type="primary" size="large" :loading="loading" @click="submitOrder" style="width: 100%">
        {{ loading ? t('order.submitting') : t('order.submitOrder') }}
      </el-button>
    </template>
  </div>
</template>

<style scoped>
.checkout-page {
  max-width: 800px;
  margin: 0 auto;
}

.coupon-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.coupon-applied {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: var(--font-body);
}

.amount-row.discount {
  color: #67c23a;
}

.amount-row.total {
  font-size: var(--font-h3);
  font-weight: bold;
}

.amount-row.total span:last-child {
  color: #f56c6c;
  font-size: var(--font-price-lg);
}
</style>