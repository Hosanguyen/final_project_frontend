import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';
import QuizService from '../../../services/QuizService';
import notification from '../../../utils/notification';
import Pagination from '../../../components/Pagination';
import './QuizList.css';

const QuizList = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        is_published: '',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 20,
        total: 0,
        total_pages: 0,
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    useEffect(() => {
        loadQuizzes();
    }, [pagination.page, filters]);

    const loadQuizzes = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                page_size: pagination.page_size,
                search: searchTerm,
                ...filters,
            };

            const response = await QuizService.getAll(params);

            // Xử lý response có thể là array hoặc object với pagination
            if (Array.isArray(response)) {
                // API cũ trả về array trực tiếp
                setQuizzes(response);
                setPagination((prev) => ({
                    ...prev,
                    total: response.length,
                    total_pages: 1,
                }));
            } else {
                // API mới trả về object với pagination
                setQuizzes(response.results || []);
                setPagination((prev) => ({
                    ...prev,
                    total: response.count || 0,
                    total_pages: response.total_pages || 0,
                }));
            }
        } catch (error) {
            notification.error('Không thể tải danh sách quiz');
            console.error('Error loading quizzes:', error);
            setQuizzes([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination({ ...pagination, page: 1 });
        loadQuizzes();
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPagination({ ...pagination, page: 1 });
    };

    const handleDelete = async () => {
        if (!selectedQuiz) return;

        try {
            await QuizService.delete(selectedQuiz.id);
            notification.success('Xóa quiz thành công');
            setShowDeleteModal(false);
            setSelectedQuiz(null);
            loadQuizzes();
        } catch (error) {
            notification.error('Không thể xóa quiz');
            console.error('Error deleting quiz:', error);
        }
    };

    const openDeleteModal = (quiz) => {
        setSelectedQuiz(quiz);
        setShowDeleteModal(true);
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes} phút ${remainingSeconds > 0 ? remainingSeconds + ' giây' : ''}`;
    };

    if (loading && quizzes.length === 0) {
        return (
            <div className="quiz-list-loading">
                <div className="quiz-list-spinner"></div>
                <p>Đang tải danh sách quiz...</p>
            </div>
        );
    }

    return (
        <div className="quiz-list">
            {/* Header */}
            <div className="quiz-list-page-header">
                <div className="quiz-list-header-left">
                    <h1>Quản lý Quiz</h1>
                    <p className="quiz-list-subtitle">Quản lý danh sách các bài thi trắc nghiệm</p>
                </div>
                <button className="quiz-list-btn-create" onClick={() => navigate('/admin/quizzes/create')}>
                    <FaPlus /> Tạo Quiz mới
                </button>
            </div>

            {/* Content Card */}
            <div className="quiz-list-content-card">
                {/* Search & Filters */}
                <div className="quiz-list-card-header">
                    <div className="quiz-list-search-box">
                        <FaSearch className="quiz-list-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    <div className="quiz-list-filters">
                        <select
                            className="quiz-list-filter-select"
                            value={filters.is_published}
                            onChange={(e) => handleFilterChange('is_published', e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="true">Đã công khai</option>
                            <option value="false">Chưa công khai</option>
                        </select>
                    </div>

                    <div className="quiz-list-stats">
                        <span className="quiz-list-stat-item">
                            Tổng số: <strong>{pagination.total}</strong>
                        </span>
                    </div>
                </div>

                {/* Table */}
                <div className="quiz-list-table-container">
                    <table className="quiz-list-data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tiêu đề</th>
                                <th>Số câu hỏi</th>
                                <th>Thời gian</th>
                                <th>Trạng thái</th>
                                <th>Người tạo</th>
                                <th>Ngày tạo</th>
                                <th className="quiz-list-text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quizzes.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="quiz-list-no-data">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                quizzes.map((quiz) => (
                                    <tr key={quiz.id}>
                                        <td>{quiz.id}</td>
                                        <td>
                                            <div className="quiz-list-title-cell">{quiz.title}</div>
                                        </td>
                                        <td>{quiz.question_count || 0}</td>
                                        <td>{formatDuration(quiz.time_limit_seconds)}</td>
                                        <td>
                                            <span
                                                className={`quiz-list-status-badge ${
                                                    quiz.is_published
                                                        ? 'quiz-list-status-published'
                                                        : 'quiz-list-status-draft'
                                                }`}
                                            >
                                                {quiz.is_published ? 'Đã công khai' : 'Nháp'}
                                            </span>
                                        </td>
                                        <td>{quiz.created_by?.full_name || 'N/A'}</td>
                                        <td>{new Date(quiz.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td className="quiz-list-text-center">
                                            <div className="quiz-list-actions">
                                                <button
                                                    className="quiz-list-btn-icon quiz-list-btn-view"
                                                    onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    className="quiz-list-btn-icon quiz-list-btn-edit"
                                                    onClick={() => navigate(`/admin/quizzes/${quiz.id}/edit`)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="quiz-list-btn-icon quiz-list-btn-delete"
                                                    onClick={() => openDeleteModal(quiz)}
                                                    title="Xóa"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.total_pages}
                    totalItems={pagination.total}
                    onPageChange={(newPage) => setPagination({ ...pagination, page: newPage })}
                    itemsPerPage={pagination.page_size}
                    showItemCount={true}
                    showFirstLast={true}
                    className="quiz-list-pagination"
                />
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="quiz-list-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="quiz-list-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Xác nhận xóa</h3>
                        <p>
                            Bạn có chắc chắn muốn xóa quiz <strong>"{selectedQuiz?.title}"</strong>?
                        </p>
                        <div className="quiz-list-modal-actions">
                            <button className="quiz-list-btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                Hủy
                            </button>
                            <button className="quiz-list-btn-confirm-delete" onClick={handleDelete}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizList;
