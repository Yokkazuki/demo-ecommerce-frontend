<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productApi, type Product } from '@/api/product'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Minus, Plus, ArrowLeft } from '@element-plus/icons-vue'
import { getFullErrorMessage } from '@/utils/error'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const product = ref<Product | null>(null)
const loading = ref(true)

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    const res = await productApi.getById(id)
    product.value = res.data
  } finally {
    loading.value = false
  }
})

async function handleAddToCart() {
  if (!product.value) return
  if (!authStore.isLoggedIn) {
    ElMessage.warning(t('auth.pleaseLogin'))
    router.push('/login')
    return
  }
  try {
    await cartStore.addToCart({ productId: product.value.id, quantity: 1 })
    ElMessage.success(t('cart.added'))
  } catch (err: unknown) {
    ElMessage.error(getFullErrorMessage(err, t('cart.updateFailed')))
  }
}

async function handleIncrease() {
  if (!product.value) return
  const itemId = cartStore.getCartItemId(product.value.id)
  const item = cartStore.cart?.items.find(i => i.productId === product.value!.id)
  if (itemId && item) {
    try {
      await cartStore.updateCartItem(itemId, item.quantity + 1)
    } catch (err: unknown) {
      ElMessage.error(getFullErrorMessage(err, t('cart.updateFailed')))
    }
  }
}

async function handleDecrease() {
  if (!product.value) return
  const itemId = cartStore.getCartItemId(product.value.id)
  const item = cartStore.cart?.items.find(i => i.productId === product.value!.id)
  if (itemId && item && item.quantity > 1) {
    try {
      await cartStore.updateCartItem(itemId, item.quantity - 1)
    } catch (err: unknown) {
      ElMessage.error(getFullErrorMessage(err, t('cart.updateFailed')))
    }
  } else if (itemId) {
    try {
      await cartStore.removeCartItem(itemId)
      ElMessage.success(t('cart.removed'))
    } catch (err: unknown) {
      ElMessage.error(getFullErrorMessage(err, t('cart.removeFailed')))
    }
  }
}
</script>

<template>
  <div class="detail-page">
    <el-button text :icon="ArrowLeft" @click="router.back()" class="back-btn">
      {{ t('product.back') }}
    </el-button>

    <div v-if="loading" style="text-align: center; padding: 80px">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
    </div>

    <el-empty v-else-if="!product" :description="t('product.noProducts')" :image-size="120">
      <el-button type="primary" @click="router.push('/')">{{ t('cart.goShopping') }}</el-button>
    </el-empty>

    <template v-else>
      <div class="detail-layout">
        <div class="detail-image">
          <img :src="product.imageUrl || 'https://placehold.co/600x400'" :alt="product.name" />
        </div>
        <div class="detail-info">
          <h1>{{ product.name }}</h1>

          <div class="tags" v-if="product.tags?.length">
            <span v-for="tag in product.tags" :key="tag.id" class="tag"
              :style="{ background: tag.color + '20', color: tag.color, borderColor: tag.color }"
            >{{ tag.name }}</span>
          </div>

          <p class="desc">{{ product.description }}</p>

          <div class="price-stock">
            <span class="price">${{ product.price.toLocaleString() }}</span>
            <span class="stock" :class="{ zero: product.stock === 0 }">
              {{ t('product.stock') }}：{{ product.stock }}
            </span>
          </div>

          <div class="cart-area">
            <div v-if="cartStore.getQuantity(product.id) > 0" class="cart-controls">
              <el-button
                size="small" circle
                :disabled="cartStore.updatingMap[cartStore.getCartItemId(product.id) ?? 0]"
                @click="handleDecrease()"
              ><el-icon><Minus /></el-icon></el-button>
              <span class="cart-qty">{{ cartStore.getQuantity(product.id) }}</span>
              <el-button
                size="small" circle
                :disabled="cartStore.updatingMap[cartStore.getCartItemId(product.id) ?? 0]"
                @click="handleIncrease()"
              ><el-icon><Plus /></el-icon></el-button>
            </div>
            <el-button
              v-else
              type="primary"
              size="large"
              :icon="ShoppingCart"
              :disabled="product.stock === 0"
              :loading="cartStore.addingMap[product.id]"
              @click="handleAddToCart"
            >
              {{ product.stock === 0 ? t('product.soldOut') : t('product.addToCart') }}
            </el-button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 1000px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 16px;
  font-size: var(--font-body);
}

.detail-layout {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.detail-image {
  flex: 1;
  min-width: 300px;
}

.detail-image img {
  width: 100%;
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
}

.detail-info {
  flex: 1;
  min-width: 300px;
}

.detail-info h1 {
  font-size: var(--font-h1);
  margin: 0 0 12px;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid;
  font-weight: 500;
}

.desc {
  font-size: var(--font-body);
  color: var(--text-light);
  line-height: 1.8;
  margin-bottom: 24px;
}

.price-stock {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg);
  border-radius: var(--radius);
}

.price {
  font-size: var(--font-price-lg);
  font-weight: 700;
  background: linear-gradient(135deg, #f43f5e, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stock {
  font-size: var(--font-body);
  color: var(--text-light);
}

.stock.zero {
  color: var(--danger);
}

.cart-area {
  margin-top: 8px;
}

.cart-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-qty {
  font-size: var(--font-h3);
  font-weight: 600;
  min-width: 28px;
  text-align: center;
}

@media (max-width: 768px) {
  .detail-layout {
    flex-direction: column;
    gap: 20px;
  }
}
</style>