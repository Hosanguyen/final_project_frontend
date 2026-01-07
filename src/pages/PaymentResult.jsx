import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import PaymentService from '../services/PaymentService';
import useDocumentTitle from '../hooks/useDocumentTitle';
import './PaymentResult.css';

const PaymentResult = () => {
  useDocumentTitle('Kết quả thanh toán');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      // Parse params từ URL
      const result = PaymentService.parsePaymentResult(searchParams);
      
      if (!result.orderCode) {
        setError('Không tìm thấy thông tin đơn hàng');
        setLoading(false);
        return;
      }

      // Kiểm tra trạng thái thanh toán
      const orderData = await PaymentService.checkPaymentStatus(result.orderCode);
      setOrderInfo(orderData);

      // Nếu thanh toán thành công, tự động chuyển hướng sau 3 giây
      if (orderData.status === 'completed') {
        setTimeout(() => {
          navigate(`/courses/${orderData.course_slug}/learn`);
        }, 3000);
      }
    } catch (err) {
      console.error('Error checking payment:', err);
      setError('Có lỗi xảy ra khi kiểm tra thanh toán');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-result-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang kiểm tra kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result-container">
        <div className="error-box">
          <h2>❌ Lỗi</h2>
          <p>{error}</p>
          <Link to="/courses" className="btn btn-primary">
            Quay lại danh sách khóa học
          </Link>
        </div>
      </div>
    );
  }

  if (!orderInfo) {
    return (
      <div className="payment-result-container">
        <div className="error-box">
          <h2>❌ Không tìm thấy thông tin đơn hàng</h2>
          <Link to="/courses" className="btn btn-primary">
            Quay lại danh sách khóa học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-container">
      {orderInfo.status === 'completed' ? (
        <div className="success-box">
          <div className="success-icon">✓</div>
          <h2>Thanh toán thành công!</h2>
          <div className="order-details">
            <p><strong>Mã đơn hàng:</strong> {orderInfo.order_code}</p>
            <p><strong>Khóa học:</strong> {orderInfo.course_title}</p>
            <p><strong>Số tiền:</strong> {Number(orderInfo.amount).toLocaleString()} VND</p>
            <p><strong>Thời gian:</strong> {new Date(orderInfo.completed_at).toLocaleString('vi-VN')}</p>
            {orderInfo.vnp_bank_code && (
              <p><strong>Ngân hàng:</strong> {orderInfo.vnp_bank_code}</p>
            )}
            {orderInfo.vnp_transaction_no && (
              <p><strong>Mã giao dịch VNPay:</strong> {orderInfo.vnp_transaction_no}</p>
            )}
          </div>
          <div className="redirect-notice">
            <p>🎉 Bạn đã đăng ký khóa học thành công!</p>
            <p>Đang chuyển hướng đến khóa học trong 3 giây...</p>
          </div>
          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/courses/${orderInfo.course}/learn`)}
            >
              Vào học ngay
            </button>
            <Link to="/my-courses" className="btn btn-secondary">
              Khóa học của tôi
            </Link>
          </div>
        </div>
      ) : orderInfo.status === 'failed' ? (
        <div className="error-box">
          <div className="error-icon">✗</div>
          <h2>Thanh toán thất bại</h2>
          <div className="order-details">
            <p><strong>Mã đơn hàng:</strong> {orderInfo.order_code}</p>
            <p><strong>Khóa học:</strong> {orderInfo.course_title}</p>
            <p><strong>Số tiền:</strong> {Number(orderInfo.amount).toLocaleString()} VND</p>
            {orderInfo.vnp_response_code && (
              <p><strong>Mã lỗi:</strong> {orderInfo.vnp_response_code}</p>
            )}
          </div>
          <div className="payment-error-message">
            <p>Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
          </div>
          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/courses/${orderInfo.course_slug || orderInfo.course}`)}
            >
              Thử lại
            </button>
            <Link to="/courses" className="btn btn-secondary">
              Quay lại danh sách
            </Link>
          </div>
        </div>
      ) : (
        <div className="pending-box">
          <div className="pending-icon">⏳</div>
          <h2>Đang xử lý thanh toán</h2>
          <div className="order-details">
            <p><strong>Mã đơn hàng:</strong> {orderInfo.order_code}</p>
            <p><strong>Trạng thái:</strong> {orderInfo.status}</p>
          </div>
          <p>Vui lòng đợi trong giây lát...</p>
        </div>
      )}
    </div>
  );
};

export default PaymentResult;

/* CSS Example - thêm vào file CSS của bạn

.payment-result-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
}

.success-box, .error-box, .pending-box {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #4caf50;
  color: white;
  font-size: 48px;
  line-height: 80px;
  margin: 0 auto 20px;
}

.error-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f44336;
  color: white;
  font-size: 48px;
  line-height: 80px;
  margin: 0 auto 20px;
}

.pending-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.order-details {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: left;
}

.order-details p {
  margin: 10px 0;
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.redirect-notice {
  margin: 20px 0;
  color: #666;
}

.loading-spinner {
  text-align: center;
  padding: 50px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

*/
