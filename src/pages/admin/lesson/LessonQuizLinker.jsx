import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaClock, FaListOl, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import QuizService from '../../../services/QuizService';
import notification from '../../../utils/notification';
import Pagination from '../../../components/Pagination';
import './LessonQuizLinker.css';

const LessonQuizLinker = ({ selectedQuizIds, onQuizIdsChange }) => {
    const navigate = useNavigate();
    const [availableQuizzes, setAvailableQuizzes] = useState([]);
    const [selectedQuizzes, setSelectedQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSelector, setShowSelector] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 10,
        total: 0,
        total_pages: 0,
    });

    useEffect(() => {
        if (showSelector) {
            loadAvailableQuizzes();
        }
    }, [showSelector, pagination.page]);

    useEffect(() => {
        const loadData = async () => {
            if (selectedQuizIds && selectedQuizIds.length > 0) {
                try {
                    const quizzes = [];
                    for (const quizId of selectedQuizIds) {
                        try {
                            const quiz = await QuizService.getById(quizId);
                            quizzes.push(quiz);
                        } catch (error) {
                            console.error(`Error loading quiz ${quizId}:`, error);
                        }
                    }
                    setSelectedQuizzes(quizzes);
                } catch (error) {
                    console.error('Error loading selected quizzes:', error);
                }
            } else {
                setSelectedQuizzes([]);
            }
        };
        loadData();
    }, [selectedQuizIds]);

    const loadAvailableQuizzes = async () => {
        try {
            setLoading(true);
            const response = await QuizService.getAll({
                is_published: true,
                page: pagination.page,
                page_size: pagination.page_size,
            });

            // Xử lý response có thể là array hoặc object với pagination
            if (Array.isArray(response)) {
                // API cũ trả về array trực tiếp
                setAvailableQuizzes(response);
                setPagination((prev) => ({
                    ...prev,
                    total: response.length,
                    total_pages: 1,
                }));
            } else {
                // API mới trả về object với pagination
                setAvailableQuizzes(response.results || []);
                setPagination((prev) => ({
                    ...prev,
                    total: response.count || 0,
                    total_pages: response.total_pages || 0,
                }));
            }
        } catch (error) {
            console.error('Error loading quizzes:', error);
            notification.error('Không thể tải danh sách quiz');
            setAvailableQuizzes([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuiz = (quiz) => {
        if (!selectedQuizIds.includes(quiz.id)) {
            const newQuizIds = [...selectedQuizIds, quiz.id];
            onQuizIdsChange(newQuizIds);
            setSelectedQuizzes([...selectedQuizzes, quiz]);
            notification.success(`Đã thêm quiz: ${quiz.title}`);
        }
    };

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    const handleRemoveQuiz = (quizId) => {
        const newQuizIds = selectedQuizIds.filter((id) => id !== quizId);
        onQuizIdsChange(newQuizIds);
        setSelectedQuizzes(selectedQuizzes.filter((q) => q.id !== quizId));
        notification.success('Đã xóa quiz khỏi bài học');
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes} phút ${remainingSeconds > 0 ? remainingSeconds + ' giây' : ''}`;
    };

    const handleCreateNewQuiz = () => {
        navigate('/admin/quizzes/create');
    };

    return (
        <div className="lesson-quiz-linker">
            <div className="lesson-quiz-linker-header">
                <h2>Quiz cho bài học</h2>
                <div className="lesson-quiz-linker-actions">
                    <button
                        type="button"
                        className="lesson-quiz-linker-btn lesson-quiz-linker-btn-add"
                        onClick={() => setShowSelector(!showSelector)}
                    >
                        <FaPlus /> Thêm Quiz có sẵn
                    </button>
                    <button
                        type="button"
                        className="lesson-quiz-linker-btn lesson-quiz-linker-btn-create"
                        onClick={handleCreateNewQuiz}
                    >
                        <FaExternalLinkAlt /> Tạo Quiz mới
                    </button>
                </div>
            </div>

            {/* Quiz Selector Modal */}
            {showSelector && (
                <>
                    <div className="lesson-quiz-linker-overlay" onClick={() => setShowSelector(false)}></div>
                    <div className="lesson-quiz-linker-selector">
                        <div className="lesson-quiz-linker-selector-header">
                            <h3>Chọn Quiz từ danh sách</h3>
                            <button
                                type="button"
                                className="lesson-quiz-linker-btn-close"
                                onClick={() => setShowSelector(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="lesson-quiz-linker-selector-body">
                            {loading ? (
                                <div className="lesson-quiz-linker-loading">Đang tải...</div>
                            ) : availableQuizzes.length === 0 ? (
                                <div className="lesson-quiz-linker-empty">
                                    <p>Không có quiz nào</p>
                                </div>
                            ) : (
                                <>
                                    <div className="lesson-quiz-linker-quiz-list">
                                        {availableQuizzes.map((quiz) => (
                                            <div
                                                key={quiz.id}
                                                className={`lesson-quiz-linker-quiz-item ${
                                                    selectedQuizIds.includes(quiz.id) ? 'selected' : ''
                                                }`}
                                            >
                                                <div className="quiz-item-info">
                                                    <h4>{quiz.title}</h4>
                                                    <div className="quiz-item-meta">
                                                        <span>
                                                            <FaListOl /> {quiz.question_count || 0} câu
                                                        </span>
                                                        <span>
                                                            <FaClock /> {formatDuration(quiz.time_limit_seconds)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={`lesson-quiz-linker-btn-select ${
                                                        selectedQuizIds.includes(quiz.id) ? 'selected' : ''
                                                    }`}
                                                    onClick={() => handleAddQuiz(quiz)}
                                                    disabled={selectedQuizIds.includes(quiz.id)}
                                                >
                                                    {selectedQuizIds.includes(quiz.id) ? 'Đã chọn' : 'Chọn'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    <Pagination
                                        currentPage={pagination.page}
                                        totalPages={pagination.total_pages}
                                        totalItems={pagination.total}
                                        onPageChange={handlePageChange}
                                        itemsPerPage={pagination.page_size}
                                        showItemCount={false}
                                        showFirstLast={false}
                                        className="lesson-quiz-linker-pagination"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Selected Quizzes List */}
            <div className="lesson-quiz-linker-selected">
                {selectedQuizzes.length === 0 ? (
                    <div className="lesson-quiz-linker-empty">
                        <p>Chưa có quiz nào được chọn</p>
                        <p className="hint">Nhấn "Thêm Quiz có sẵn" để chọn quiz hoặc "Tạo Quiz mới" để tạo mới</p>
                    </div>
                ) : (
                    <div className="lesson-quiz-linker-selected-list">
                        {selectedQuizzes.map((quiz, index) => (
                            <div key={quiz.id} className="lesson-quiz-linker-selected-item">
                                <div className="selected-item-number">{index + 1}</div>
                                <div className="selected-item-content">
                                    <h4>{quiz.title}</h4>
                                    <div className="selected-item-meta">
                                        <span>
                                            <FaListOl /> {quiz.question_count || 0} câu
                                        </span>
                                        <span>
                                            <FaClock /> {formatDuration(quiz.time_limit_seconds)}
                                        </span>
                                        <span className="quiz-points">{quiz.total_points || 0} điểm</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="lesson-quiz-linker-btn-remove"
                                    onClick={() => handleRemoveQuiz(quiz.id)}
                                    title="Xóa quiz"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonQuizLinker;
