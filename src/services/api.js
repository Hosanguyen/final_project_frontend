// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Xử lý lỗi 401 Unauthorized hoặc 403 Forbidden
        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403) &&
            !originalRequest._retry
        ) {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            // Trường hợp 1: Không có token và gặp 401/403 → chuyển về login
            if (!accessToken && !refreshToken) {
                console.warn('No authentication. Redirect to login.');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            // Trường hợp 2: Token invalid hoặc hết hạn → thử refresh
            if (error.response.data?.detail === 'Invalid token' && refreshToken) {
                originalRequest._retry = true;

                // Nếu đang refresh token thì chờ cho đến khi refresh xong
                if (isRefreshing) {
                    return new Promise(function (resolve, reject) {
                        failedQueue.push({ resolve, reject });
                    })
                        .then((token) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return api(originalRequest);
                        })
                        .catch((err) => Promise.reject(err));
                }

                // === Bắt đầu refresh token ===
                isRefreshing = true;

                try {
                    const response = await axios.post(`${API_URL}/api/users/refresh/`, {
                        refresh: refreshToken,
                    });

                    const newAccessToken = response.data.tokens.access;
                    const newRefreshToken = response.data.tokens.refresh;

                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
                    processQueue(null, newAccessToken);
                    isRefreshing = false;

                    // Gửi lại request ban đầu với access token mới
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    isRefreshing = false;
                    console.error('Refresh token failed:', refreshError);

                    // Xóa token và chuyển về trang login
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }

            // Trường hợp 3: Có token nhưng gặp 403 (permission denied)
            // → Không redirect, để component xử lý
            // Hoặc có thể redirect về trang chủ nếu muốn
            if (accessToken && error.response.status === 403) {
                console.warn('Access denied. You do not have permission.');
                // Uncomment dòng dưới nếu muốn redirect về trang chủ
                // window.location.href = '/';
            }
        }

        // Trả lỗi nếu không phải lỗi token
        return Promise.reject(error);
    },
);

export default api;
