import { createI18n } from 'vue-i18n'
import zhTW from './zh-TW'
import en from './en'

const i18n = createI18n({
  legacy: false,      // 使用 Composition API 模式
  locale: 'zh-TW',    // 預設繁體中文
  fallbackLocale: 'en',
  messages: {
    'zh-TW': zhTW,
    en: en
  }
})

export default i18n