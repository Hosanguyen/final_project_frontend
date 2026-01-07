import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import PermissionService from '../../../services/PermissionService';
import Pagination from '../../../components/Pagination';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import './PermissionList.css';
import notification from '../../../utils/notification';

const PermissionList = () => {
    useDocumentTitle('Quản trị - Quyền');
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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
                search: searchTerm || undefined,
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
                                <th style={{ width: '220px' }}>Mã phân quyền</th>
                                <th>Mô tả</th>
                                <th style={{ width: '300px' }}>Loại phân quyền</th>
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
        </div>
    );
};

export default PermissionList;
