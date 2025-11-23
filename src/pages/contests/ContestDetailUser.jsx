import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaTrophy, FaClock, FaCalendar, FaListAlt, FaCheckCircle, FaTimesCircle, FaCircle, FaChevronLeft } from 'react-icons/fa';
import ContestService from '../../services/ContestService';
import './ContestDetailUser.css';

const ContestDetailUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchContestDetail();
    }, [id]);

    const fetchContestDetail = async () => {
        try {
            setLoading(true);
            const data = await ContestService.getContestDetailForUser(id);
            setContest(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching contest details:', err);
            setError('Không thể tải thông tin cuộc thi. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            running: { text: 'Đang diễn ra', className: 'running', icon: '🔴' },
            upcoming: { text: 'Sắp diễn ra', className: 'upcoming', icon: '🟡' },
            finished: { text: 'Đã kết thúc', className: 'finished', icon: '⚫' }
        };
        return badges[status] || badges.upcoming;
    };

    const getProblemStatusIcon = (userStatus) => {
        if (!userStatus) return <FaCircle className="status-icon not-attempted" />;
        
        switch (userStatus.status) {
            case 'AC':
                return <FaCheckCircle className="status-icon accepted" />;
            case 'WA':
                return <FaTimesCircle className="status-icon wrong-answer" />;
            default:
                return <FaCircle className="status-icon attempted" />;
        }
    };

    const getProblemStatusText = (userStatus) => {
        if (!userStatus) return 'Chưa làm';
        
        switch (userStatus.status) {
            case 'AC':
                return `Đã AC (${userStatus.count} lần nộp)`;
            case 'WA':
                return `Sai (${userStatus.count} lần nộp)`;
            default:
                return `Đã thử (${userStatus.count} lần nộp)`;
        }
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            'easy': '#28a745',
            'medium': '#ffc107',
            'hard': '#dc3545'
        };
        return colors[difficulty?.toLowerCase()] || '#6c757d';
    };

    const getTimeUntilStart = (startDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const diff = start - now;
        
        if (diff <= 0) return null;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days} ngày ${hours} giờ`;
        if (hours > 0) return `${hours} giờ ${minutes} phút`;
        return `${minutes} phút`;
    };

    if (loading) {
        return (
            <div className="contest-detail-container">
                <div className="contest-loading">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin cuộc thi...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="contest-detail-container">
                <div className="contest-error">
                    <p>{error}</p>
                    <button onClick={() => navigate('/contests')} className="back-btn">
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    if (!contest) return null;

    const statusBadge = getStatusBadge(contest.status);

    return (
        <div className="contest-detail-container">
            <button onClick={() => navigate('/contests')} className="back-button">
                <FaChevronLeft /> Quay lại
            </button>

            {/* Contest Header */}
            <div className="contest-header-section">
                <div className="contest-title-row">
                    <h1>
                        <FaTrophy className="trophy-icon" />
                        {contest.title}
                    </h1>
                    <span className={`status-badge ${statusBadge.className}`}>
                        {statusBadge.icon} {statusBadge.text}
                    </span>
                </div>

                {contest.description && (
                    <div className="contest-description">
                        <p>{contest.description}</p>
                    </div>
                )}

                <div className="contest-info-grid">
                    <div className="info-card">
                        <FaCalendar className="info-icon" />
                        <div className="info-content">
                            <span className="info-label">Bắt đầu</span>
                            <span className="info-value">{formatDateTime(contest.start_at)}</span>
                        </div>
                    </div>

                    <div className="info-card">
                        <FaClock className="info-icon" />
                        <div className="info-content">
                            <span className="info-label">Kết thúc</span>
                            <span className="info-value">{formatDateTime(contest.end_at)}</span>
                        </div>
                    </div>

                    <div className="info-card">
                        <FaListAlt className="info-icon" />
                        <div className="info-content">
                            <span className="info-label">Số bài</span>
                            <span className="info-value">{contest.problem_count} bài</span>
                        </div>
                    </div>

                    <div className="info-card">
                        <FaClock className="info-icon" />
                        <div className="info-content">
                            <span className="info-label">Penalty</span>
                            <span className="info-value">
                                {contest.penalty_mode === 'none' ? 'Không' : `${contest.penalty_time} phút`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Problems List */}
            <div className="problems-section">
                <div className="section-header">
                    <h2>Danh sách bài tập</h2>
                    <span className="problem-count">{contest.problems?.length || 0} bài</span>
                </div>

                {contest.status === 'upcoming' ? (
                    <div className="contest-locked">
                        <div className="locked-icon">🔒</div>
                        <h3>Cuộc thi chưa bắt đầu</h3>
                        <p>Danh sách bài tập sẽ được công bố khi cuộc thi bắt đầu</p>
                        <div className="countdown-info">
                            <FaClock className="clock-icon" />
                            <span>Cuộc thi bắt đầu sau: <strong>{getTimeUntilStart(contest.start_at)}</strong></span>
                        </div>
                        <p className="start-time">
                            Thời gian bắt đầu: <strong>{formatDateTime(contest.start_at)}</strong>
                        </p>
                    </div>
                ) : !contest.problems || contest.problems.length === 0 ? (
                    <div className="no-problems">
                        <FaListAlt className="empty-icon" />
                        <p>Chưa có bài tập nào trong cuộc thi này</p>
                    </div>
                ) : (
                    <div className="problems-table-container">
                        <table className="problems-table">
                            <thead>
                                <tr>
                                    <th className="col-status">Trạng thái</th>
                                    <th className="col-label">Label</th>
                                    <th className="col-title">Tên bài</th>
                                    <th className="col-difficulty">Độ khó</th>
                                    <th className="col-points">Điểm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contest.problems.map((problem, index) => (
                                    <tr 
                                        key={problem.id}
                                        className={`problem-row ${problem.user_status?.status?.toLowerCase() || ''}`}
                                        onClick={() => navigate(`/problems/${problem.problem_id}`)}
                                    >
                                        <td className="col-status">
                                            <div className="status-cell" title={getProblemStatusText(problem.user_status)}>
                                                {getProblemStatusIcon(problem.user_status)}
                                            </div>
                                        </td>
                                        <td className="col-label">
                                            <span 
                                                className="problem-label"
                                                style={{ 
                                                    backgroundColor: problem.rgb || '#6c757d',
                                                    color: '#fff'
                                                }}
                                            >
                                                {problem.label || problem.alias}
                                            </span>
                                        </td>
                                        <td className="col-title">
                                            <Link 
                                                to={`/contest-problems/${problem.id}`}
                                                className="problem-link"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {problem.problem_title}
                                            </Link>
                                        </td>
                                        <td className="col-difficulty">
                                            <span 
                                                className="difficulty-badge"
                                                style={{ color: getDifficultyColor(problem.problem_difficulty) }}
                                            >
                                                {problem.problem_difficulty || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="col-points">
                                            <span className="points-value">{problem.point}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Contest Rules */}
            <div className="contest-rules">
                <h3>Quy định cuộc thi</h3>
                <ul>
                    <li>Mỗi bài submit sai sẽ bị phạt {contest.penalty_time} phút (nếu có penalty)</li>
                    <li>Thời gian tính từ khi bắt đầu cuộc thi đến khi AC bài đầu tiên</li>
                    <li>Bảng xếp hạng được cập nhật real-time</li>
                    <li>Không được sử dụng tài khoản khác hoặc hợp tác với người khác</li>
                </ul>
            </div>
        </div>
    );
};

export default ContestDetailUser;
