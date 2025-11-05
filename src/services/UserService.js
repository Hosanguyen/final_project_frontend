import api from './api';

export const updateUserProfile = async (formData, avatarFile) => {
    const formDataToSend = new FormData();

    // Thêm các trường từ formData
    Object.keys(formData).forEach((key) => {
        if (key === 'avatar_url') return;
        if (formData[key] !== null && formData[key] !== undefined) formDataToSend.append(key, formData[key]);
    });
    // Thêm avatar (nếu có)
    if (avatarFile) {
        const blob = avatarFile;
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        formDataToSend.append('avatar_url', file);
    }

    // Gọi API
    const response = await api.put('/api/users/profile/update/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
};

const UserService = {
    /**
     * Lấy danh sách tất cả Users (Admin)
     * GET /api/users/admin/list/
     */
    getAll: async (params = {}) => {
        try {
            const response = await api.get('/api/users/admin/list/', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết 1 User
     * GET /api/users/admin/detail/:id/
     */
    getById: async (id) => {
        try {
            const response = await api.get(`/api/users/admin/detail/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            throw error;
        }
    },

    /**
     * Tạo User mới (Admin)
     * POST /api/users/admin/create/
     */
    create: async (data) => {
        try {
            const response = await api.post('/api/users/admin/create/', data);
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    /**
     * Cập nhật User (Admin)
     * PUT /api/users/admin/update/:id/
     */
    update: async (id, data) => {
        try {
            const response = await api.put(`/api/users/admin/update/${id}/`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating user ${id}:`, error);
            throw error;
        }
    },

    /**
     * Xóa User (Admin)
     * DELETE /api/users/admin/delete/:id/
     */
    delete: async (id) => {
        try {
            const response = await api.delete(`/api/users/admin/delete/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting user ${id}:`, error);
            throw error;
        }
    },

    /**
     * Gán roles cho user
     * POST /api/users/admin/:user_id/assign-roles/
     */
    assignRoles: async (userId, roleIds) => {
        try {
            const response = await api.post(`/api/users/admin/${userId}/assign-roles/`, {
                role_ids: roleIds,
            });
            return response.data;
        } catch (error) {
            console.error(`Error assigning roles to user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Xóa roles khỏi user
     * POST /api/users/admin/:user_id/remove-roles/
     */
    removeRoles: async (userId, roleIds) => {
        try {
            const response = await api.post(`/api/users/admin/${userId}/remove-roles/`, {
                role_ids: roleIds,
            });
            return response.data;
        } catch (error) {
            console.error(`Error removing roles from user ${userId}:`, error);
            throw error;
        }
    },
};

export default UserService;
