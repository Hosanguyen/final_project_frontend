import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaClock, FaFire, FaStar } from 'react-icons/fa';
import ContestService from '../../services/ContestService';
import './Practice.css';

const Practice = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, solved, unsolved
    const [difficultyFilter, setDifficultyFilter] = useState('all'); // all, easy, medium, hard
    const [userSubmissions, setUserSubmissions] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(25); // Items per page
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
    });

    useEffect(() => {
        loadPracticeProblems();
    }, [currentPage]);

    const loadPracticeProblems = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get contest details with problems (with pagination)
            const contestDetail = await ContestService.getPracticeContest({
                page: currentPage,
                page_size: pageSize,
            });

            // API trả về field "problems" chứ không phải "contest_problems"
            const problemList = contestDetail?.problems || contestDetail?.contest_problems || [];

            // Update pagination info
            if (contestDetail?.pagination) {
                setPagination(contestDetail.pagination);
            }

            if (problemList.length > 0) {
                // Backend đã tính toán user_status cho mỗi problem
                // Build userSubmissions từ data backend trả về
                const submissions = {};
                problemList.forEach((cp) => {
                    if (cp.user_status) {
                        submissions[cp.problem_id] = cp.user_status;
                    }
                });
                setUserSubmissions(submissions);
                setProblems(problemList);
            } else {
                setProblems([]);
            }
        } catch (err) {
            console.error('Error loading practice problems:', err);
            setError('Không thể tải danh sách bài tập. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const getProblemStatusIcon = (problemId) => {
        const submission = userSubmissions[problemId];

        if (!submission || !submission.status) {
            return null;
        }

        switch (submission.status) {
            case 'AC':
                return <FaCheckCircle className="status-icon solved" title="Đã giải" />;
            case 'WA':
                return <FaTimesCircle className="status-icon wrong" title="Chưa đúng" />;
            case 'ATTEMPTED':
                return <FaClock className="status-icon attempted" title="Đã thử" />;
            default:
                return null;
        }
    };

    const getProblemStatusClass = (problemId) => {
        const submission = userSubmissions[problemId];

        if (!submission || !submission.status) {
            return 'unsolved';
        }

        switch (submission.status) {
            case 'AC':
                return 'solved';
            case 'WA':
                return 'wrong';
            case 'ATTEMPTED':
                return 'attempted';
            default:
                return 'unsolved';
        }
    };

    const getDifficultyClass = (difficulty) => {
        return difficulty?.toLowerCase() || 'medium';
    };

    const getDifficultyLabel = (difficulty) => {
        const labels = {
            easy: 'Dễ',
            medium: 'Trung bình',
            hard: 'Khó',
        };
        return labels[difficulty?.toLowerCase()] || 'Trung bình';
    };

    const filteredProblems = problems.filter((cp) => {
        // Filter by status
        if (filter === 'solved') {
            const submission = userSubmissions[cp.problem_id];
            if (!submission || submission.status !== 'AC') return false;
        } else if (filter === 'unsolved') {
            const submission = userSubmissions[cp.problem_id];
            if (submission && submission.status === 'AC') return false;
        }

        // Filter by difficulty (assuming problem has difficulty field)
        if (difficultyFilter !== 'all' && cp.problem_difficulty) {
            if (cp.problem_difficulty.toLowerCase() !== difficultyFilter) return false;
        }

        return true;
    });

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const stats = {
        total: pagination.total_items || problems.length,
        solved: Object.values(userSubmissions).filter((s) => s.status === 'AC').length,
        attempted: Object.values(userSubmissions).filter((s) => s.status && s.status !== 'AC').length,
    };

    if (loading) {
        return (
            <div className="practice-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Đang tải danh sách bài tập...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="practice-container">
                <div className="error-message">
                    <FaTimesCircle />
                    <p>{error}</p>
                    <button onClick={loadPracticeProblems} className="btn-retry">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="practice-container">
            <div className="practice-header">
                <h1>
                    <FaFire className="header-icon" />
                    Thực Hành
                </h1>
                <p className="subtitle">Rèn luyện kỹ năng lập trình với hàng trăm bài tập</p>
            </div>

            <div className="practice-stats">
                <div className="stat-card total">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Tổng bài tập</div>
                </div>
                <div className="stat-card solved">
                    <div className="stat-number">{stats.solved}</div>
                    <div className="stat-label">Đã giải</div>
                </div>
                <div className="stat-card attempted">
                    <div className="stat-number">{stats.attempted}</div>
                    <div className="stat-label">Đã thử</div>
                </div>
                <div className="stat-card progress">
                    <div className="stat-number">
                        {stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0}%
                    </div>
                    <div className="stat-label">Tiến độ</div>
                </div>
            </div>

            <div className="practice-filters">
                <div className="filter-group">
                    <label>Trạng thái:</label>
                    <div className="filter-buttons">
                        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
                            Tất cả
                        </button>
                        <button className={filter === 'solved' ? 'active' : ''} onClick={() => setFilter('solved')}>
                            Đã giải
                        </button>
                        <button className={filter === 'unsolved' ? 'active' : ''} onClick={() => setFilter('unsolved')}>
                            Chưa giải
                        </button>
                    </div>
                </div>

                <div className="filter-group">
                    <label>Độ khó:</label>
                    <div className="filter-buttons">
                        <button
                            className={difficultyFilter === 'all' ? 'active' : ''}
                            onClick={() => setDifficultyFilter('all')}
                        >
                            Tất cả
                        </button>
                        <button
                            className={difficultyFilter === 'easy' ? 'active' : ''}
                            onClick={() => setDifficultyFilter('easy')}
                        >
                            Dễ
                        </button>
                        <button
                            className={difficultyFilter === 'medium' ? 'active' : ''}
                            onClick={() => setDifficultyFilter('medium')}
                        >
                            Trung bình
                        </button>
                        <button
                            className={difficultyFilter === 'hard' ? 'active' : ''}
                            onClick={() => setDifficultyFilter('hard')}
                        >
                            Khó
                        </button>
                    </div>
                </div>
            </div>

            <div className="problems-list">
                {filteredProblems.length === 0 ? (
                    <div className="empty-state">
                        <FaStar />
                        <p>Không tìm thấy bài tập nào phù hợp với bộ lọc.</p>
                    </div>
                ) : (
                    <>
                        <table className="problems-table">
                            <thead>
                                <tr>
                                    <th className="col-status">Trạng thái</th>
                                    <th className="col-title">Tên bài</th>
                                    <th className="col-difficulty">Độ khó</th>
                                    <th className="col-submissions">Lượt nộp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProblems.map((cp) => (
                                    <tr key={cp.id} className={`problem-row ${getProblemStatusClass(cp.problem_id)}`}>
                                        <td className="col-status">{getProblemStatusIcon(cp.problem_id)}</td>
                                        <td className="col-title">
                                            <Link to={`/problems/${cp.problem_id}`} className="problem-link">
                                                {cp.problem_title}
                                            </Link>
                                            <span className="problem-slug">{cp.problem_slug}</span>
                                        </td>
                                        <td className="col-difficulty">
                                            <span
                                                className={`difficulty-badge ${getDifficultyClass(
                                                    cp.problem_difficulty,
                                                )}`}
                                            >
                                                {getDifficultyLabel(cp.problem_difficulty)}
                                            </span>
                                        </td>
                                        <td className="col-submissions">
                                            {userSubmissions[cp.problem_id]?.count || 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {pagination.total_pages > 1 && (
                            <div className="pagination-controls">
                                <button
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!pagination.has_previous}
                                >
                                    ← Trang trước
                                </button>

                                <div className="pagination-info">
                                    <span className="page-numbers">
                                        {(() => {
                                            const pages = [];
                                            const maxVisible = 5;
                                            let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                            let endPage = Math.min(pagination.total_pages, startPage + maxVisible - 1);

                                            if (endPage - startPage < maxVisible - 1) {
                                                startPage = Math.max(1, endPage - maxVisible + 1);
                                            }

                                            if (startPage > 1) {
                                                pages.push(
                                                    <button
                                                        key={1}
                                                        className="page-number"
                                                        onClick={() => handlePageChange(1)}
                                                    >
                                                        1
                                                    </button>,
                                                );
                                                if (startPage > 2) {
                                                    pages.push(
                                                        <span key="ellipsis1" className="ellipsis">
                                                            ...
                                                        </span>,
                                                    );
                                                }
                                            }

                                            for (let i = startPage; i <= endPage; i++) {
                                                pages.push(
                                                    <button
                                                        key={i}
                                                        className={`page-number ${i === currentPage ? 'active' : ''}`}
                                                        onClick={() => handlePageChange(i)}
                                                    >
                                                        {i}
                                                    </button>,
                                                );
                                            }

                                            if (endPage < pagination.total_pages) {
                                                if (endPage < pagination.total_pages - 1) {
                                                    pages.push(
                                                        <span key="ellipsis2" className="ellipsis">
                                                            ...
                                                        </span>,
                                                    );
                                                }
                                                pages.push(
                                                    <button
                                                        key={pagination.total_pages}
                                                        className="page-number"
                                                        onClick={() => handlePageChange(pagination.total_pages)}
                                                    >
                                                        {pagination.total_pages}
                                                    </button>,
                                                );
                                            }

                                            return pages;
                                        })()}
                                    </span>
                                    <span className="pagination-text">
                                        Trang {currentPage} / {pagination.total_pages}
                                    </span>
                                </div>

                                <button
                                    className="pagination-btn"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!pagination.has_next}
                                >
                                    Trang sau →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Practice;
