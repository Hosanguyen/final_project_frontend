import api from './api';

/**
 * Rating Service - API calls for global ranking and user ratings
 */
class RatingService {
    /**
     * Get global ranking leaderboard
     * @param {number} page - Page number (default: 1)
     * @param {number} limit - Items per page (default: 50, max: 100)
     * @returns {Promise} - Rankings data with pagination
     */
    async getGlobalRanking(page = 1, limit = 50) {
        try {
            const response = await api.get('/api/users/ranking/global/', {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching global ranking:', error);
            throw error;
        }
    }

    /**
     * Get current user's rating info
     * @returns {Promise} - User rating data
     */
    async getMyRating() {
        try {
            const response = await api.get('/api/users/rating/me/');
            return response.data;
        } catch (error) {
            console.error('Error fetching my rating:', error);
            throw error;
        }
    }

    /**
     * Get specific user's rating info
     * @param {number} userId - User ID
     * @returns {Promise} - User rating data
     */
    async getUserRating(userId) {
        try {
            const response = await api.get(`/api/users/rating/${userId}/`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching rating for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Get current user's rating history
     * @param {number} limit - Number of records (default: 50, max: 100)
     * @returns {Promise} - Rating history data
     */
    async getMyRatingHistory(limit = 50) {
        try {
            const response = await api.get('/api/users/rating/history/me/', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching my rating history:', error);
            throw error;
        }
    }

    /**
     * Get specific user's rating history
     * @param {number} userId - User ID
     * @param {number} limit - Number of records (default: 50, max: 100)
     * @returns {Promise} - Rating history data
     */
    async getUserRatingHistory(userId, limit = 50) {
        try {
            const response = await api.get(`/api/users/rating/history/${userId}/`, {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching rating history for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Update contest ratings (Admin only)
     * @param {number} contestId - Contest ID
     * @returns {Promise} - Update result
     */
    async updateContestRatings(contestId) {
        try {
            const response = await api.post(`/api/users/rating/contest/${contestId}/update/`);
            return response.data;
        } catch (error) {
            console.error(`Error updating ratings for contest ${contestId}:`, error);
            throw error;
        }
    }

    /**
     * Get rank color based on rank name
     * @param {string} rank - Rank name (e.g., 'newbie', 'specialist', etc.)
     * @returns {string} - Color hex code
     */
    getRankColor(rank) {
        const colors = {
            'newbie': '#808080',
            'pupil': '#008000',
            'specialist': '#03A89E',
            'expert': '#0000FF',
            'candidate_master': '#AA00AA',
            'master': '#FF8C00',
            'international_master': '#FF8C00',
            'grandmaster': '#FF0000',
            'international_grandmaster': '#FF0000',
            'legendary_grandmaster': '#FF0000',
        };
        return colors[rank] || '#808080';
    }

    /**
     * Format rank name for display
     * @param {string} rank - Rank name (e.g., 'candidate_master')
     * @returns {string} - Formatted rank (e.g., 'Candidate Master')
     */
    formatRankName(rank) {
        return rank.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
}

export default new RatingService();
