import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    publicDir: "",
    base:"./",
    build: {
        outDir:"ipfs-video-player",
        assetsDir:"assets"
    },
    server: {
        host: '0.0.0.0'
    }
})
