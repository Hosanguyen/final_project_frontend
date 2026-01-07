import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Code
} from 'lucide-react';
import ContestService from '../../../services/ContestService';
import './ContestStatistics.css';

// Register Chart.js components
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

const ContestStatistics2 = () => {
    const navigate = useNavigate();
    
    // Lấy tháng hiện tại làm giá trị mặc định
    const getCurrentMonth = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    const [selectedMonthYear, setSelectedMonthYear] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const contestsPerPage = 10;

    // Data states
    const [statsData, setStatsData] = useState(null);
    const [allContestsData, setAllContestsData] = useState({ contests: [], total: 0, page: 1, totalPages: 0 });
    const [loading, setLoading] = useState(true);

    const lineChartRef = useRef(null);
    const barChartRef = useRef(null);
    const doughnutChartRef = useRef(null);
    const participantsChartRef = useRef(null);

    const lineChartInstance = useRef(null);
    const barChartInstance = useRef(null);
    const doughnutChartInstance = useRef(null);
    const participantsChartInstance = useRef(null);

    // Fetch stats data
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const monthParam = selectedMonthYear === 'all' ? null : selectedMonthYear;
                const data = await ContestService.getStatistics(monthParam);
                setStatsData(data);
            } catch (error) {
                console.error('Error fetching contest stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedMonthYear]);

    // Fetch all contests with pagination
    useEffect(() => {
        const fetchAllContests = async () => {
            if (!statsData) return;
            
            try {
                // Filter contests based on current filters
                let filtered = statsData.contests?.recent_contests || [];
                
                if (searchTerm) {
                    filtered = filtered.filter(c => 
                        c.title.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                
                if (filterStatus !== 'all') {
                    const now = new Date();
                    filtered = filtered.filter(c => {
                        const start = new Date(c.start_at);
                        const end = new Date(c.end_at);
                        
                        if (filterStatus === 'upcoming') return now < start;
                        if (filterStatus === 'ongoing') return now >= start && now <= end;
                        if (filterStatus === 'ended') return now > end;
                        return true;
                    });
                }
                
                const total = filtered.length;
                const totalPages = Math.ceil(total / contestsPerPage);
                const start = (currentPage - 1) * contestsPerPage;
                const paginatedContests = filtered.slice(start, start + contestsPerPage);
                
                setAllContestsData({
                    contests: paginatedContests,
                    total,
                    page: currentPage,
                    totalPages
                });
            } catch (error) {
                console.error('Error filtering contests:', error);
            }
        };
        fetchAllContests();
    }, [currentPage, searchTerm, filterStatus, statsData]);

    // Render charts
    useEffect(() => {
        if (!statsData || loading) return;

        const renderCharts = () => {
            try {
                // Destroy existing charts
                if (lineChartInstance.current) lineChartInstance.current.destroy();
                if (barChartInstance.current) barChartInstance.current.destroy();
                if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();
                if (participantsChartInstance.current) participantsChartInstance.current.destroy();

                // Line Chart - Contest Growth Over Time
                if (lineChartRef.current && statsData.charts?.contests_by_month) {
                    const ctx = lineChartRef.current.getContext('2d');
                    const data = statsData.charts.contests_by_month;
                    
                    lineChartInstance.current = new ChartJS(ctx, {
                        type: 'line',
                        data: {
                            labels: data.map(d => d.month),
                            datasets: [
                                {
                                    label: 'Số Contest',
                                    data: data.map(d => d.count),
                                    borderColor: '#3b82f6',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    tension: 0.4,
                                    fill: true,
                                    borderWidth: 3,
                                    pointRadius: 4,
                                    pointHoverRadius: 6,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false,
                                },
                                tooltip: {
                                    backgroundColor: '#1e293b',
                                    padding: 12,
                                    titleColor: '#f1f5f9',
                                    bodyColor: '#f1f5f9',
                                    borderColor: '#334155',
                                    borderWidth: 1,
                                },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        color: '#e2e8f0',
                                    },
                                    ticks: {
                                        color: '#64748b',
                                    },
                                },
                                x: {
                                    grid: {
                                        display: false,
                                    },
                                    ticks: {
                                        color: '#64748b',
                                    },
                                },
                            },
                        },
                    });
                }

                // Bar Chart - Submissions by Status
                if (barChartRef.current && statsData.contests?.submissions?.by_status) {
                    const ctx = barChartRef.current.getContext('2d');
                    const data = statsData.contests.submissions.by_status;
                    
                    barChartInstance.current = new ChartJS(ctx, {
                        type: 'bar',
                        data: {
                            labels: data.map(d => d.status || 'Unknown'),
                            datasets: [
                                {
                                    label: 'Số lượng',
                                    data: data.map(d => d.count),
                                    backgroundColor: [
                                        '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', 
                                        '#06b6d4', '#ec4899', '#6366f1', '#14b8a6'
                                    ],
                                    borderRadius: 8,
                                    borderSkipped: false,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false,
                                },
                                tooltip: {
                                    backgroundColor: '#1e293b',
                                    padding: 12,
                                    titleColor: '#f1f5f9',
                                    bodyColor: '#f1f5f9',
                                    borderColor: '#334155',
                                    borderWidth: 1,
                                },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        color: '#e2e8f0',
                                    },
                                    ticks: {
                                        color: '#64748b',
                                    },
                                },
                                x: {
                                    grid: {
                                        display: false,
                                    },
                                    ticks: {
                                        color: '#64748b',
                                    },
                                },
                            },
                        },
                    });
                }

                // Doughnut Chart - Contest Mode Distribution
                if (doughnutChartRef.current && statsData.contests?.overview) {
                    const ctx = doughnutChartRef.current.getContext('2d');
                    const overview = statsData.contests.overview;
                    
                    doughnutChartInstance.current = new ChartJS(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['ICPC Mode', 'OI Mode'],
                            datasets: [
                                {
                                    data: [overview.icpc_contests || 0, overview.oi_contests || 0],
                                    backgroundColor: ['#3b82f6', '#8b5cf6'],
                                    borderWidth: 0,
                                    hoverOffset: 8,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 20,
                                        font: {
                                            size: 12,
                                            weight: '500',
                                        },
                                        color: '#64748b',
                                    },
                                },
                                tooltip: {
                                    backgroundColor: '#1e293b',
                                    padding: 12,
                                    titleColor: '#f1f5f9',
                                    bodyColor: '#f1f5f9',
                                    borderColor: '#334155',
                                    borderWidth: 1,
                                },
                            },
                        },
                    });
                }

                // Line Chart - Participants Growth
                if (participantsChartRef.current && statsData.charts?.participants_growth) {
                    const ctx = participantsChartRef.current.getContext('2d');
                    const data = statsData.charts.participants_growth;
                    
                    participantsChartInstance.current = new ChartJS(ctx, {
                        type: 'line',
                        data: {
                            labels: data.map(d => d.month),
                            datasets: [
                                {
                                    label: 'Số Thí Sinh',
                                    data: data.map(d => d.count),
                                    borderColor: '#22c55e',
                                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                    tension: 0.4,
                                    fill: true,
                                    borderWidth: 3,
                                    pointRadius: 4,
                                    pointHoverRadius: 6,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false,
                                },
                                tooltip: {
                                    backgroundColor: '#1e293b',
                                    padding: 12,
                                    titleColor: '#f1f5f9',
                                    bodyColor: '#f1f5f9',
                                    borderColor: '#334155',
                                    borderWidth: 1,
                                },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        color: '#e2e8f0',
                                    },
                                    ticks: {
                                        color: '#64748b',
                                    },
                                },
                                x: {
                                    grid: {
                                        display: false,
                                    },
                                    ticks: {
                                        color: '#64748b',
                                    },
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
            if (lineChartInstance.current) lineChartInstance.current.destroy();
            if (barChartInstance.current) barChartInstance.current.destroy();
            if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();
            if (participantsChartInstance.current) participantsChartInstance.current.destroy();
        };
    }, [statsData, loading]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusInfo = (contest) => {
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
            <div className="contest-reports">
                <div className="contest-reports-container">
                    <div className="contest-reports-loading">Đang tải...</div>
                </div>
            </div>
        );
    }

    if (!statsData) return null;

    const contests = statsData.contests || {};
    const practice = statsData.practice || {};

    return (
        <div className="contest-reports">
            <div className="contest-reports-container">
                {/* Header */}
                <div className="contest-reports-header">
                    <div>
                        <h1 className="contest-reports-title">
                            <Trophy className="title-icon" />
                            Thống kê Contest & Practice
                        </h1>
                        <p className="contest-reports-subtitle">
                            Tổng quan về các cuộc thi lập trình và luyện tập
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                            type="month"
                            value={selectedMonthYear}
                            onChange={(e) => setSelectedMonthYear(e.target.value)}
                            className="time-range-select"
                            style={{
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        />
                    </div>
                </div>

                {/* Practice Stats */}
                <div className="section-title">
                    <Code size={20} />
                    <span>Practice Mode</span>
                </div>
                <div className="stats-grid">
                    <div 
                        className="stat-card clickable-card"
                        onClick={() => navigate(`/admin/contests/${practice.contest_id}/statistics`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="stat-card-content">
                            <div className="stat-info">
                                <div className="stat-label">Tổng bài tập</div>
                                <div className="stat-value">{practice.total_problems || 0}</div>
                            </div>
                            <div className="stat-icon bg-blue-500">
                                <FileText className="icon" />
                            </div>
                        </div>
                    </div>

                    <div 
                        className="stat-card clickable-card"
                        onClick={() => navigate(`/admin/contests/${practice.contest_id}/statistics`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="stat-card-content">
                            <div className="stat-info">
                                <div className="stat-label">Lượt nộp bài</div>
                                <div className="stat-value">{practice.total_submissions || 0}</div>
                                <div className="stat-change">
                                    <CheckCircle className="change-icon" />
                                    {practice.acceptance_rate || 0}% AC
                                </div>
                            </div>
                            <div className="stat-icon bg-green-500">
                                <Send className="icon" />
                            </div>
                        </div>
                    </div>

                    <div 
                        className="stat-card clickable-card"
                        onClick={() => navigate(`/admin/contests/${practice.contest_id}/statistics`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="stat-card-content">
                            <div className="stat-info">
                                <div className="stat-label">Người tham gia</div>
                                <div className="stat-value">{practice.total_participants || 0}</div>
                            </div>
                            <div className="stat-icon bg-purple-500">
                                <Users className="icon" />
                            </div>
                        </div>
                    </div>

                    <div 
                        className="stat-card clickable-card"
                        onClick={() => navigate(`/admin/contests/${practice.contest_id}/statistics`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="stat-card-content">
                            <div className="stat-info">
                                <div className="stat-label">Bài AC</div>
                                <div className="stat-value">{practice.accepted_submissions || 0}</div>
                            </div>
                            <div className="stat-icon bg-green-500">
                                <CheckCircle className="icon" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contest Stats */}
                <div className="section-title">
                    <Trophy size={20} />
                    <span>Contest Mode</span>
                </div>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-info">
                                <div className="stat-label">Tổng Contest</div>
                                <div className="stat-value">{contests.overview?.total_contests || 0}</div>
                                <div className="stat-sublabel">
                                    <span className="sublabel-item">
                                        <Calendar size={12} /> {contests.overview?.upcoming_contests || 0} sắp diễn ra
                                    </span>
                                    <span className="sublabel-item">
                                        <Activity size={12} /> {contests.overview?.ongoing_contests || 0} đang diễn ra
                                    </span>
                                </div>
                            </div>
                            <div className="stat-icon bg-orange-500">
                                <Trophy className="icon" />
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-info">
                                <div className="stat-label">Tổng Bài Tập</div>
                                <div className="stat-value">{contests.problems?.total_contest_problems || 0}</div>
                                <div className="stat-change">
                                    <TrendingUp className="change-icon" />
                                    TB: {contests.problems?.avg_problems_per_contest || 0} bài/contest
                                </div>
                            </div>
                            <div className="stat-icon bg-blue-500">
                                <FileText className="icon" />
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-info">
                                <div className="stat-label">Tổng Thí Sinh</div>
                                <div className="stat-value">{contests.participants?.total_participants || 0}</div>
                                <div className="stat-change">
                                    <TrendingUp className="change-icon" />
                                    TB: {contests.participants?.avg_participants_per_contest || 0} người/contest
                                </div>
                            </div>
                            <div className="stat-icon bg-purple-500">
                                <Users className="icon" />
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-info">
                                <div className="stat-label">Tổng Bài Nộp</div>
                                <div className="stat-value">{contests.submissions?.total_submissions || 0}</div>
                                <div className="stat-change">
                                    <CheckCircle className="change-icon" />
                                    {contests.submissions?.accepted_submissions || 0} AC ({contests.submissions?.acceptance_rate || 0}%)
                                </div>
                            </div>
                            <div className="stat-icon bg-green-500">
                                <Send className="icon" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="charts-row">
                    <div className="chart-card">
                        <h3 className="chart-title">Xu hướng Contest (12 tháng)</h3>
                        <div className="chart-container">
                            <canvas ref={lineChartRef}></canvas>
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">Tăng trưởng Thí Sinh (12 tháng)</h3>
                        <div className="chart-container">
                            <canvas ref={participantsChartRef}></canvas>
                        </div>
                    </div>
                </div>

                <div className="charts-row">
                    <div className="chart-card">
                        <h3 className="chart-title">Phân bố Trạng thái Bài Nộp</h3>
                        <div className="chart-container">
                            <canvas ref={barChartRef}></canvas>
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">Phân bố Chế độ Contest</h3>
                        <div className="chart-container">
                            <canvas ref={doughnutChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Top Performers */}
                {contests.top_performers && contests.top_performers.length > 0 && (
                    <>
                        <div className="section-title">
                            <Award size={20} />
                            <span>Top Performers</span>
                        </div>
                        <div className="table-card">
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
                    </>
                )}

                {/* All Contests Table */}
                <div className="section-title">
                    <Trophy size={20} />
                    <span>Danh sách Contest</span>
                </div>
                <div className="table-card">
                    <div className="table-header">
                        <div className="search-filter-row">
                            <input
                                type="text"
                                placeholder="Tìm kiếm contest..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="search-input"
                            />
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="filter-select"
                            >
                                <option value="all">Tất cả</option>
                                <option value="upcoming">Sắp diễn ra</option>
                                <option value="ongoing">Đang diễn ra</option>
                                <option value="ended">Đã kết thúc</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Contest</th>
                                    <th>Trạng thái</th>
                                    <th>Chế độ</th>
                                    <th>Thời gian</th>
                                    <th>Thí sinh</th>
                                    <th>Bài tập</th>
                                    <th>Bài nộp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allContestsData.contests.map((contest) => {
                                    const status = getStatusInfo(contest);
                                    return (
                                        <tr 
                                            key={contest.id}
                                            onClick={() => navigate(`/admin/contests/${contest.id}/statistics`)}
                                            className="clickable-row"
                                        >
                                            <td>
                                                <div className="contest-title-cell">
                                                    <Trophy size={16} />
                                                    <span>{contest.title}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge mode-${contest.contest_mode.toLowerCase()}`}>
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
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {allContestsData.totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                Trước
                            </button>
                            <span className="pagination-info">
                                Trang {currentPage} / {allContestsData.totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(allContestsData.totalPages, p + 1))}
                                disabled={currentPage === allContestsData.totalPages}
                                className="pagination-btn"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContestStatistics2;
