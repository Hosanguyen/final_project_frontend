import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import RoleService from '../../../services/RoleService';
import './RoleList.css';

const RoleList = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await RoleService.getAll();
            setRoles(data);
        } catch (error) {
            console.error('Failed to load roles:', error);
            alert('Không thể tải danh sách vai trò');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedRole) return;

        try {
            const response = await RoleService.delete(selectedRole.id);
            alert(response.detail);
            loadRoles();
            setShowDeleteModal(false);
            setSelectedRole(null);
        } catch (error) {
            console.error('Delete failed:', error);
            if (error.response?.data?.detail) {
                alert(error.response.data.detail);
            } else {
                alert('Xóa vai trò thất bại');
            }
        }
    };

    const openDeleteModal = (role) => {
        setSelectedRole(role);
        setShowDeleteModal(true);
    };

    const filteredRoles = roles.filter(
        (role) =>
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="role-list">
            <div className="page-header">
                <div className="header-left">
                    <h1>Quản lý vai trò</h1>
                    <p className="subtitle">Quản lý các vai trò và phân quyền trong hệ thống</p>
                </div>
                <button className="btn-create" onClick={() => navigate('/admin/roles/create')}>
                    <FaPlus /> Tạo vai trò mới
                </button>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc mô tả..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="stats">
                        <span className="stat-item">
                            Tổng số: <strong>{roles.length}</strong>
                        </span>
                    </div>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th style={{ width: '200px' }}>Tên vai trò</th>
                                <th>Mô tả</th>
                                <th style={{ width: '120px' }}>Số quyền</th>
                                <th style={{ width: '120px' }}>Số người dùng</th>
                                <th style={{ width: '150px' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoles.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-data">
                                        {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có vai trò nào'}
                                    </td>
                                </tr>
                            ) : (
                                filteredRoles.map((role) => (
                                    <tr key={role.id}>
                                        <td>
                                            <span className="id-badge">{role.id}</span>
                                        </td>
                                        <td>
                                            <strong>{role.name}</strong>
                                        </td>
                                        <td>{role.description || '-'}</td>
                                        <td>
                                            <span className="count-badge">{role.permission_count}</span>
                                        </td>
                                        <td>
                                            <span className="count-badge">{role.user_count}</span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-action btn-edit"
                                                    onClick={() => navigate(`/admin/roles/edit/${role.id}`)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="btn-action btn-delete"
                                                    onClick={() => openDeleteModal(role)}
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
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Xác nhận xóa</h3>
                        </div>
                        <div className="modal-body">
                            <p>
                                Bạn có chắc chắn muốn xóa vai trò <strong>"{selectedRole?.name}"</strong>?
                            </p>
                            {selectedRole?.user_count > 0 && (
                                <p className="warning-text">
                                    Lưu ý: Vai trò này đang được gán cho {selectedRole.user_count} người dùng. Không thể
                                    xóa!
                                </p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                Hủy
                            </button>
                            <button
                                className="btn-confirm-delete"
                                onClick={handleDelete}
                                disabled={selectedRole?.user_count > 0}
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleList;
