import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaClock, FaCalendar, FaUsers } from 'react-icons/fa';
import ContestService from '../../services/ContestService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import './Contests.css';

const Contests = () => {
    useDocumentTitle('Cuộc thi');
    const [contests, setContests] = useState({ upcoming: [], running: [], finished: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            setLoading(true);
            const data = await ContestService.getUserContests();
            setContests(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching contests:', err);
            setError('Không thể tải danh sách cuộc thi. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getTimeRemaining = (startDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const diff = start - now;
        
        if (diff <= 0) return 'Đã bắt đầu';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `Còn ${days} ngày`;
        if (hours > 0) return `Còn ${hours} giờ`;
        return `Còn ${minutes} phút`;
    };

    const renderContestCard = (contest, status) => {
        return (
            <Link to={`/contests/${contest.id}`} key={contest.id} className={`contest-card ${status}`}>
                <div className="contest-card-header">
                    <div className={`contest-status-badge ${status}`}>
                        {status === 'running' && '🔴 Đang diễn ra'}
                        {status === 'upcoming' && '🟡 Sắp diễn ra'}
                        {status === 'finished' && '⚫ Đã kết thúc'}
                    </div>
                </div>
                
                <div className="contest-card-body">
                    <h3 className="contest-card-title">
                        <FaTrophy className="trophy-icon" />
                        {contest.title}
                    </h3>
                    
                    <div className="contest-card-info">
                        <div className="info-row">
                            <FaCalendar className="info-icon" />
                            <span>Bắt đầu: {formatDateTime(contest.start_at)}</span>
                        </div>
                        <div className="info-row">
                            <FaClock className="info-icon" />
                            <span>Kết thúc: {formatDateTime(contest.end_at)}</span>
                        </div>
                        {status === 'upcoming' && (
                            <div className="info-row countdown">
                                <span className="countdown-text">{getTimeRemaining(contest.start_at)}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="contest-card-footer">
                    <button className="contest-view-btn">
                        {status === 'running' ? 'Tham gia ngay' : 'Xem chi tiết'}
                    </button>
                </div>
            </Link>
        );
    };

    if (loading) {
        return (
            <div className="contests-container">
                <div className="contests-loading">
                    <div className="spinner"></div>
                    <p>Đang tải danh sách cuộc thi...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="contests-container">
                <div className="contests-error">
                    <p>{error}</p>
                    <button onClick={fetchContests} className="retry-btn">Thử lại</button>
                </div>
            </div>
        );
    }

    const hasContests = contests.running?.length > 0 || contests.upcoming?.length > 0 || contests.finished?.length > 0;

    return (
        <div className="contests-container">
            <div className="contests-header">
                <h1>
                    <FaTrophy className="header-icon" />
                    Cuộc thi lập trình
                </h1>
                <p className="contests-subtitle">
                    Tham gia các cuộc thi để thử thách bản thân và cạnh tranh với các lập trình viên khác
                </p>
            </div>

            {!hasContests ? (
                <div className="contests-empty">
                    <FaTrophy className="empty-icon" />
                    <h3>Chưa có cuộc thi nào</h3>
                    <p>Hãy quay lại sau để tham gia các cuộc thi thú vị!</p>
                </div>
            ) : (
                <>
                    {contests.running && contests.running.length > 0 && (
                        <div className="contest-section">
                            <div className="section-header running">
                                <h2>
                                    <span className="status-dot running"></span>
                                    Đang diễn ra
                                </h2>
                                <span className="section-count">{contests.running.length} cuộc thi</span>
                            </div>
                            <div className="contests-grid">
                                {contests.running.map(contest => renderContestCard(contest, 'running'))}
                            </div>
                        </div>
                    )}

                    {contests.upcoming && contests.upcoming.length > 0 && (
                        <div className="contest-section">
                            <div className="section-header upcoming">
                                <h2>
                                    <span className="status-dot upcoming"></span>
                                    Sắp diễn ra
                                </h2>
                                <span className="section-count">{contests.upcoming.length} cuộc thi</span>
                            </div>
                            <div className="contests-grid">
                                {contests.upcoming.map(contest => renderContestCard(contest, 'upcoming'))}
                            </div>
                        </div>
                    )}

                    {contests.finished && contests.finished.length > 0 && (
                        <div className="contest-section">
                            <div className="section-header finished">
                                <h2>
                                    <span className="status-dot finished"></span>
                                    Đã kết thúc
                                </h2>
                                <span className="section-count">{contests.finished.length} cuộc thi</span>
                            </div>
                            <div className="contests-grid">
                                {contests.finished.map(contest => renderContestCard(contest, 'finished'))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Contests;
