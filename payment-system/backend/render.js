// render.js - Render平台部署专用入口文件
console.log('使用Render专用入口文件启动应用');

// 设置环境变量
process.env.USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE || 'true';
process.env.RENDER = 'true';

// 导入并运行主服务器文件
require('./server.js');