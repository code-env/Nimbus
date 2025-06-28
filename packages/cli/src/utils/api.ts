import { getAuthConfig } from "./auth.js";
import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:1284/",
});

// Add auth token to requests
api.interceptors.request.use(config => {
	const { token } = getAuthConfig();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.request.use(config => {
	const { user } = getAuthConfig();
	if (user) {
		config.headers.session = JSON.stringify(user);
	}
	return config;
});

// Handle auth errors
api.interceptors.response.use(
	response => response,
	error => {
		console.log(error);
		if (error.response?.status === 401) {
			console.error("Authentication error. Please run 'nimbus login' again.");
			process.exit(1);
		}
		return Promise.reject(error);
	}
);

export default api;
