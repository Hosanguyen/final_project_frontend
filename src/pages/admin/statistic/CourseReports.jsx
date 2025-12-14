import React, { useState, useEffect, useRef } from 'react';
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
import { BookOpen, Users, TrendingUp, DollarSign, Award, ShoppingCart } from 'lucide-react';
import CourseService from '../../../services/CourseService';
import './CourseReports.css';

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

const CourseReports = () => {
    // Lấy tháng hiện tại làm giá trị mặc định
    const getCurrentMonth = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    const [selectedMonthYear, setSelectedMonthYear] = useState(getCurrentMonth()); // Format: YYYY-MM
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 10;

    // Data states
    const [statsData, setStatsData] = useState(null);
    const [topCourses, setTopCourses] = useState([]);
    const [allCoursesData, setAllCoursesData] = useState({ data: [], total_count: 0, total_pages: 0 });
    const [loading, setLoading] = useState(true);

    const lineChartRef = useRef(null);
    const doughnutChartRef = useRef(null);
    const barChartRef = useRef(null);
    const completionChartRef = useRef(null);

    const lineChartInstance = useRef(null);
    const doughnutChartInstance = useRef(null);
    const barChartInstance = useRef(null);
    const completionChartInstance = useRef(null);

    // Fetch stats data
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await CourseService.getReportsStats(selectedMonthYear);
                setStatsData(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, [selectedMonthYear]);

    // Fetch top courses
    useEffect(() => {
        const fetchTopCourses = async () => {
            try {
                const data = await CourseService.getReportsTopCourses();
                setTopCourses(data);
            } catch (error) {
                console.error('Error fetching top courses:', error);
            }
        };
        fetchTopCourses();
    }, []);

    // Fetch all courses with pagination
    useEffect(() => {
        const fetchAllCourses = async () => {
            try {
                const params = {
                    page: currentPage,
                    page_size: coursesPerPage,
                    search: searchTerm,
                    status: filterStatus === 'all' ? '' : filterStatus,
                };
                const data = await CourseService.getReportsAllCourses(params);
                setAllCoursesData(data);
            } catch (error) {
                console.error('Error fetching all courses:', error);
            }
        };
        fetchAllCourses();
    }, [currentPage, searchTerm, filterStatus]);

    // Fetch and render charts
    useEffect(() => {
        const fetchAndRenderCharts = async () => {
            try {
                setLoading(true);

                // Fetch all chart data
                const [enrollmentData, categoryData, revenueData, completionData] = await Promise.all([
                    CourseService.getReportsEnrollmentGrowth(selectedMonthYear),
                    CourseService.getReportsCategoryDistribution(selectedMonthYear),
                    CourseService.getReportsRevenueStats(selectedMonthYear),
                    CourseService.getReportsCompletionStats(selectedMonthYear),
                ]);

                // Destroy existing charts
                if (lineChartInstance.current) lineChartInstance.current.destroy();
                if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();
                if (barChartInstance.current) barChartInstance.current.destroy();
                if (completionChartInstance.current) completionChartInstance.current.destroy();

                // Line Chart - Enrollment Growth
                if (lineChartRef.current) {
                    const ctx = lineChartRef.current.getContext('2d');
                    lineChartInstance.current = new ChartJS(ctx, {
                        type: 'line',
                        data: {
                            labels: enrollmentData.labels,
                            datasets: [
                                {
                                    label: 'Tổng Đăng Ký',
                                    data: enrollmentData.total_enrollments,
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
                                    label: 'Đăng Ký Mới',
                                    data: enrollmentData.new_enrollments,
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

                // Doughnut Chart - Category Distribution
                if (doughnutChartRef.current) {
                    const ctx = doughnutChartRef.current.getContext('2d');
                    doughnutChartInstance.current = new ChartJS(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: categoryData.labels,
                            datasets: [
                                {
                                    data: categoryData.data,
                                    backgroundColor: [
                                        '#3b82f6',
                                        '#8b5cf6',
                                        '#10b981',
                                        '#f59e0b',
                                        '#ef4444',
                                        '#06b6d4',
                                        '#ec4899',
                                        '#84cc16',
                                    ],
                                    borderWidth: 0,
                                    hoverOffset: 15,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: {
                                        color: '#475569',
                                        font: { size: 11, weight: '500' },
                                        padding: 12,
                                        usePointStyle: true,
                                        pointStyle: 'circle',
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
                        },
                    });
                }

                // Bar Chart - Revenue Stats
                if (barChartRef.current) {
                    const ctx = barChartRef.current.getContext('2d');
                    barChartInstance.current = new ChartJS(ctx, {
                        type: 'bar',
                        data: {
                            labels: revenueData.labels,
                            datasets: [
                                {
                                    label: 'Doanh Thu (VNĐ)',
                                    data: revenueData.revenue,
                                    backgroundColor: '#10b981',
                                    borderRadius: 6,
                                    barThickness: 40,
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
                                    callbacks: {
                                        label: function (context) {
                                            let label = context.dataset.label || '';
                                            if (label) {
                                                label += ': ';
                                            }
                                            if (context.parsed.y !== null) {
                                                label += new Intl.NumberFormat('vi-VN').format(context.parsed.y);
                                            }
                                            return label;
                                        },
                                    },
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
                                        callback: function (value) {
                                            return new Intl.NumberFormat('vi-VN', {
                                                notation: 'compact',
                                                compactDisplay: 'short',
                                            }).format(value);
                                        },
                                    },
                                },
                                x: {
                                    grid: {
                                        display: false,
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

                // Bar Chart - Completion Stats
                if (completionChartRef.current) {
                    const ctx = completionChartRef.current.getContext('2d');
                    completionChartInstance.current = new ChartJS(ctx, {
                        type: 'bar',
                        data: {
                            labels: completionData.labels,
                            datasets: [
                                {
                                    label: 'Tỷ Lệ Hoàn Thành (%)',
                                    data: completionData.completion_rates,
                                    backgroundColor: '#8b5cf6',
                                    borderRadius: 6,
                                    barThickness: 40,
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
                                    callbacks: {
                                        label: function (context) {
                                            let label = context.dataset.label || '';
                                            if (label) {
                                                label += ': ';
                                            }
                                            if (context.parsed.y !== null) {
                                                label += context.parsed.y.toFixed(1) + '%';
                                            }
                                            return label;
                                        },
                                    },
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
                                        callback: function (value) {
                                            return value + '%';
                                        },
                                    },
                                    max: 100,
                                },
                                x: {
                                    grid: {
                                        display: false,
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
            if (completionChartInstance.current) completionChartInstance.current.destroy();
        };
    }, [selectedMonthYear]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getStatusLabel = (status) => {
        const labels = {
            active: 'Đang hoạt động',
            draft: 'Nháp',
            archived: 'Lưu trữ',
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-500',
            draft: 'bg-yellow-500',
            archived: 'bg-gray-500',
        };
        return colors[status] || 'bg-gray-500';
    };

    // Stats cards data
    const stats = statsData
        ? [
              {
                  label: 'Tổng Khóa Học',
                  value: statsData.total_courses,
                  change: statsData.total_change,
                  icon: BookOpen,
                  color: 'bg-blue-500',
              },
              {
                  label: 'Khóa Học Mới',
                  value: statsData.new_courses,
                  change: statsData.new_change,
                  icon: Award,
                  color: 'bg-green-500',
              },
              {
                  label: 'Tổng Đăng Ký',
                  value: statsData.total_enrollments,
                  change: statsData.enrollment_change,
                  icon: Users,
                  color: 'bg-purple-500',
              },
              {
                  label: 'Doanh Thu',
                  value: formatPrice(statsData.total_revenue),
                  change: statsData.revenue_change,
                  icon: DollarSign,
                  color: 'bg-orange-500',
              },
          ]
        : [];

    if (loading && !statsData) {
        return (
            <div className="course-reports">
                <div className="course-reports-container">
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="course-reports">
            <div className="course-reports-container">
                {/* Header */}
                <div className="course-reports-header">
                    <div>
                        <h1 className="course-reports-title">
                            <BookOpen className="title-icon" />
                            Báo Cáo Khóa Học
                        </h1>
                        <p className="course-reports-subtitle">Tổng quan và phân tích khóa học nền tảng</p>
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
                    {/* Enrollment Growth Chart */}
                    <div className="chart-card">
                        <h3 className="chart-title">Tăng Trưởng Đăng Ký</h3>
                        <div className="chart-container">
                            <canvas ref={lineChartRef}></canvas>
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="chart-card">
                        <h3 className="chart-title">Phân Bổ Theo Danh Mục</h3>
                        <div className="chart-container">
                            <canvas ref={doughnutChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="charts-row">
                    {/* Revenue Stats */}
                    <div className="chart-card">
                        <h3 className="chart-title">Thống Kê Doanh Thu</h3>
                        <div className="chart-container">
                            <canvas ref={barChartRef}></canvas>
                        </div>
                    </div>

                    {/* Completion Stats */}
                    <div className="chart-card">
                        <h3 className="chart-title">Tỷ Lệ Hoàn Thành</h3>
                        <div className="chart-container">
                            <canvas ref={completionChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Top Courses Table */}
                <div className="table-card">
                    <h3 className="table-title">
                        <Award className="trophy-icon" />
                        Top 5 Khóa Học Phổ Biến
                    </h3>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Xếp hạng</th>
                                    <th>Tên khóa học</th>
                                    <th>Danh mục</th>
                                    <th>Giá</th>
                                    <th>Số Đăng Ký</th>
                                    <th>Doanh Thu</th>
                                    <th>Hoàn Thành</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topCourses.length > 0 ? (
                                    topCourses.map((course, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <span
                                                    className={`course-report-rank-badge ${
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
                                            <td className="course-name">{course.title}</td>
                                            <td>
                                                <span className="badge bg-blue-500">{course.category}</span>
                                            </td>
                                            <td className="price-value">{formatPrice(course.price)}</td>
                                            <td>{course.enrollments}</td>
                                            <td className="revenue-value">{formatPrice(course.revenue)}</td>
                                            <td className="completion-rate">{course.completion_rate}%</td>
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

                {/* All Courses Table */}
                <div className="table-card">
                    <div className="table-header">
                        <h3 className="table-title">
                            <ShoppingCart className="courses-icon" />
                            Danh Sách Tất Cả Khóa Học ({allCoursesData.total_count})
                        </h3>

                        <div className="table-filters">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên khóa học hoặc danh mục..."
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
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="draft">Nháp</option>
                                <option value="archived">Lưu trữ</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên khóa học</th>
                                    <th>Danh mục</th>
                                    <th>Giá</th>
                                    <th>Đăng ký</th>
                                    <th>Doanh thu</th>
                                    <th>Hoàn thành</th>
                                    <th>Ngày tạo</th>
                                    <th>Cập nhật</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allCoursesData.data.length > 0 ? (
                                    allCoursesData.data.map((course) => (
                                        <tr key={course.id}>
                                            <td>
                                                <span className="course-id">#{course.id}</span>
                                            </td>
                                            <td className="course-name">{course.title}</td>
                                            <td>
                                                <span className="badge bg-blue-500">{course.category}</span>
                                            </td>
                                            <td className="price-value">{formatPrice(course.price)}</td>
                                            <td>{course.enrollments}</td>
                                            <td className="revenue-value">{formatPrice(course.revenue)}</td>
                                            <td className="completion-rate">{course.completion_rate}%</td>
                                            <td className="date-text">{course.created_at}</td>
                                            <td className="date-text">{course.updated_at}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusColor(course.status)}`}>
                                                    {getStatusLabel(course.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="no-data">
                                            Không tìm thấy khóa học nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {allCoursesData.total_pages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                Trước
                            </button>

                            <div className="pagination-pages">
                                {[...Array(allCoursesData.total_pages)].map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentPage(idx + 1)}
                                        className={`pagination-page ${currentPage === idx + 1 ? 'active' : ''}`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, allCoursesData.total_pages))}
                                disabled={currentPage === allCoursesData.total_pages}
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

export default CourseReports;
