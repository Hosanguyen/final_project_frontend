import api from './api';

const SubmissionService = {
    /**
     * Submit code for a problem
     * POST /api/problems/:problemId/submissions/
     */
    submit: async (problemId, data) => {
        try {
            const response = await api.post(`/api/problems/${problemId}/submissions/`, data);
            return response.data;
        } catch (error) {
            console.error(`Error submitting code for problem ${problemId}:`, error);
            throw error;
        }
    },

    /**
     * Get all submissions for a problem
     * GET /api/problems/:problemId/submissions/list/
     */
    getByProblem: async (problemId, params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.page_size) queryParams.append('page_size', params.page_size);
            if (params.ordering) queryParams.append('ordering', params.ordering);
            if (params.contest_id) queryParams.append('contest_id', params.contest_id);

            const response = await api.get(
                `/api/problems/${problemId}/submissions/list/?${queryParams.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error(`Error fetching submissions for problem ${problemId}:`, error);
            throw error;
        }
    },

    /**
     * Get all submissions (all problems)
     * GET /api/problems/submissions/
     */
    getAll: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.page_size) queryParams.append('page_size', params.page_size);
            if (params.ordering) queryParams.append('ordering', params.ordering);

            const response = await api.get(`/api/problems/submissions/?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all submissions:', error);
            throw error;
        }
    },

    /**
     * Get submission detail
     * GET /api/problems/submissions/:id/
     */
    getById: async (submissionId) => {
        try {
            const response = await api.get(`/api/problems/submissions/${submissionId}/`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching submission ${submissionId}:`, error);
            throw error;
        }
    },
};

export default SubmissionService;
