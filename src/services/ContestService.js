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

    getByContestProblemId: async (contestProblemId) => {
        try {
            const response = await api.get(`/api/contests/contest-problem/${contestProblemId}/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get practice contest with pagination
     * @param {Object} params - Query parameters (page, page_size)
     * @returns {Promise} Contest details with paginated problems
     */
    getPracticeContest: async (params = {}) => {
        try {
            const response = await api.get(`/api/contests/practice/contest/`, { params });
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
    },

    /**
     * Add problem to contest
     * @param {number} contestId - Contest ID
     * @param {Object} problemData - Problem data (problem_id, label, color, rgb, points, lazy_eval_results)
     * @returns {Promise} Result
     */
    addProblem: async (contestId, problemData) => {
        try {
            const response = await api.post(`/api/contests/${contestId}/problems/`, problemData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Remove problem from contest
     * @param {number} contestId - Contest ID
     * @param {number} problemId - Problem ID
     * @returns {Promise} Result
     */
    removeProblem: async (contestId, problemId) => {
        try {
            const response = await api.delete(`/api/contests/${contestId}/problems/${problemId}/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get contests for user header (excluding practice)
     * @returns {Promise} Contests categorized by status (upcoming, running, finished)
     */
    getUserContests: async () => {
        try {
            const response = await api.get('/api/contests/user/contests/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get contest details for user
     * @param {number} contestId - Contest ID
     * @returns {Promise} Contest details with problems
     */
    getContestDetailForUser: async (contestId) => {
        try {
            const response = await api.get(`/api/contests/user/${contestId}/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Register for a contest
     * @param {number} contestId - Contest ID
     * @returns {Promise} Registration result
     */
    registerForContest: async (contestId) => {
        try {
            const response = await api.post(`/api/contests/user/${contestId}/register/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Unregister from a contest
     * @param {number} contestId - Contest ID
     * @returns {Promise} Unregistration result
     */
    unregisterFromContest: async (contestId) => {
        try {
            const response = await api.delete(`/api/contests/user/${contestId}/register/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Check registration status for a contest
     * @param {number} contestId - Contest ID
     * @returns {Promise} Registration status
     */
    getRegistrationStatus: async (contestId) => {
        try {
            const response = await api.get(`/api/contests/user/${contestId}/registration-status/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get participants list for a contest
     * @param {number} contestId - Contest ID
     * @returns {Promise} List of participants with statistics
     */
    getParticipants: async (contestId) => {
        try {
            const response = await api.get(`/api/contests/${contestId}/participants/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get user candidates (search) for adding to contest
     */
    getUserCandidates: async (contestId, params = {}) => {
        try {
            const response = await api.get(`/api/contests/${contestId}/user-candidates/`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Bulk add participants to a contest
     */
    bulkAddParticipants: async (contestId, userIds) => {
        try {
            const response = await api.post(`/api/contests/${contestId}/participants/bulk-add/`, { user_ids: userIds });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Toggle participant active status
     * @param {number} contestId - Contest ID
     * @param {number} participantId - Participant ID
     * @returns {Promise} Updated participant
     */
    toggleParticipantStatus: async (contestId, participantId) => {
        try {
            const response = await api.patch(`/api/contests/${contestId}/participants/${participantId}/toggle/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get contest leaderboard
     * @param {number} contestId - Contest ID
     * @returns {Promise} Leaderboard data with rankings and problem details
     */
    getLeaderboard: async (contestId) => {
        try {
            const response = await api.get(`/api/contests/${contestId}/leaderboard/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Recalculate rankings for a contest (admin action)
     * @param {number} contestId - Contest ID
     * @returns {Promise} Result with updated count
     */
    recalculateRankings: async (contestId) => {
        try {
            const response = await api.post(`/api/contests/${contestId}/recalculate-rankings/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get contest statistics for admin dashboard
     * @returns {Promise} Contest statistics data
     */
    getStatistics: async () => {
        try {
            const response = await api.get('/api/contests/statistics/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default ContestService;
