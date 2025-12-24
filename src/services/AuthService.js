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
        if (response.data.tokens?.access) {
            console.log(response.data.tokens.access)
            localStorage.setItem('accessToken', response.data.tokens.access);
            localStorage.setItem('refreshToken', response.data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return {
            success: true,
            data: response.data,
            user: response.data.user, // Trả về user data
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

// đăng xuất
export const logoutUser = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
            // Gọi API logout để revoke token
            await axios.post(`${API_URL}/api/users/logout/`, {
                refresh: refreshToken
            });
        }
        
        // Xóa dữ liệu local
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        return {
            success: true,
            message: 'Đăng xuất thành công!'
        };
    } catch (error) {
        // Vẫn xóa local storage ngay cả khi API fail
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        return {
            success: true, // Vẫn trả success vì đã xóa local
            message: 'Đăng xuất thành công!'
        };
    }
};
