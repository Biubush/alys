/// <reference types="vite/client" />

// 声明全局变量
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 声明process.env
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    readonly VITE_API_BASE_URL: string;
    // 更多环境变量...
  }
} 