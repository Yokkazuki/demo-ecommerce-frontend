<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { couponApi, type CouponData } from '@/api/order'
import type { CouponForm } from '@/api/order'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { isCancelError, getErrorMessage } from '@/utils/error'

const { t } = useI18n()

interface CouponFormData {
  id: number
  code: string
  discountType: string
  discountValue: number
  minPurchase: number | null
  maxDiscount: number | null
  quantity: number
  isActive: boolean
  expireAt: string | null
}

const coupons = ref<CouponData[]>([])
const loading = ref(true)
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)

const defaultForm = (): CouponFormData => ({
  id: 0,
  code: '',
  discountType: 'FIXED_AMOUNT',
  discountValue: 0,
  minPurchase: null,
  maxDiscount: null,
  quantity: 100,
  isActive: true,
  expireAt: ''
})

const form = reactive(defaultForm())

onMounted(() => fetchCoupons())

async function fetchCoupons() {
  loading.value = true
  try {
    const res = await couponApi.getAll()
    coupons.value = res.data
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  isEdit.value = false
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

function handleEdit(coupon: CouponData) {
  isEdit.value = true
  form.id = coupon.id
  form.code = coupon.code
  form.discountType = coupon.discountType
  form.discountValue = coupon.discountValue
  form.minPurchase = coupon.minPurchase
  form.maxDiscount = coupon.maxDiscount
  form.quantity = coupon.quantity
  form.isActive = coupon.isActive
  form.expireAt = coupon.expireAt ? coupon.expireAt.substring(0, 16) : ''
  dialogVisible.value = true
}

async function handleDelete(coupon: CouponData) {
  try {
    await ElMessageBox.confirm(
      t('admin.couponDeleteConfirm', { code: coupon.code }),
      t('common.confirm'),
      { type: 'warning' }
    )
    await couponApi.delete(coupon.id)
    ElMessage.success(t('admin.couponDeleteSuccess'))
    await fetchCoupons()
  } catch (err: unknown) {
    if (!isCancelError(err)) {
      ElMessage.error(getErrorMessage(err, t('admin.operationFailed')))
    }
  }
}

async function handleSubmit() {
  saving.value = true
  try {
    const payload: CouponForm = {
      code: form.code,
      discountType: form.discountType,
      discountValue: form.discountValue,
      minPurchase: form.minPurchase,
      maxDiscount: form.maxDiscount,
      quantity: form.quantity,
      isActive: form.isActive,
      expireAt: form.expireAt ? form.expireAt + ':00' : null
    }

    if (isEdit.value) {
      await couponApi.update(form.id, payload)
      ElMessage.success(t('admin.couponUpdateSuccess'))
    } else {
      await couponApi.create(payload)
      ElMessage.success(t('admin.couponCreateSuccess'))
    }
    dialogVisible.value = false
    await fetchCoupons()
  } catch (err: unknown) {
    ElMessage.error(getErrorMessage(err, t('admin.operationFailed')))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>{{ t('admin.couponManage') }}</h1>
    </div>

    <div class="toolbar">
      <div></div> <!-- 左邊留空，保持 flex 對齊 -->
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        {{ t('admin.addCoupon') }}
      </el-button>
    </div>

    <el-table :data="coupons" v-loading="loading">
      <el-table-column prop="code" :label="t('admin.couponCode')" min-width="130" />
      <el-table-column :label="t('admin.couponType')" min-width="110">
        <template #default="{ row }">
          {{ row.discountType === 'PERCENTAGE' ? t('admin.percentage') : t('admin.fixedAmount') }}
        </template>
      </el-table-column>
      <el-table-column prop="discountValue" :label="t('admin.discountValue')" min-width="90" />
      <el-table-column :label="t('admin.usedTotal')" min-width="110">
        <template #default="{ row }">{{ row.usedCount }} / {{ row.quantity }}</template>
      </el-table-column>
      <el-table-column :label="t('admin.status')" min-width="90">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
            {{ row.isActive ? t('admin.enable') : t('admin.disable') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('admin.action')" min-width="170">
        <template #default="{ row }">
          <el-button size="small" type="primary" :icon="Edit" @click="handleEdit(row)">
            {{ t('admin.edit') }}
          </el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">
            {{ t('admin.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? t('admin.editCoupon') : t('admin.addCoupon')" style="width: 600px; max-width: 95vw">
      <el-form :model="form" label-width="100px">
        <el-form-item :label="t('admin.couponCode')">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item :label="t('admin.couponType')">
          <el-select v-model="form.discountType" style="width: 100%">
            <el-option value="FIXED_AMOUNT" :label="t('admin.fixedAmount')" />
            <el-option value="PERCENTAGE" :label="t('admin.percentage')" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('admin.discountValue')">
          <el-input-number v-model="form.discountValue" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('admin.minPurchase')">
          <el-input-number v-model="form.minPurchase" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="form.discountType === 'PERCENTAGE'" :label="t('admin.maxDiscount')">
          <el-input-number v-model="form.maxDiscount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('admin.quantity')">
          <el-input-number v-model="form.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('admin.expireAt')">
          <el-input v-model="form.expireAt" type="datetime-local" />
        </el-form-item>
        <el-form-item :label="t('admin.status')">
          <el-switch
            v-model="form.isActive"
            :active-text="t('admin.enable')"
            :inactive-text="t('admin.disable')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('admin.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          {{ t('admin.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-page {
  max-width: 1100px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: var(--font-h1);
  margin: 0 0 20px 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

:deep(.el-table) {
  width: 100% !important;
  font-size: var(--font-body);
}

:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper) {
  width: 100% !important;
}

:deep(.el-table th) {
  font-size: var(--font-body);
}

:deep(.el-table td) {
  font-size: var(--font-body);
}

:deep(.el-dialog__title) {
  font-size: var(--font-h3);
}

:deep(.el-form-item__label) {
  font-size: var(--font-body);
}
</style>