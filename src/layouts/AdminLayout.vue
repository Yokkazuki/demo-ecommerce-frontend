<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import {
  Goods, List, Ticket, User, DataAnalysis,
  ShoppingCart, Check, Expand, Fold
} from '@element-plus/icons-vue'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isCollapse = ref(false)
const mobileMenuOpen = ref(false)
const isMobile = ref(false)

const menuItems = [
  { path: '/admin/dashboard', title: 'admin.dashboard', icon: DataAnalysis },
  { path: '/admin/products', title: 'admin.productManage', icon: Goods },
  { path: '/admin/orders', title: 'admin.orderManage', icon: List },
  { path: '/admin/coupons', title: 'admin.couponManage', icon: Ticket },
  { path: '/admin/users', title: 'admin.userManage', icon: User }
]

function handleResize() {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    isCollapse.value = true
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function handleMenuClick(path: string) {
  router.push(path)
  if (isMobile.value) {
    mobileMenuOpen.value = false
  }
}

function goHome() {
  router.push('/')
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}

function toggleLang() {
  const next = locale.value === 'zh-TW' ? 'en' : 'zh-TW'
  locale.value = next
  localStorage.setItem('lang', next)
}

const fontKeys = ['small', 'medium', 'large'] as const
type FontSize = typeof fontKeys[number]

const fontLabelMap: Record<FontSize, string> = {
  small: 'fontSmall',
  medium: 'fontMedium',
  large: 'fontLarge'
}

const currentFont = ref<FontSize>(
  (localStorage.getItem('fontSize') as FontSize) || 'medium'
)

function setFontSize(key: FontSize) {
  currentFont.value = key
  localStorage.setItem('fontSize', key)
  document.documentElement.classList.remove('font-large', 'font-medium', 'font-small')
  document.documentElement.classList.add('font-' + key)
}
</script>

<template>
  <el-container class="admin-layout">
    <!-- 側邊欄：桌機版 -->
    <el-aside v-if="!isMobile" :width="isCollapse ? '64px' : '220px'" class="admin-aside">
      <div class="aside-header">
        <span v-if="!isCollapse" class="aside-title">{{ t('admin.dashboard') }}</span>
        <el-button text style="color: white" @click="isCollapse = !isCollapse">
          <el-icon><component :is="isCollapse ? Expand : Fold" /></el-icon>
        </el-button>
      </div>
      <el-menu
        :default-active="route.path"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        :collapse="isCollapse"
        @select="handleMenuClick"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ t(item.title) }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- Header -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-button v-if="isMobile" text @click="mobileMenuOpen = !mobileMenuOpen" class="menu-toggle">
            <span></span><span></span><span></span>
          </el-button>
          <el-button text @click="goHome">
            <el-icon><ShoppingCart /></el-icon>
            <span class="hide-mobile">{{ t('admin.backToFront') }}</span>
          </el-button>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click">
            <el-button size="small">
              {{ t('common.fontSize') }}：{{ t('common.' + fontLabelMap[currentFont]) }}
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="key in fontKeys" :key="key" @click="setFontSize(key)">
                  {{ t('common.' + fontLabelMap[key]) }}
                  <el-icon v-if="currentFont === key" style="margin-left: 8px"><Check /></el-icon>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-button size="small" @click="toggleLang" class="hide-mobile">
            {{ t('common.switchLang') }}
          </el-button>

          <el-tag size="small" class="hide-mobile">{{ authStore.username }}</el-tag>
          <el-button size="small" type="danger" @click="handleLogout()">
            {{ t('common.logout') }}
          </el-button>
        </div>
      </el-header>

      <!-- 手機版下拉選單 -->
      <div v-if="isMobile && mobileMenuOpen" class="mobile-menu">
        <button
          v-for="item in menuItems" :key="item.path"
          class="mobile-nav-item"
          :class="{ active: route.path === item.path }"
          @click="handleMenuClick(item.path)"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          {{ t(item.title) }}
        </button>
      </div>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.admin-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.aside-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  color: white;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  height: 56px;
}

.aside-title {
  font-size: var(--font-h3);
  font-weight: bold;
  white-space: nowrap;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  padding: 0 16px;
  height: 56px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-toggle {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
}

.menu-toggle span {
  width: 20px;
  height: 2px;
  background: #333;
  border-radius: 2px;
}

.mobile-menu {
  background: #fff;
  border-bottom: 1px solid var(--border);
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: none;
  background: none;
  font-size: var(--font-body);
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  color: var(--text);
}

.mobile-nav-item.active {
  background: var(--primary);
  color: white;
}

.el-menu {
  border-right: none;
}

.el-menu-item {
  font-size: var(--font-body) !important;
}

@media (max-width: 768px) {
  .hide-mobile {
    display: none !important;
  }
}
</style>