<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { ShoppingCart, List, Check } from '@element-plus/icons-vue'
import { watch, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const mobileMenuOpen = ref(false)

watch(() => authStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) cartStore.fetchCart()
})

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

setFontSize(currentFont.value)
</script>

<template>
  <template v-if="isAdminRoute">
    <RouterView />
  </template>

  <template v-else>
    <div class="app-wrapper">
      <header class="navbar">
        <div class="nav-inner">
          <div class="logo" @click="router.push('/')">
            <span class="logo-icon">🛒</span>
            <span class="logo-text">{{ t('common.appName') }}</span>
          </div>

          <div class="nav-actions">
            <button class="menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
              <span></span><span></span><span></span>
            </button>

            <div class="desktop-menu">
              <el-dropdown trigger="click">
                <button class="nav-btn">
                  Aa {{ t('common.' + fontLabelMap[currentFont]) }}
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="key in fontKeys" :key="key" @click="setFontSize(key)">
                      {{ t('common.' + fontLabelMap[key]) }}
                      <el-icon v-if="currentFont === key" style="margin-left: 8px"><Check /></el-icon>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <template v-if="authStore.isLoggedIn">
                <el-badge :value="cartStore.totalItems" :hidden="cartStore.totalItems === 0" class="cart-badge">
                  <button class="nav-btn" @click="router.push('/cart')">
                    <el-icon><ShoppingCart /></el-icon>
                    <span class="nav-btn-text">{{ t('common.cart') }}</span>
                  </button>
                </el-badge>
                <button class="nav-btn" @click="router.push('/orders')">
                  <el-icon><List /></el-icon>
                  <span class="nav-btn-text">{{ t('common.orders') }}</span>
                </button>

                <template v-if="authStore.isAdmin">
                  <button class="nav-btn admin-btn" @click="router.push('/admin')">
                    ⚙️ <span class="nav-btn-text">{{ t('admin.dashboard') }}</span>
                  </button>
                </template>

                <span class="user-tag">{{ authStore.username }}</span>
                <button class="nav-btn" @click="router.push('/change-password')">
                  <span class="nav-btn-text">{{ t('auth.changePassword') }}</span>
                </button>
                <button class="nav-btn" @click="router.push('/about')">
                  <span class="nav-btn-text">{{ t('common.aboutTitle') }}</span>
                </button>
                <button class="nav-btn logout-btn" @click="authStore.logout()">
                  {{ t('common.logout') }}
                </button>
              </template>
              <template v-else>
                <button class="nav-btn primary-btn" @click="router.push('/login')">
                  {{ t('common.login') }}
                </button>
                <button class="nav-btn" @click="router.push('/register')">
                  {{ t('common.register') }}
                </button>
              </template>

              <button class="nav-btn lang-btn" @click="toggleLang">
                {{ t('common.switchLang') }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="mobileMenuOpen" class="mobile-menu">
          <button v-if="authStore.isLoggedIn" class="mobile-nav-item" @click="router.push('/cart'); mobileMenuOpen = false">
            🛒 {{ t('common.cart') }}
          </button>
          <button v-if="authStore.isLoggedIn" class="mobile-nav-item" @click="router.push('/orders'); mobileMenuOpen = false">
            📋 {{ t('common.orders') }}
          </button>
          <button v-if="authStore.isAdmin" class="mobile-nav-item" @click="router.push('/admin'); mobileMenuOpen = false">
            ⚙️ {{ t('admin.dashboard') }}
          </button>
          <button v-if="authStore.isLoggedIn" class="mobile-nav-item" @click="router.push('/change-password'); mobileMenuOpen = false">
            🔐 {{ t('auth.changePassword') }}
          </button>
          <button v-if="authStore.isLoggedIn" class="mobile-nav-item" @click="router.push('/about'); mobileMenuOpen = false">
            ℹ️ {{ t('common.aboutTitle') }}
          </button>
          <button v-if="authStore.isLoggedIn" class="mobile-nav-item logout" @click="authStore.logout(); mobileMenuOpen = false">
            {{ t('common.logout') }}
          </button>
          <button v-else class="mobile-nav-item" @click="router.push('/login'); mobileMenuOpen = false">
            {{ t('common.login') }}
          </button>
        </div>
      </header>

      <main class="main-content">
        <RouterView />
      </main>

      <footer class="footer">
        <p>© {{ new Date().getFullYear() }} {{ t('common.appName') }}</p>
      </footer>
    </div>
  </template>
</template>

<style>
/* ---------- CSS 變數 ---------- */
:root {
  --font-body: 14px;
  --font-h1: 28px;
  --font-h3: 18px;
  --font-small: 13px;
  --font-price: 22px;
  --font-price-lg: 28px;
  --btn-padding: 8px 16px;
  --btn-font: 14px;
  --primary: #6366f1;
  --primary-light: #818cf8;
  --primary-dark: #4f46e5;
  --danger: #ef4444;
  --success: #22c55e;
  --warning: #f59e0b;
  --bg: #f8fafc;
  --card-bg: #ffffff;
  --text: #1e293b;
  --text-light: #64748b;
  --border: #e2e8f0;
  --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
  --radius: 12px;
}

html.font-large {
  --font-body: 18px;
  --font-h1: 34px;
  --font-h3: 22px;
  --font-small: 15px;
  --font-price: 28px;
  --font-price-lg: 34px;
  --btn-padding: 12px 24px;
  --btn-font: 16px;
}

html.font-medium {
  --font-body: 14px;
  --font-h1: 28px;
  --font-h3: 18px;
  --font-small: 13px;
  --font-price: 22px;
  --font-price-lg: 28px;
  --btn-padding: 8px 16px;
  --btn-font: 14px;
}

html.font-small {
  --font-body: 12px;
  --font-h1: 22px;
  --font-h3: 15px;
  --font-small: 11px;
  --font-price: 18px;
  --font-price-lg: 22px;
  --btn-padding: 5px 10px;
  --btn-font: 12px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', 'Noto Sans TC', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: var(--font-body);
  background: var(--bg);
  color: var(--text);
  transition: font-size 0.2s;
  -webkit-font-smoothing: antialiased;
}

h1 { font-size: var(--font-h1) !important; font-weight: 700 !important; }
h3 { font-size: var(--font-h3) !important; font-weight: 600 !important; }

/* ---------- Navbar ---------- */
.navbar {
  background: var(--card-bg);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.logo-icon { font-size: 24px; }

.logo-text {
  font-size: var(--font-h3);
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.desktop-menu {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-btn {
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: var(--font-small);
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.15s;
  white-space: nowrap;
}

.nav-btn:hover { background: var(--bg); }

.primary-btn {
  background: var(--primary) !important;
  color: white !important;
  padding: 8px 16px !important;
}

.primary-btn:hover { background: var(--primary-dark) !important; }

.admin-btn { color: var(--warning) !important; font-weight: 600; }
.logout-btn { color: var(--danger) !important; }

.lang-btn { border: 1px solid var(--border) !important; }

.user-tag {
  font-size: var(--font-small);
  padding: 4px 10px;
  background: var(--bg);
  border-radius: 20px;
  color: var(--text-light);
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.menu-toggle span {
  width: 22px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
}

.mobile-menu {
  display: none;
  padding: 12px 24px;
  background: var(--card-bg);
  border-top: 1px solid var(--border);
  flex-direction: column;
  gap: 4px;
}

.mobile-nav-item {
  width: 100%;
  padding: 12px;
  text-align: left;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: var(--font-body);
  cursor: pointer;
  color: var(--text);
}

.mobile-nav-item:hover { background: var(--bg); }
.mobile-nav-item.logout { color: var(--danger); }

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  min-height: calc(100vh - 120px);
}

.footer {
  text-align: center;
  padding: 24px;
  color: var(--text-light);
  font-size: var(--font-small);
  border-top: 1px solid var(--border);
  background: var(--card-bg);
}

/* Element Plus 覆蓋 */
.el-button {
  font-size: var(--btn-font) !important;
  border-radius: 8px !important;
}

.el-button--primary {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
}

.el-button--primary:hover { background: var(--primary-dark) !important; }

.el-card {
  border-radius: var(--radius) !important;
  box-shadow: var(--shadow) !important;
  border: 1px solid var(--border) !important;
  transition: box-shadow 0.2s, transform 0.2s;
}

.el-card:hover {
  box-shadow: var(--shadow-md) !important;
  transform: translateY(-2px);
}

.el-input__wrapper { border-radius: 8px !important; }
.el-pagination .el-pager li.is-active { background: var(--primary) !important; }
.el-tag { border-radius: 20px !important; }

@media (max-width: 768px) {
  .desktop-menu { display: none !important; }
  .menu-toggle { display: flex; }
  .mobile-menu { display: flex; }
  .main-content { padding: 20px 16px; }
  .nav-inner { padding: 0 16px; }
}

@media (max-width: 480px) {
  .logo-text { font-size: 14px; }
  .main-content { padding: 16px 12px; }
}
</style>