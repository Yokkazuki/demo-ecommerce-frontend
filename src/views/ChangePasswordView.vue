<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import api from '@/api/axios'
import { ElMessage } from 'element-plus'
import { getErrorMessage } from '@/utils/error'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const form = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const loading = ref(false)

async function handleSubmit() {
  if (form.value.newPassword !== form.value.confirmPassword) {
    ElMessage.error(t('auth.passwordMismatch'))
    return
  }

  loading.value = true
  try {
    await api.put('/auth/change-password', {
      oldPassword: form.value.oldPassword,
      newPassword: form.value.newPassword
    })
    ElMessage.success(t('auth.passwordChanged'))
    authStore.logout()
    router.push('/login')
  } catch (err: unknown) {
    ElMessage.error(getErrorMessage(err, t('auth.changeFailed')))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="wrapper">
    <el-card class="card">
      <h1>{{ t('auth.changePassword') }}</h1>
      <el-form @submit.prevent="handleSubmit" label-position="top">
        <el-form-item :label="t('auth.oldPassword')">
          <el-input v-model="form.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item :label="t('auth.newPassword')">
          <el-input v-model="form.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item :label="t('auth.confirmPassword')">
          <el-input v-model="form.confirmPassword" type="password" show-password />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%">
          {{ t('auth.changePasswordBtn') }}
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.wrapper {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card {
  width: 400px;
}
h1 {
  text-align: center;
  margin-bottom: 24px;
}
</style>