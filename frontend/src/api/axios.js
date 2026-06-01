import axios from 'axios';
const VITE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: VITE_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (
            error.response?.status === 401 &&
            !original._retry &&
            !original.url.includes('token/refresh') &&
            !original.url.includes('accounts/me')
        ) {
            original._retry = true;
            try {
                await axios.post(`${VITE_URL}token/refresh/`, {}, {
                    withCredentials: true,
                });
                return api(original);
            } catch {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;