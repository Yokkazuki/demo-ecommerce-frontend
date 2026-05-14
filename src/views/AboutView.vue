<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const frontendTech = [
  { name: 'Vue 3', desc: t('about.vue3') },
  { name: 'Vite', desc: t('about.vite') },
  { name: 'Pinia', desc: t('about.pinia') },
  { name: 'Vue Router', desc: t('about.vueRouter') },
  { name: 'Element Plus', desc: t('about.elementPlus') },
  { name: 'Vue I18n', desc: t('about.vueI18n') },
  { name: 'Axios', desc: t('about.axios') },
  { name: 'Vercel Blob', desc: t('about.vercelBlob') }
]

const backendTech = [
  { name: 'Spring Boot 3', desc: t('about.springBoot') },
  { name: 'Spring Security', desc: t('about.springSecurity') },
  { name: 'Spring Data JPA', desc: t('about.springDataJpa') },
  { name: 'PostgreSQL', desc: t('about.postgresql') },
  { name: 'Redis', desc: t('about.redis') },
  { name: 'Swagger', desc: t('about.swagger') },
  { name: 'Docker Compose', desc: t('about.docker') }
]

import { computed } from 'vue'

const features = computed(() => [
  t('about.f1'),
  t('about.f2'),
  t('about.f3'),
  t('about.f4'),
  t('about.f5'),
  t('about.f6'),
  t('about.f7'),
  t('about.f8'),
  t('about.f9'),
  t('about.f10'),
  t('about.f11'),
  t('about.f12'),
  t('about.f13'),
  t('about.f14')
])
</script>

<template>
  <div class="about-page">
    <h1>{{ t('common.aboutTitle') }}</h1>
    <p class="subtitle">{{ t('common.aboutDesc') }}</p>

    <el-card class="section">
      <template #header><h2>{{ t('common.features') }}</h2></template>
      <el-row :gutter="[12, 8]">
        <el-col v-for="(f, i) in features" :key="i" :xs="12" :sm="6">
          <span class="feature-tag">✅ {{ f }}</span>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="24" style="margin-top: 24px">
      <el-col :xs="24" :md="12">
        <el-card class="section">
          <template #header><h2>{{ t('common.frontend') }}</h2></template>
          <div v-for="tech in frontendTech" :key="tech.name" class="tech-item">
            <span class="tech-name">{{ tech.name }}</span>
            <span class="tech-desc">{{ tech.desc }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12" style="margin-top: 16px">
        <el-card class="section">
          <template #header><h2>{{ t('common.backend') }}</h2></template>
          <div v-for="tech in backendTech" :key="tech.name" class="tech-item">
            <span class="tech-name">{{ tech.name }}</span>
            <span class="tech-desc">{{ tech.desc }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.subtitle {
  color: var(--text-light);
  font-size: var(--font-body);
  margin-bottom: 32px;
}

.section {
  margin-bottom: 16px;
}

.section h2 {
  margin: 0;
  font-size: var(--font-h3);
}

.feature-tag {
  display: block;
  padding: 4px 0;
  font-size: var(--font-small);
  color: var(--text);
}

.tech-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.tech-item:last-child {
  border-bottom: none;
}

.tech-name {
  font-weight: 600;
  font-size: var(--font-body);
}

.tech-desc {
  color: var(--text-light);
  font-size: var(--font-small);
}

@media (max-width: 768px) {
  .el-col {
    margin-top: 0 !important;
  }
}
</style>