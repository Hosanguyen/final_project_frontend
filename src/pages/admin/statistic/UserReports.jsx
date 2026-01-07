import React, { useState, useEffect, useRef } from 'react';
import { Users, TrendingUp, Code, BookOpen, Trophy, UserPlus, Activity } from 'lucide-react';
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
import UserService from '../../../services/UserService';
import Pagination from '../../../components/Pagination';
import './UserReports.css';

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

const UserReports = () => {
    // Lấy tháng hiện tại làm giá trị mặc định
    const getCurrentMonth = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    const [selectedMonthYear, setSelectedMonthYear] = useState(getCurrentMonth()); // Format: YYYY-MM
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // Data states
    const [statsData, setStatsData] = useState(null);
    const [topUsers, setTopUsers] = useState([]);
    const [allUsersData, setAllUsersData] = useState({ data: [], total_count: 0, total_pages: 0 });
    const [loading, setLoading] = useState(true);

    const lineChartRef = useRef(null);
    const doughnutChartRef = useRef(null);
    const barChartRef = useRef(null);
    const contestChartRef = useRef(null);

    const lineChartInstance = useRef(null);
    const doughnutChartInstance = useRef(null);
    const barChartInstance = useRef(null);
    const contestChartInstance = useRef(null);

    // Fetch stats data
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await UserService.getReportsStats(selectedMonthYear);
                setStatsData(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, [selectedMonthYear]);

    // Fetch top users
    useEffect(() => {
        const fetchTopUsers = async () => {
            try {
                const data = await UserService.getReportsTopUsers();
                setTopUsers(data);
            } catch (error) {
                console.error('Error fetching top users:', error);
            }
        };
        fetchTopUsers();
    }, []);

    // Fetch all users with pagination
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const params = {
                    page: currentPage,
                    page_size: usersPerPage,
                    search: searchTerm,
                    level: filterLevel === 'all' ? '' : filterLevel,
                };
                const data = await UserService.getReportsAllUsers(params);
                setAllUsersData(data);
            } catch (error) {
                console.error('Error fetching all users:', error);
            }
        };
        fetchAllUsers();
    }, [currentPage, searchTerm, filterLevel]);

    // Fetch and render charts
    useEffect(() => {
        const fetchAndRenderCharts = async () => {
            try {
                setLoading(true);

                // Fetch all chart data
                const [growthData, levelData, courseData, contestData] = await Promise.all([
                    UserService.getReportsGrowthChart(selectedMonthYear),
                    UserService.getReportsLevelDistribution(selectedMonthYear),
                    UserService.getReportsCourseEnrollments(selectedMonthYear),
                    UserService.getReportsContestStats(selectedMonthYear),
                ]);

                // Destroy existing charts
                if (lineChartInstance.current) lineChartInstance.current.destroy();
                if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();
                if (barChartInstance.current) barChartInstance.current.destroy();
                if (contestChartInstance.current) contestChartInstance.current.destroy();

                // Line Chart - User Growth
                if (lineChartRef.current) {
                    const ctx = lineChartRef.current.getContext('2d');
                    lineChartInstance.current = new ChartJS(ctx, {
                        type: 'line',
                        data: {
                            labels: growthData.labels,
                            datasets: [
                                {
                                    label: 'Tổng Users',
                                    data: growthData.total_users,
                                    borderColor: '#3b82f6',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    tension: 0.4,
                                    fill: true,
                                    borderWidth: 3,
                                    pointRadius: 5,
                                    pointHoverRadius: 7,
                                    pointBackgroundColor: '#3b82f6',
                                    pointBorderColor: '#fff',
                                    pointBorderWidth: 2,
                                },
                                {
                                    label: 'Hoạt Động',
                                    data: growthData.active_users,
                                    borderColor: '#8b5cf6',
                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                    tension: 0.4,
                                    fill: true,
                                    borderWidth: 3,
                                    pointRadius: 5,
                                    pointHoverRadius: 7,
                                    pointBackgroundColor: '#8b5cf6',
                                    pointBorderColor: '#fff',
                                    pointBorderWidth: 2,
                                },
                                {
                                    label: 'Mới',
                                    data: growthData.new_users,
                                    borderColor: '#10b981',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    tension: 0.4,
                                    fill: true,
                                    borderWidth: 3,
                                    pointRadius: 5,
                                    pointHoverRadius: 7,
                                    pointBackgroundColor: '#10b981',
                                    pointBorderColor: '#fff',
                                    pointBorderWidth: 2,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    labels: {
                                        color: '#475569',
                                        font: { size: 12, weight: '500' },
                                        padding: 15,
                                        usePointStyle: true,
                                    },
                                },
                                tooltip: {
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    titleColor: '#1e293b',
                                    bodyColor: '#475569',
                                    borderColor: '#e2e8f0',
                                    borderWidth: 1,
                                    padding: 12,
                                    displayColors: true,
                                    boxPadding: 6,
                                },
                            },
                            scales: {
                                y: {
                                    grid: {
                                        color: 'rgba(226, 232, 240, 0.5)',
                                        drawBorder: false,
                                    },
                                    ticks: {
                                        color: '#64748b',
                                        font: { size: 11 },
                                    },
                                },
                                x: {
                                    grid: {
                                        color: 'rgba(226, 232, 240, 0.5)',
                                        drawBorder: false,
                                    },
                                    ticks: {
                                        color: '#64748b',
                                        font: { size: 11 },
                                    },
                                },
                            },
                        },
                    });
                }

                // Doughnut Chart - Level Distribution
                if (doughnutChartRef.current) {
                    const ctx = doughnutChartRef.current.getContext('2d');
                    doughnutChartInstance.current = new ChartJS(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: levelData.labels,
                            datasets: [
                                {
                                    data: levelData.data,
                                    backgroundColor: [
                                        'rgba(59, 130, 246, 0.7)',
                                        'rgba(16, 185, 129, 0.7)',
                                        'rgba(139, 92, 246, 0.7)',
                                        'rgba(245, 158, 11, 0.7)',
                                        'rgba(234, 179, 8, 0.7)',
                                        'rgba(239, 68, 68, 0.7)',
                                    ],
                                    borderColor: '#ffffff',
                                    borderWidth: 2,
                                    hoverOffset: 10,
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
                                        color: '#475569',
                                        font: { size: 12, weight: '500' },
                                        padding: 15,
                                        usePointStyle: true,
                                    },
                                },
                                tooltip: {
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    titleColor: '#1e293b',
                                    bodyColor: '#475569',
                                    borderColor: '#e2e8f0',
                                    borderWidth: 1,
                                    padding: 12,
                                    callbacks: {
                                        label: function (context) {
                                            const label = context.label || '';
                                            const value = context.parsed || 0;
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                            const percentage = ((value / total) * 100).toFixed(1);
                                            return `${label}: ${value} (${percentage}%)`;
                                        },
                                    },
                                },
                            },
                        },
                    });
                }

                // Bar Chart - Course Enrollments
                if (barChartRef.current) {
                    const ctx = barChartRef.current.getContext('2d');
                    barChartInstance.current = new ChartJS(ctx, {
                        type: 'bar',
                        data: {
                            labels: courseData.labels,
                            datasets: [
                                {
                                    label: 'Học viên',
                                    data: courseData.data,
                                    backgroundColor: [
                                        'rgba(59, 130, 246, 0.6)',
                                        'rgba(139, 92, 246, 0.6)',
                                        'rgba(16, 185, 129, 0.6)',
                                        'rgba(245, 158, 11, 0.6)',
                                        'rgba(239, 68, 68, 0.6)',
                                    ],
                                    borderColor: [
                                        'rgba(59, 130, 246, 0.8)',
                                        'rgba(139, 92, 246, 0.8)',
                                        'rgba(16, 185, 129, 0.8)',
                                        'rgba(245, 158, 11, 0.8)',
                                        'rgba(239, 68, 68, 0.8)',
                                    ],
                                    borderWidth: 1,
                                    borderRadius: 6,
                                    barThickness: 40,
                                },
                            ],
                        },
                        options: {
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false,
                                },
                                tooltip: {
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    titleColor: '#1e293b',
                                    bodyColor: '#475569',
                                    borderColor: '#e2e8f0',
                                    borderWidth: 1,
                                    padding: 12,
                                },
                            },
                            scales: {
                                y: {
                                    grid: {
                                        display: false,
                                    },
                                    ticks: {
                                        color: '#64748b',
                                        font: { size: 11, weight: '500' },
                                    },
                                },
                                x: {
                                    grid: {
                                        color: 'rgba(226, 232, 240, 0.5)',
                                        drawBorder: false,
                                    },
                                    ticks: {
                                        color: '#64748b',
                                        font: { size: 11 },
                                    },
                                },
                            },
                        },
                    });
                }

                // Bar Chart - Contest Stats
                if (contestChartRef.current) {
                    const ctx = contestChartRef.current.getContext('2d');
                    contestChartInstance.current = new ChartJS(ctx, {
                        type: 'bar',
                        data: {
                            labels: contestData.labels,
                            datasets: [
                                {
                                    label: 'Người tham gia',
                                    data: contestData.contest_participants,
                                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                                    borderColor: 'rgba(139, 92, 246, 0.8)',
                                    borderWidth: 1,
                                    borderRadius: 4,
                                },
                                {
                                    label: 'Số cuộc thi',
                                    data: contestData.contest_count,
                                    backgroundColor: 'rgba(245, 158, 11, 0.6)',
                                    borderColor: 'rgba(245, 158, 11, 0.8)',
                                    borderWidth: 1,
                                    borderRadius: 4,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    labels: {
                                        color: '#475569',
                                        font: { size: 12, weight: '500' },
                                        padding: 15,
                                        usePointStyle: true,
                                    },
                                },
                                tooltip: {
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    titleColor: '#1e293b',
                                    bodyColor: '#475569',
                                    borderColor: '#e2e8f0',
                                    borderWidth: 1,
                                    padding: 12,
                                },
                            },
                            scales: {
                                y: {
                                    grid: {
                                        color: 'rgba(226, 232, 240, 0.5)',
                                        drawBorder: false,
                                    },
                                    ticks: {
                                        color: '#64748b',
                                        font: { size: 11 },
                                    },
                                },
                                x: {
                                    grid: {
                                        color: 'rgba(226, 232, 240, 0.5)',
                                        drawBorder: false,
                                    },
                                    ticks: {
                                        color: '#64748b',
                                        font: { size: 11 },
                                    },
                                },
                            },
                        },
                    });
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching chart data:', error);
                setLoading(false);
            }
        };

        fetchAndRenderCharts();

        return () => {
            if (lineChartInstance.current) lineChartInstance.current.destroy();
            if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();
            if (barChartInstance.current) barChartInstance.current.destroy();
            if (contestChartInstance.current) contestChartInstance.current.destroy();
        };
    }, [selectedMonthYear]);

    const getRankLabel = (rank) => {
        const labels = {
            newbie: 'Newbie',
            pupil: 'Pupil',
            specialist: 'Specialist',
            expert: 'Expert',
            candidate_master: 'Candidate Master',
            master: 'Master',
            international_master: 'International Master',
            grandmaster: 'Grandmaster',
            international_grandmaster: 'International Grandmaster',
            legendary_grandmaster: 'Legendary Grandmaster',
        };
        return labels[rank] || rank;
    };

    const getRankColor = (rank) => {
        const colors = {
            newbie: 'bg-blue-500',
            pupil: 'bg-green-500',
            specialist: 'bg-purple-500',
            expert: 'bg-orange-500',
            candidate_master: 'bg-yellow-500',
            master: 'bg-red-500',
            international_master: 'bg-pink-500',
            grandmaster: 'bg-indigo-500',
            international_grandmaster: 'bg-teal-500',
            legendary_grandmaster: 'bg-gray-900',
        };
        return colors[rank] || 'bg-gray-500';
    };

    // Stats cards data
    const stats = statsData
        ? [
              {
                  label: 'Tổng Người Dùng',
                  value: statsData.total_users,
                  change: statsData.total_change,
                  icon: Users,
                  color: 'bg-blue-500',
              },
              {
                  label: 'Người Dùng Mới',
                  value: statsData.new_users,
                  change: statsData.new_change,
                  icon: UserPlus,
                  color: 'bg-green-500',
              },
              {
                  label: 'Người Dùng Hoạt Động',
                  value: statsData.active_users,
                  change: statsData.active_change,
                  icon: Activity,
                  color: 'bg-purple-500',
              },
              {
                  label: 'Khóa Học Đã Bán',
                  value: statsData.courses_sold,
                  change: statsData.courses_change,
                  icon: BookOpen,
                  color: 'bg-orange-500',
              },
          ]
        : [];

    if (loading && !statsData) {
        return (
            <div className="user-reports">
                <div className="user-reports-container">
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="user-reports">
            <div className="user-reports-container">
                {/* Header */}
                <div className="user-reports-header">
                    <div>
                        <h1 className="user-reports-title">
                            <Code className="title-icon" />
                            Báo Cáo Người Dùng
                        </h1>
                        <p className="user-reports-subtitle">Tổng quan và phân tích người dùng nền tảng</p>
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

                {/* Stats Cards */}
                <div className="stats-grid">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="stat-card">
                            <div className="stat-card-content">
                                <div className="stat-info">
                                    <p className="stat-label">{stat.label}</p>
                                    <p className="stat-value">{stat.value}</p>
                                    <p className="stat-change">
                                        <TrendingUp className="change-icon" />
                                        {stat.change}
                                    </p>
                                </div>
                                <div className={`stat-icon ${stat.color}`}>
                                    <stat.icon className="icon" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Row 1 */}
                <div className="charts-row">
                    {/* User Growth Chart */}
                    <div className="chart-card">
                        <h3 className="chart-title">Tăng Trưởng Người Dùng</h3>
                        <div className="chart-container">
                            <canvas ref={lineChartRef}></canvas>
                        </div>
                    </div>

                    {/* User Level Distribution */}
                    <div className="chart-card">
                        <h3 className="chart-title">Phân Bổ Cấp Độ Người Dùng</h3>
                        <div className="chart-container">
                            <canvas ref={doughnutChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="charts-row">
                    {/* Popular Courses */}
                    <div className="chart-card">
                        <h3 className="chart-title">Khóa Học Phổ Biến</h3>
                        <div className="chart-container">
                            <canvas ref={barChartRef}></canvas>
                        </div>
                    </div>

                    {/* Contest Stats */}
                    <div className="chart-card">
                        <h3 className="chart-title">Thống Kê Thi Đấu</h3>
                        <div className="chart-container">
                            <canvas ref={contestChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Top Users Table */}
                <div className="table-card">
                    <h3 className="table-title">
                        <Trophy className="trophy-icon" />
                        Top 5 Người Dùng Xuất Sắc
                    </h3>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Xếp hạng</th>
                                    <th>Username</th>
                                    <th>Tên</th>
                                    <th>Rating</th>
                                    <th>Số Contest</th>
                                    <th>Khóa Học</th>
                                    <th>Huy Hiệu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topUsers.length > 0 ? (
                                    topUsers.map((user, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <span
                                                    className={`user-report-rank-badge ${
                                                        idx === 0
                                                            ? 'gold'
                                                            : idx === 1
                                                            ? 'silver'
                                                            : idx === 2
                                                            ? 'bronze'
                                                            : ''
                                                    }`}
                                                >
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td>
                                                <code className="username-badge">{user.username}</code>
                                            </td>
                                            <td className="user-name">{user.name}</td>
                                            <td className="rating-value">{user.rating}</td>
                                            <td>{user.contests}</td>
                                            <td>{user.courses}</td>
                                            <td>
                                                <span className={`badge ${getRankColor(user.badge)}`}>
                                                    {getRankLabel(user.badge)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="no-data">
                                            Chưa có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* All Users Table */}
                <div className="table-card">
                    <div className="table-header">
                        <h3 className="table-title">
                            <Users className="users-icon" />
                            Danh Sách Tất Cả Người Dùng ({allUsersData.total_count})
                        </h3>

                        <div className="table-filters">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, username hoặc email..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="search-input"
                            />

                            <select
                                value={filterLevel}
                                onChange={(e) => {
                                    setFilterLevel(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="filter-select"
                            >
                                <option value="all">Tất cả cấp độ</option>
                                <option value="newbie">Newbie</option>
                                <option value="pupil">Pupil</option>
                                <option value="specialist">Specialist</option>
                                <option value="expert">Expert</option>
                                <option value="candidate_master">Candidate Master</option>
                                <option value="master">Master</option>
                                <option value="international_master">International Master</option>
                                <option value="grandmaster">Grandmaster</option>
                                <option value="international_grandmaster">International Grandmaster</option>
                                <option value="legendary_grandmaster">Legendary Grandmaster</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Tên</th>
                                    <th>Email</th>
                                    <th>Cấp độ</th>
                                    <th>Rating</th>
                                    <th>Contests</th>
                                    <th>Khóa học</th>
                                    <th>Ngày tham gia</th>
                                    <th>Hoạt động</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsersData.data.length > 0 ? (
                                    allUsersData.data.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <span className="user-id">#{user.id}</span>
                                            </td>
                                            <td>
                                                <code className="username-badge">{user.username}</code>
                                            </td>
                                            <td className="user-name">{user.name}</td>
                                            <td className="user-email">{user.email}</td>
                                            <td>
                                                <span className={`badge ${getRankColor(user.level)}`}>
                                                    {getRankLabel(user.level)}
                                                </span>
                                            </td>
                                            <td className="rating-value">{user.rating}</td>
                                            <td>{user.contests}</td>
                                            <td>{user.courses}</td>
                                            <td className="date-text">{user.join_date}</td>
                                            <td className="date-text">{user.last_active}</td>
                                            <td>
                                                <span
                                                    className={`status-badge ${
                                                        user.status === 'active' ? 'active' : 'inactive'
                                                    }`}
                                                >
                                                    {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="no-data">
                                            Không tìm thấy người dùng nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={allUsersData.total_pages}
                        totalItems={allUsersData.total_count}
                        onPageChange={setCurrentPage}
                        itemsPerPage={usersPerPage}
                        showItemCount={true}
                        showFirstLast={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserReports;
