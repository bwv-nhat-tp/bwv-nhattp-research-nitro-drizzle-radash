export default defineNitroConfig({
  routeRules: {
    '/api/**': { cors: true }
  },
  devServer: {
    port: 3001
  }
});