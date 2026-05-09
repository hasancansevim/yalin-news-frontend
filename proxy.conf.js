const target = process.env.API_PROXY_TARGET || 'https://localhost:7001';

module.exports = {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
  },
};
