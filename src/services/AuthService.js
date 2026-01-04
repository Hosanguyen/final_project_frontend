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
            console.log(response.data.tokens.access);
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
            await axios.post(`${API_URL}/api/users/logout/`, {
                refresh: refreshToken,
            });
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        return {
            success: true,
            message: 'Đăng xuất thành công!',
        };
    } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        return {
            success: true,
            message: 'Đăng xuất thành công!',
        };
    }
};

export const sendVerificationOTP = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/api/users/otp/send-verification/`, { email });
        return {
            success: true,
            data: response.data,
            message: response.data.message || 'Mã OTP đã được gửi đến email của bạn',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.detail || 'Không thể gửi OTP. Vui lòng thử lại!',
            errors: error.response?.data,
        };
    }
};

export const verifyEmail = async (email, otpCode) => {
    try {
        const response = await axios.post(`${API_URL}/api/users/otp/verify-email/`, {
            email,
            otp_code: otpCode,
        });

        return {
            success: true,
            data: response.data,
            user: response.data.user,
            message: response.data.message || 'Xác thực email thành công!',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.detail || 'Xác thực thất bại. Vui lòng thử lại!',
            errors: error.response?.data,
        };
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/api/users/otp/forgot-password/`, { email });
        return {
            success: true,
            data: response.data,
            message: response.data.message || 'Mã OTP đã được gửi đến email của bạn',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.detail || 'Không thể gửi OTP. Vui lòng thử lại!',
            errors: error.response?.data,
        };
    }
};

export const resetPasswordWithOTP = async (email, otpCode, newPassword, confirmPassword) => {
    try {
        const response = await axios.post(`${API_URL}/api/users/otp/reset-password/`, {
            email,
            otp_code: otpCode,
            new_password: newPassword,
            confirm_password: confirmPassword,
        });
        return {
            success: true,
            data: response.data,
            message: response.data.message || 'Đặt lại mật khẩu thành công!',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.detail || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại!',
            errors: error.response?.data,
        };
    }
};
