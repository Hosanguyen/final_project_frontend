import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import PermissionCategoryService from '../../../services/PermissionCategoryService';
import './PermissionCategoryList.css';
import notification from '../../../utils/notification';

const PermissionCategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await PermissionCategoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load permission categories:', error);
            notification.error('Không thể tải danh sách loại phân quyền');
        } finally {
            setLoading(false);
        }
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
                    <h1>Quản lý loại nhóm quyền</h1>
                    <p className="subtitle">Quản lý các loại nhóm quyền trong hệ thống</p>
                </div>
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
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PermissionCategoryList;
