import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaMedal, FaChartLine, FaUser } from 'react-icons/fa';
import RatingService from '../../services/RatingService';
import './GlobalRanking.css';

const GlobalRanking = () => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [myRating, setMyRating] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        total_pages: 0
    });
    const navigate = useNavigate();
    const SERVER_URL = process.env.REACT_APP_API_URL || '';

    useEffect(() => {
        fetchGlobalRanking();
        
        // Only fetch my rating if user is logged in
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            fetchMyRating();
        }
    }, [pagination.page]);

    const fetchMyRating = async () => {
        try {
            const data = await RatingService.getMyRating();
            setMyRating(data);
        } catch (err) {
            console.error('Error fetching my rating:', err);
            // Không hiển thị error vì user có thể chưa đăng nhập
        }
    };

    const fetchGlobalRanking = async () => {
        try {
            setLoading(true);
            const data = await RatingService.getGlobalRanking(pagination.page, pagination.limit);
            setRankings(data.rankings);
            setPagination(prev => ({
                ...prev,
                total: data.pagination.total,
                total_pages: data.pagination.total_pages
            }));
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Không thể tải bảng xếp hạng');
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <FaTrophy className="rank-icon gold" />;
        if (rank === 2) return <FaMedal className="rank-icon silver" />;
        if (rank === 3) return <FaMedal className="rank-icon bronze" />;
        return <span className="rank-number">#{rank}</span>;
    };

    const getRankClass = (rank_title) => {
        return `rank-badge rank-${rank_title.replace('_', '-')}`;
    };

    const handleUserClick = (userId) => {
        navigate(`/users/${userId}/profile`);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
            window.scrollTo(0, 0);
        }
    };

    if (loading) {
        return (
            <div className="global-ranking-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải bảng xếp hạng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="global-ranking-page">
                <div className="error-container">
                    <p>Lỗi: {error}</p>
                    <button onClick={fetchGlobalRanking} className="retry-btn">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="global-ranking-page">
            <div className="ranking-header">
                <div className="header-content">
                    <h1>
                        <FaChartLine className="header-icon" />
                        Bảng Xếp Hạng Global
                    </h1>
                    <p className="header-description">
                        Xếp hạng dựa trên rating từ các contest thi đấu
                    </p>
                </div>
                {myRating && (
                    <div className="my-rank-card">
                        <h3>Thứ hạng của bạn</h3>
                        <div className="my-rank-content">
                            <div className="my-rank-position">
                                {getRankIcon(rankings.find(r => r.user_id === myRating.id)?.rank || 0)}
                            </div>
                            <div className="my-rank-details">
                                <div className="my-rank-title">
                                    <span 
                                        className={getRankClass(myRating.rank)}
                                        style={{ 
                                            backgroundColor: myRating.rank_color + '20',
                                            color: myRating.rank_color,
                                            borderColor: myRating.rank_color
                                        }}
                                    >
                                        {myRating.rank.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="my-rank-rating">
                                    <span style={{ color: myRating.rank_color, fontWeight: 'bold', fontSize: '24px' }}>
                                        {myRating.current_rating}
                                    </span>
                                    <span className="max-rating-label"> / {myRating.max_rating} max</span>
                                </div>
                                <div className="my-rank-stats">
                                    <span>{myRating.contests_participated} contests</span>
                                    {myRating.contests_won > 0 && (
                                        <span className="wins"> • {myRating.contests_won} wins</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="ranking-container">
                {rankings.length === 0 ? (
                    <div className="empty-state">
                        <p>Chưa có dữ liệu xếp hạng</p>
                    </div>
                ) : (
                    <>
                        <div className="ranking-table-wrapper">
                            <table className="ranking-table">
                                <thead>
                                    <tr>
                                        <th className="col-rank">Hạng</th>
                                        <th className="col-user">Người dùng</th>
                                        <th className="col-rank-title">Rank</th>
                                        <th className="col-rating">Rating</th>
                                        <th className="col-max-rating">Max Rating</th>
                                        <th className="col-contests">Contests</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rankings.map((user) => (
                                        <tr 
                                            key={user.user_id} 
                                            className="ranking-row"
                                            onClick={() => handleUserClick(user.user_id)}
                                        >
                                            <td className="col-rank">
                                                {getRankIcon(user.rank)}
                                            </td>
                                            <td className="col-user">
                                                <div className="user-info">
                                                    {user.avatar_url ? (
                                                        <img 
                                                            src={`${SERVER_URL}${user.avatar_url}`} 
                                                            alt={user.username}
                                                            className="user-avatar"
                                                        />
                                                    ) : (
                                                        <div className="user-avatar-placeholder">
                                                            <FaUser />
                                                        </div>
                                                    )}
                                                    <div className="user-details">
                                                        <span className="user-fullname">{user.full_name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="col-rank-title">
                                                <span 
                                                    className={getRankClass(user.rank_title)}
                                                    style={{ 
                                                        backgroundColor: user.rank_color + '20',
                                                        color: user.rank_color,
                                                        borderColor: user.rank_color
                                                    }}
                                                >
                                                    {user.rank_title.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="col-rating">
                                                <span 
                                                    className="rating-value"
                                                    style={{ color: user.rank_color }}
                                                >
                                                    {user.current_rating}
                                                </span>
                                            </td>
                                            <td className="col-max-rating">
                                                <span className="max-rating-value">
                                                    {user.max_rating}
                                                </span>
                                            </td>
                                            <td className="col-contests">
                                                <div className="contests-info">
                                                    <span>{user.contests_participated}</span>
                                                    {user.contests_won > 0 && (
                                                        <FaTrophy 
                                                            className="win-icon" 
                                                            title={`${user.contests_won} lần vô địch`}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {pagination.total_pages > 1 && (
                            <div className="pagination">
                                <button 
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                >
                                    Trước
                                </button>
                                
                                <div className="page-numbers">
                                    {[...Array(Math.min(5, pagination.total_pages))].map((_, idx) => {
                                        let pageNum;
                                        if (pagination.total_pages <= 5) {
                                            pageNum = idx + 1;
                                        } else if (pagination.page <= 3) {
                                            pageNum = idx + 1;
                                        } else if (pagination.page >= pagination.total_pages - 2) {
                                            pageNum = pagination.total_pages - 4 + idx;
                                        } else {
                                            pageNum = pagination.page - 2 + idx;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                className={`page-btn ${pagination.page === pageNum ? 'active' : ''}`}
                                                onClick={() => handlePageChange(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button 
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.total_pages}
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default GlobalRanking;
