import api from './api';

const QuizService = {
    /**
     * Lấy danh sách quizzes
     * GET /api/quizzes/
     */
    getAll: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page);
            if (params.page_size) queryParams.append('page_size', params.page_size);
            if (params.search) queryParams.append('search', params.search);
            if (params.is_published !== undefined) queryParams.append('is_published', params.is_published);

            const response = await api.get(`/api/quizzes/?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy chi tiết quiz
     * GET /api/quizzes/:id/
     */
    getById: async (id) => {
        try {
            const response = await api.get(`/api/quizzes/${id}/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Tạo quiz mới
     * POST /api/quizzes/
     */
    create: async (data) => {
        try {
            const response = await api.post('/api/quizzes/', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cập nhật quiz
     * PUT /api/quizzes/:id/
     */
    update: async (id, data) => {
        try {
            const response = await api.put(`/api/quizzes/${id}/`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Xóa quiz
     * DELETE /api/quizzes/:id/
     */
    delete: async (id) => {
        try {
            const response = await api.delete(`/api/quizzes/${id}/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Bắt đầu làm quiz
     * POST /api/quizzes/submissions/start/
     */
    startSubmission: async (quizId) => {
        try {
            const response = await api.post('/api/quizzes/submissions/start/', {
                quiz_id: quizId,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Submit câu trả lời
     * POST /api/quizzes/submissions/:submission_id/answer/
     */
    submitAnswer: async (submissionId, data) => {
        try {
            const response = await api.post(`/api/quizzes/submissions/${submissionId}/answer/`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Hoàn thành quiz
     * POST /api/quizzes/submissions/:submission_id/submit/
     */
    submitQuiz: async (submissionId) => {
        try {
            const response = await api.post(`/api/quizzes/submissions/${submissionId}/submit/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy danh sách submissions
     * GET /api/quizzes/submissions/
     */
    getSubmissions: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page);
            if (params.page_size) queryParams.append('page_size', params.page_size);
            if (params.quiz_id) queryParams.append('quiz_id', params.quiz_id);

            const response = await api.get(`/api/quizzes/submissions/?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy chi tiết submission
     * GET /api/quizzes/submissions/:id/
     */
    getSubmissionById: async (id) => {
        try {
            const response = await api.get(`/api/quizzes/submissions/${id}/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default QuizService;
