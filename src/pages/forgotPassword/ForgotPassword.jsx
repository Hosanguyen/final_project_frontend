import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import { FaHome } from 'react-icons/fa';
import { forgotPassword } from '../../services/AuthService';
import notification from '../../utils/notification';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const ForgotPassword = () => {
    useDocumentTitle('Quên mật khẩu');
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({});

        if (!email.trim()) {
            setErrors({ email: 'Vui lòng nhập email' });
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: 'Email không hợp lệ' });
            return;
        }

        setLoading(true);

        const result = await forgotPassword(email);

        setLoading(false);

        if (result.success) {
            notification.success('Mã OTP đã được gửi đến email của bạn', 'Thành công!');
            navigate('/reset-password', { state: { email } });
        } else {
            const errorMessage = result.message || 'Không thể gửi OTP';
            notification.error(errorMessage, 'Thất bại');

            if (result.errors) {
                setErrors(result.errors);
            }
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-box">
                <div className="forgot-password-header">
                    <h1 className="forgot-password-title">Quên Mật Khẩu</h1>
                    <button
                        type="button"
                        className="forgot-home-button"
                        onClick={() => navigate('/')}
                        title="Về trang chủ"
                    >
                        <FaHome />
                    </button>
                </div>

                <div className="forgot-password-info">
                    <p>Nhập email của bạn để nhận mã OTP đặt lại mật khẩu</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="forgot-input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors({});
                            }}
                            className={`forgot-password-input ${errors.email ? 'error' : ''}`}
                            disabled={loading}
                        />
                        {errors.email && <span className="forgot-error-message">{errors.email}</span>}
                    </div>

                    <button type="submit" className="forgot-password-button" disabled={loading}>
                        {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                    </button>
                </form>

                <div className="forgot-password-links">
                    <button type="button" onClick={() => navigate('/login')} className="forgot-back-button">
                        Quay lại đăng nhập
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
