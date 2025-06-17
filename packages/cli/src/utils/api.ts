import { getAuthConfig } from "./auth.js";
import axios from "axios";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// Add auth token to requests
api.interceptors.request.use(config => {
	const { token } = getAuthConfig();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Handle auth errors
api.interceptors.response.use(
	response => response,
	error => {
		if (error.response?.status === 401) {
			console.error("Authentication error. Please run 'nimbus login' again.");
			process.exit(1);
		}
		return Promise.reject(error);
	}
);

export default api;
