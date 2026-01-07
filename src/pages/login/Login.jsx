import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FaHome } from 'react-icons/fa';
import { loginUser } from '../../services/AuthService';
import { useUser } from '../../contexts/UserContext';
import notification from '../../utils/notification';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const Login = () => {
    useDocumentTitle('Đăng nhập');
    const navigate = useNavigate();
    const { login: userLogin } = useUser();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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

        if (!username.trim()) {
            setErrors({ username: 'Vui lòng nhập tên đăng nhập hoặc email' });
            return;
        }

        if (!password) {
            setErrors({ password: 'Vui lòng nhập mật khẩu' });
            return;
        }

        setLoading(true);

        const credentials = {
            username: username,
            password: password,
        };

        const result = await loginUser(credentials);

        setLoading(false);

        if (result.success) {
            // Lưu user data vào UserContext
            if (result.user) {
                userLogin(result.user);
            }
            notification.success('Đăng nhập thành công!', 'Chào mừng!');
            navigate('/');
        } else {
            // Hiển thị notification lỗi
            const errorMessage = result.message || 'Đăng nhập không thành công';
            notification.error(errorMessage, 'Đăng nhập thất bại');
            
            // Nếu có lỗi chi tiết, hiển thị trong form
            if (result.errors) {
                setErrors(result.errors);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1 className="login-title">Đăng Nhập</h1>
                    <button 
                        type="button" 
                        className="home-button" 
                        onClick={() => navigate('/')}
                        title="Về trang chủ"
                    >
                        <FaHome />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Tên đăng nhập hoặc Email"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setErrors({});
                            }}
                            className={`login-input ${errors.username ? 'error' : ''}`}
                            disabled={loading}
                        />
                        {errors.username && <span className="login-error-message">{errors.username}</span>}
                    </div>

                    <div className="input-group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors({});
                            }}
                            className={`login-input ${errors.password ? 'error' : ''}`}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                        >
                            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </button>
                        {errors.password && <span className="login-error-message">{errors.password}</span>}
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="login-links">
                    <Link to="/forgot-password" className="link">
                        Quên mật khẩu?
                    </Link>
                    <div>
                        <span>Tạo </span>
                        <Link to="/register" className="link">
                            tài khoản mới?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
