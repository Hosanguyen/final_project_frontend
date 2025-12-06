import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { loginUser } from '../../services/AuthService';
import { useUser } from '../../contexts/UserContext';
import notification from '../../utils/notification';

const Login = () => {
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
            setErrors({ username: 'Vui lòng nhập tên đăng nhập' });
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
            notification.success(result.message);
            navigate('/');
        } else {
            if (result.errors) {
                setErrors(result.errors);
            } else {
                notification.error(result.message);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">Đăng Nhập</h1>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Tên đăng nhập"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setErrors({});
                            }}
                            className={`login-input ${errors.username ? 'error' : ''}`}
                            disabled={loading}
                        />
                        {errors.username && <span className="error-message">{errors.username}</span>}
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
                        {errors.password && <span className="error-message">{errors.password}</span>}
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
