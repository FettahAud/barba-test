// vite.config.js
export default {
  build: {
    rollupOptions: {
      input: {
        main: '/src/main.js',
        index: './index.html',
        about: '/src/room-2.html'
      }
    }
  }
}