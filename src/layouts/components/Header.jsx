import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaUser, FaSignOutAlt, FaBars, FaSearch } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import logo from '../../assets/images/logo.png';
import './Header.css';

const Header = ({ toggleSidebar, isAdmin = false }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

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
                    <Link to="/practice" className="nav-link">
                        Thực hành
                    </Link>
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
                    <input type="text" placeholder="Tìm kiếm khóa học, bài tập..." />
                </div>

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
                        <span>Nguyễn Văn A</span>
                    </button>

                    {showUserMenu && (
                        <div className="user-dropdown">
                            <Link to="/profile" className="dropdown-item">
                                <FaUser /> Hồ sơ cá nhân
                            </Link>
                            {isAdmin && (
                                <Link to="/admin/dashboard" className="dropdown-item">
                                    <MdDashboard /> Quản trị
                                </Link>
                            )}
                            <button onClick={handleLogout} className="dropdown-item logout">
                                <FaSignOutAlt /> Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
