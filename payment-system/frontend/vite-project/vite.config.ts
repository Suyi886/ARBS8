import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url'; // ✅ 官方推荐方式
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 可添加更多别名（可选）
      // '@components': fileURLToPath(new URL('./src/components', import.meta.url))
    }
  },
  define: {
    // ✅ 开启 hydration 不匹配详细信息（Vue 3.3+）
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true'
  }
});

