import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import PermissionCategoryService from '../../../services/PermissionCategoryService';
import './PermissionCategoryList.css';

const PermissionCategoryList = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await PermissionCategoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
            alert('Không thể tải danh sách loại phân quyền');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;

        try {
            const response = await PermissionCategoryService.delete(selectedCategory.id);
            alert(response.detail);
            loadCategories();
            setShowDeleteModal(false);
            setSelectedCategory(null);
        } catch (error) {
            console.error('Delete failed:', error);
            if (error.response?.data?.detail) {
                alert(error.response.data.detail);
            } else {
                alert('Xóa loại phân quyền thất bại');
            }
        }
    };

    const openDeleteModal = (category) => {
        setSelectedCategory(category);
        setShowDeleteModal(true);
    };

    const filteredCategories = categories.filter(
        (cat) =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase())),
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
        <div className="permission-category-list">
            <div className="page-header">
                <div className="header-left">
                    <h1>Quản lý loại phân quyền</h1>
                    <p className="subtitle">Quản lý các loại phân quyền trong hệ thống</p>
                </div>
                <button className="btn-create" onClick={() => navigate('/admin/permission-categories/create')}>
                    <FaPlus /> Tạo loại phân quyền mới
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
                            Tổng số: <strong>{categories.length}</strong>
                        </span>
                    </div>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th>Tên loại phân quyền</th>
                                <th>Mô tả</th>
                                <th style={{ width: '150px' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="no-data">
                                        {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có loại phân quyền nào'}
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category.id}>
                                        <td className="text-center">
                                            <span className="id-badge">{category.id}</span>
                                        </td>
                                        <td>
                                            <strong>{category.name}</strong>
                                        </td>
                                        <td className="text-muted">{category.description || '-'}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-action btn-edit"
                                                    onClick={() =>
                                                        navigate(`/admin/permission-categories/edit/${category.id}`)
                                                    }
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="btn-action btn-delete"
                                                    onClick={() => openDeleteModal(category)}
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
                                Bạn có chắc chắn muốn xóa loại phân quyền <strong>"{selectedCategory?.name}"</strong>?
                            </p>
                            <p className="warning-text">
                                Lưu ý: Các permission thuộc loại này sẽ không bị xóa nhưng sẽ không còn thuộc loại nào.
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

export default PermissionCategoryList;
