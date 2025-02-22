import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router'; // 导入路由配置

const app = createApp(App); // 先创建 Vue (应用,钥匙交给 app，明确操作的房子)
app.use(router); // 注册路由 (装修工人 (router) 开始装修（添加路由功能）)
app.mount('#app'); // 挂载 Vue 应用(最后把房子安装到你的地皮上（挂载到 DOM 上）)
