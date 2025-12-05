// src/services/PaymentService.js
import api from './api';

const PaymentService = {
  /**
   * Tạo đơn hàng và URL thanh toán VNPay
   * @param {number} courseId - ID của khóa học
   * @param {string} returnUrl - URL frontend để redirect sau khi thanh toán
   * @returns {Promise} Payment data including payment URL
   */
  createPayment: async (courseId, returnUrl = '') => {
    try {
      const response = await api.post('/api/payment/create/', {
        course_id: courseId,
        return_url: returnUrl
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Kiểm tra trạng thái thanh toán
   * @param {string} orderCode - Mã đơn hàng
   * @returns {Promise} Order status data
   */
  checkPaymentStatus: async (orderCode) => {
    try {
      const response = await api.get(`/api/payment/status/${orderCode}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy lịch sử đơn hàng của user
   * @returns {Promise} List of orders
   */
  getOrderHistory: async () => {
    try {
      const response = await api.get('/api/payment/history/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Kiểm tra xem user đã đăng ký khóa học chưa
   * @param {number} courseId - ID của khóa học
   * @returns {Promise} Enrollment status
   */
  checkEnrollment: async (courseId) => {
    try {
      const response = await api.get(`/api/enrollment/check/${courseId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách khóa học đã đăng ký
   * @returns {Promise} List of enrollments
   */
  getEnrollments: async () => {
    try {
      const response = await api.get('/api/enrollment/list/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xử lý redirect đến trang thanh toán VNPay
   * @param {string} paymentUrl - URL thanh toán từ VNPay
   */
  redirectToPayment: (paymentUrl) => {
    window.location.href = paymentUrl;
  },

  /**
   * Parse payment result từ URL params sau khi VNPay redirect về
   * @param {URLSearchParams} searchParams - URL search params
   * @returns {Object} Payment result info
   */
  parsePaymentResult: (searchParams) => {
    return {
      orderCode: searchParams.get('order_code'),
      status: searchParams.get('status'),
      isSuccess: searchParams.get('status') === 'completed'
    };
  }
};

export default PaymentService;
