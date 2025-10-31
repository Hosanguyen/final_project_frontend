import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaTrophy, FaArrowLeft, FaEdit, FaTrash, FaCalendarAlt,
    FaClock, FaEye, FaEyeSlash, FaUsers, FaSpinner
} from 'react-icons/fa';
import './ContestDetail.css';
import ContestService from '../../../services/ContestService';

const ContestDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        loadContest();
    }, [id]);

    const loadContest = async () => {
        setLoading(true);
        try {
            const data = await ContestService.getById(id);
            setContest(data);
        } catch (error) {
            console.error('Error loading contest:', error);
            alert('Không thể tải thông tin contest');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        navigate(`/admin/contests/edit/${id}`);
    };

    const handleDelete = async () => {
        try {
            const response = await ContestService.delete(id);
            alert(response.message || 'Contest deleted successfully');
            navigate('/admin/contests');
        } catch (error) {
            console.error('Delete failed:', error);
            alert(error.error || 'Xóa contest thất bại');
        }
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

    const getStatusBadge = (status) => {
        const statusConfig = {
            upcoming: { label: 'Sắp diễn ra', class: 'status-upcoming' },
            running: { label: 'Đang diễn ra', class: 'status-running' },
            finished: { label: 'Đã kết thúc', class: 'status-finished' }
        };
        const config = statusConfig[status] || statusConfig.upcoming;
        return <span className={`status-badge ${config.class}`}>{config.label}</span>;
    };

    if (loading) {
        return (
            <div className="contest-detail-loading">
                <FaSpinner className="spinner" />
                <p>Đang tải thông tin contest...</p>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="contest-detail-error">
                <h2>Contest không tồn tại</h2>
                <button className="contest-btn-back" onClick={() => navigate('/admin/contests')}>
                    <FaArrowLeft /> Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="contest-detail">
            <div className="contest-detail-header">
                <button className="contest-btn-back" onClick={() => navigate('/admin/contests')}>
                    <FaArrowLeft /> Quay lại
                </button>
                <div className="contest-detail-actions">
                    <button className="contest-btn-edit" onClick={handleEdit}>
                        <FaEdit /> Chỉnh sửa
                    </button>
                    <button className="contest-btn-delete" onClick={() => setShowDeleteModal(true)}>
                        <FaTrash /> Xóa
                    </button>
                </div>
            </div>

            <div className="contest-detail-content">
                <div className="contest-detail-title">
                    <FaTrophy />
                    <h1>{contest.title}</h1>
                    {getStatusBadge(contest.status)}
                </div>

                <div className="contest-detail-slug">
                    <strong>Slug:</strong> <code>{contest.slug}</code>
                </div>

                {contest.description && (
                    <div className="contest-detail-description">
                        <h3>Mô tả</h3>
                        <p>{contest.description}</p>
                    </div>
                )}

                <div className="contest-detail-info-grid">
                    <div className="info-card">
                        <div className="info-icon">
                            <FaCalendarAlt />
                        </div>
                        <div className="info-content">
                            <h4>Thời gian bắt đầu</h4>
                            <p>{formatDateTime(contest.start_at)}</p>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-icon">
                            <FaClock />
                        </div>
                        <div className="info-content">
                            <h4>Thời gian kết thúc</h4>
                            <p>{formatDateTime(contest.end_at)}</p>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-icon">
                            {contest.visibility === 'public' ? <FaEye /> : <FaEyeSlash />}
                        </div>
                        <div className="info-content">
                            <h4>Hiển thị</h4>
                            <p className={`visibility-${contest.visibility}`}>
                                {contest.visibility === 'public' ? 'Public' : 'Private'}
                            </p>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-icon">
                            <FaUsers />
                        </div>
                        <div className="info-content">
                            <h4>Số bài tập</h4>
                            <p>{contest.problem_count} bài</p>
                        </div>
                    </div>
                </div>

                <div className="contest-detail-settings">
                    <h3>Cài đặt</h3>
                    <div className="settings-grid">
                        <div className="setting-item">
                            <strong>Penalty Time:</strong>
                            <span>{contest.penalty_time} phút</span>
                        </div>
                        <div className="setting-item">
                            <strong>Penalty Mode:</strong>
                            <span>{contest.penalty_mode === 'standard' ? 'Standard' : 'None'}</span>
                        </div>
                        {contest.freeze_rankings_at && (
                            <div className="setting-item">
                                <strong>Freeze Rankings:</strong>
                                <span>{formatDateTime(contest.freeze_rankings_at)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {contest.problems && contest.problems.length > 0 && (
                    <div className="contest-detail-problems">
                        <h3>Danh sách bài tập</h3>
                        <table className="problems-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Alias</th>
                                    <th>Tên bài tập</th>
                                    <th>Slug</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contest.problems.map((problem, index) => (
                                    <tr key={problem.id}>
                                        <td>{index + 1}</td>
                                        <td><strong>{problem.alias}</strong></td>
                                        <td>{problem.problem_title}</td>
                                        <td><code>{problem.problem_slug}</code></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="contest-detail-meta">
                    <div className="meta-item">
                        <strong>Tạo bởi:</strong> {contest.created_by_name || 'Unknown'}
                    </div>
                    <div className="meta-item">
                        <strong>Cập nhật bởi:</strong> {contest.updated_by_name || 'Unknown'}
                    </div>
                    <div className="meta-item">
                        <strong>Ngày tạo:</strong> {formatDateTime(contest.created_at)}
                    </div>
                    <div className="meta-item">
                        <strong>Cập nhật lần cuối:</strong> {formatDateTime(contest.updated_at)}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="contest-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="contest-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="contest-modal-header">
                            <h3>Xác nhận xóa</h3>
                        </div>
                        <div className="contest-modal-body">
                            <p>Bạn có chắc chắn muốn xóa contest <strong>{contest.title}</strong>?</p>
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

export default ContestDetail;
