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
    DollarSign,
    ShoppingCart,
    Users,
    TrendingUp,
    Award,
    Package,
    CreditCard,
    Activity
} from 'lucide-react';
import api from '../../../services/api';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import './RevenueStatistics.css';

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

const RevenueStatistics = () => {
    useDocumentTitle('Thống kê - Doanh thu');
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [loading, setLoading] = useState(true);

    const dailyChartRef = useRef(null);
    const monthlyChartRef = useRef(null);
    const paymentMethodChartRef = useRef(null);
    const statusChartRef = useRef(null);

    const dailyChartInstance = useRef(null);
    const monthlyChartInstance = useRef(null);
    const paymentMethodChartInstance = useRef(null);
    const statusChartInstance = useRef(null);

    // Fetch statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const params = selectedMonth !== 'all' ? { month: selectedMonth } : {};
                const response = await api.get('/api/revenue/statistics/', { params });
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching revenue stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedMonth]);

    // Render charts
    useEffect(() => {
        if (!stats || loading) return;

        const renderCharts = () => {
            try {
                // Destroy existing charts
                if (dailyChartInstance.current) dailyChartInstance.current.destroy();
                if (monthlyChartInstance.current) monthlyChartInstance.current.destroy();
                if (paymentMethodChartInstance.current) paymentMethodChartInstance.current.destroy();
                if (statusChartInstance.current) statusChartInstance.current.destroy();

                // Daily Revenue Chart (Line)
                if (dailyChartRef.current && stats.revenue_by_date) {
                    const ctx = dailyChartRef.current.getContext('2d');
                    
                    dailyChartInstance.current = new ChartJS(ctx, {
                        type: 'line',
                        data: {
                            labels: stats.revenue_by_date.map(d => d.date),
                            datasets: [
                                {
                                    label: 'Doanh thu (VND)',
                                    data: stats.revenue_by_date.map(d => d.revenue),
                                    borderColor: '#667eea',
                                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                    fill: true,
                                    tension: 0.4,
                                    borderWidth: 2,
                                },
                                {
                                    label: 'Số đơn hàng',
                                    data: stats.revenue_by_date.map(d => d.orders),
                                    borderColor: '#48bb78',
                                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                                    fill: true,
                                    tension: 0.4,
                                    borderWidth: 2,
                                    yAxisID: 'y1',
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: {
                                mode: 'index',
                                intersect: false,
                            },
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            let label = context.dataset.label || '';
                                            if (label) {
                                                label += ': ';
                                            }
                                            if (context.datasetIndex === 0) {
                                                label += new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(context.parsed.y);
                                            } else {
                                                label += context.parsed.y;
                                            }
                                            return label;
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    type: 'linear',
                                    display: true,
                                    position: 'left',
                                    ticks: {
                                        callback: function(value) {
                                            return new Intl.NumberFormat('vi-VN').format(value);
                                        }
                                    }
                                },
                                y1: {
                                    type: 'linear',
                                    display: true,
                                    position: 'right',
                                    grid: {
                                        drawOnChartArea: false,
                                    },
                                }
                            }
                        }
                    });
                }

                // Monthly Revenue Chart (Bar)
                if (monthlyChartRef.current && stats.revenue_by_month) {
                    const ctx = monthlyChartRef.current.getContext('2d');
                    
                    monthlyChartInstance.current = new ChartJS(ctx, {
                        type: 'bar',
                        data: {
                            labels: stats.revenue_by_month.map(d => d.month),
                            datasets: [
                                {
                                    label: 'Doanh thu (VND)',
                                    data: stats.revenue_by_month.map(d => d.revenue),
                                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                                    borderColor: '#667eea',
                                    borderWidth: 2,
                                    borderRadius: 8,
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false,
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            return new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(context.parsed.y);
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function(value) {
                                            return new Intl.NumberFormat('vi-VN').format(value);
                                        }
                                    }
                                }
                            }
                        }
                    });
                }

                // Payment Method Chart (Doughnut)
                if (paymentMethodChartRef.current && stats.payment_methods) {
                    const ctx = paymentMethodChartRef.current.getContext('2d');
                    
                    paymentMethodChartInstance.current = new ChartJS(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: stats.payment_methods.map(m => m.payment_method || 'Unknown'),
                            datasets: [{
                                data: stats.payment_methods.map(m => m.revenue),
                                backgroundColor: [
                                    'rgba(102, 126, 234, 0.8)',
                                    'rgba(72, 187, 120, 0.8)',
                                    'rgba(237, 137, 54, 0.8)',
                                    'rgba(159, 122, 234, 0.8)',
                                ],
                                borderWidth: 2,
                                borderColor: '#fff'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const label = context.label || '';
                                            const value = new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(context.parsed);
                                            return `${label}: ${value}`;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }

                // Order Status Chart (Doughnut)
                if (statusChartRef.current && stats.order_status) {
                    const ctx = statusChartRef.current.getContext('2d');
                    
                    statusChartInstance.current = new ChartJS(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Completed', 'Failed', 'Pending', 'Cancelled'],
                            datasets: [{
                                data: [
                                    stats.order_status.completed,
                                    stats.order_status.failed,
                                    stats.order_status.pending,
                                    stats.order_status.cancelled
                                ],
                                backgroundColor: [
                                    'rgba(72, 187, 120, 0.8)',
                                    'rgba(245, 101, 101, 0.8)',
                                    'rgba(237, 137, 54, 0.8)',
                                    'rgba(160, 174, 192, 0.8)',
                                ],
                                borderWidth: 2,
                                borderColor: '#fff'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                }
                            }
                        }
                    });
                }

            } catch (error) {
                console.error('Error rendering charts:', error);
            }
        };

        renderCharts();

        return () => {
            if (dailyChartInstance.current) dailyChartInstance.current.destroy();
            if (monthlyChartInstance.current) monthlyChartInstance.current.destroy();
            if (paymentMethodChartInstance.current) paymentMethodChartInstance.current.destroy();
            if (statusChartInstance.current) statusChartInstance.current.destroy();
        };
    }, [stats, loading]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    if (loading) {
        return (
            <div className="revenue-reports">
                <div className="revenue-reports-container">
                    <div className="revenue-loading-spinner">Đang tải...</div>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="revenue-reports">
            <div className="revenue-reports-container">
                {/* Header */}
                <div className="revenue-reports-header">
                    <div>
                        <h1 className="revenue-reports-title">
                            <DollarSign className="revenue-title-icon" />
                            Thống kê Doanh thu
                        </h1>
                        <p className="revenue-reports-subtitle">
                            Tổng quan doanh thu và đơn hàng
                        </p>
                    </div>
                    <div>
                        <input
                            type="month"
                            value={selectedMonth === 'all' ? '' : selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value || 'all')}
                            className="revenue-time-range-select"
                            placeholder="Chọn tháng"
                        />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="revenue-stats-grid">
                    <div className="revenue-stat-card">
                        <div className="revenue-stat-card-content">
                            <div className="revenue-stat-info">
                                <div className="revenue-stat-label">Tổng Doanh Thu</div>
                                <div className="revenue-stat-value">{formatCurrency(stats.total_revenue)}</div>
                            </div>
                            <div className="revenue-stat-icon revenue-bg-blue-500">
                                <DollarSign className="icon" />
                            </div>
                        </div>
                    </div>

                    <div className="revenue-stat-card">
                        <div className="revenue-stat-card-content">
                            <div className="revenue-stat-info">
                                <div className="revenue-stat-label">Tổng Đơn Hàng</div>
                                <div className="revenue-stat-value">{stats.total_orders}</div>
                            </div>
                            <div className="revenue-stat-icon revenue-bg-green-500">
                                <ShoppingCart className="icon" />
                            </div>
                        </div>
                    </div>

                    <div className="revenue-stat-card">
                        <div className="revenue-stat-card-content">
                            <div className="revenue-stat-info">
                                <div className="revenue-stat-label">Khách Hàng Unique</div>
                                <div className="revenue-stat-value">{stats.unique_customers}</div>
                            </div>
                            <div className="revenue-stat-icon revenue-bg-purple-500">
                                <Users className="icon" />
                            </div>
                        </div>
                    </div>

                    <div className="revenue-stat-card">
                        <div className="revenue-stat-card-content">
                            <div className="revenue-stat-info">
                                <div className="revenue-stat-label">Giá Trị ĐH Trung Bình</div>
                                <div className="revenue-stat-value">{formatCurrency(stats.avg_order_value)}</div>
                            </div>
                            <div className="revenue-stat-icon revenue-bg-orange-500">
                                <TrendingUp className="icon" />
                            </div>
                        </div>
                    </div>

                    <div className="revenue-stat-card">
                        <div className="revenue-stat-card-content">
                            <div className="revenue-stat-info">
                                <div className="revenue-stat-label">Tỷ Lệ Thành Công</div>
                                <div className="revenue-stat-value">{stats.success_rate}%</div>
                            </div>
                            <div className="revenue-stat-icon revenue-bg-pink-500">
                                <Activity className="icon" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1: Daily & Monthly Revenue */}
                <div className="revenue-charts-row">
                    <div className="revenue-chart-card">
                        <h3 className="revenue-chart-title">
                            Doanh thu theo {selectedMonth === 'all' ? 'ngày (30 ngày)' : 'ngày trong tháng'}
                        </h3>
                        <div className="revenue-chart-container">
                            <canvas ref={dailyChartRef}></canvas>
                        </div>
                    </div>

                    <div className="revenue-chart-card">
                        <h3 className="revenue-chart-title">Doanh thu theo tháng (12 tháng)</h3>
                        <div className="revenue-chart-container">
                            <canvas ref={monthlyChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Charts Row 2: Payment Methods & Order Status */}
                <div className="revenue-charts-row">
                    <div className="revenue-chart-card">
                        <h3 className="revenue-chart-title">Phân bố theo Phương thức Thanh toán</h3>
                        <div className="revenue-chart-container">
                            <canvas ref={paymentMethodChartRef}></canvas>
                        </div>
                    </div>

                    <div className="revenue-chart-card">
                        <h3 className="revenue-chart-title">Phân bố Trạng thái Đơn hàng</h3>
                        <div className="revenue-chart-container">
                            <canvas ref={statusChartRef}></canvas>
                        </div>
                    </div>
                </div>

                {/* Top Courses Table */}
                <div className="revenue-table-card">
                    <h3 className="revenue-table-title">
                        <Award className="revenue-title-icon" style={{ display: 'inline-block', marginRight: '0.5rem' }} />
                        Top 10 Khóa Học Bán Chạy
                    </h3>
                    <table className="revenue-data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Khóa Học</th>
                                <th>Doanh Thu</th>
                                <th>Số Đơn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.top_courses && stats.top_courses.map((course, index) => (
                                <tr key={course.course__id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <a 
                                            href={`/courses/${course.course__slug}`} 
                                            className="revenue-course-link"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {course.course__title}
                                        </a>
                                    </td>
                                    <td>{formatCurrency(course.total_revenue)}</td>
                                    <td>{course.total_orders}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Top Customers Table */}
                <div className="revenue-table-card">
                    <h3 className="revenue-table-title">
                        <Users className="revenue-title-icon" style={{ display: 'inline-block', marginRight: '0.5rem' }} />
                        Top 10 Khách Hàng
                    </h3>
                    <table className="revenue-data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên</th>
                                <th>Username</th>
                                <th>Tổng Chi Tiêu</th>
                                <th>Số Đơn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.top_customers && stats.top_customers.map((customer, index) => (
                                <tr key={customer.user__id}>
                                    <td>{index + 1}</td>
                                    <td>{customer.user__full_name || 'N/A'}</td>
                                    <td>{customer.user__username}</td>
                                    <td>{formatCurrency(customer.total_spent)}</td>
                                    <td>{customer.total_orders}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevenueStatistics;
