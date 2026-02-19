import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [react()],
	root: 'src/client',
	publicDir: '../../public',
	build: {
		outDir: '../../dist/client',
		emptyOutDir: true,
	},
	resolve: {
		alias: {
			'@shared': resolve(__dirname, 'src/shared'),
			'@client': resolve(__dirname, 'src/client'),
		},
	},
	server: {
		port: 5173,
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
			},
		},
	},
})
