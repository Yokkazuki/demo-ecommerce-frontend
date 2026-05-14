/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_BLOB_READ_WRITE_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
