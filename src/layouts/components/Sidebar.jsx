import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    MdDashboard,
    MdSchool,
    MdQuiz,
    MdEmojiEvents,
    MdPeople,
    MdForum,
    MdBarChart,
    MdSettings,
    MdCode,
    MdLanguage,
    MdLocalOffer,
} from 'react-icons/md';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
    const location = useLocation();
    const [expandedMenu, setExpandedMenu] = useState({});

    const menuItems = [
        {
            title: 'Tổng quan',
            icon: <MdDashboard />,
            path: '/admin/dashboard',
        },
        {
            title: 'Quản lý khóa học',
            icon: <MdSchool />,
            path: '/admin/courses',
            subMenu: [
                { title: 'Danh sách khóa học', path: '/admin/courses' },
                { title: 'Quản lý bài học', path: '/admin/lessons' },
            ],
        },
        {
            title: 'Bài tập lập trình',
            icon: <MdCode />,
            path: '/admin/problems',
            subMenu: [
                { title: 'Danh sách bài tập', path: '/admin/problems' },
                { title: 'Thêm bài tập mới', path: '/admin/problems/create' },
                { title: 'Test cases', path: '/admin/testcases' },
            ],
        },
        {
            title: 'Thi & Quiz',
            icon: <MdQuiz />,
            path: '/admin/quizzes',
            subMenu: [
                { title: 'Danh sách Quiz', path: '/admin/quizzes' },
                { title: 'Tạo Quiz mới', path: '/admin/quizzes/create' },
            ],
        },
        {
            title: 'Contest',
            icon: <MdEmojiEvents />,
            path: '/admin/contests',
            subMenu: [
                { title: 'Danh sách Contest', path: '/admin/contests' },
                { title: 'Tạo Contest mới', path: '/admin/contests/create' },
                { title: 'Bảng xếp hạng', path: '/admin/leaderboard' },
            ],
        },
        {
            title: 'Người dùng',
            icon: <MdPeople />,
            path: '/admin/users',
            subMenu: [
                { title: 'Danh sách học viên', path: '/admin/users' },
                { title: 'Quản lý quyền', path: '/admin/roles' },
                { title: 'Phân quyền', path: '/admin/permissions' },
                { title: 'Loại phân quyền', path: '/admin/permission-categories' },
            ],
        },
        {
            title: 'Ngôn ngữ lập trình',
            icon: <MdLanguage />,
            path: '/admin/languages',
        },
        {
            title: 'Quản lý thẻ',
            icon: <MdLocalOffer />,
            path: '/admin/tags',
        },
        {
            title: 'Thống kê',
            icon: <MdBarChart />,
            path: '/admin/statistics',
            subMenu: [
                { title: 'Báo cáo người dùng', path: '/admin/statistics/user-reports' },
                { title: 'Báo cáo khóa học', path: '/admin/statistics/course-reports' },
                { title: 'Báo cáo Contest', path: '/admin/statistics/contest-reports' },
                { title: 'Báo cáo Doanh thu', path: '/admin/statistics/revenue-reports' },
            ],
        },
    ];

    const toggleMenu = (index) => {
        setExpandedMenu((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-content">
                {menuItems.map((item, index) => (
                    <div key={index} className="menu-item-wrapper">
                        {item.subMenu ? (
                            <>
                                <div
                                    className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => toggleMenu(index)}
                                >
                                    <span className="menu-icon">{item.icon}</span>
                                    <span className="menu-title">{item.title}</span>
                                    <span className="menu-arrow">
                                        {expandedMenu[index] ? <FaChevronUp /> : <FaChevronDown />}
                                    </span>
                                </div>
                                {expandedMenu[index] && (
                                    <div className="submenu">
                                        {item.subMenu.map((subItem, subIndex) => (
                                            <Link
                                                key={subIndex}
                                                to={subItem.path}
                                                className={`submenu-item ${isActive(subItem.path) ? 'active' : ''}`}
                                            >
                                                {subItem.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link to={item.path} className={`menu-item ${isActive(item.path) ? 'active' : ''}`}>
                                <span className="menu-icon">{item.icon}</span>
                                <span className="menu-title">{item.title}</span>
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
