import { useEffect, useState } from 'react'

export function App() {
	const [message, setMessage] = useState<string>('Loading...')

	useEffect(() => {
		fetch('/api/hello')
			.then((res) => res.json())
			.then((data) => setMessage(data.message))
			.catch(() => setMessage('Failed to connect to server'))
	}, [])

	return (
		<main>
			<h1>{{PROJECT_NAME}}</h1>
			<p>Server says: {message}</p>
		</main>
	)
}
