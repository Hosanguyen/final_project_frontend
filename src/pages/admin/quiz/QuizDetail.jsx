import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaArrowLeft,
    FaEdit,
    FaTrash,
    FaClock,
    FaQuestionCircle,
    FaCheckCircle,
    FaChevronDown,
    FaChevronUp,
} from 'react-icons/fa';
import QuizService from '../../../services/QuizService';
import notification from '../../../utils/notification';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import './QuizDetail.css';

const QuizDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [expandedQuestions, setExpandedQuestions] = useState(new Set());

    useDocumentTitle(quiz ? `Quản trị - ${quiz.title}` : 'Chi tiết trắc nghiệm');

    useEffect(() => {
        loadQuizDetail();
    }, [id]);

    const loadQuizDetail = async () => {
        setLoading(true);
        try {
            const data = await QuizService.getById(id);
            setQuiz(data);
        } catch (error) {
            notification.error('Không thể tải chi tiết quiz');
            console.error('Error loading quiz detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await QuizService.delete(id);
            notification.success('Xóa quiz thành công');
            navigate('/admin/quizzes');
        } catch (error) {
            notification.error('Không thể xóa quiz');
            console.error('Error deleting quiz:', error);
        }
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes} phút ${remainingSeconds > 0 ? remainingSeconds + ' giây' : ''}`;
    };

    const toggleQuestion = (index) => {
        const newExpanded = new Set(expandedQuestions);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedQuestions(newExpanded);
    };

    if (loading) {
        return (
            <div className="quiz-detail-loading">
                <div className="quiz-detail-spinner"></div>
                <p>Đang tải chi tiết quiz...</p>
            </div>
        );
    }

    if (!quiz) {
        return <div className="quiz-detail-error">Không tìm thấy quiz</div>;
    }

    return (
        <div className="quiz-detail">
            {/* Header */}
            <div className="quiz-detail-page-header">
                <div className="quiz-detail-header-left">
                    <h1>{quiz.title}</h1>
                    <p className="quiz-detail-subtitle">Chi tiết thông tin quiz</p>
                </div>
                <div className="quiz-detail-header-actions">
                    <button className="quiz-detail-btn-back" onClick={() => navigate('/admin/quizzes')}>
                        <FaArrowLeft /> Quay lại
                    </button>
                    <button className="quiz-detail-btn-edit" onClick={() => navigate(`/admin/quizzes/${id}/edit`)}>
                        <FaEdit /> Chỉnh sửa
                    </button>
                    <button className="quiz-detail-btn-delete" onClick={() => setShowDeleteModal(true)}>
                        <FaTrash /> Xóa
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="quiz-detail-content">
                {/* Basic Info */}
                <div className="quiz-detail-info-card">
                    <h2 className="quiz-detail-card-title">Thông tin cơ bản</h2>
                    <div className="quiz-detail-info-grid">
                        <div className="quiz-detail-info-item">
                            <span className="quiz-detail-info-label">ID:</span>
                            <span>{quiz.id}</span>
                        </div>
                        <div className="quiz-detail-info-item">
                            <span className="quiz-detail-info-label">Tiêu đề:</span>
                            <span>{quiz.title}</span>
                        </div>
                        <div className="quiz-detail-info-item">
                            <span className="quiz-detail-info-label">Thời gian:</span>
                            <span>
                                <FaClock /> {formatDuration(quiz.time_limit_seconds)}
                            </span>
                        </div>
                        <div className="quiz-detail-info-item">
                            <span className="quiz-detail-info-label">Số câu hỏi:</span>
                            <span>
                                <FaQuestionCircle /> {quiz.question_count || 0}
                            </span>
                        </div>
                        <div className="quiz-detail-info-item">
                            <span className="quiz-detail-info-label">Trạng thái:</span>
                            <span
                                className={`quiz-detail-status-badge ${
                                    quiz.is_published ? 'quiz-detail-status-published' : 'quiz-detail-status-draft'
                                }`}
                            >
                                {quiz.is_published ? 'Đã công khai' : 'Nháp'}
                            </span>
                        </div>
                        <div className="quiz-detail-info-item">
                            <span className="quiz-detail-info-label">Người tạo:</span>
                            <span>{quiz.created_by?.full_name || 'N/A'}</span>
                        </div>
                        <div className="quiz-detail-info-item">
                            <span className="quiz-detail-info-label">Ngày tạo:</span>
                            <span>{new Date(quiz.created_at).toLocaleString('vi-VN')}</span>
                        </div>
                        <div className="quiz-detail-info-item">
                            <span className="quiz-detail-info-label">Cập nhật:</span>
                            <span>{new Date(quiz.updated_at).toLocaleString('vi-VN')}</span>
                        </div>
                        {quiz.description && (
                            <div className="quiz-detail-info-item quiz-detail-full-width">
                                <span className="quiz-detail-info-label">Mô tả:</span>
                                <div
                                    className="quiz-detail-description"
                                    dangerouslySetInnerHTML={{ __html: quiz.description }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Lessons */}
                {quiz.lessons && quiz.lessons.length > 0 && (
                    <div className="quiz-detail-info-card">
                        <h2 className="quiz-detail-card-title">Bài học liên quan</h2>
                        <div className="quiz-detail-lessons-list">
                            {quiz.lessons.map((lesson) => (
                                <div key={lesson.id} className="quiz-detail-lesson-item">
                                    <FaCheckCircle className="quiz-detail-lesson-icon" />
                                    <span>{lesson.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Questions */}
                {quiz.questions && quiz.questions.length > 0 && (
                    <div className="quiz-detail-info-card">
                        <h2 className="quiz-detail-card-title">Danh sách câu hỏi ({quiz.questions.length})</h2>
                        <div className="quiz-detail-questions-list">
                            {quiz.questions.map((question, index) => (
                                <div key={question.id} className="quiz-detail-question-item">
                                    <div className="quiz-detail-question-header" onClick={() => toggleQuestion(index)}>
                                        <h3>
                                            Câu {index + 1}
                                            {question.content && (
                                                <span className="quiz-detail-question-preview">
                                                    {' '}
                                                    - {question.content.substring(0, 50)}
                                                    {question.content.length > 50 ? '...' : ''}
                                                </span>
                                            )}
                                        </h3>
                                        <div className="quiz-detail-question-header-right">
                                            <div className="quiz-detail-question-meta">
                                                <span className="quiz-detail-question-type">
                                                    {question.question_type === 1 ? 'Một đáp án' : 'Nhiều đáp án'}
                                                </span>
                                                <span className="quiz-detail-question-points">
                                                    {question.points} điểm
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="quiz-detail-btn-toggle-question"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleQuestion(index);
                                                }}
                                            >
                                                {expandedQuestions.has(index) ? <FaChevronUp /> : <FaChevronDown />}
                                            </button>
                                        </div>
                                    </div>
                                    {expandedQuestions.has(index) && (
                                        <div className="quiz-detail-question-body">
                                            <p className="quiz-detail-question-content">{question.content}</p>
                                            <div className="quiz-detail-options-list">
                                                {question.options?.map((option, oIndex) => (
                                                    <div
                                                        key={option.id}
                                                        className={`quiz-detail-option-item ${
                                                            option.is_correct ? 'quiz-detail-option-correct' : ''
                                                        }`}
                                                    >
                                                        <span className="quiz-detail-option-label">
                                                            {String.fromCharCode(65 + oIndex)}.
                                                        </span>
                                                        <span className="quiz-detail-option-content">
                                                            {option.option_text}
                                                        </span>
                                                        {option.is_correct && (
                                                            <FaCheckCircle className="quiz-detail-correct-icon" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="quiz-detail-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="quiz-detail-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Xác nhận xóa</h3>
                        <p>
                            Bạn có chắc chắn muốn xóa quiz <strong>"{quiz.title}"</strong>?
                        </p>
                        <div className="quiz-detail-modal-actions">
                            <button className="quiz-detail-btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                Hủy
                            </button>
                            <button className="quiz-detail-btn-confirm-delete" onClick={handleDelete}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizDetail;
