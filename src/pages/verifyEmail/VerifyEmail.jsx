import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './VerifyEmail.css';
import { FaHome } from 'react-icons/fa';
import { sendVerificationOTP, verifyEmail } from '../../services/AuthService';
import { useUser } from '../../contexts/UserContext';
import notification from '../../utils/notification';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const VerifyEmail = () => {
    useDocumentTitle('Xác thực email');
    const navigate = useNavigate();
    const location = useLocation();
    const { login: userLogin } = useUser();
    const [email, setEmail] = useState(location.state?.email || '');
    const [otpCode, setOtpCode] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (!email) {
            notification.error('Không tìm thấy email. Vui lòng đăng ký lại.', 'Lỗi');
            navigate('/register');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResendOTP = async () => {
        if (countdown > 0) return;

        setResending(true);
        const result = await sendVerificationOTP(email);
        setResending(false);

        if (result.success) {
            notification.success('Đã gửi lại mã OTP', 'Thành công!');
            setCountdown(60);
        } else {
            notification.error(result.message, 'Gửi lại OTP thất bại');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({});

        if (!otpCode.trim()) {
            setErrors({ otpCode: 'Vui lòng nhập mã OTP' });
            return;
        }

        if (otpCode.length !== 6) {
            setErrors({ otpCode: 'Mã OTP phải có 6 chữ số' });
            return;
        }

        setLoading(true);

        const result = await verifyEmail(email, otpCode);

        setLoading(false);

        if (result.success) {
            if (result.user) {
                userLogin(result.user);
            }
            notification.success('Xác thực email thành công!', 'Chào mừng!');
            navigate('/');
        } else {
            const errorMessage = result.message || 'Xác thực thất bại';
            notification.error(errorMessage, 'Xác thực thất bại');

            if (result.errors) {
                setErrors(result.errors);
            }
        }
    };

    return (
        <div className="verify-email-container">
            <div className="verify-email-box">
                <div className="verify-email-header">
                    <h1 className="verify-email-title">Xác Thực Email</h1>
                    <button
                        type="button"
                        className="verify-home-button"
                        onClick={() => navigate('/')}
                        title="Về trang chủ"
                    >
                        <FaHome />
                    </button>
                </div>

                <div className="verify-email-info">
                    <p>Mã OTP đã được gửi đến email:</p>
                    <strong>{email}</strong>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="verify-input-group">
                        <input
                            type="text"
                            placeholder="Nhập mã OTP (6 chữ số)"
                            value={otpCode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setOtpCode(value);
                                setErrors({});
                            }}
                            className={`verify-email-input ${errors.otpCode ? 'error' : ''}`}
                            disabled={loading}
                            maxLength={6}
                        />
                        {errors.otpCode && <span className="verify-error-message">{errors.otpCode}</span>}
                    </div>

                    <button type="submit" className="verify-email-button" disabled={loading}>
                        {loading ? 'Đang xác thực...' : 'Xác thực'}
                    </button>
                </form>

                <div className="verify-email-links">
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        className="verify-resend-button"
                        disabled={resending || countdown > 0}
                    >
                        {resending ? 'Đang gửi...' : countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại mã OTP'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
