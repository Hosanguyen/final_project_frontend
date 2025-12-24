import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    LineController,
    BarController,
    DoughnutController,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import {
    Code,
    FileText,
    Users,
    CheckCircle,
    TrendingUp,
    Trophy,
    Clock,
    Activity,
    Target
} from 'lucide-react';
import api from '../../../services/api';
import './ProblemStatistics.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    LineController,
    BarController,
    DoughnutController,
    Title,
    Tooltip,
    Legend,
    Filler,
);

const ProblemStatistics = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [selectedContest, setSelectedContest] = useState('all');
    const [contestsList, setContestsList] = useState([]);
    const [loading, setLoading] = useState(true);

    const submissionsChartRef = useRef(null);
    const statusChartRef = useRef(null);

    const submissionsChartInstance = useRef(null);
    const statusChartInstance = useRef(null);

    // Fetch statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const params = selectedContest !== 'all' ? { contest_id: selectedContest } : {};
                const response = await api.get(`/api/problems/${id}/statistics/`, { params });
                setStats(response.data);
                
                // Store contests list only when fetching all contests (not filtered)
                if (selectedContest === 'all' && response.data.contests) {
                    setContestsList(response.data.contests);
                }
            } catch (error) {
                console.error('Error fetching problem stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [id, selectedContest]);

    // Render charts
    useEffect(() => {
        if (!stats || loading) return;

        const renderCharts = () => {
            try {
                // Destroy existing charts
                if (submissionsChartInstance.current) submissionsChartInstance.current.destroy();
                if (statusChartInstance.current) statusChartInstance.current.destroy();

                // Line Chart - Submissions over time
                if (submissionsChartRef.current && stats.submissions_by_date) {
                    const ctx = submissionsChartRef.current.getContext('2d');
                    
                    submissionsChartInstance.current = new ChartJS(ctx, {
                        type: 'line',
                        data: {
                            labels: stats.submissions_by_date.map(d => d.date),
                            datasets: [
                                {
                                    label: 'Submissions',
                                    data: stats.submissions_by_date.map(d => d.count),
                                    borderColor: '#3b82f6',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    tension: 0.4,
                                    fill: true,
                                    borderWidth: 3,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: '#1e293b',
                                    padding: 12,
                                },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: { color: '#e2e8f0' },
                                    ticks: { color: '#64748b' },
                                },
                                x: {
                                    grid: { display: false },
                                    ticks: { color: '#64748b' },
                                },
                            },
                        },
                    });
                }

                // Bar Chart - Status distribution
                if (statusChartRef.current && stats.by_status) {
                    const ctx = statusChartRef.current.getContext('2d');
                    
                    statusChartInstance.current = new ChartJS(ctx, {
                        type: 'bar',
                        data: {
                            labels: stats.by_status.map(d => d.status || 'Unknown'),
                            datasets: [
                                {
                                    label: 'Số lượng',
                                    data: stats.by_status.map(d => d.count),
                                    backgroundColor: [
                                        '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6',
                                        '#06b6d4', '#ec4899', '#6366f1', '#14b8a6'
                                    ],
                                    borderRadius: 8,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: '#1e293b',
                                    padding: 12,
                                },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: { color: '#e2e8f0' },
                                    ticks: { color: '#64748b' },
                                },
                                x: {
                                    grid: { display: false },
                                    ticks: { color: '#64748b' },
                                },
                            },
                        },
                    });
                }
            } catch (error) {
                console.error('Error rendering charts:', error);
            }
        };

        renderCharts();

        return () => {
            if (submissionsChartInstance.current) submissionsChartInstance.current.destroy();
            if (statusChartInstance.current) statusChartInstance.current.destroy();
        };
    }, [stats, loading]);

    if (loading) {
        return (
            <div className="problem-reports">
                <div className="problem-reports-container">
                    <div className="loading-spinner">Đang tải...</div>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="problem-reports">
            <div className="problem-reports-container">
                {/* Header */}
                <div className="problem-reports-header">
                    <div>
                        <h1 className="problem-reports-title">
                            <Code className="title-icon" />
                            Thống kê: {stats.problem_title}
                        </h1>
                        <p className="problem-reports-subtitle">
                            Chi tiết submissions và performance
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select
                            value={selectedContest}
                            onChange={(e) => setSelectedContest(e.target.value)}
                            className="time-range-select"
                        >
                            <option value="all">Tất cả Contest</option>
                            {contestsList && contestsList.map(contest => (
                                <option key={contest.contest_id} value={contest.contest_id}>
                                    {contest.contest_title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-info">
                                <div className="stat-label">Tổng Submissions</div>
                                <div className="stat-value">{stats.total_submissions || 0}</div>
                            </div>
                            <div className="stat-icon bg-blue-500">
                                <FileText className="icon" />
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-info">
                                <div className="stat-label">Accepted</div>
                                <div className="stat-value">{stats.accepted_submissions || 0}</div>
                                <div className="stat-change">
                                    <CheckCircle className="change-icon" />
                                    {stats.acceptance_rate}% AC Rate
                                </div>
                            </div>
                            <div className="stat-icon bg-green-500">
                                <CheckCircle className="icon" />
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-info">
                                <div className="stat-label">Unique Solvers</div>
                                <div className="stat-value">{stats.unique_solvers || 0}</div>
                            </div>
                            <div className="stat-icon bg-purple-500">
                                <Users className="icon" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="charts-row">
                    <div className="chart-card">
                        <h3 className="chart-title">Submissions theo thời gian (30 ngày)</h3>
                        <div className="chart-container">
                            <canvas ref={submissionsChartRef}></canvas>
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">Phân bố Status</h3>
                        <div className="chart-container">
                            <canvas ref={statusChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Top Solvers */}
                {stats.top_solvers && stats.top_solvers.length > 0 && (
                    <>
                        <div className="section-title">
                            <Trophy size={20} />
                            <span>Top Solvers</span>
                        </div>
                        <div className="table-card">
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Username</th>
                                            <th>Full Name</th>
                                            <th>AC Count</th>
                                            <th>First AC</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.top_solvers.map((solver, index) => (
                                            <tr key={index}>
                                                <td className="center-cell">{index + 1}</td>
                                                <td>@{solver.user__username}</td>
                                                <td>{solver.user__full_name || '-'}</td>
                                                <td className="center-cell">{solver.ac_count}</td>
                                                <td>{new Date(solver.first_ac).toLocaleDateString('vi-VN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* Contests List (when viewing all contests) */}
                {selectedContest === 'all' && stats.contests && stats.contests.length > 0 && (
                    <>
                        <div className="section-title">
                            <Activity size={20} />
                            <span>Problem trong các Contest</span>
                        </div>
                        <div className="table-card">
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Contest</th>
                                            <th>Alias</th>
                                            <th>Point</th>
                                            <th>Submissions</th>
                                            <th>Accepted</th>
                                            <th>AC Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.contests.map((contest) => {
                                            const acRate = contest.total_submissions > 0
                                                ? ((contest.accepted_submissions / contest.total_submissions) * 100).toFixed(2)
                                                : 0;
                                            return (
                                                <tr 
                                                    key={contest.contest_id}
                                                    onClick={() => setSelectedContest(contest.contest_id.toString())}
                                                    className="clickable-row"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td>{contest.contest_title}</td>
                                                    <td className="center-cell">
                                                        <span className="badge">{contest.alias}</span>
                                                    </td>
                                                    <td className="center-cell">{contest.point}</td>
                                                    <td className="center-cell">{contest.total_submissions}</td>
                                                    <td className="center-cell">{contest.accepted_submissions}</td>
                                                    <td className="center-cell">
                                                        <span className="badge badge-success">{acRate}%</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProblemStatistics;
