import React, { useState, useEffect } from 'react';
import { FaClipboardList, FaTrophy, FaClock, FaCheckCircle, FaEye } from 'react-icons/fa';
import QuizService from '../../services/QuizService';
import './QuizHistory.css';

const QuizHistory = ({ courseId, lessonId, onViewResult }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 10,
        total_pages: 1,
    });

    useEffect(() => {
        loadSubmissions();
    }, [courseId, lessonId, pagination.page]);

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                page_size: pagination.page_size,
                status: 'submitted',
            };

            if (lessonId) {
                params.lesson_id = lessonId;
            }

            const response = await QuizService.getSubmissions(params);
            setSubmissions(response.results || []);
            setPagination((prev) => ({
                ...prev,
                total_pages: response.total_pages || 1,
            }));
        } catch (error) {
            console.error('Error loading submissions:', error);
            setSubmissions([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getScoreColor = (score, maxScore) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return '#4caf50';
        if (percentage >= 60) return '#ff9800';
        return '#f44336';
    };

    const calculateMaxScore = (submission) => {
        return submission.quiz_snapshot?.questions?.reduce((sum, q) => sum + q.points, 0) || 0;
    };

    if (loading) {
        return (
            <div className="quiz-history-container">
                <div className="quiz-history-loading">Đang tải lịch sử...</div>
            </div>
        );
    }

    return (
        <div className="quiz-history-container">
            <div className="quiz-history-header">
                <h3>
                    <FaClipboardList /> Lịch sử làm bài Quiz
                </h3>
                {submissions.length > 0 && <span className="quiz-history-count">{submissions.length} bài đã nộp</span>}
            </div>

            {submissions.length === 0 ? (
                <div className="quiz-history-empty">
                    <FaClipboardList />
                    <p>Bạn chưa nộp bài quiz nào</p>
                </div>
            ) : (
                <div className="quiz-history-list">
                    {submissions.map((submission) => {
                        const maxScore = calculateMaxScore(submission);
                        const scoreColor = getScoreColor(submission.total_score, maxScore);
                        const scorePercentage =
                            maxScore > 0 ? Math.round((submission.total_score / maxScore) * 100) : 0;

                        return (
                            <div key={submission.id} className="quiz-history-card">
                                <div className="quiz-history-card-header">
                                    <div className="quiz-history-card-title">
                                        <FaClipboardList className="quiz-icon" />
                                        <span>{submission.quiz_title || 'Quiz'}</span>
                                    </div>
                                    {submission.lesson_title && (
                                        <span className="quiz-history-lesson">Bài học: {submission.lesson_title}</span>
                                    )}
                                </div>

                                <div className="quiz-history-card-body">
                                    <div className="quiz-history-score">
                                        <div className="score-circle" style={{ borderColor: scoreColor }}>
                                            <span className="score-value" style={{ color: scoreColor }}>
                                                {submission.total_score?.toFixed(1) || 0}
                                            </span>
                                            <span className="score-max">/ {maxScore}</span>
                                        </div>
                                        <div className="score-percentage" style={{ color: scoreColor }}>
                                            {scorePercentage}%
                                        </div>
                                    </div>

                                    <div className="quiz-history-info">
                                        <div className="info-item">
                                            <FaCheckCircle />
                                            <span>{submission.quiz_snapshot?.questions?.length || 0} câu hỏi</span>
                                        </div>
                                        <div className="info-item">
                                            <FaClock />
                                            <span>{formatDate(submission.submitted_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="quiz-history-card-footer">
                                    <button className="btn-view-result" onClick={() => onViewResult(submission.id)}>
                                        <FaEye /> Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {pagination.total_pages > 1 && (
                <div className="quiz-history-pagination">
                    <button
                        disabled={pagination.page === 1}
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    >
                        Trang trước
                    </button>
                    <span className="pagination-info">
                        Trang {pagination.page} / {pagination.total_pages}
                    </span>
                    <button
                        disabled={pagination.page >= pagination.total_pages}
                        onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Trang sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizHistory;
