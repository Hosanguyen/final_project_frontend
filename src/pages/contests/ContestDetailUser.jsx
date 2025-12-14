import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaTrophy, FaClock, FaCalendar, FaListAlt, FaCheckCircle, FaTimesCircle, FaCircle, FaChevronLeft, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import ContestService from '../../services/ContestService';
import ContestLeaderboard from './ContestLeaderboard';
import './ContestDetailUser.css';
import notification from '../../utils/notification';

const ContestDetailUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [registering, setRegistering] = useState(false);
    const [activeTab, setActiveTab] = useState('problems'); // 'problems' or 'leaderboard'

    useEffect(() => {
        fetchContestDetail();
    }, [id]);

    const fetchContestDetail = async () => {
        try {
            setLoading(true);
            const data = await ContestService.getContestDetailForUser(id);
            
            // Chặn truy cập contest practice, redirect về /practice
            if (data.slug === 'practice') {
                notification.warning('Contest luyện tập không thể truy cập trực tiếp. Đang chuyển hướng...');
                navigate('/practice');
                return;
            }
            
            setContest(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching contest details:', err);
            
            // Nếu backend trả về 403 với redirect_to, redirect về trang đó
            if (err.status === 403 && err.redirect_to) {
                notification.warning('Contest luyện tập không thể truy cập trực tiếp. Đang chuyển hướng...');
                navigate(err.redirect_to);
                return;
            }
            
            setError('Không thể tải thông tin cuộc thi. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        try {
            setRegistering(true);
            await ContestService.registerForContest(id);
            await fetchContestDetail(); // Refresh contest data
            notification.success('Đăng ký tham gia cuộc thi thành công!');
        } catch (err) {
            console.error('Error registering for contest:', err);
            notification.error(err.error || 'Không thể đăng ký tham gia cuộc thi. Vui lòng thử lại sau.');
        } finally {
            setRegistering(false);
        }
    };

    const handleUnregister = async () => {
        const result = await notification.confirm(
            'Bạn có chắc chắn muốn hủy đăng ký tham gia cuộc thi này?',
            'Xác nhận hủy đăng ký'
        );
        
        if (!result.isConfirmed) {
            return;
        }

        try {
            setRegistering(true);
            await ContestService.unregisterFromContest(id);
            await fetchContestDetail(); // Refresh contest data
            notification.success('Hủy đăng ký tham gia cuộc thi thành công!');
        } catch (err) {
            console.error('Error unregistering from contest:', err);
            notification.error(err.error || 'Không thể hủy đăng ký. Vui lòng thử lại sau.');
        } finally {
            setRegistering(false);
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

                {/* Registration Button */}
                <div className="registration-section">
                    {contest.status === 'finished' ? (
                        contest.is_registered ? (
                            <div className="registration-info">
                                <div className="registered-badge">
                                    <FaUserCheck className="check-icon" />
                                    <span>Đã tham gia cuộc thi</span>
                                </div>
                            </div>
                        ) : (
                            <div className="contest-ended-message">
                                <span>Cuộc thi đã kết thúc. Không thể đăng ký.</span>
                            </div>
                        )
                    ) : contest.is_registered ? (
                        <div className="registration-info">
                            <div className="registered-badge">
                                <FaUserCheck className="check-icon" />
                                <span>Đã đăng ký tham gia</span>
                            </div>
                            {contest.status === 'upcoming' && (
                                <button 
                                    onClick={handleUnregister}
                                    disabled={registering}
                                    className="unregister-btn"
                                >
                                    {registering ? 'Đang xử lý...' : 'Hủy đăng ký'}
                                </button>
                            )}
                        </div>
                    ) : (
                        <button 
                            onClick={handleRegister}
                            disabled={registering}
                            className="register-btn"
                        >
                            {registering ? 'Đang đăng ký...' : 'Đăng ký tham gia'}
                        </button>
                    )}
                </div>

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
                        <FaTrophy className="info-icon" />
                        <div className="info-content">
                            <span className="info-label">Chế độ</span>
                            <span className="info-value">{contest.contest_mode || 'ICPC'}</span>
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

            {/* Tabs Navigation */}
            <div className="contest-tabs">
                <button 
                    className={`tab-button ${activeTab === 'problems' ? 'active' : ''}`}
                    onClick={() => setActiveTab('problems')}
                >
                    <FaListAlt /> Danh sách bài tập
                </button>
                <button 
                    className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('leaderboard')}
                >
                    <FaTrophy /> Bảng xếp hạng
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'problems' ? (
                /* Problems List */
                <div className="problems-section">
                    <div className="section-header">
                        <h2>Danh sách bài tập</h2>
                        <span className="problem-count">{contest.problems?.length || 0} bài</span>
                    </div>

                {contest.status === 'finished' ? (
                    // Contest đã kết thúc - mọi người đều xem được bài
                    !contest.problems || contest.problems.length === 0 ? (
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
                                            onClick={() => navigate(`/contest-problems/${problem.id}`)}
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
                    )
                ) : !contest.is_registered ? (
                    <div className="contest-locked">
                        <div className="locked-icon">🔒</div>
                        <h3>Cần đăng ký để xem bài tập</h3>
                        {contest.status === 'finished' ? (
                            <p>Cuộc thi đã kết thúc. Không thể đăng ký tham gia.</p>
                        ) : (
                            <p>Vui lòng đăng ký tham gia cuộc thi để xem danh sách bài tập và nộp bài</p>
                        )}
                    </div>
                ) : contest.status === 'upcoming' ? (
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
                                        onClick={() => navigate(`/contest-problems/${problem.id}`)}
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
            ) : (
                /* Leaderboard Tab */
                <div className="leaderboard-section">
                    {contest.status === 'upcoming' ? (
                        <div className="contest-locked">
                            <div className="locked-icon">🔒</div>
                            <h3>Bảng xếp hạng chưa khả dụng</h3>
                            <p>Bảng xếp hạng sẽ được công bố khi cuộc thi bắt đầu</p>
                        </div>
                    ) : (
                        <ContestLeaderboard 
                            contestId={contest.id} 
                            contestMode={contest.contest_mode}
                            autoRefresh={contest.status === 'running' || contest.status === 'finished'}
                        />
                    )}
                </div>
            )}

            {/* Contest Rules */}
            <div className="contest-rules">
                <h3>Quy định cuộc thi</h3>
                <ul>
                    {contest.contest_mode === 'ICPC' ? (
                        <>
                            <li><strong>Chế độ ICPC:</strong> Mỗi bài chỉ hiển thị Accepted (AC) hoặc Wrong Answer (WA)</li>
                            <li>Mỗi bài submit sai sẽ bị phạt {contest.penalty_time} phút (nếu có penalty)</li>
                            <li>Thời gian tính từ khi bắt đầu cuộc thi đến khi AC bài đầu tiên</li>
                        </>
                    ) : (
                        <>
                            <li><strong>Chế độ OI:</strong> Hiển thị số test cases đã pass (ví dụ: 17/18)</li>
                            <li>Điểm được tính dựa trên số lượng test cases đúng</li>
                            <li>Có thể nộp nhiều lần để cải thiện điểm số</li>
                        </>
                    )}
                    <li>Bảng xếp hạng được cập nhật real-time</li>
                    {!contest.is_show_result && contest.status !== 'finished' && (
                        <li><strong>⚠️ Lưu ý:</strong> Chi tiết kết quả chấm (test cases, error messages) sẽ được công bố sau khi contest kết thúc</li>
                    )}
                    {contest.is_show_result && contest.status === 'finished' && (
                        <li><strong>✅ Contest đã kết thúc:</strong> Chi tiết kết quả chấm đã được công bố</li>
                    )}
                    <li>Không được sử dụng tài khoản khác hoặc hợp tác với người khác</li>
                </ul>
            </div>
        </div>
    );
};

export default ContestDetailUser;
