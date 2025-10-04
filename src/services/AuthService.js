import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// đăng ký
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/api/users/register/`, userData);
        return {
            success: true,
            data: response.data,
            message: 'Đăng ký thành công!',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!',
            errors: error.response?.data,
        };
    }
};

// đăng nhập
export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/api/users/login/`, credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.access);
            // localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return {
            success: true,
            data: response.data,
            message: 'Đăng nhập thành công!',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!',
            errors: error.response?.data,
        };
    }
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
