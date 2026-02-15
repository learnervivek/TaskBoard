import axios from 'axios'

const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

const instance = axios.create({ baseURL: apiBase + '/api' })

// attach token from localStorage for authenticated requests
instance.interceptors.request.use(config => {
	const token = localStorage.getItem('token')
	if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` }
	return config
})

export default instance
