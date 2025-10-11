import api from './api';

const RoleService = {
    /**
     * Lấy danh sách tất cả Roles (không có permissions chi tiết)
     * GET /api/users/roles/
     */
    getAll: async () => {
        try {
            const response = await api.get('/api/users/roles/');
            return response.data;
        } catch (error) {
            console.error('Error fetching roles:', error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết 1 Role (có danh sách permissions đầy đủ)
     * GET /api/users/roles/:id/
     */
    getById: async (id) => {
        try {
            const response = await api.get(`/api/users/roles/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching role ${id}:`, error);
            throw error;
        }
    },

    /**
     * Tạo Role mới VÀ gán permissions
     * POST /api/users/roles/
     * @param {Object} data - { name, description, permission_ids: [1, 2, 3] }
     */
    create: async (data) => {
        try {
            const response = await api.post('/api/users/roles/', data);
            return response.data;
        } catch (error) {
            console.error('Error creating role:', error);
            throw error;
        }
    },

    /**
     * Cập nhật Role VÀ permissions
     * PUT /api/users/roles/:id/
     * @param {number} id
     * @param {Object} data - { name, description, permission_ids: [1, 2, 3] }
     */
    update: async (id, data) => {
        try {
            const response = await api.put(`/api/users/roles/${id}/`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating role ${id}:`, error);
            throw error;
        }
    },

    /**
     * Xóa Role
     * DELETE /api/users/roles/:id/
     */
    delete: async (id) => {
        try {
            const response = await api.delete(`/api/users/roles/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting role ${id}:`, error);
            throw error;
        }
    },

    /**
     * THÊM permissions vào role (không xóa permissions cũ)
     * POST /api/users/roles/:roleId/assign-permissions/
     * @param {number} roleId
     * @param {Array<number>} permissionIds - [7, 8, 9]
     */
    assignPermissions: async (roleId, permissionIds) => {
        try {
            const response = await api.post(`/api/users/roles/${roleId}/assign-permissions/`, {
                permission_ids: permissionIds,
            });
            return response.data;
        } catch (error) {
            console.error(`Error assigning permissions to role ${roleId}:`, error);
            throw error;
        }
    },

    /**
     * XÓA permissions khỏi role
     * POST /api/users/roles/:roleId/remove-permissions/
     * @param {number} roleId
     * @param {Array<number>} permissionIds - [7, 8]
     */
    removePermissions: async (roleId, permissionIds) => {
        try {
            const response = await api.post(`/api/users/roles/${roleId}/remove-permissions/`, {
                permission_ids: permissionIds,
            });
            return response.data;
        } catch (error) {
            console.error(`Error removing permissions from role ${roleId}:`, error);
            throw error;
        }
    },

    /**
     * Lấy danh sách roles đơn giản (chỉ id và name)
     * GET /api/users/selections/roles/
     */
    getAllSimple: async () => {
        try {
            const response = await api.get('/api/users/selections/roles/');
            return response.data;
        } catch (error) {
            console.error('Error fetching simple roles:', error);
            throw error;
        }
    },
};

export default RoleService;
