import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaTrophy, FaPlus, FaCalendarAlt, FaClock, FaEye, FaEyeSlash,
    FaEdit, FaTrash, FaUsers, FaSpinner, FaSearch, FaTimes
} from 'react-icons/fa';
import './ContestManagement.css';
import ContestService from '../../../services/ContestService';

const ContestManagement = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        visibility: ''
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedContest, setSelectedContest] = useState(null);

    useEffect(() => {
        loadContests();
    }, [filters]);

    const loadContests = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                ...filters
            };
            const response = await ContestService.getAll(params);
            setContests(response.contests || []);
        } catch (error) {
            console.error('Error loading contests:', error);
            alert('Không thể tải danh sách contest');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        loadContests();
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleCreate = () => {
        navigate('/admin/contests/create');
    };

    const handleEdit = (contestId) => {
        navigate(`/admin/contests/edit/${contestId}`);
    };

    const handleView = (contestId) => {
        navigate(`/admin/contests/${contestId}`);
    };

    const handleDelete = async () => {
        if (!selectedContest) return;

        try {
            const response = await ContestService.delete(selectedContest.id);
            alert(response.message || 'Contest deleted successfully');
            loadContests();
            setShowDeleteModal(false);
            setSelectedContest(null);
        } catch (error) {
            console.error('Delete failed:', error);
            alert(error.error || 'Xóa contest thất bại');
        }
    };

    const openDeleteModal = (contest) => {
        setSelectedContest(contest);
        setShowDeleteModal(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            upcoming: { label: 'Upcoming', class: 'status-upcoming' },
            running: { label: 'Running', class: 'status-running' },
            finished: { label: 'Finished', class: 'status-finished' }
        };
        const config = statusConfig[status] || statusConfig.upcoming;
        return <span className={`status-badge ${config.class}`}>{config.label}</span>;
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && contests.length === 0) {
        return (
            <div className="contest-loading-container">
                <FaSpinner className="spinner" />
                <p>Đang tải contests...</p>
            </div>
        );
    }

    return (
        <div className="contest-management">
            {/* Page Header */}
            <div className="contest-management-page-header">
                <div className="contest-management-header-left">
                    <h1>Contest Management</h1>
                    <p className="contest-management-subtitle">Manage programming contests and competitions</p>
                </div>
                <button className="contest-btn-create" onClick={handleCreate}>
                    <FaPlus /> Create Contest
                </button>
            </div>

            {/* Content Card */}
            <div className="contest-content-card">
                {/* Card Header with Search and Filters */}
                <div className="contest-card-header">
                    <div className="contest-search-box">
                        <FaSearch className="contest-search-icon" />
                        <input
                            type="text"
                            placeholder="Search contests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        {searchTerm && (
                            <FaTimes
                                className="contest-clear-icon"
                                onClick={() => {
                                    setSearchTerm('');
                                    loadContests();
                                }}
                            />
                        )}
                    </div>

                    <div className="contest-filters">
                        <select
                            className="contest-filter-select"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="running">Running</option>
                            <option value="finished">Finished</option>
                        </select>

                        <select
                            className="contest-filter-select"
                            value={filters.visibility}
                            onChange={(e) => handleFilterChange('visibility', e.target.value)}
                        >
                            <option value="">All Visibility</option>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                </div>

            {/* Contest List */}
            {contests.length === 0 ? (
                <div className="contest-empty">
                    <FaTrophy size={64} />
                    <h3>Không tìm thấy contest</h3>
                    <p>Tạo contest đầu tiên để bắt đầu!</p>
                    <button className="contest-btn-create" onClick={handleCreate}>
                        <FaPlus /> Tạo Contest
                    </button>
                </div>
            ) : (
                <div className="contest-table-container">
                    <table className="contest-table">
                        <thead>
                            <tr>
                                <th>Contest</th>
                                <th>Thời gian</th>
                                <th>Trạng thái</th>
                                <th>Hiển thị</th>
                                <th>Bài tập</th>
                                <th>Penalty</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contests.map(contest => (
                                <tr key={contest.id}>
                                    <td>
                                        <div className="contest-info">
                                            <div className="contest-title">{contest.title}</div>
                                            <div className="contest-slug">{contest.slug}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contest-time">
                                            <div className="time-row">
                                                <FaCalendarAlt />
                                                <span>{formatDateTime(contest.start_at)}</span>
                                            </div>
                                            <div className="time-row">
                                                <FaClock />
                                                <span>{formatDateTime(contest.end_at)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {getStatusBadge(contest.status)}
                                    </td>
                                    <td>
                                        <span className={`visibility-badge visibility-${contest.visibility}`}>
                                            {contest.visibility === 'public' ? <FaEye /> : <FaEyeSlash />}
                                            {contest.visibility}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="problem-count">
                                            <FaUsers /> {contest.problem_count}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="penalty-time">{contest.penalty_time} phút</span>
                                    </td>
                                    <td>
                                        <div className="contest-actions">
                                            <button
                                                className="contest-btn-icon contest-btn-view"
                                                onClick={() => handleView(contest.id)}
                                                title="Xem chi tiết"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                className="contest-btn-icon contest-btn-edit"
                                                onClick={() => handleEdit(contest.id)}
                                                title="Chỉnh sửa"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="contest-btn-icon contest-btn-delete"
                                                onClick={() => openDeleteModal(contest)}
                                                title="Xóa"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="contest-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="contest-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="contest-modal-header">
                            <h3>Xác nhận xóa</h3>
                        </div>
                        <div className="contest-modal-body">
                            <p>Bạn có chắc chắn muốn xóa contest <strong>{selectedContest?.title}</strong>?</p>
                            <p className="contest-warning-text">Hành động này không thể hoàn tác!</p>
                        </div>
                        <div className="contest-modal-actions">
                            <button
                                className="contest-btn-cancel"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="contest-btn-confirm-delete"
                                onClick={handleDelete}
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

export default ContestManagement;
