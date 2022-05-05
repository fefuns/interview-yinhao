const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use('/api', proxy({ target: 'https://api.uomg.com', changeOrigin: true }));
};