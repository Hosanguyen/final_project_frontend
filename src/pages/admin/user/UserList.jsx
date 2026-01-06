import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserShield, FaCheck, FaTimes } from 'react-icons/fa';
import UserService from '../../../services/UserService';
import Pagination from '../../../components/Pagination';
import './UserList.css';
import notification from '../../../utils/notification';

const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(10);

    useEffect(() => {
        loadUsers();
    }, [currentPage]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                page: currentPage,
                page_size: pageSize,
            };
            const response = await UserService.getAll(params);
            setUsers(response.results || []);
            setTotalItems(response.total || 0);
            setTotalPages(response.total_pages || 1);
        } catch (error) {
            console.error('Failed to load users:', error);
            notification.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSearch = () => {
        setCurrentPage(1);
        loadUsers();
    };
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDelete = async () => {
        if (!selectedUser) return;

        try {
            const response = await UserService.delete(selectedUser.id);
            notification.success(response.detail);
            loadUsers();
            setShowDeleteModal(false);
            setSelectedUser(null);
        } catch (error) {
            console.error('Delete failed:', error);
            if (error.response?.data?.detail) {
                notification.error(error.response.data.detail);
            } else {
                notification.error('Xóa người dùng thất bại');
            }
        }
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    if (loading && users.length === 0) {
        return (
            <div className="user-list-loading-container">
                <div className="user-list-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="user-list">
            <div className="user-list-page-header">
                <div className="user-list-header-left">
                    <h1>Quản lý người dùng</h1>
                    <p className="user-list-subtitle">Quản lý tài khoản và phân quyền người dùng trong hệ thống</p>
                </div>
                <button className="user-list-btn-create" onClick={() => navigate('/admin/users/create')}>
                    <FaPlus /> Tạo người dùng mới
                </button>
            </div>

            <div className="user-list-content-card">
                <div className="user-list-card-header">
                    <div className="user-list-search-box">
                        <FaSearch className="user-list-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo username, email, họ tên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="user-list-stats">
                        <span className="user-list-stat-item">
                            Tổng số: <strong>{totalItems}</strong>
                        </span>
                    </div>
                </div>

                <div className="user-list-table-container">
                    <table className="user-list-data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th style={{ width: '150px' }}>Username</th>
                                <th>Email</th>
                                <th>Họ tên</th>
                                <th style={{ width: '150px' }}>Vai trò</th>
                                <th style={{ width: '120px' }}>Trạng thái</th>
                                <th style={{ width: '150px' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="user-list-no-data">
                                        {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có người dùng nào'}
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <span className="user-list-id-badge">{user.id}</span>
                                        </td>
                                        <td>
                                            <code className="user-list-username-badge">{user.username}</code>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.full_name || '-'}</td>
                                        <td>
                                            {user.roles && user.roles.length > 0 ? (
                                                <div className="user-list-roles">
                                                    {user.roles.map((role) => (
                                                        <span key={role.id} className="user-list-role-badge">
                                                            <FaUserShield /> {role.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="user-list-text-muted">Chưa có</span>
                                            )}
                                        </td>
                                        <td>
                                            {user.active ? (
                                                <span className="user-list-status-badge user-list-status-active">
                                                    <FaCheck /> Hoạt động
                                                </span>
                                            ) : (
                                                <span className="user-list-status-badge user-list-status-inactive">
                                                    <FaTimes /> Vô hiệu hóa
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="user-list-action-buttons">
                                                <button
                                                    className="user-list-btn-action user-list-btn-edit"
                                                    onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="user-list-btn-action user-list-btn-delete"
                                                    onClick={() => openDeleteModal(user)}
                                                    title="Xóa"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    itemsPerPage={pageSize}
                />
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="user-list-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="user-list-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="user-list-modal-header">
                            <h3>Xác nhận xóa</h3>
                        </div>
                        <div className="user-list-modal-body">
                            <p>
                                Bạn có chắc chắn muốn xóa người dùng <strong>"{selectedUser?.username}"</strong>?
                            </p>
                            <p className="user-list-warning-text">
                                Lưu ý: Tất cả dữ liệu liên quan đến người dùng này sẽ bị mất và không thể khôi phục.
                            </p>
                        </div>
                        <div className="user-list-modal-footer">
                            <button className="user-list-btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                Hủy
                            </button>
                            <button className="user-list-btn-confirm-delete" onClick={handleDelete}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
