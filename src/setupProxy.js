const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://45.131.41.170:5001',
      changeOrigin: true,
    })
  );
};
