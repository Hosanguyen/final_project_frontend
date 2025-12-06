import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaArrowLeft, FaEye } from 'react-icons/fa';
import QuizService from '../../services/QuizService';
import './QuizResult.css';

const QuizResult = ({ submissionId, onBack, onViewHistory }) => {
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAnswers, setShowAnswers] = useState(false);

    useEffect(() => {
        loadSubmission();
    }, [submissionId]);

    const loadSubmission = async () => {
        try {
            setLoading(true);
            const data = await QuizService.getSubmissionById(submissionId);
            setSubmission(data);
        } catch (error) {
            console.error('Error loading submission:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAnswerStatus = (question, userAnswers) => {
        const correctOptions = question.options.filter((opt) => opt.is_correct).map((opt) => opt.option_id);
        // Backend trả về selected_option là ID (integer), không phải object
        const selectedOptions = userAnswers.map((ans) => ans.selected_option).filter(Boolean);

        const isCorrect =
            correctOptions.length === selectedOptions.length &&
            correctOptions.every((opt) => selectedOptions.includes(opt));

        return { isCorrect, correctOptions, selectedOptions };
    };

    const calculateStats = () => {
        if (!submission?.quiz_snapshot?.questions) return { correct: 0, incorrect: 0, total: 0 };

        const questions = submission.quiz_snapshot.questions;
        let correct = 0;
        let incorrect = 0;

        questions.forEach((question) => {
            const userAnswers = submission.answers?.filter((ans) => ans.question === question.question_id) || [];
            const { isCorrect } = getAnswerStatus(question, userAnswers);
            if (isCorrect) correct++;
            else incorrect++;
        });

        return { correct, incorrect, total: questions.length };
    };

    const getScorePercentage = () => {
        if (!submission?.quiz_snapshot?.questions) return 0;
        const totalPoints = submission.quiz_snapshot.questions.reduce((sum, q) => sum + q.points, 0);
        if (totalPoints === 0) return 0;
        return Math.round((submission.total_score / totalPoints) * 100);
    };

    if (loading) {
        return (
            <div className="quiz-result-container">
                <div className="quiz-result-loading">Đang tải kết quả...</div>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="quiz-result-container">
                <div className="quiz-result-error">Không thể tải kết quả</div>
            </div>
        );
    }

    const stats = calculateStats();
    const scorePercentage = getScorePercentage();
    const totalPoints = submission.quiz_snapshot?.questions?.reduce((sum, q) => sum + q.points, 0) || 0;

    return (
        <div className="quiz-result-container">
            <div className="quiz-result-header">
                <button className="quiz-result-back-btn" onClick={onBack}>
                    <FaArrowLeft /> Quay lại
                </button>
            </div>

            <div className="quiz-result-content">
                {/* Score Summary Card */}
                <div className="quiz-result-summary">
                    <div className="quiz-result-trophy">
                        <FaTrophy />
                    </div>
                    <h2>Kết quả bài làm</h2>
                    <div className="quiz-result-score">
                        <span className="score-number">{submission.total_score?.toFixed(1) || 0}</span>
                        <span className="score-total">/ {totalPoints}</span>
                    </div>
                    <div className="quiz-result-percentage">
                        <div className="percentage-circle" data-percentage={scorePercentage}>
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <path
                                    className="circle-bg"
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="circle"
                                    strokeDasharray={`${scorePercentage}, 100`}
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <text x="18" y="20.35" className="percentage-text">
                                    {scorePercentage}%
                                </text>
                            </svg>
                        </div>
                    </div>
                    <div className="quiz-result-stats">
                        <div className="stat-item correct">
                            <FaCheckCircle />
                            <span>{stats.correct} đúng</span>
                        </div>
                        <div className="stat-item incorrect">
                            <FaTimesCircle />
                            <span>{stats.incorrect} sai</span>
                        </div>
                    </div>

                    <div className="quiz-result-actions">
                        <button className="btn-view-answers" onClick={() => setShowAnswers(!showAnswers)}>
                            <FaEye /> {showAnswers ? 'Ẩn đáp án' : 'Xem đáp án'}
                        </button>
                        {onViewHistory && (
                            <button className="btn-view-history" onClick={onViewHistory}>
                                Xem lịch sử
                            </button>
                        )}
                    </div>
                </div>

                {/* Answer Review */}
                {showAnswers && (
                    <div className="quiz-result-answers">
                        <h3>Chi tiết câu trả lời</h3>
                        {submission.quiz_snapshot?.questions?.map((question, index) => {
                            const userAnswers =
                                submission.answers?.filter((ans) => ans.question === question.question_id) || [];
                            const { isCorrect, correctOptions, selectedOptions } = getAnswerStatus(
                                question,
                                userAnswers,
                            );

                            return (
                                <div
                                    key={question.question_id}
                                    className={`quiz-review-card ${isCorrect ? 'correct' : 'incorrect'}`}
                                >
                                    <div className="quiz-review-header">
                                        <div className="quiz-review-number">
                                            {isCorrect ? (
                                                <FaCheckCircle className="icon-correct" />
                                            ) : (
                                                <FaTimesCircle className="icon-incorrect" />
                                            )}
                                            <span>Câu {index + 1}</span>
                                        </div>
                                        <span className="quiz-review-points">
                                            {userAnswers[0]?.points_awarded?.toFixed(1) || 0} / {question.points} điểm
                                        </span>
                                    </div>
                                    <div className="quiz-review-question">
                                        <p dangerouslySetInnerHTML={{ __html: question.content }} />
                                    </div>
                                    <div className="quiz-review-options">
                                        {question.options.map((option) => {
                                            const isSelected = selectedOptions.includes(option.option_id);
                                            const isCorrectOption = correctOptions.includes(option.option_id);

                                            let optionClass = 'quiz-review-option';
                                            if (isSelected && isCorrectOption) {
                                                optionClass += ' selected-correct';
                                            } else if (isSelected && !isCorrectOption) {
                                                optionClass += ' selected-incorrect';
                                            } else if (!isSelected && isCorrectOption) {
                                                optionClass += ' correct-answer';
                                            }

                                            return (
                                                <div key={option.option_id} className={optionClass}>
                                                    <span className="option-indicator">
                                                        {isSelected && isCorrectOption && <FaCheckCircle />}
                                                        {isSelected && !isCorrectOption && <FaTimesCircle />}
                                                        {!isSelected && isCorrectOption && <FaCheckCircle />}
                                                    </span>
                                                    <span className="option-text">{option.option_text}</span>
                                                    {isCorrectOption && !isSelected && (
                                                        <span className="correct-label">Đáp án đúng</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizResult;
