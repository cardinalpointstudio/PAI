/**
 * Shared types between server and client
 */

export interface User {
	id: string
	email: string
	name: string
	createdAt: Date
}

export interface ApiResponse<T> {
	data: T
	error?: string
	timestamp: string
}

export interface HealthCheck {
	status: 'ok' | 'error'
	timestamp: string
}
