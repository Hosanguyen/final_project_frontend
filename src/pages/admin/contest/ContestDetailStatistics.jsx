import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Users,
    FileText,
    CheckCircle,
    XCircle,
    Activity,
    Award,
    TrendingUp,
    AlertCircle,
    ArrowLeft,
} from 'lucide-react';
import ContestService from '../../../services/ContestService';
import './ContestDetailStatistics.css';

const ContestDetailStatistics = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadStatistics();
    }, [id]);

    const loadStatistics = async () => {
        try {
            setLoading(true);
            const response = await ContestService.getContestDetailStatistics(id);
            setData(response);
            setError(null);
        } catch (err) {
            setError(err.error || 'Không thể tải thống kê contest');
            console.error('Error loading contest statistics:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            AC: '#10b981',
            WA: '#ef4444',
            TLE: '#f59e0b',
            MLE: '#8b5cf6',
            RE: '#ec4899',
            CE: '#6366f1',
        };
        return colors[status] || '#6b7280';
    };

    const getStatusLabel = (status) => {
        const labels = {
            AC: 'Accepted',
            WA: 'Wrong Answer',
            TLE: 'Time Limit',
            MLE: 'Memory Limit',
            RE: 'Runtime Error',
            CE: 'Compile Error',
            PE: 'Presentation Error',
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="contest-detail-stats-container">
                <div className="loading">Đang tải thống kê...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="contest-detail-stats-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    if (!data) return null;

    const { contest, statistics, charts } = data;

    return (
        <div className="contest-detail-stats-container">
            {/* Header */}
            <div className="stats-header">
                <button className="back-button" onClick={() => navigate('/admin/statistics/contest-reports')}>
                    <ArrowLeft size={20} />
                    <span>Quay lại</span>
                </button>
                <div className="header-content">
                    <h1>{contest.title}</h1>
                    <div className="contest-info">
                        <span className={`contest-badge ${contest.visibility}`}>{contest.visibility}</span>
                        <span className="contest-mode">{contest.contest_mode} Mode</span>
                        <span className="contest-dates">
                            {new Date(contest.start_at).toLocaleDateString('vi-VN')} -{' '}
                            {new Date(contest.end_at).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-icon participants">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>Người tham gia</h3>
                        <p className="stat-value">{statistics.participants.total}</p>
                        <span className="stat-detail">{statistics.participants.active} đang hoạt động</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon submissions">
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>Tổng bài nộp</h3>
                        <p className="stat-value">{statistics.submissions.total}</p>
                        <span className="stat-detail">{statistics.submissions.accepted} được chấp nhận</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon acceptance">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>Tỷ lệ AC</h3>
                        <p className="stat-value">{statistics.submissions.acceptance_rate}%</p>
                        <span className="stat-detail">Tỷ lệ chấp nhận</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon problems">
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>Số bài tập</h3>
                        <p className="stat-value">{statistics.problems.total}</p>
                        <span className="stat-detail">Trong contest</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                {/* Submissions Over Time */}
                <div className="chart-card">
                    <h2>
                        <TrendingUp size={20} />
                        Submissions theo thời gian
                    </h2>
                    <div className="bar-chart">
                        {charts.submissions_over_time.map((item, index) => {
                            const maxCount = Math.max(...charts.submissions_over_time.map((i) => i.count));
                            const height = (item.count / maxCount) * 100;
                            return (
                                <div key={index} className="bar-item">
                                    <div
                                        className="bar submissions-bar"
                                        style={{ height: `${height}%` }}
                                        title={`${item.day}: ${item.count} submissions`}
                                    >
                                        <span className="bar-value">{item.count}</span>
                                    </div>
                                    <span className="bar-label">
                                        {new Date(item.day).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                        })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Test Case Statistics */}
                {statistics.test_cases && statistics.test_cases.total_test_cases_run > 0 && (
                    <div className="chart-card">
                        <h2>
                            <CheckCircle size={20} />
                            Thống kê Test Case
                        </h2>
                        <div className="test-case-overview">
                            <div className="test-case-summary">
                                <div className="test-stat">
                                    <span className="test-stat-label">Tổng test case chạy</span>
                                    <span className="test-stat-value">
                                        {statistics.test_cases.total_test_cases_run}
                                    </span>
                                </div>
                                <div className="test-stat passed">
                                    <span className="test-stat-label">Passed</span>
                                    <span className="test-stat-value">{statistics.test_cases.passed_test_cases}</span>
                                </div>
                                <div className="test-stat failed">
                                    <span className="test-stat-label">Failed</span>
                                    <span className="test-stat-value">{statistics.test_cases.failed_test_cases}</span>
                                </div>
                            </div>

                            {/* Test case pass rate bar */}
                            <div className="test-case-bar">
                                <div
                                    className="test-case-passed"
                                    style={{
                                        width: `${(
                                            (statistics.test_cases.passed_test_cases /
                                                statistics.test_cases.total_test_cases_run) *
                                            100
                                        ).toFixed(1)}%`,
                                    }}
                                    title={`${statistics.test_cases.passed_test_cases} passed`}
                                />
                                <div
                                    className="test-case-failed"
                                    style={{
                                        width: `${(
                                            (statistics.test_cases.failed_test_cases /
                                                statistics.test_cases.total_test_cases_run) *
                                            100
                                        ).toFixed(1)}%`,
                                    }}
                                    title={`${statistics.test_cases.failed_test_cases} failed`}
                                />
                            </div>

                            {/* Test case by verdict */}
                            {statistics.test_cases.by_verdict && statistics.test_cases.by_verdict.length > 0 && (
                                <div className="test-case-verdicts">
                                    <h4>Chi tiết theo verdict:</h4>
                                    {statistics.test_cases.by_verdict.map((item, index) => (
                                        <div key={index} className="verdict-item">
                                            <span className="verdict-label">{item.verdict}</span>
                                            <div className="verdict-bar-container">
                                                <div
                                                    className="verdict-bar"
                                                    style={{
                                                        width: `${(
                                                            (item.count / statistics.test_cases.total_test_cases_run) *
                                                            100
                                                        ).toFixed(1)}%`,
                                                        backgroundColor:
                                                            item.verdict === 'correct' ? '#10b981' : '#ef4444',
                                                    }}
                                                />
                                            </div>
                                            <span className="verdict-count">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Error Distribution */}
                <div className="chart-card">
                    <h2>
                        <AlertCircle size={20} />
                        Phân bố lỗi
                    </h2>
                    <div className="error-distribution">
                        {statistics.submissions.by_status.map((item, index) => (
                            <div key={index} className="error-item">
                                <div className="error-info">
                                    <span
                                        className="error-dot"
                                        style={{ backgroundColor: getStatusColor(item.status) }}
                                    />
                                    <span className="error-label">{getStatusLabel(item.status)}</span>
                                </div>
                                <div className="error-bar-container">
                                    <div
                                        className="error-bar"
                                        style={{
                                            width: `${(item.count / statistics.submissions.total) * 100}%`,
                                            backgroundColor: getStatusColor(item.status),
                                        }}
                                    />
                                </div>
                                <span className="error-count">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Problem Statistics */}
            <div className="problems-stats-section">
                <h2>
                    <Activity size={20} />
                    Thống kê theo bài tập
                </h2>
                <div className="problems-grid">
                    {statistics.problems.by_problem.map((problem, index) => (
                        <div
                            key={index}
                            className="problem-card clickable-card"
                            onClick={() => navigate(`/admin/statistics/problem/${problem.problem_id}?contest_id=${id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="problem-header">
                                <span className="problem-alias">{problem.alias}</span>
                                <span className="problem-point">{problem.point} điểm</span>
                            </div>
                            <h3 className="problem-title">{problem.problem_title}</h3>
                            <div className="problem-stats">
                                <div className="problem-stat">
                                    <FileText size={16} />
                                    <span>{problem.total_submissions} submissions</span>
                                </div>
                                <div className="problem-stat accepted">
                                    <CheckCircle size={16} />
                                    <span>{problem.accepted_submissions} AC</span>
                                </div>
                            </div>
                            <div className="problem-acceptance">
                                <div className="acceptance-bar">
                                    <div className="acceptance-fill" style={{ width: `${problem.acceptance_rate}%` }} />
                                </div>
                                <span className="acceptance-rate">{problem.acceptance_rate}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Participants */}
            <div className="top-participants-section">
                <h2>
                    <Award size={20} />
                    Top người tham gia
                </h2>
                <div className="participants-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Hạng</th>
                                <th>Tên</th>
                                <th>Bài giải</th>
                                <th>Điểm</th>
                                <th>Submissions</th>
                                <th>Tỷ lệ AC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statistics.participants.top_participants.map((participant, index) => (
                                <tr key={participant.user_id}>
                                    <td>
                                        <span className={`rank rank-${index + 1}`}>{index + 1}</span>
                                    </td>
                                    <td>
                                        <div className="participant-info">
                                            <strong>{participant.username}</strong>
                                            <span className="full-name">{participant.full_name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="solved-count">{participant.solved_count}</span>
                                    </td>
                                    <td>
                                        <span className="score">{participant.total_score}</span>
                                    </td>
                                    <td>{participant.total_submissions}</td>
                                    <td>
                                        <span className="ac-rate">
                                            {participant.total_submissions > 0
                                                ? Math.round(
                                                      (participant.accepted_submissions /
                                                          participant.total_submissions) *
                                                          100,
                                                  )
                                                : 0}
                                            %
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Submissions */}
            <div className="recent-submissions-section">
                <h2>
                    <FileText size={20} />
                    Submissions gần đây
                </h2>
                <div className="submissions-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Người dùng</th>
                                <th>Bài tập</th>
                                <th>Trạng thái</th>
                                <th>Ngôn ngữ</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statistics.submissions.recent.map((submission) => (
                                <tr key={submission.id}>
                                    <td>#{submission.id}</td>
                                    <td>{submission.user}</td>
                                    <td>
                                        <span className="submission-problem">
                                            {submission.alias} - {submission.problem}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(submission.status) }}
                                        >
                                            {submission.status}
                                        </span>
                                    </td>
                                    <td>{submission.language}</td>
                                    <td>{new Date(submission.created_at).toLocaleString('vi-VN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ContestDetailStatistics;
