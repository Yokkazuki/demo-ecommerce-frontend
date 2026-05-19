<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ShoppingCart, Search, Minus, Plus } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { tagApi, type Tag } from '@/api/tag'
import { getFullErrorMessage } from '@/utils/error'
import { checkServer } from '@/api/health'

const { t } = useI18n()
const productStore = useProductStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

const currentPage = ref(1)
const searchKeyword = ref('')
const allTags = ref<Tag[]>([])
const selectedTagId = ref<number | null>(null)

const serverChecking = ref(true)
const serverError = ref(false)

onMounted(async () => {
  const ready = await checkServer()
  if (!ready) {
    serverError.value = true
    serverChecking.value = false
    return
  }

  serverChecking.value = false

  const requests: Promise<unknown>[] = [productStore.fetchProducts(0), tagApi.getAll()]
  if (authStore.isLoggedIn) {
    requests.push(cartStore.fetchCart())
  }
  const results = await Promise.all(requests)
  allTags.value = (results[1] as { data: Tag[] }).data
})

function handlePageChange(page: number) {
  currentPage.value = page
  productStore.searchProducts(searchKeyword.value, selectedTagId.value, page - 1)
}

function handleSearch() {
  currentPage.value = 1
  productStore.searchProducts(searchKeyword.value, selectedTagId.value, 0)
}

function handleTagClick(tagId: number | null) {
  selectedTagId.value = tagId
  currentPage.value = 1
  productStore.searchProducts(searchKeyword.value, tagId, 0)
}

async function handleAddToCart(productId: number, stock: number) {
  if (stock === 0) return
  if (!authStore.isLoggedIn) {
    ElMessage.warning(t('auth.pleaseLogin'))
    router.push('/login')
    return
  }
  try {
    await cartStore.addToCart({ productId, quantity: 1 })
    ElMessage.success(t('cart.added'))
  } catch (err: unknown) {
    ElMessage.error(getFullErrorMessage(err, t('cart.updateFailed')))
  }
}

async function handleIncrease(productId: number) {
  const itemId = cartStore.getCartItemId(productId)
  const item = cartStore.cart?.items.find(i => i.productId === productId)
  if (itemId && item) {
    try {
      await cartStore.updateCartItem(itemId, item.quantity + 1)
    } catch (err: unknown) {
      ElMessage.error(getFullErrorMessage(err, t('cart.updateFailed')))
    }
  }
}

