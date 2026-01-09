// src/services/OrderService.js
import api from './api';

const OrderService = {
  /**
   * Lấy danh sách tất cả đơn hàng (Admin)
   * @param {Object} params - Query parameters
   * @returns {Promise} List of all orders with pagination
   */
  getAllOrders: async (params = {}) => {
    try {
      const response = await api.get('/api/admin/orders/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy chi tiết đơn hàng theo ID (Admin)
   * @param {number} orderId - ID của đơn hàng
   * @returns {Promise} Order detail
   */
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/admin/orders/${orderId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái đơn hàng (Admin)
   * @param {number} orderId - ID của đơn hàng
   * @param {string} status - Trạng thái mới
   * @returns {Promise} Updated order
   */
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.patch(`/api/admin/orders/${orderId}/`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xuất danh sách đơn hàng ra CSV (Admin)
   * @param {Object} filters - Filter parameters
   * @returns {Promise} CSV data
   */
  exportOrders: async (filters = {}) => {
    try {
      const response = await api.get('/api/admin/orders/export/', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy thống kê đơn hàng (Admin)
   * @param {Object} params - Query parameters
   * @returns {Promise} Order statistics
   */
  getOrderStatistics: async (params = {}) => {
    try {
      const response = await api.get('/api/admin/orders/statistics/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default OrderService;
