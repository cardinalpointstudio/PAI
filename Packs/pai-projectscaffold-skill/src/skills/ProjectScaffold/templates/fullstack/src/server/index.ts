import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('/api/*', cors())

// Health check
app.get('/api/health', (c) => {
	return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.get('/api/hello', (c) => {
	return c.json({ message: 'Hello from the server!' })
})

// Start server
const port = process.env.PORT || 3000
console.log(`Server running at http://localhost:${port}`)

export default {
	port,
	fetch: app.fetch,
}
