import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PaymentService from '../services/PaymentService';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await PaymentService.getOrderHistory();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'Thành công', className: 'badge-success' },
      pending: { label: 'Đang xử lý', className: 'badge-warning' },
      failed: { label: 'Thất bại', className: 'badge-danger' },
      cancelled: { label: 'Đã hủy', className: 'badge-secondary' }
    };

    const config = statusConfig[status] || { label: status, className: 'badge-secondary' };
    return <span className={`badge ${config.className}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="order-history-container">
        <div className="loading">Đang tải lịch sử đơn hàng...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="page-header">
        <h1>Lịch sử đơn hàng</h1>
        <p className="subtitle">Quản lý tất cả giao dịch mua khóa học của bạn</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>Bạn chưa có đơn hàng nào</p>
          <Link to="/courses" className="btn btn-primary">
            Khám phá khóa học
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-code">
                  <strong>Mã đơn hàng:</strong> {order.order_code}
                </div>
                <div className="order-status">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <div className="order-body">
                <div className="course-info">
                  <h3>{order.course_title}</h3>
                  <p className="course-slug">@{order.course_slug}</p>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="label">Số tiền:</span>
                    <span className="value">
                      {Number(order.amount).toLocaleString()} VND
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Phương thức:</span>
                    <span className="value">{order.payment_method.toUpperCase()}</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Ngày tạo:</span>
                    <span className="value">
                      {new Date(order.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  {order.completed_at && (
                    <div className="detail-row">
                      <span className="label">Hoàn thành:</span>
                      <span className="value">
                        {new Date(order.completed_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}

                  {order.vnp_transaction_no && (
                    <div className="detail-row">
                      <span className="label">Mã GD VNPay:</span>
                      <span className="value">{order.vnp_transaction_no}</span>
                    </div>
                  )}

                  {order.vnp_bank_code && (
                    <div className="detail-row">
                      <span className="label">Ngân hàng:</span>
                      <span className="value">{order.vnp_bank_code}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="order-footer">
                {order.status === 'completed' && (
                  <Link 
                    to={`/courses/${order.course}/learn`}
                    className="btn btn-primary btn-sm"
                  >
                    Vào học
                  </Link>
                )}
                {order.status === 'failed' && (
                  <Link 
                    to={`/courses/${order.course_slug || order.course}`}
                    className="btn btn-secondary btn-sm"
                  >
                    Thử lại
                  </Link>
                )}
                <Link 
                  to={`/orders/${order.order_code}`}
                  className="btn btn-outline btn-sm"
                >
                  Chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

/* CSS Example - thêm vào file CSS của bạn

.order-history-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.page-header .subtitle {
  color: #666;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.order-code {
  font-size: 14px;
}

.order-body {
  padding: 20px;
}

.course-info h3 {
  font-size: 20px;
  margin-bottom: 5px;
}

.course-slug {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: #666;
  font-size: 14px;
}

.detail-row .value {
  font-weight: 500;
  font-size: 14px;
}

.order-footer {
  padding: 15px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

.badge-warning {
  background: #fff3cd;
  color: #856404;
}

.badge-danger {
  background: #f8d7da;
  color: #721c24;
}

.badge-secondary {
  background: #e2e3e5;
  color: #383d41;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  border: none;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-outline {
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

*/
