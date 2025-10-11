import api from './api';

const PermissionService = {
    /**
     * Lấy danh sách tất cả Permissions
     * GET /api/users/permissions/
     */
    getAll: async () => {
        try {
            const response = await api.get('/api/users/permissions/');
            return response.data;
        } catch (error) {
            console.error('Error fetching permissions:', error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết 1 Permission
     * GET /api/users/permissions/:id/
     */
    getById: async (id) => {
        try {
            const response = await api.get(`/api/users/permissions/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching permission ${id}:`, error);
            throw error;
        }
    },

    /**
     * Tạo Permission mới
     * POST /api/users/permissions/
     * @param {Object} data - { code, description, category_id }
     */
    create: async (data) => {
        try {
            const response = await api.post('/api/users/permissions/', data);
            return response.data;
        } catch (error) {
            console.error('Error creating permission:', error);
            throw error;
        }
    },

    /**
     * Cập nhật Permission
     * PUT /api/users/permissions/:id/
     * @param {number} id
     * @param {Object} data - { code, description, category_id }
     */
    update: async (id, data) => {
        try {
            const response = await api.put(`/api/users/permissions/${id}/`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating permission ${id}:`, error);
            throw error;
        }
    },

    /**
     * Xóa Permission
     * DELETE /api/users/permissions/:id/
     */
    delete: async (id) => {
        try {
            const response = await api.delete(`/api/users/permissions/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting permission ${id}:`, error);
            throw error;
        }
    },

    /**
     * Lấy danh sách permissions nhóm theo category (dùng cho checkbox)
     * GET /api/users/selections/permissions/
     */
    getAllGroupedByCategory: async () => {
        try {
            const response = await api.get('/api/users/selections/permissions/');
            return response.data;
        } catch (error) {
            console.error('Error fetching permissions grouped by category:', error);
            throw error;
        }
    },
};

export default PermissionService;
