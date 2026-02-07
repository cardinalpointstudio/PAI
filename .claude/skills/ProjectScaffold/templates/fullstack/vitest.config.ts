import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
	test: {
		root: '.',
		include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
		exclude: ['node_modules', 'dist'],
	},
	resolve: {
		alias: {
			'@shared': resolve(__dirname, 'src/shared'),
			'@server': resolve(__dirname, 'src/server'),
			'@client': resolve(__dirname, 'src/client'),
		},
	},
})
