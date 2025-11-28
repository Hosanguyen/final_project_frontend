import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaUser, FaSignOutAlt, FaBars, FaSearch } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import logo from '../../assets/images/logo.png';
import './Header.css';

const Header = ({ toggleSidebar, isAdmin = false }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
        navigate('/login');
    };

    // Check authentication status on component mount
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('accessToken');
            const userData = localStorage.getItem('user');
            
            if (token && userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    setIsLoggedIn(true);
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    setIsLoggedIn(false);
                }
            } else {
                setIsLoggedIn(false);
            }
        };

        checkAuth();

        // Listen for storage changes (e.g., login in another tab)
        window.addEventListener('storage', checkAuth);
        
        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    return (
        <header className="header">
            <div className="header-left">
                {isAdmin && (
                    <button className="menu-toggle" onClick={toggleSidebar}>
                        <FaBars />
                    </button>
                )}
                <Link to="/" className="logo">
                    <img src={logo} alt="Logo" />
                    <span>CodeLearn</span>
                </Link>
            </div>

            {!isAdmin && (
                <nav className="header-nav">
                    <Link to="/courses" className="nav-link">
                        Khóa học
                    </Link>
                    <div className="nav-link dropdown">
                        <span className="dropdown-toggle">Thực hành</span>
                        <div className="dropdown-menu">
                            <Link to="/practice" className="dropdown-item">Bài tập</Link>
                            <Link to="/practice/ranking" className="dropdown-item">Bảng xếp hạng</Link>
                        </div>
                    </div>
                    <Link to="/contests" className="nav-link">
                        Thi đấu
                    </Link>
                    <Link to="/leaderboard" className="nav-link">
                        Bảng xếp hạng
                    </Link>
                    <Link to="/forum" className="nav-link">
                        Diễn đàn
                    </Link>
                </nav>
            )}

            <div className="header-right">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input type="text" placeholder="Tìm kiếm khóa học, bài tập..."/>
                </div>

                {isLoggedIn ? (
                    <>
                        <div className="notification-wrapper">
                            <button className="icon-button" onClick={() => setShowNotifications(!showNotifications)}>
                                <FaBell />
                                <span className="badge">3</span>
                            </button>

                            {showNotifications && (
                                <div className="notification-dropdown">
                                    <div className="notification-header">
                                        <h4>Thông báo</h4>
                                        <Link to="/notifications">Xem tất cả</Link>
                                    </div>
                                    <div className="notification-list">
                                        <div className="notification-item unread">
                                            <p>Bạn có bài tập mới trong khóa Python cơ bản</p>
                                            <span className="time">2 giờ trước</span>
                                        </div>
                                        <div className="notification-item">
                                            <p>Contest "Weekly Challenge #45" sắp bắt đầu</p>
                                            <span className="time">5 giờ trước</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="user-menu-wrapper">
                            <button className="user-button" onClick={() => setShowUserMenu(!showUserMenu)}>
                                <FaUser />
                                <span>{user?.full_name || user?.username || user?.email || 'User'}</span>
                            </button>

                            {showUserMenu && (
                                <div className="user-dropdown">
                                    <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                        <FaUser /> Hồ sơ cá nhân
                                    </Link>
                                    {!isAdmin && (
                                        <Link to="/admin/dashboard" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                            <MdDashboard /> Quản trị
                                        </Link>
                                    )}
                                    <button onClick={() => {
                                            setShowUserMenu(false); 
                                            handleLogout();         
                                        }} className="dropdown-item logout">
                                        <FaSignOutAlt /> Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="btn-login">
                            Đăng nhập
                        </Link>
                        <Link to="/register" className="btn-register">
                            Đăng ký
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
