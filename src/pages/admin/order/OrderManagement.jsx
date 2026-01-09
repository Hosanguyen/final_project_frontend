// src/pages/admin/order/OrderManagement.jsx
import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaCheck, FaTimes, FaClock, FaBan, FaFileExport } from 'react-icons/fa';
import OrderService from '../../../services/OrderService';
import Pagination from '../../../components/Pagination';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import './OrderManagement.css';
import notification from '../../../utils/notification';

const OrderManagement = () => {
  useDocumentTitle('Quản trị - Đơn hàng');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    payment_method: '',
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        page: currentPage,
        page_size: pageSize,
        ...filters,
      };
      
      const response = await OrderService.getAllOrders(params);
      setOrders(response.results || []);
      setTotalItems(response.total || 0);
      setTotalPages(response.total_pages || 1);
    } catch (err) {
      console.error('Error loading orders:', err);
      notification.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadOrders();
  };

  const handleFilterChange = (key, value) => {
    setCurrentPage(1);
    setFilters({ ...filters, [key]: value });
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'order-list-status-pending', label: 'Chờ xử lý', icon: <FaClock /> },
      completed: { class: 'order-list-status-completed', label: 'Hoàn thành', icon: <FaCheck /> },
      failed: { class: 'order-list-status-failed', label: 'Thất bại', icon: <FaTimes /> },
      cancelled: { class: 'order-list-status-cancelled', label: 'Đã hủy', icon: <FaBan /> },
    };
    return badges[status] || { class: '', label: status, icon: null };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportCSV = async () => {
    try {
      const response = await OrderService.exportOrders(filters);
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      notification.success('Xuất file thành công');
    } catch (err) {
      console.error('Error exporting orders:', err);
      notification.error('Không thể xuất file');
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="order-list-loading-container">
        <div className="order-list-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="order-list">
      <div className="order-list-page-header">
        <div className="order-list-header-left">
          <h1>Quản lý đơn hàng</h1>
          <p className="order-list-subtitle">Quản lý các đơn hàng thanh toán khóa học trong hệ thống</p>
        </div>
        <button className="order-list-btn-export" onClick={handleExportCSV}>
          <FaFileExport /> Xuất CSV
        </button>
      </div>

      <div className="order-list-content-card">
        <div className="order-list-card-header">
          <div className="order-list-search-box">
            <FaSearch className="order-list-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, username, email, khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="order-list-filters">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="order-list-filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="failed">Thất bại</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            <select
              value={filters.payment_method}
              onChange={(e) => handleFilterChange('payment_method', e.target.value)}
              className="order-list-filter-select"
            >
              <option value="">Tất cả phương thức</option>
              <option value="vnpay">VNPay</option>
            </select>
          </div>

          <div className="order-list-stats">
            <span className="order-list-stat-item">
              Tổng số: <strong>{totalItems}</strong>
            </span>
          </div>
        </div>

        <div className="order-list-table-container">
          <table className="order-list-data-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Mã đơn hàng</th>
                <th style={{ width: '150px' }}>Người mua</th>
                <th>Khóa học</th>
                <th style={{ width: '130px' }}>Số tiền</th>
                <th style={{ width: '120px' }}>Phương thức</th>
                <th style={{ width: '120px' }}>Trạng thái</th>
                <th style={{ width: '150px' }}>Ngày tạo</th>
                <th style={{ width: '100px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="order-list-no-data">
                    {searchTerm || filters.status || filters.payment_method
                      ? 'Không tìm thấy kết quả phù hợp'
                      : 'Chưa có đơn hàng nào'}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <code className="order-list-code-badge">{order.order_code}</code>
                    </td>
                    <td>
                      <div className="order-list-user-cell">
                        <div className="order-list-username">{order.user_name}</div>
                        <div className="order-list-email">{order.user_email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="order-list-course-title">{order.course_title}</div>
                    </td>
                    <td>
                      <span className="order-list-amount">{formatPrice(order.amount)}</span>
                    </td>
                    <td>
                      <span className="order-list-payment-method">
                        {order.payment_method?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`order-list-status-badge ${getStatusBadge(order.status).class}`}>
                        {getStatusBadge(order.status).icon} {getStatusBadge(order.status).label}
                      </span>
                    </td>
                    <td>
                      <span className="order-list-date">{formatDate(order.created_at)}</span>
                    </td>
                    <td>
                      <div className="order-list-action-buttons">
                        <button
                          className="order-list-btn-action order-list-btn-view"
                          onClick={() => openDetailModal(order)}
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          itemsPerPage={pageSize}
        />
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="order-list-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="order-list-modal-content order-list-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="order-list-modal-header">
              <h3>Chi tiết đơn hàng</h3>
              <button className="order-list-modal-close" onClick={() => setShowDetailModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="order-list-modal-body">
              <div className="order-list-detail-grid">
                <div className="order-list-detail-section">
                  <h4>Thông tin đơn hàng</h4>
                  <div className="order-list-detail-item">
                    <label>Mã đơn hàng:</label>
                    <span><code>{selectedOrder.order_code}</code></span>
                  </div>
                  <div className="order-list-detail-item">
                    <label>Trạng thái:</label>
                    <span className={`order-list-status-badge ${getStatusBadge(selectedOrder.status).class}`}>
                      {getStatusBadge(selectedOrder.status).icon} {getStatusBadge(selectedOrder.status).label}
                    </span>
                  </div>
                  <div className="order-list-detail-item">
                    <label>Số tiền:</label>
                    <span className="order-list-amount-large">{formatPrice(selectedOrder.amount)}</span>
                  </div>
                  <div className="order-list-detail-item">
                    <label>Phương thức:</label>
                    <span>{selectedOrder.payment_method?.toUpperCase() || 'N/A'}</span>
                  </div>
                </div>

                <div className="order-list-detail-section">
                  <h4>Thông tin người mua</h4>
                  <div className="order-list-detail-item">
                    <label>Username:</label>
                    <span>{selectedOrder.user_name}</span>
                  </div>
                  <div className="order-list-detail-item">
                    <label>Email:</label>
                    <span>{selectedOrder.user_email}</span>
                  </div>
                </div>

                <div className="order-list-detail-section">
                  <h4>Thông tin khóa học</h4>
                  <div className="order-list-detail-item">
                    <label>Tên khóa học:</label>
                    <span>{selectedOrder.course_title}</span>
                  </div>
                  <div className="order-list-detail-item">
                    <label>Slug:</label>
                    <span><code>{selectedOrder.course_slug}</code></span>
                  </div>
                </div>

                <div className="order-list-detail-section">
                  <h4>Thông tin thanh toán VNPay</h4>
                  <div className="order-list-detail-item">
                    <label>Mã tham chiếu:</label>
                    <span>{selectedOrder.vnp_txn_ref || '-'}</span>
                  </div>
                  <div className="order-list-detail-item">
                    <label>Mã giao dịch:</label>
                    <span>{selectedOrder.vnp_transaction_no || '-'}</span>
                  </div>
                  <div className="order-list-detail-item">
                    <label>Mã phản hồi:</label>
                    <span>{selectedOrder.vnp_response_code || '-'}</span>
                  </div>
                  <div className="order-list-detail-item">
                    <label>Ngân hàng:</label>
                    <span>{selectedOrder.vnp_bank_code || '-'}</span>
                  </div>
                  <div className="order-list-detail-item">
                    <label>Thời gian thanh toán:</label>
                    <span>{selectedOrder.vnp_pay_date || '-'}</span>
                  </div>
                </div>

                <div className="order-list-detail-section order-list-detail-section-full">
                  <h4>Thời gian</h4>
                  <div className="order-list-detail-item">
                    <label>Ngày tạo:</label>
                    <span>{formatDate(selectedOrder.created_at)}</span>
                  </div>
                  <div className="order-list-detail-item">
                    <label>Cập nhật:</label>
                    <span>{formatDate(selectedOrder.updated_at)}</span>
                  </div>
                  <div className="order-list-detail-item">
                    <label>Hoàn thành:</label>
                    <span>{formatDate(selectedOrder.completed_at)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-list-modal-footer">
              <button className="order-list-btn-cancel" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
