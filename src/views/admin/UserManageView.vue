<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userApi, type UserData } from '@/api/user'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getErrorMessage } from '@/utils/error'

const { t } = useI18n()

const users = ref<UserData[]>([])
const loading = ref(true)

onMounted(() => fetchUsers())

async function fetchUsers() {
  loading.value = true
  try {
    const res = await userApi.getAll()
    users.value = res.data
  } finally {
    loading.value = false
  }
}

async function toggleRole(user: UserData) {
  const newRole = user.role === 'ADMIN' ? 'BUYER' : 'ADMIN'
  try {
    await userApi.updateRole(user.id, newRole)
    ElMessage.success(t('admin.roleUpdateSuccess'))
    await fetchUsers()
  } catch (err: unknown) {
    ElMessage.error(getErrorMessage(err, t('admin.operationFailed')))
  }
}
</script>

<template>
  <div class="admin-page">
    <h1>{{ t('admin.userManage') }}</h1>

    <el-table :data="users" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" :label="t('admin.userId')" width="60" />
      <el-table-column prop="username" :label="t('admin.userUsername')" width="120" />
      <el-table-column prop="email" :label="t('admin.userEmail')" min-width="200" />
      <el-table-column :label="t('admin.userRole')" width="100">
        <template #default="{ row }">
          <el-tag :type="row.role === 'ADMIN' ? 'danger' : 'info'" size="small">
            {{ row.role }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('admin.action')" width="130">
        <template #default="{ row }">
          <el-button
            size="small"
            :type="row.role === 'ADMIN' ? 'warning' : 'primary'"
            @click="toggleRole(row)"
          >
            {{ row.role === 'ADMIN' ? t('admin.demote') : t('admin.promote') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
:deep(.el-table) {
  width: 100% !important;
  font-size: var(--font-body);
}

:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper) {
  width: 100% !important;
}
</style>