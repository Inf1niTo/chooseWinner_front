const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001', // Заменить на IP виртуальной машины
      changeOrigin: true,
    })
  );
};
