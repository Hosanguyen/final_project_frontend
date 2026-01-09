import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaClock, FaFire, FaStar, FaSearch, FaTags } from 'react-icons/fa';
import ContestService from '../../services/ContestService';
import TagService from '../../services/TagService';
import RecommendedProblems from '../../components/RecommendedProblems';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import './Practice.css';

const Practice = () => {
    useDocumentTitle('Luyện tập');
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, solved, unsolved
    const [difficultyFilter, setDifficultyFilter] = useState('all'); // all, easy, medium, hard
    const [tagFilter, setTagFilter] = useState(''); // tag id or empty for all
    const [availableTags, setAvailableTags] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [userSubmissions, setUserSubmissions] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(25); // Items per page
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
    });
    const [userStats, setUserStats] = useState({
        total_problems: 0,
        solved: 0,
        attempted: 0
    });

    useEffect(() => {
        loadPracticeProblems();
    }, [currentPage, filter, difficultyFilter, tagFilter]);

    // Load available tags on mount
    useEffect(() => {
        const loadTags = async () => {
            try {
                const tags = await TagService.getTags();
                setAvailableTags(tags || []);
            } catch (err) {
                console.error('Error loading tags:', err);
            }
        };
        loadTags();
    }, []);

    // Reset page when search query or filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [filter, difficultyFilter, tagFilter]);

    // Debounce search query
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Reload when debounced search query changes
    useEffect(() => {
        if (currentPage === 1) {
            loadPracticeProblems();
        } else {
            setCurrentPage(1);
        }
    }, [debouncedSearchQuery]);

    const loadPracticeProblems = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get contest details with problems (with pagination, search, and filters)
            const params = {
                page: currentPage,
                page_size: pageSize,
            };
            
            // Add search query if exists
            if (debouncedSearchQuery.trim()) {
                params.search = debouncedSearchQuery.trim();
            }
            
            // Add status filter
            if (filter !== 'all') {
                params.status = filter;
            }
            
            // Add difficulty filter
            if (difficultyFilter !== 'all') {
                params.difficulty = difficultyFilter;
            }
            
            // Add tag filter
            if (tagFilter) {
                params.tag = tagFilter;
            }
            
            const contestDetail = await ContestService.getPracticeContest(params);

            // API trả về field "problems" chứ không phải "contest_problems"
            const problemList = contestDetail?.problems || contestDetail?.contest_problems || [];

            // Update pagination info
            if (contestDetail?.pagination) {
                setPagination(contestDetail.pagination);
            }
            
            // Update user stats from API
            if (contestDetail?.user_stats) {
                setUserStats(contestDetail.user_stats);
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

    // Problems are already filtered by API, just use them directly
    const filteredProblems = problems;

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };
    
    const handleDifficultyChange = (newDifficulty) => {
        setDifficultyFilter(newDifficulty);
        setCurrentPage(1);
    };
    
    const handleTagChange = (tagId) => {
        setTagFilter(tagId);
        setCurrentPage(1);
    };

    const stats = {
        total: userStats.total_problems || pagination.total_items || 0,
        solved: userStats.solved || 0,
        attempted: userStats.attempted || 0,
    };

    if (loading) {
        return (
            <div className="practice-container">
                <div className="practice-loading-container">
                    <div className="practice-loading-spinner"></div>
                    <p>Đang tải danh sách bài tập...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="practice-container">
                <div className="practice-error-message">
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
                <div className="stat-card practice total">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Tổng bài tập</div>
                </div>
                <div className="stat-card practice solved">
                    <div className="stat-number">{stats.solved}</div>
                    <div className="stat-label">Đã giải</div>
                </div>
                <div className="stat-card practice attempted">
                    <div className="stat-number">{stats.attempted}</div>
                    <div className="stat-label">Đã thử</div>
                </div>
                <div className="stat-card practice progress">
                    <div className="stat-number">
                        {stats.total > 0 ? ((stats.solved / stats.total) * 100).toFixed(1) : '0.0'}%
                    </div>
                    <div className="stat-label">Tiến độ</div>
                </div>
            </div>

            {/* Recommended Problems Section */}
            <RecommendedProblems />

            <div className="practice-filters">
                <div className="filter-group search-group">
                    <label>Tìm kiếm:</label>
                    <div className="search-input-container">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên bài hoặc slug..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="clear-search"
                                title="Xóa tìm kiếm"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                <div className="filter-group">
                    <label>Trạng thái:</label>
                    <div className="filter-buttons">
                        <button className={filter === 'all' ? 'active' : ''} onClick={() => handleFilterChange('all')}>
                            Tất cả
                        </button>
                        <button className={filter === 'solved' ? 'active' : ''} onClick={() => handleFilterChange('solved')}>
                            Đã giải
                        </button>
                        <button className={filter === 'unsolved' ? 'active' : ''} onClick={() => handleFilterChange('unsolved')}>
                            Chưa giải
                        </button>
                    </div>
                </div>

                <div className="filter-group">
                    <label>Độ khó:</label>
                    <div className="filter-buttons">
                        <button
                            className={difficultyFilter === 'all' ? 'active' : ''}
                            onClick={() => handleDifficultyChange('all')}
                        >
                            Tất cả
                        </button>
                        <button
                            className={difficultyFilter === 'easy' ? 'active' : ''}
                            onClick={() => handleDifficultyChange('easy')}
                        >
                            Dễ
                        </button>
                        <button
                            className={difficultyFilter === 'medium' ? 'active' : ''}
                            onClick={() => handleDifficultyChange('medium')}
                        >
                            Trung bình
                        </button>
                        <button
                            className={difficultyFilter === 'hard' ? 'active' : ''}
                            onClick={() => handleDifficultyChange('hard')}
                        >
                            Khó
                        </button>
                    </div>
                </div>

                <div className="filter-group tag-filter-group">
                    <label><FaTags /> Tag:</label>
                    <select
                        value={tagFilter}
                        onChange={(e) => handleTagChange(e.target.value)}
                        className="tag-select"
                    >
                        <option value="">Tất cả tags</option>
                        {availableTags.map((tag) => (
                            <option key={tag.id} value={tag.id}>
                                {tag.name}
                            </option>
                        ))}
                    </select>
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
                                    <th className="col-tags">Tags</th>
                                    <th className="col-difficulty">Độ khó</th>
                                    <th className="col-submissions">Lượt nộp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProblems.map((cp) => (
                                    <tr key={cp.id} className={`problem-row ${getProblemStatusClass(cp.problem_id)}`}>
                                        <td className="col-status">{getProblemStatusIcon(cp.problem_id)}</td>
                                        <td className="col-title">
                                            <Link to={`/contest-problems/${cp.id}`} className="problem-link">
                                                {cp.problem_title}
                                            </Link>
                                            <span className="problem-slug">{cp.problem_slug}</span>
                                        </td>
                                        <td className="col-tags">
                                            <div className="tags-container">
                                                {(cp.problem_tags || []).slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag.id}
                                                        className="tag-badge"
                                                        onClick={() => handleTagChange(String(tag.id))}
                                                        title={`Lọc theo tag: ${tag.name}`}
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))}
                                                {(cp.problem_tags || []).length > 3 && (
                                                    <span className="tag-badge more" title={cp.problem_tags.map(t => t.name).join(', ')}>
                                                        +{cp.problem_tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
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
