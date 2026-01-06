// src/pages/admin/contest/ContestStatistics.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Trophy,
    FileText,
    Users,
    Send,
    CheckCircle,
    TrendingUp,
    Calendar,
    Eye,
    EyeOff,
    Target,
    Activity,
    Award,
    BarChart3,
    Code,
} from 'lucide-react';
import ContestService from '../../../services/ContestService';
import './ContestStatistics.css';

const ContestStatistics = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await ContestService.getStatistics();
            setStats(data);
        } catch (err) {
            setError('Không thể tải thống kê contest');
            console.error('Error loading contest statistics:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusLabel = (contest) => {
        const now = new Date();
        const startAt = new Date(contest.start_at);
        const endAt = new Date(contest.end_at);

        if (now < startAt) {
            return { label: 'Sắp diễn ra', className: 'status-upcoming' };
        } else if (now >= startAt && now <= endAt) {
            return { label: 'Đang diễn ra', className: 'status-ongoing' };
        } else {
            return { label: 'Đã kết thúc', className: 'status-ended' };
        }
    };

    if (loading) {
        return (
            <div className="statistics-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải thống kê...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="statistics-error">
                <p>{error}</p>
                <button onClick={loadStatistics} className="btn-retry">
                    Thử lại
                </button>
            </div>
        );
    }

    if (!stats) return null;

    const contests = stats.contests || {};
    const practice = stats.practice || {};
    const charts = stats.charts || {};

    return (
        <div className="contest-statistics">
            <div className="statistics-header">
                <h1>Thống kê Contest & Practice</h1>
                <p>Tổng quan về các cuộc thi lập trình và luyện tập</p>
            </div>

            {/* Practice Stats Section */}
            <div className="stats-section practice-section">
                <h2>
                    <Code size={24} /> Practice Mode
                </h2>
                <div className="stats-grid practice-grid">
                    <div className="stat-card practice">
                        <div className="stat-icon practice-problems">
                            <FileText />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{practice.total_problems || 0}</div>
                            <div className="stat-label">Tổng bài tập</div>
                        </div>
                    </div>

                    <div className="stat-card practice">
                        <div className="stat-icon practice-submissions">
                            <Send />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{practice.total_submissions || 0}</div>
                            <div className="stat-label">Lượt nộp bài</div>
                            <div className="stat-sublabel">{practice.acceptance_rate || 0}% AC</div>
                        </div>
                    </div>

                    <div className="stat-card practice">
                        <div className="stat-icon practice-users">
                            <Users />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{practice.total_participants || 0}</div>
                            <div className="stat-label">Người tham gia</div>
                        </div>
                    </div>

                    <div className="stat-card practice">
                        <div className="stat-icon practice-accepted">
                            <CheckCircle />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{practice.accepted_submissions || 0}</div>
                            <div className="stat-label">Bài AC</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contest Overview Stats */}
            <div className="stats-section">
                <h2>
                    <Trophy size={24} /> Contest Mode
                </h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon contests">
                            <Trophy />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{contests.overview?.total_contests || 0}</div>
                            <div className="stat-label">Tổng số contest</div>
                            <div className="stat-breakdown">
                                <span className="stat-item upcoming">
                                    <Calendar size={14} />
                                    {contests.overview?.upcoming_contests || 0} sắp diễn ra
                                </span>
                                <span className="stat-item ongoing">
                                    <Activity size={14} />
                                    {contests.overview?.ongoing_contests || 0} đang diễn ra
                                </span>
                                <span className="stat-item ended">
                                    <CheckCircle size={14} />
                                    {contests.overview?.ended_contests || 0} đã kết thúc
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon problems">
                            <FileText />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{contests.problems?.total_contest_problems || 0}</div>
                            <div className="stat-label">Tổng số bài tập</div>
                            <div className="stat-sublabel">
                                Trung bình {contests.problems?.avg_problems_per_contest || 0} bài/contest
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon participants">
                            <Users />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{contests.participants?.total_participants || 0}</div>
                            <div className="stat-label">Tổng thí sinh</div>
                            <div className="stat-sublabel">
                                Trung bình {contests.participants?.avg_participants_per_contest || 0} người/contest
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon submissions">
                            <Send />
                        </div>
                        <div className="stat-content">
                            <div className="stat-number">{contests.submissions?.total_submissions || 0}</div>
                            <div className="stat-label">Tổng bài nộp</div>
                            <div className="stat-sublabel">
                                <CheckCircle size={14} style={{ color: '#10b981', marginRight: '4px' }} />
                                {contests.submissions?.accepted_submissions || 0} AC (
                                {contests.submissions?.acceptance_rate || 0}%)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contest Details */}
            <div className="stats-section">
                <h2>Phân loại Contest</h2>
                <div className="stats-grid secondary">
                    <div className="stat-card mini">
                        <div className="stat-icon-small visibility-public">
                            <Eye />
                        </div>
                        <div className="stat-content-mini">
                            <div className="stat-number-mini">{contests.overview?.public_contests || 0}</div>
                            <div className="stat-label-mini">Public</div>
                        </div>
                    </div>

                    <div className="stat-card mini">
                        <div className="stat-icon-small visibility-private">
                            <EyeOff />
                        </div>
                        <div className="stat-content-mini">
                            <div className="stat-number-mini">{contests.overview?.private_contests || 0}</div>
                            <div className="stat-label-mini">Private</div>
                        </div>
                    </div>

                    <div className="stat-card mini">
                        <div className="stat-icon-small mode-icpc">
                            <Target />
                        </div>
                        <div className="stat-content-mini">
                            <div className="stat-number-mini">{contests.overview?.icpc_contests || 0}</div>
                            <div className="stat-label-mini">ICPC Mode</div>
                        </div>
                    </div>

                    <div className="stat-card mini">
                        <div className="stat-icon-small mode-oi">
                            <TrendingUp />
                        </div>
                        <div className="stat-content-mini">
                            <div className="stat-number-mini">{contests.overview?.oi_contests || 0}</div>
                            <div className="stat-label-mini">OI Mode</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            {charts && (
                <div className="charts-section">
                    <div className="chart-container">
                        <h3>
                            <BarChart3 size={20} /> Xu hướng Contest (12 tháng)
                        </h3>
                        <div className="simple-chart">
                            {charts.contests_by_month && charts.contests_by_month.length > 0 ? (
                                <div className="bar-chart">
                                    {charts.contests_by_month.map((item, index) => (
                                        <div key={index} className="bar-item">
                                            <div
                                                className="bar"
                                                style={{
                                                    height: `${Math.max(
                                                        (item.count /
                                                            Math.max(...charts.contests_by_month.map((i) => i.count))) *
                                                            100,
                                                        5,
                                                    )}%`,
                                                }}
                                                title={`${item.month}: ${item.count} contests`}
                                            >
                                                <span className="bar-value">{item.count}</span>
                                            </div>
                                            <div className="bar-label">{item.month.substring(5)}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">Chưa có dữ liệu</p>
                            )}
                        </div>
                    </div>

                    <div className="chart-container">
                        <h3>
                            <TrendingUp size={20} /> Tăng trưởng thí sinh (12 tháng)
                        </h3>
                        <div className="simple-chart">
                            {charts.participants_growth && charts.participants_growth.length > 0 ? (
                                <div className="bar-chart">
                                    {charts.participants_growth.map((item, index) => (
                                        <div key={index} className="bar-item">
                                            <div
                                                className="bar bar-participants"
                                                style={{
                                                    height: `${Math.max(
                                                        (item.count /
                                                            Math.max(
                                                                ...charts.participants_growth.map((i) => i.count),
                                                            )) *
                                                            100,
                                                        5,
                                                    )}%`,
                                                }}
                                                title={`${item.month}: ${item.count} người`}
                                            >
                                                <span className="bar-value">{item.count}</span>
                                            </div>
                                            <div className="bar-label">{item.month.substring(5)}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">Chưa có dữ liệu</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Submission Status Distribution */}
            {contests.submissions?.by_status && contests.submissions.by_status.length > 0 && (
                <div className="stats-section">
                    <h2>Phân bố trạng thái bài nộp Contest</h2>
                    <div className="submission-status-list">
                        {contests.submissions.by_status.map((item, index) => (
                            <div key={index} className="submission-status-item">
                                <span className={`status-label status-${item.status}`}>{item.status || 'Unknown'}</span>
                                <div className="status-bar">
                                    <div
                                        className="status-bar-fill"
                                        style={{
                                            width: `${(
                                                (item.count / contests.submissions.total_submissions) *
                                                100
                                            ).toFixed(1)}%`,
                                        }}
                                    />
                                </div>
                                <span className="status-count">
                                    {item.count} (
                                    {((item.count / contests.submissions.total_submissions) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Performers */}
            {contests.top_performers && contests.top_performers.length > 0 && (
                <div className="stats-section">
                    <h2>
                        <Award size={24} /> Người chơi xuất sắc
                    </h2>
                    <div className="top-performers-grid">
                        {contests.top_performers.map((user, index) => (
                            <div key={user.id} className="performer-card">
                                <div className="performer-rank">#{index + 1}</div>
                                <div className="performer-info">
                                    <h4>{user.full_name || user.username}</h4>
                                    <p className="performer-username">@{user.username}</p>
                                    <div className="performer-stats">
                                        <span>
                                            <Trophy size={14} />
                                            {user.contests_participated} contests
                                        </span>
                                        <span>
                                            <CheckCircle size={14} />
                                            {user.total_problems_solved} bài AC
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Contests */}
            {contests.recent_contests && contests.recent_contests.length > 0 && (
                <div className="stats-section">
                    <h2>Contest gần đây</h2>
                    <div className="contests-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tên Contest</th>
                                    <th>Trạng thái</th>
                                    <th>Chế độ</th>
                                    <th>Thời gian</th>
                                    <th>Thí sinh</th>
                                    <th>Bài tập</th>
                                    <th>Bài nộp</th>
                                    <th>Tác giả</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contests.recent_contests.map((contest) => {
                                    const status = getStatusLabel(contest);
                                    return (
                                        <tr
                                            key={contest.id}
                                            onClick={() => navigate(`/admin/contests/${contest.id}/statistics`)}
                                            className="clickable-row"
                                        >
                                            <td>
                                                <div className="contest-title">
                                                    <Trophy size={16} />
                                                    {contest.title}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`mode-badge mode-${contest.contest_mode.toLowerCase()}`}
                                                >
                                                    {contest.contest_mode}
                                                </span>
                                            </td>
                                            <td className="date-cell">
                                                <div>{formatDate(contest.start_at)}</div>
                                                <div className="date-end">→ {formatDate(contest.end_at)}</div>
                                            </td>
                                            <td className="center-cell">{contest.participants_count}</td>
                                            <td className="center-cell">{contest.problems_count}</td>
                                            <td className="center-cell">{contest.submissions_count}</td>
                                            <td>{contest.created_by || 'N/A'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Most Participated Contests */}
            {contests.most_participated_contests && contests.most_participated_contests.length > 0 && (
                <div className="stats-section">
                    <h2>Contest có nhiều người tham gia nhất</h2>
                    <div className="popular-contests">
                        {contests.most_participated_contests.slice(0, 5).map((contest, index) => {
                            const status = getStatusLabel(contest);
                            return (
                                <div
                                    key={contest.id}
                                    className="popular-contest-card"
                                    onClick={() => navigate(`/admin/contests/${contest.id}/statistics`)}
                                >
                                    <div className="rank-badge">#{index + 1}</div>
                                    <div className="popular-contest-content">
                                        <h3>{contest.title}</h3>
                                        <div className="popular-contest-meta">
                                            <span className={`status-badge ${status.className}`}>{status.label}</span>
                                            <span className="participant-count">
                                                <Users size={16} />
                                                {contest.participants_count} thí sinh
                                            </span>
                                        </div>
                                        <div className="popular-contest-time">
                                            <Calendar size={14} />
                                            {formatDate(contest.start_at)} → {formatDate(contest.end_at)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContestStatistics;
