import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResetPassword.css';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FaHome } from 'react-icons/fa';
import { resetPasswordWithOTP, forgotPassword } from '../../services/AuthService';
import notification from '../../utils/notification';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const ResetPassword = () => {
    useDocumentTitle('Đặt lại mật khẩu');
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [formData, setFormData] = useState({
        otpCode: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (!email) {
            notification.error('Không tìm thấy email. Vui lòng thử lại.', 'Lỗi');
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleResendOTP = async () => {
        if (countdown > 0) return;

        setResending(true);
        const result = await forgotPassword(email);
        setResending(false);

        if (result.success) {
            notification.success('Đã gửi lại mã OTP', 'Thành công!');
            setCountdown(60);
        } else {
            notification.error(result.message, 'Gửi lại OTP thất bại');
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.otpCode.trim()) {
            newErrors.otpCode = 'Vui lòng nhập mã OTP';
        } else if (formData.otpCode.length !== 6) {
            newErrors.otpCode = 'Mã OTP phải có 6 chữ số';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const errorKeys = Object.keys(newErrors);
            const firstError = newErrors[errorKeys[0]];
            notification.error(firstError, 'Lỗi validation');
            return;
        }

        setLoading(true);

        const result = await resetPasswordWithOTP(
            email,
            formData.otpCode,
            formData.newPassword,
            formData.confirmPassword,
        );

        setLoading(false);

        if (result.success) {
            notification.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', 'Thành công!');
            navigate('/login');
        } else {
            const errorMessage = result.message || 'Đặt lại mật khẩu thất bại';
            notification.error(errorMessage, 'Thất bại');

            if (result.errors) {
                setErrors(result.errors);
            }
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-box">
                <div className="reset-password-header">
                    <h1 className="reset-password-title">Đặt Lại Mật Khẩu</h1>
                    <button
                        type="button"
                        className="reset-home-button"
                        onClick={() => navigate('/')}
                        title="Về trang chủ"
                    >
                        <FaHome />
                    </button>
                </div>

                <div className="reset-password-info">
                    <p>Mã OTP đã được gửi đến email:</p>
                    <strong>{email}</strong>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="reset-input-group">
                        <input
                            type="text"
                            name="otpCode"
                            placeholder="Nhập mã OTP (6 chữ số)"
                            value={formData.otpCode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setFormData((prev) => ({ ...prev, otpCode: value }));
                                if (errors.otpCode) {
                                    setErrors((prev) => ({ ...prev, otpCode: '' }));
                                }
                            }}
                            className={`reset-password-input ${errors.otpCode ? 'error' : ''}`}
                            disabled={loading}
                            maxLength={6}
                        />
                        {errors.otpCode && <span className="reset-error-message">{errors.otpCode}</span>}
                    </div>

                    <div className="reset-input-group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="newPassword"
                            placeholder="Mật khẩu mới"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className={`reset-password-input ${errors.newPassword ? 'error' : ''}`}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="reset-toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                        >
                            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </button>
                        {errors.newPassword && <span className="reset-error-message">{errors.newPassword}</span>}
                    </div>

                    <div className="reset-input-group">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Xác nhận mật khẩu mới"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`reset-password-input ${errors.confirmPassword ? 'error' : ''}`}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="reset-toggle-password"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={loading}
                        >
                            {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </button>
                        {errors.confirmPassword && (
                            <span className="reset-error-message">{errors.confirmPassword}</span>
                        )}
                    </div>

                    <button type="submit" className="reset-password-button" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </button>
                </form>

                <div className="reset-password-links">
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        className="reset-resend-button"
                        disabled={resending || countdown > 0}
                    >
                        {resending ? 'Đang gửi...' : countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại mã OTP'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
