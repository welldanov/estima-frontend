import react, {reactCompilerPreset} from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        babel({presets: [reactCompilerPreset()]}),
        svgr(),
    ],
    resolve: {
        alias: {
            '@src': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        proxy: {
            "/api": {
                target: "http://127.0.0.1:8000",
                changeOrigin: true,
            },
        },
    },
})
