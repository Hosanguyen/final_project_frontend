import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import PermissionService from '../../../services/PermissionService';
import Pagination from '../../../components/Pagination';
import './PermissionList.css';
import notification from '../../../utils/notification';

const PermissionList = () => {
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        loadPermissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, searchTerm]);

    const loadPermissions = async () => {
        setLoading(true);
        try {
            const data = await PermissionService.getAll({
                page: currentPage,
                page_size: pageSize,
                search: searchTerm || undefined
            });
            const response = data.results || data;
            setPermissions(Array.isArray(response) ? response : []);
            setTotalPages(data.total_pages || 1);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error('Failed to load permissions:', error);
            notification.error('Không thể tải danh sách phân quyền');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to page 1 when searching
    };

    const handleDelete = async () => {
        if (!selectedPermission) return;

        try {
            const response = await PermissionService.delete(selectedPermission.id);
            notification.success(response.detail);
            loadPermissions();
            setShowDeleteModal(false);
            setSelectedPermission(null);
        } catch (error) {
            console.error('Delete failed:', error);
            if (error.response?.data?.detail) {
                notification.error(error.response.data.detail);
            } else {
                notification.error('Xóa phân quyền thất bại');
            }
        }
    };

    const openDeleteModal = (permission) => {
        setSelectedPermission(permission);
        setShowDeleteModal(true);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="permission-list">
            <div className="page-header">
                <div className="header-left">
                    <h1>Quản lý phân quyền</h1>
                    <p className="subtitle">Quản lý các phân quyền trong hệ thống</p>
                </div>
                <button className="btn-create" onClick={() => navigate('/admin/permissions/create')}>
                    <FaPlus /> Tạo phân quyền mới
                </button>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã, mô tả hoặc loại..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="stats">
                        <span className="stat-item">
                            Tổng số: <strong>{totalItems}</strong>
                        </span>
                    </div>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th style={{ width: '200px' }}>Mã phân quyền</th>
                                <th>Mô tả</th>
                                <th style={{ width: '180px' }}>Loại phân quyền</th>
                                <th style={{ width: '150px' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="no-data">
                                        {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có phân quyền nào'}
                                    </td>
                                </tr>
                            ) : (
                                permissions.map((permission) => (
                                    <tr key={permission.id}>
                                        <td>
                                            <span className="id-badge">{permission.id}</span>
                                        </td>
                                        <td>
                                            <code className="code-badge">{permission.code}</code>
                                        </td>
                                        <td>{permission.description || '-'}</td>
                                        <td>
                                            {permission.category_name ? (
                                                <span className="category-badge">{permission.category_name}</span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-action btn-edit"
                                                    onClick={() => navigate(`/admin/permissions/edit/${permission.id}`)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="btn-action btn-delete"
                                                    onClick={() => openDeleteModal(permission)}
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
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Xác nhận xóa</h3>
                        </div>
                        <div className="modal-body">
                            <p>
                                Bạn có chắc chắn muốn xóa phân quyền <strong>"{selectedPermission?.code}"</strong>?
                            </p>
                            <p className="warning-text">
                                Lưu ý: Phân quyền này sẽ bị xóa khỏi tất cả các vai trò đang sử dụng nó.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                Hủy
                            </button>
                            <button className="btn-confirm-delete" onClick={handleDelete}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PermissionList;
