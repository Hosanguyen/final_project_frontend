import api from './api';

const PermissionCategoryService = {
    /**
     * Lấy danh sách tất cả Permission Categories
     * GET /api/users/permission-categories/
     */
    getAll: async () => {
        try {
            const response = await api.get('/api/users/permission-categories/');
            return response.data;
        } catch (error) {
            console.error('Error fetching permission categories:', error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết 1 Permission Category
     * GET /api/users/permission-categories/:id/
     */
    getById: async (id) => {
        try {
            const response = await api.get(`/api/users/permission-categories/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching permission category ${id}:`, error);
            throw error;
        }
    },

    /**
     * Tạo Permission Category mới
     * POST /api/users/permission-categories/
     * @param {Object} data - { name, description }
     */
    create: async (data) => {
        try {
            const response = await api.post('/api/users/permission-categories/', data);
            return response.data;
        } catch (error) {
            console.error('Error creating permission category:', error);
            throw error;
        }
    },

    /**
     * Cập nhật Permission Category
     * PUT /api/users/permission-categories/:id/
     * @param {number} id
     * @param {Object} data - { name, description }
     */
    update: async (id, data) => {
        try {
            const response = await api.put(`/api/users/permission-categories/${id}/`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating permission category ${id}:`, error);
            throw error;
        }
    },

    /**
     * Xóa Permission Category
     * DELETE /api/users/permission-categories/:id/
     */
    delete: async (id) => {
        try {
            const response = await api.delete(`/api/users/permission-categories/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting permission category ${id}:`, error);
            throw error;
        }
    },
};

export default PermissionCategoryService;
