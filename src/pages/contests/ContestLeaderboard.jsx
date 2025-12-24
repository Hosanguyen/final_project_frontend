import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaSync } from 'react-icons/fa';
import ContestService from '../../services/ContestService';
import './ContestLeaderboard.css';
import notification from '../../utils/notification';

const ContestLeaderboard = ({ contestId, contestMode, autoRefresh = false }) => {
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const SYNC_INTERVAL = parseInt(process.env.REACT_APP_SYNC_INTERVAL_LEADERBOARD) || 5000;
    
    useEffect(() => {
        fetchLeaderboard();

        // Auto-refresh every 30 seconds if enabled
        let interval = null;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchLeaderboard(true);
            }, SYNC_INTERVAL);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [contestId, autoRefresh]);

    const fetchLeaderboard = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const data = await ContestService.getLeaderboard(contestId);
            setLeaderboardData(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            setError('Không thể tải bảng xếp hạng. Vui lòng thử lại sau.');
            if (!isRefresh) {
                notification.error('Không thể tải bảng xếp hạng');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchLeaderboard(true);
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return <FaTrophy className="rank-icon gold" />;
        if (rank === 2) return <FaMedal className="rank-icon silver" />;
        if (rank === 3) return <FaMedal className="rank-icon bronze" />;
        return null;
    };

    const formatTime = (minutes) => {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}`;
    };

    const getProblemCellClass = (problemData) => {
        if (!problemData || problemData.status === null) return 'problem-cell not-attempted';
        if (problemData.status === 'AC') return 'problem-cell accepted';
        if (problemData.status === 'WA') return 'problem-cell wrong-answer';
        return 'problem-cell pending';
    };

    const renderProblemCell = (problemData, problemInfo) => {
        if (!problemData || problemData.status === null) {
            return <div className={getProblemCellClass(problemData)}>-</div>;
        }

        if (contestMode === 'ICPC' || !contestMode) {
            // ICPC mode: show time and attempts
            if (problemData.status === 'AC') {
                // Calculate display attempts (unfrozen only for AC)
                const displayAttempts = problemData.wrong_attempts + 1;
                
                return (
                    <div className={getProblemCellClass(problemData)}>
                        <div className="problem-time">{problemData.time_minutes}</div>
                        {problemData.frozen_attempts > 0 ? (
                            <div className="problem-attempts">
                                +{displayAttempts} {displayAttempts > 1 ? 'tries' : 'try'}
                                <span className="frozen-indicator"> + {problemData.frozen_attempts}</span>
                            </div>
                        ) : (
                            <div className="problem-attempts">
                                +{displayAttempts} {displayAttempts > 1 ? 'tries' : 'try'}
                            </div>
                        )}
                    </div>
                );
            } else {
                // Not AC yet - show unfrozen attempts + frozen attempts
                const unfrozenAttempts = problemData.attempts || 0;
                const frozenAttempts = problemData.frozen_attempts || 0;
                
                return (
                    <div className={getProblemCellClass(problemData)}>
                        {frozenAttempts > 0 ? (
                            <div className="problem-attempts">
                                +{unfrozenAttempts} {unfrozenAttempts !== 1 ? 'tries' : 'try'}
                                <span className="frozen-indicator"> + {frozenAttempts}</span>
                            </div>
                        ) : (
                            <div className="problem-attempts">
                                +{unfrozenAttempts} {unfrozenAttempts !== 1 ? 'tries' : 'try'}
                            </div>
                        )}
                    </div>
                );
            }
        } else if (contestMode === 'OI') {
            // OI mode: show score or test results
            if (problemData.score !== null && problemData.score !== undefined) {
                return (
                    <div className={getProblemCellClass(problemData)}>
                        <div className="problem-score">{problemData.score.toFixed(0)}</div>
                        {problemData.test_passed !== null && problemData.test_total !== null && (
                            <div className="problem-tests">{problemData.test_passed}/{problemData.test_total}</div>
                        )}
                    </div>
                );
            }
        }

        return <div className={getProblemCellClass(problemData)}>-</div>;
    };

    if (loading) {
        return (
            <div className="leaderboard-loading">
                <div className="spinner"></div>
                <p>Đang tải bảng xếp hạng...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="leaderboard-error">
                <p>{error}</p>
                <button onClick={() => fetchLeaderboard()} className="retry-btn">
                    Thử lại
                </button>
            </div>
        );
    }

    if (!leaderboardData || !leaderboardData.leaderboard) {
        return (
            <div className="leaderboard-empty">
                <FaTrophy className="empty-icon" />
                <p>Chưa có dữ liệu xếp hạng</p>
            </div>
        );
    }

    const { leaderboard, problems, contest_mode } = leaderboardData;

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h2>
                    <FaTrophy className="trophy-icon" />
                    Bảng xếp hạng
                </h2>
                <div className="leaderboard-actions">
                    <span className="participant-count">{leaderboard.length} người tham gia</span>
                    {/* <button 
                        onClick={handleRefresh} 
                        className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
                        disabled={refreshing}
                    >
                        <FaSync className={refreshing ? 'spinning' : ''} />
                        {refreshing ? 'Đang cập nhật...' : 'Làm mới'}
                    </button> */}
                </div>
            </div>

            <div className="leaderboard-table-container">
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th className="col-rank">Hạng</th>
                            <th className="col-participant">Thành viên</th>
                            <th className="col-solved">Solved</th>
                            {contest_mode === 'ICPC' && (
                                <th className="col-penalty">Penalty</th>
                            )}
                            {contest_mode === 'OI' && (
                                <th className="col-score">Điểm</th>
                            )}
                            {contest_mode === 'ICPC' && problems && problems.map(problem => {
                                const bgColor = (problem.rgb && problem.rgb.trim()) || (problem.color && problem.color.trim()) || '#f8f9fa';
                                const hasCustomColor = (problem.rgb && problem.rgb.trim()) || (problem.color && problem.color.trim());
                                
                                return (
                                    <th 
                                        key={problem.id} 
                                        className="col-problem" 
                                        title={problem.title}
                                        style={{
                                            backgroundColor: bgColor,
                                            color: hasCustomColor ? '#fff' : '#495057',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {problem.label}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((entry, index) => (
                            <tr key={entry.user_id} className={`leaderboard-row rank-${entry.rank}`}>
                                <td className="col-rank">
                                    <div className="rank-cell">
                                        {getRankBadge(entry.rank)}
                                        <span className="rank-number">{entry.rank}</span>
                                    </div>
                                </td>
                                <td className="col-participant">
                                    <div className="participant-info">
                                        <div className="participant-details">
                                            <div className="participant-name">{entry.full_name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="col-solved">
                                    <span className="solved-count">{entry.solved_count}</span>
                                </td>
                                {contest_mode === 'ICPC' && (
                                    <td className="col-penalty">
                                        <span className="penalty-time">{entry.penalty_minutes}</span>
                                    </td>
                                )}
                                {contest_mode === 'OI' && (
                                    <td className="col-score">
                                        <span className="total-score">{entry.total_score.toFixed(2)}</span>
                                    </td>
                                )}
                                {contest_mode === 'ICPC' && problems && problems.map(problem => (
                                    <td key={problem.id} className="col-problem">
                                        {renderProblemCell(
                                            entry.problems ? entry.problems[problem.id] : null,
                                            problem
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {leaderboard.length === 0 && (
                <div className="leaderboard-empty">
                    <p>Chưa có người tham gia nào</p>
                </div>
            )}
        </div>
    );
};

export default ContestLeaderboard;
