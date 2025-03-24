import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 从项目根目录加载.env文件
  const rootEnv = loadEnv(mode, resolve(__dirname, '..'), '');
  
  // 只获取以VITE_开头的环境变量
  const viteEnv = Object.keys(rootEnv)
    .filter(key => key.startsWith('VITE_'))
    .reduce((env, key) => {
      env[key] = rootEnv[key];
      return env;
    }, {} as Record<string, string>);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    define: {
      'process.env': viteEnv,
    },
  };
}); 