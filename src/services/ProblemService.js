import api from './api';

const ProblemService = {
    /**
     * Lấy danh sách problems (có phân trang và filter)
     * GET /api/problems/?page=1&page_size=20&difficulty=easy&search=sum
     */
    getAll: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page);
            if (params.page_size) queryParams.append('page_size', params.page_size);
            if (params.difficulty) queryParams.append('difficulty', params.difficulty);
            if (params.is_public) queryParams.append('is_public', params.is_public);
            if (params.tag_id) queryParams.append('tag_id', params.tag_id);
            if (params.search) queryParams.append('search', params.search);
            if (params.ordering) queryParams.append('ordering', params.ordering);

            const response = await api.get(`/api/problems/?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching problems:', error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết 1 problem
     * GET /api/problems/:id/
     */
    getById: async (id) => {
        try {
            const response = await api.get(`/api/problems/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching problem ${id}:`, error);
            throw error;
        }
    },

    /**
     * Tạo problem mới (kèm test cases)
     * POST /api/problems/
     */
    create: async (data) => {
        try {
            const config = {};

            // Nếu data là FormData (có file ZIP), set Content-Type
            if (data instanceof FormData) {
                config.headers = {
                    'Content-Type': 'multipart/form-data',
                };
            }

            const response = await api.post('/api/problems/', data, config);
            return response.data;
        } catch (error) {
            console.error('Error creating problem:', error);
            throw error;
        }
    },

    /**
     * Cập nhật problem
     * PUT /api/problems/:id/
     */
    update: async (id, data) => {
        try {
            const config = {};

            // Nếu data là FormData (có file ZIP), set Content-Type
            if (data instanceof FormData) {
                config.headers = {
                    'Content-Type': 'multipart/form-data',
                };
            }

            const response = await api.put(`/api/problems/${id}/`, data, config);
            return response.data;
        } catch (error) {
            console.error(`Error updating problem ${id}:`, error);
            throw error;
        }
    },

    /**
     * Xóa problem
     * DELETE /api/problems/:id/
     */
    delete: async (id) => {
        try {
            const response = await api.delete(`/api/problems/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting problem ${id}:`, error);
            throw error;
        }
    },

    /**
     * Lấy danh sách test cases của problem
     * GET /api/problems/:id/test-cases/
     */
    getTestCases: async (problemId) => {
        try {
            const response = await api.get(`/api/problems/${problemId}/test-cases/`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching test cases for problem ${problemId}:`, error);
            throw error;
        }
    },

    /**
     * Thêm test case
     * POST /api/problems/:id/test-cases/
     */
    addTestCase: async (problemId, data) => {
        try {
            const response = await api.post(`/api/problems/${problemId}/test-cases/`, data);
            return response.data;
        } catch (error) {
            console.error(`Error adding test case:`, error);
            throw error;
        }
    },

    /**
     * Cập nhật test case
     * PUT /api/problems/:problemId/test-cases/:testcaseId/
     */
    updateTestCase: async (problemId, testcaseId, data) => {
        try {
            const response = await api.put(`/api/problems/${problemId}/test-cases/${testcaseId}/`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating test case:`, error);
            throw error;
        }
    },

    /**
     * Xóa test case
     * DELETE /api/problems/:problemId/test-cases/:testcaseId/
     */
    deleteTestCase: async (problemId, testcaseId) => {
        try {
            const response = await api.delete(`/api/problems/${problemId}/test-cases/${testcaseId}/`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting test case:`, error);
            throw error;
        }
    },

    /**
     * Lấy thống kê problem
     * GET /api/problems/:id/statistics/
     */
    getStatistics: async (id) => {
        try {
            const response = await api.get(`/api/problems/${id}/statistics/`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching statistics for problem ${id}:`, error);
            throw error;
        }
    },
};

export default ProblemService;
