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

    /**
     * ============= USER REPORTS APIs =============
     */

    /**
     * Lấy thống kê tổng quan
     * GET /api/users/reports/stats/?month=YYYY-MM
     */
    getReportsStats: async (month) => {
        try {
            const params = month ? { month } : {};
            const response = await api.get('/api/users/reports/stats/', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching reports stats:', error);
            throw error;
        }
    },

    /**
     * Lấy dữ liệu biểu đồ tăng trưởng
     * GET /api/users/reports/growth-chart/?month=YYYY-MM
     */
    getReportsGrowthChart: async (month) => {
        try {
            const params = month ? { month } : {};
            const response = await api.get('/api/users/reports/growth-chart/', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching growth chart:', error);
            throw error;
        }
    },

    /**
     * Lấy phân bổ cấp độ người dùng
     * GET /api/users/reports/level-distribution/?month=YYYY-MM
     */
    getReportsLevelDistribution: async (month) => {
        try {
            const params = month ? { month } : {};
            const response = await api.get('/api/users/reports/level-distribution/', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching level distribution:', error);
            throw error;
        }
    },

    /**
     * Lấy thống kê khóa học phổ biến
     * GET /api/users/reports/course-enrollments/?month=YYYY-MM
     */
    getReportsCourseEnrollments: async (month) => {
        try {
            const params = month ? { month } : {};
            const response = await api.get('/api/users/reports/course-enrollments/', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching course enrollments:', error);
            throw error;
        }
    },

    /**
     * Lấy thống kê contest
     * GET /api/users/reports/contest-stats/?month=YYYY-MM
     */
    getReportsContestStats: async (month) => {
        try {
            const params = month ? { month } : {};
            const response = await api.get('/api/users/reports/contest-stats/', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching contest stats:', error);
            throw error;
        }
    },

    /**
     * Lấy top 5 users xuất sắc
     * GET /api/users/reports/top-users/
     */
    getReportsTopUsers: async () => {
        try {
            const response = await api.get('/api/users/reports/top-users/');
            return response.data;
        } catch (error) {
            console.error('Error fetching top users:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách tất cả users với pagination
     * GET /api/users/reports/all-users/?page=1&page_size=10&search=&level=
     */
    getReportsAllUsers: async (params = {}) => {
        try {
            const response = await api.get('/api/users/reports/all-users/', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    },
};

export default UserService;
