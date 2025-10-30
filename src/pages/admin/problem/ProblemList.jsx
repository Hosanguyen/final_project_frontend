import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import ProblemService from '../../../services/ProblemService';
import './ProblemList.css';

const ProblemList = () => {
    const navigate = useNavigate();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        difficulty: '',
        is_public: '',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 20,
        total: 0,
        total_pages: 0,
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProblem, setSelectedProblem] = useState(null);

    useEffect(() => {
        loadProblems();
    }, [pagination.page, filters]);

    const loadProblems = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                page_size: pagination.page_size,
                search: searchTerm,
                ...filters,
            };

            const data = await ProblemService.getAll(params);

            setProblems(data.results);
            setPagination({
                ...pagination,
                total: data.total,
                total_pages: data.total_pages,
            });
        } catch (error) {
            console.error('Failed to load problems:', error);
            alert('Không thể tải danh sách bài toán');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination({ ...pagination, page: 1 });
        loadProblems();
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPagination({ ...pagination, page: 1 });
    };

    const handleDelete = async () => {
        if (!selectedProblem) return;

        try {
            const response = await ProblemService.delete(selectedProblem.id);
            alert(response.detail);
            loadProblems();
            setShowDeleteModal(false);
            setSelectedProblem(null);
        } catch (error) {
            console.error('Delete failed:', error);
            if (error.response?.data?.detail) {
                alert(error.response.data.detail);
            } else {
                alert('Xóa bài toán thất bại');
            }
        }
    };

    const openDeleteModal = (problem) => {
        setSelectedProblem(problem);
        setShowDeleteModal(true);
    };

    const getDifficultyBadge = (difficulty) => {
        const badges = {
            easy: { class: 'problem-list-badge-easy', label: 'Dễ' },
            medium: { class: 'problem-list-badge-medium', label: 'Trung bình' },
            hard: { class: 'problem-list-badge-hard', label: 'Khó' },
        };
        return badges[difficulty] || { class: '', label: difficulty };
    };

    if (loading && problems.length === 0) {
        return (
            <div className="problem-list-loading-container">
                <div className="problem-list-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="problem-list">
            <div className="problem-list-page-header">
                <div className="problem-list-header-left">
                    <h1>Quản lý bài toán lập trình</h1>
                    <p className="problem-list-subtitle">Quản lý các bài toán thuật toán và đề thi lập trình</p>
                </div>
                <button className="problem-list-btn-create" onClick={() => navigate('/admin/problems/create')}>
                    <FaPlus /> Tạo bài toán mới
                </button>
            </div>

            <div className="problem-list-content-card">
                <div className="problem-list-card-header">
                    <div className="problem-list-search-box">
                        <FaSearch className="problem-list-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề, slug..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    <div className="problem-list-filters">
                        <select
                            value={filters.difficulty}
                            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                            className="problem-list-filter-select"
                        >
                            <option value="">Tất cả độ khó</option>
                            <option value="easy">Dễ</option>
                            <option value="medium">Trung bình</option>
                            <option value="hard">Khó</option>
                        </select>

                        <select
                            value={filters.is_public}
                            onChange={(e) => handleFilterChange('is_public', e.target.value)}
                            className="problem-list-filter-select"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="true">Công khai</option>
                            <option value="false">Riêng tư</option>
                        </select>
                    </div>

                    <div className="problem-list-stats">
                        <span className="problem-list-stat-item">
                            Tổng số: <strong>{pagination.total}</strong>
                        </span>
                    </div>
                </div>

                <div className="problem-list-table-container">
                    <table className="problem-list-data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th style={{ width: '150px' }}>Slug</th>
                                <th>Tiêu đề</th>
                                <th style={{ width: '120px' }}>Độ khó</th>
                                <th style={{ width: '100px' }}>Test cases</th>
                                <th style={{ width: '100px' }}>Trạng thái</th>
                                <th style={{ width: '100px' }}>DOMjudge</th>
                                <th style={{ width: '150px' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {problems.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="problem-list-no-data">
                                        {searchTerm || filters.difficulty || filters.is_public
                                            ? 'Không tìm thấy kết quả phù hợp'
                                            : 'Chưa có bài toán nào'}
                                    </td>
                                </tr>
                            ) : (
                                problems.map((problem) => (
                                    <tr key={problem.id}>
                                        <td>
                                            <span className="problem-list-id-badge">{problem.id}</span>
                                        </td>
                                        <td>
                                            <code className="problem-list-code-badge">{problem.slug}</code>
                                        </td>
                                        <td>
                                            <div className="problem-list-title-cell">
                                                <div className="problem-list-title">{problem.title}</div>
                                                {problem.short_statement && (
                                                    <div className="problem-list-short-desc">
                                                        {problem.short_statement}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`problem-list-difficulty-badge ${
                                                    getDifficultyBadge(problem.difficulty).class
                                                }`}
                                            >
                                                {getDifficultyBadge(problem.difficulty).label}
                                            </span>
                                        </td>
                                        <td className="problem-list-text-center">{problem.test_case_count || 0}</td>
                                        <td>
                                            {problem.is_public ? (
                                                <span className="problem-list-status-badge problem-list-status-public">
                                                    <FaCheck /> Công khai
                                                </span>
                                            ) : (
                                                <span className="problem-list-status-badge problem-list-status-private">
                                                    <FaTimes /> Riêng tư
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {problem.is_synced_to_domjudge ? (
                                                <span className="problem-list-sync-badge problem-list-synced">
                                                    <FaCheck /> Đã sync
                                                </span>
                                            ) : (
                                                <span className="problem-list-sync-badge problem-list-not-synced">
                                                    <FaTimes /> Chưa sync
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="problem-list-action-buttons">
                                                <button
                                                    className="problem-list-btn-action problem-list-btn-view"
                                                    onClick={() => navigate(`/admin/problems/${problem.id}`)}
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    className="problem-list-btn-action problem-list-btn-edit"
                                                    onClick={() => navigate(`/admin/problems/edit/${problem.id}`)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="problem-list-btn-action problem-list-btn-delete"
                                                    onClick={() => openDeleteModal(problem)}
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
                {pagination.total_pages > 1 && (
                    <div className="problem-list-pagination">
                        <button
                            className="problem-list-pagination-btn"
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            disabled={pagination.page === 1}
                        >
                            Trước
                        </button>
                        <span className="problem-list-pagination-info">
                            Trang {pagination.page} / {pagination.total_pages}
                        </span>
                        <button
                            className="problem-list-pagination-btn"
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            disabled={pagination.page === pagination.total_pages}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="problem-list-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="problem-list-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="problem-list-modal-header">
                            <h3>Xác nhận xóa</h3>
                        </div>
                        <div className="problem-list-modal-body">
                            <p>
                                Bạn có chắc chắn muốn xóa bài toán <strong>"{selectedProblem?.title}"</strong>?
                            </p>
                            <p className="problem-list-warning-text">
                                Lưu ý: Bài toán này sẽ bị xóa khỏi cả DOMjudge và tất cả dữ liệu liên quan sẽ bị mất.
                            </p>
                        </div>
                        <div className="problem-list-modal-footer">
                            <button className="problem-list-btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                Hủy
                            </button>
                            <button className="problem-list-btn-confirm-delete" onClick={handleDelete}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProblemList;