async function handleDecrease(productId: number) {
  const itemId = cartStore.getCartItemId(productId)
  const item = cartStore.cart?.items.find(i => i.productId === productId)
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

function handleRetry() {
  location.reload()
}
</script>

<template>
  <div class="product-list">
    <h1>{{ t('product.title') }}</h1>
    <!-- 暖機中 -->
    <div v-if="serverChecking" class="server-status">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <h2>{{ t('common.serverWaking') }}</h2>
      <p class="status-desc">{{ t('common.serverWakingDesc') }}</p>
    </div>

    <!-- 暖機失敗 -->
    <div v-else-if="serverError" class="server-status">
      <el-empty :description="t('common.serverError')" :image-size="120">
        <el-button type="primary" @click="handleRetry">
          {{ t('common.retry') }}
        </el-button>
      </el-empty>
    </div>
    <template v-else>
      <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        :placeholder="t('product.searchPlaceholder')"
        clearable
        @keyup.enter="handleSearch"
        @clear="handleSearch"
        style="width: 320px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="tag-bar" v-if="allTags.length">
      <span
        class="filter-tag"
        :class="{ active: selectedTagId === null }"
        @click="handleTagClick(null)"
      >全部</span>
      <span
        v-for="tag in allTags"
        :key="tag.id"
        class="filter-tag"
        :class="{ active: selectedTagId === tag.id }"
        :style="selectedTagId === tag.id
          ? { background: tag.color, borderColor: tag.color, color: '#fff' }
          : { color: tag.color, borderColor: tag.color }"
        @click="handleTagClick(tag.id)"
      >{{ tag.name }}</span>
    </div>

    <div v-if="productStore.loading" style="text-align: center; padding: 50px">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p>{{ t('common.loading') }}</p>
    </div>

    <el-row v-else :gutter="20">
      <el-col v-for="product in productStore.products" :key="product.id" :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="product-card" shadow="hover" @click="router.push(`/product/${product.id}`)">
          <img
            :src="product.imageUrl || 'https://placehold.co/300x200?text=No+Image'"
            class="product-image"
          />
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="description">{{ product.description }}</p>

            <div class="tags" v-if="product.tags?.length">
              <span
                v-for="tag in product.tags"
                :key="tag.id"
                class="tag"
                :style="{ background: tag.color + '20', color: tag.color, borderColor: tag.color }"
              >{{ tag.name }}</span>
            </div>

            <div class="price-row">
              <span class="price">${{ product.price.toLocaleString() }}</span>
              <span class="stock" :class="{ zero: product.stock === 0 }">
                {{ t('product.stock') }}：{{ product.stock }}
              </span>
            </div>

            <div v-if="cartStore.getQuantity(product.id) > 0" class="cart-controls" @click.stop>
              <el-button
                size="small" circle
                :disabled="cartStore.updatingMap[cartStore.getCartItemId(product.id) ?? 0]"
                @click="handleDecrease(product.id)"
              ><el-icon><Minus /></el-icon></el-button>
              <span class="cart-qty">{{ cartStore.getQuantity(product.id) }}</span>
              <el-button
                size="small" circle
                :disabled="cartStore.updatingMap[cartStore.getCartItemId(product.id) ?? 0]"
                @click="handleIncrease(product.id)"
              ><el-icon><Plus /></el-icon></el-button>
            </div>

            <el-button
              v-else
              type="primary"
              :icon="ShoppingCart"
              style="width: 100%; margin-top: 12px"
              :disabled="product.stock === 0"
              :loading="cartStore.addingMap[product.id]"
              @click.stop="handleAddToCart(product.id, product.stock)"
            >
              {{ product.stock === 0 ? t('product.soldOut') : t('product.addToCart') }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty
      v-if="!productStore.loading && productStore.products.length === 0"
      :description="t('product.noProducts')"
    />

    <div v-if="productStore.totalPages > 1" style="text-align: center; margin-top: 24px">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="productStore.totalElements"
        :page-size="8"
        v-model:current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
    </template>
    
  </div>
</template>

<style scoped>
.product-list {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 24px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.search-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.search-bar :deep(.el-input__wrapper) {
  box-shadow: var(--shadow-md) !important;
  border-radius: 24px !important;
  padding: 4px 16px;
}

.tag-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 24px;
}

.filter-tag {
  padding: 6px 16px;
  border: 1px solid;
  border-radius: 20px;
  cursor: pointer;
  font-size: var(--font-small);
  transition: all 0.2s;
  user-select: none;
}

.filter-tag:hover {
  opacity: 0.8;
}

.filter-tag.active {
  font-weight: 600;
}

.product-card {
  margin-bottom: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 12px 16px 12px;
}

.product-info h3 {
  margin: 0;
  font-size: var(--font-h3);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description {
  color: var(--text-light);
  font-size: var(--font-small);
  margin: 6px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.tags {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  margin: 6px 0;
  overflow: hidden;
  height: 22px;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.price {
  font-size: var(--font-price);
  font-weight: 700;
  background: linear-gradient(135deg, #f43f5e, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stock {
  color: var(--text-light);
  font-size: var(--font-small);
}

.stock.zero {
  color: var(--danger);
  font-weight: 600;
}

.cart-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.cart-qty {
  font-size: var(--font-body);
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

@media (max-width: 768px) {
  .product-image {
    height: 160px;
  }
}
</style>