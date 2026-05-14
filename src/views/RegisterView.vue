<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserFilled, Message, Lock } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { getErrorMessage } from '@/utils/error'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const form = ref({ username: '', email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  loading.value = true
  error.value = ''
  try {
    await authStore.register(form.value)
    router.push('/')
  } catch (err: unknown) {
    error.value = getErrorMessage(err, t('auth.registerFailed'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-wrapper">
    <el-card class="register-card">
      <h1 class="title">{{ t('auth.registerTitle') }}</h1>
      <el-form @submit.prevent="handleRegister" label-position="top">
        <el-form-item :label="t('auth.username')">
          <el-input v-model="form.username" :prefix-icon="UserFilled" :placeholder="t('auth.username')" />
        </el-form-item>
        <el-form-item :label="t('auth.email')">
          <el-input v-model="form.email" :prefix-icon="Message" :placeholder="t('auth.email')" />
        </el-form-item>
        <el-form-item :label="t('auth.password')">
          <el-input v-model="form.password" type="password" :prefix-icon="Lock" :placeholder="t('auth.password')" show-password />
        </el-form-item>
        <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" style="margin-bottom: 16px" />
        <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%">
          {{ loading ? t('auth.registering') : t('auth.registerBtn') }}
        </el-button>
      </el-form>
      <p style="text-align: center; margin-top: 16px">
        {{ t('auth.hasAccount') }}<router-link to="/login">{{ t('auth.goLogin') }}</router-link>
      </p>
    </el-card>
  </div>
</template>

<style scoped>
.register-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.register-card {
  width: 400px;
}
.title {
  text-align: center;
  margin-bottom: 24px;
  color: #409eff;
}
</style>