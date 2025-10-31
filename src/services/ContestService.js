import api from './api';

const ContestService = {
    /**
     * Get all contests
     * @param {Object} params - Query parameters (status, visibility)
     * @returns {Promise} List of contests
     */
    getAll: async (params = {}) => {
        try {
            const response = await api.get('/api/contests/', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get contest by ID
     * @param {number} contestId - Contest ID
     * @returns {Promise} Contest details
     */
    getById: async (contestId) => {
        try {
            const response = await api.get(`/api/contests/${contestId}/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Create new contest
     * @param {Object} contestData - Contest data
     * @returns {Promise} Created contest
     */
    create: async (contestData) => {
        try {
            const response = await api.post('/api/contests/create/', contestData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Update contest
     * @param {number} contestId - Contest ID
     * @param {Object} contestData - Updated contest data
     * @returns {Promise} Updated contest
     */
    update: async (contestId, contestData) => {
        try {
            const response = await api.put(`/api/contests/${contestId}/`, contestData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Delete contest
     * @param {number} contestId - Contest ID
     * @returns {Promise} Deletion result
     */
    delete: async (contestId) => {
        try {
            const response = await api.delete(`/api/contests/${contestId}/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default ContestService;
