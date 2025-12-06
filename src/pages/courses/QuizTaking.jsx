import React, { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import QuizService from '../../services/QuizService';
import notification from '../../utils/notification';
import './QuizTaking.css';

const QuizTaking = ({ quiz, lessonId, onBack, onComplete }) => {
    const [submission, setSubmission] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Key để lưu thời gian trong localStorage
    const getStorageKey = (submissionId) => `quiz_timer_${submissionId}`;

    useEffect(() => {
        startQuiz();
    }, [quiz.id]);

    // Timer effect - chạy liên tục và lưu vào localStorage
    useEffect(() => {
        if (!submission || timeLeft === null || timeLeft <= 0 || submitting) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const newTime = prev - 1;

                // Lưu thời gian còn lại vào localStorage
                if (submission.id) {
                    localStorage.setItem(getStorageKey(submission.id), newTime.toString());
                }

                // Tự động nộp bài khi hết giờ
                if (newTime <= 0) {
                    handleSubmitQuiz(true);
                    return 0;
                }

                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submission, submitting]);

    const startQuiz = async () => {
        try {
            setLoading(true);

            // Kiểm tra xem có submission đang làm dở không
            const submissionsResponse = await QuizService.getSubmissions({
                quiz_id: quiz.id,
                status: 'in_progress',
                page: 1,
                page_size: 1,
            });

            let response;
            if (submissionsResponse.results && submissionsResponse.results.length > 0) {
                // Có submission đang làm dở - tiếp tục
                response = submissionsResponse.results[0];
                notification.info('Tiếp tục làm bài quiz');
            } else {
                // Tạo submission mới
                response = await QuizService.startSubmission(quiz.id, lessonId);
                notification.success('Bắt đầu làm bài quiz');
            }

            setSubmission(response);

            // Tính toán thời gian còn lại
            if (quiz.time_limit_seconds) {
                const storageKey = getStorageKey(response.id);
                const savedTime = localStorage.getItem(storageKey);

                if (savedTime !== null) {
                    // Có thời gian đã lưu - tiếp tục từ đó
                    const remainingTime = parseInt(savedTime);
                    if (remainingTime > 0) {
                        setTimeLeft(remainingTime);
                        const mins = Math.floor(remainingTime / 60);
                        const secs = remainingTime % 60;
                        notification.info(`Thời gian còn lại: ${mins}:${secs.toString().padStart(2, '0')}`);
                    } else {
                        // Hết giờ rồi - tự động nộp
                        setTimeLeft(0);
                        setTimeout(() => handleSubmitQuiz(true), 100);
                    }
                } else {
                    // Lần đầu làm bài - khởi tạo thời gian
                    setTimeLeft(quiz.time_limit_seconds);
                    localStorage.setItem(storageKey, quiz.time_limit_seconds.toString());
                }
            }
        } catch (error) {
            console.error('Error starting quiz:', error);
            notification.error('Không thể bắt đầu quiz');
            onBack();
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = async (questionId, optionId, questionType) => {
        const newAnswers = { ...answers };

        if (questionType === 'single') {
            // Single choice: chỉ chọn 1
            newAnswers[questionId] = [optionId];
        } else {
            // Multiple choice: có thể chọn nhiều
            if (!newAnswers[questionId]) {
                newAnswers[questionId] = [];
            }

            const index = newAnswers[questionId].indexOf(optionId);
            if (index > -1) {
                newAnswers[questionId].splice(index, 1);
            } else {
                newAnswers[questionId].push(optionId);
            }
        }

        setAnswers(newAnswers);

        // Gửi câu trả lời lên server
        try {
            await QuizService.submitAnswer(submission.id, {
                question_id: questionId,
                selected_option_ids: newAnswers[questionId] || [],
            });
        } catch (error) {
            console.error('Error submitting answer:', error);
            notification.error('Không thể lưu câu trả lời');
        }
    };

    const handleSubmitQuiz = async (autoSubmit = false) => {
        if (submitting) return;

        const unansweredCount = getUnansweredCount();

        // Nếu không phải tự động nộp và còn câu chưa trả lời thì hỏi xác nhận
        if (!autoSubmit && unansweredCount > 0) {
            const confirm = window.confirm(`Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc muốn nộp bài?`);
            if (!confirm) return;
        }

        try {
            setSubmitting(true);
            const result = await QuizService.submitQuiz(submission.id);

            // Xóa thời gian đã lưu trong localStorage
            if (submission.id) {
                localStorage.removeItem(getStorageKey(submission.id));
            }

            if (autoSubmit) {
                notification.warning('Hết thời gian làm bài! Bài làm đã được tự động nộp.');
            } else {
                notification.success('Nộp bài thành công!');
            }

            onComplete(result);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            notification.error('Không thể nộp bài');
        } finally {
            setSubmitting(false);
        }
    };

    const getUnansweredCount = () => {
        const questions = submission?.quiz_snapshot?.questions || [];
        return questions.filter((q) => !answers[q.question_id] || answers[q.question_id].length === 0).length;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) {
        return (
            <div className="quiz-taking-container">
                <div className="quiz-taking-loading">Đang tải quiz...</div>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="quiz-taking-container">
                <div className="quiz-taking-error">Không thể tải quiz</div>
            </div>
        );
    }

    const questions = submission.quiz_snapshot?.questions || [];
    const answeredCount = Object.keys(answers).filter((qId) => answers[qId]?.length > 0).length;

    return (
        <div className="quiz-taking-container">
            <div className="quiz-taking-header">
                <button className="quiz-back-btn" onClick={onBack}>
                    <FaArrowLeft /> Quay lại
                </button>
                <div className="quiz-taking-info">
                    <h2>{submission.quiz_snapshot?.title || quiz.title}</h2>
                    <div className="quiz-taking-meta">
                        <span className="quiz-progress">
                            Đã trả lời: {answeredCount}/{questions.length}
                        </span>
                        {timeLeft !== null && (
                            <span className={`quiz-timer ${timeLeft < 60 ? 'warning' : ''}`}>
                                <FaClock /> {formatTime(timeLeft)}
                            </span>
                        )}
                    </div>
                </div>
                <button className="quiz-submit-btn" onClick={handleSubmitQuiz} disabled={submitting}>
                    {submitting ? 'Đang nộp...' : 'Nộp bài'}
                </button>
            </div>

            <div className="quiz-taking-content">
                {questions.length === 0 ? (
                    <div className="quiz-no-questions">Không có câu hỏi nào</div>
                ) : (
                    questions.map((question, index) => (
                        <div key={question.question_id} className="quiz-question-card">
                            <div className="quiz-question-header">
                                <span className="quiz-question-number">Câu {index + 1}</span>
                                <span className="quiz-question-points">{question.points} điểm</span>
                            </div>
                            <div className="quiz-question-content">
                                <p dangerouslySetInnerHTML={{ __html: question.content }} />
                            </div>
                            <div className="quiz-question-type">
                                {question.question_type === 'single' ? '(Chọn 1 đáp án)' : '(Chọn nhiều đáp án)'}
                            </div>
                            <div className="quiz-options-list">
                                {question.options.map((option) => {
                                    const isSelected = answers[question.question_id]?.includes(option.option_id);
                                    return (
                                        <label
                                            key={option.option_id}
                                            className={`quiz-option ${isSelected ? 'selected' : ''}`}
                                        >
                                            <input
                                                type={question.question_type === 'single' ? 'radio' : 'checkbox'}
                                                name={`question-${question.question_id}`}
                                                checked={isSelected}
                                                onChange={() =>
                                                    handleAnswerChange(
                                                        question.question_id,
                                                        option.option_id,
                                                        question.question_type,
                                                    )
                                                }
                                            />
                                            <span className="quiz-option-text">{option.option_text}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default QuizTaking;
