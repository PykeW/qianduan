declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 扩展 ImportMeta 接口
interface ImportMetaEnv {
  VITE_APP_TITLE: string
  MODE: string
  BASE_URL: string
  PROD: boolean
  DEV: boolean
  SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 