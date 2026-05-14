<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useProductStore } from '@/stores/product'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { uploadImage } from '@/api/upload'
import { isCancelError, getErrorMessage } from '@/utils/error'
import type { Product } from '@/api/product'
import { tagApi, type Tag } from '@/api/tag'

const { t } = useI18n()
const productStore = useProductStore()

const searchKeyword = ref('')
const currentPage = ref(1)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const saving = ref(false)
const uploading = ref(false)
const allTags = ref<Tag[]>([])

const defaultForm = () => ({
  id: 0,
  name: '',
  description: '',
  price: 0,
  stock: 0,
  imageUrl: '',
  isActive: true,
  tagIds: [] as number[]
})

const form = reactive(defaultForm())

const formRules = computed(() => ({
  name: [{ required: true, message: t('admin.nameRequired'), trigger: 'blur' }],
  price: [{ required: true, message: t('admin.priceRequired'), trigger: 'blur' }],
  stock: [{ required: true, message: t('admin.stockRequired'), trigger: 'blur' }]
}))

const formRef = ref()

onMounted(async () => {
  productStore.fetchAllProducts(0)
  const res = await tagApi.getAll()
  allTags.value = res.data
})

function handleSearch() {
  currentPage.value = 1
  if (searchKeyword.value.trim()) {
    productStore.searchAllProducts(searchKeyword.value.trim(), 0)
  } else {
    productStore.fetchAllProducts(0)
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  if (searchKeyword.value.trim()) {
    productStore.searchAllProducts(searchKeyword.value.trim(), page - 1)
  } else {
    productStore.fetchAllProducts(page - 1)
  }
}

// ---------- 圖片上傳 ----------
async function handleImageUpload(file: File) {
  uploading.value = true
  try {
    const url = await uploadImage(file)
    form.imageUrl = url
    ElMessage.success(t('admin.uploadSuccess'))
  } catch {
    ElMessage.error(t('admin.uploadFailed'))
  } finally {
    uploading.value = false
  }
}

// ---------- 新增 ----------
function handleCreate() {
  isEdit.value = false
  dialogTitle.value = t('admin.addProduct')
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

// ---------- 編輯 ----------
function handleEdit(product: Product) {
  isEdit.value = true
  dialogTitle.value = t('admin.editProduct')
  form.id = product.id
  form.name = product.name
  form.description = product.description || ''
  form.price = product.price
  form.stock = product.stock
  form.imageUrl = product.imageUrl || ''
  form.isActive = product.isActive
  form.tagIds = product.tags?.map(t => t.id) || []
  dialogVisible.value = true
}

// ---------- 刪除 ----------
async function handleDelete(product: Product) {
  try {
    await ElMessageBox.confirm(
      t('admin.deleteConfirm', { name: product.name }),
      t('common.confirm'),
      { type: 'warning' }
    )
    await productStore.deleteProduct(product.id)
    ElMessage.success(t('admin.deleteSuccess'))
  } catch (err: unknown) {
    if (!isCancelError(err)) {
      ElMessage.error(getErrorMessage(err, t('admin.operationFailed')))
    }
  }
}

// ---------- 送出 ----------
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const payload = {
      name: form.name,
      description: form.description,
      price: form.price,
      stock: form.stock,
      imageUrl: form.imageUrl,
      isActive: form.isActive,
      tags: form.tagIds.map(id => allTags.value.find(t => t.id === id)!)
    }

    if (isEdit.value) {
      await productStore.updateProduct(form.id, payload)
      ElMessage.success(t('admin.updateSuccess'))
    } else {
      await productStore.createProduct(payload)
      ElMessage.success(t('admin.createSuccess'))
    }
    dialogVisible.value = false
    handlePageChange(currentPage.value)
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
      <h1>{{ t('admin.productManage') }}</h1>
    </div>

    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        :placeholder="t('admin.searchPlaceholder')"
        clearable
        @keyup.enter="handleSearch"
        @clear="handleSearch"
        style="width: 300px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        {{ t('admin.addProduct') }}
      </el-button>
    </div>


    <el-table :data="productStore.products" v-loading="productStore.loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" :label="t('admin.name')" min-width="150" />
      <el-table-column :label="t('admin.price')" width="100">
        <template #default="{ row }">${{ row.price.toLocaleString() }}</template>
      </el-table-column>
      <el-table-column prop="stock" :label="t('admin.stock')" width="80" />
      <el-table-column :label="t('admin.status')" width="80">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
            {{ row.isActive ? t('admin.active') : t('admin.inactive') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('admin.action')" width="260">
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

    <!-- 分頁 -->
    <div v-if="productStore.totalPages > 1" style="text-align: center; margin-top: 20px">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="productStore.totalElements"
        :page-size="10"
        v-model:current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" style="width: 600px; max-width: 95vw">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item :label="t('admin.name')" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="t('admin.description')">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item :label="t('admin.tags')">
          <el-select
            v-model="form.tagIds"
            multiple
            :placeholder="t('admin.selectTags')"
            style="width: 100%"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            >
              <span :style="{ color: tag.color }">●</span> {{ tag.name }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="t('admin.price')" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('admin.stock')" prop="stock">
          <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="t('admin.imageUrl')">
          <div class="upload-area">
            <el-input v-model="form.imageUrl" :placeholder="t('admin.imageUrl')" style="margin-bottom: 8px" />
            <el-upload
              :show-file-list="false"
              :before-upload="(file: File) => { handleImageUpload(file); return false }"
              accept="image/*"
            >
              <el-button :loading="uploading" size="small">
                {{ uploading ? t('admin.uploading') : t('admin.uploadImage') }}
              </el-button>
            </el-upload>
            <img v-if="form.imageUrl" :src="form.imageUrl" class="preview-img" :alt="t('admin.imagePreview')" />
          </div>
        </el-form-item>
        <el-form-item v-if="isEdit" :label="t('admin.status')">
          <el-switch
            v-model="form.isActive"
            :active-text="t('admin.active')"
            :inactive-text="t('admin.inactive')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('admin.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          {{ isEdit ? t('admin.update') : t('admin.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
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