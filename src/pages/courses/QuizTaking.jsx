import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaClock, FaArrowLeft } from 'react-icons/fa';
import QuizService from '../../services/QuizService';
import notification from '../../utils/notification';
import './QuizTaking.css';

const QuizTaking = ({ quiz, lessonId, onBack, onComplete }) => {
    const [submission, setSubmission] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const handleSubmitQuizRef = useRef(null);

    // Key để lưu thời gian trong localStorage
    const getStorageKey = (submissionId) => `quiz_timer_${submissionId}`;

    useEffect(() => {
        startQuiz();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

                // Cảnh báo khi còn 5 phút
                if (newTime === 300) {
                    notification.warning('⚠️ Còn 5 phút! Hãy kiểm tra lại bài làm.');
                }

                // Cảnh báo khi còn 1 phút
                if (newTime === 60) {
                    notification.error('⚠️ CHỈ CÒN 1 PHÚT! Chuẩn bị nộp bài!');
                }

                // Tự động nộp bài khi hết giờ
                if (newTime <= 0) {
                    if (handleSubmitQuizRef.current) {
                        handleSubmitQuizRef.current(true);
                    }
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
            let isResuming = false;

            if (submissionsResponse.results && submissionsResponse.results.length > 0) {
                // Có submission đang làm dở - tiếp tục
                response = submissionsResponse.results[0];
                isResuming = true;
                
                // Load lại submission chi tiết để có answers
                const detailResponse = await QuizService.getSubmissionById(response.id);
                response = detailResponse;
                
                // Load lại các câu trả lời đã lưu
                const savedAnswers = {};
                if (response.answers && response.answers.length > 0) {
                    response.answers.forEach((answer) => {
                        // API trả về: question (id), selected_option (single id)
                        const questionId = answer.question || answer.question_id;
                        const selectedOptions = answer.selected_option_ids || 
                                              (answer.selected_option ? [answer.selected_option] : []);
                        
                        if (questionId && selectedOptions.length > 0) {
                            savedAnswers[questionId] = selectedOptions;
                        }
                    });
                }
                
                console.log('Loaded saved answers:', savedAnswers); // Debug
                setAnswers(savedAnswers);
                
                notification.info('Tiếp tục làm bài quiz từ lần trước');
            } else {
                // Tạo submission mới
                response = await QuizService.startSubmission(quiz.id, lessonId);
                notification.success('Bắt đầu làm bài quiz mới');
            }

            setSubmission(response);

            // Tính toán thời gian còn lại
            // Lấy time_limit từ quiz hoặc quiz_snapshot
            const timeLimit = quiz.time_limit_seconds || response.quiz_snapshot?.time_limit_seconds;
            
            console.log('Quiz time limit:', timeLimit); // Debug

            if (timeLimit && timeLimit > 0) {
                const storageKey = getStorageKey(response.id);
                const savedTime = localStorage.getItem(storageKey);

                if (savedTime !== null && isResuming) {
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
                        setTimeout(() => {
                            if (handleSubmitQuizRef.current) {
                                handleSubmitQuizRef.current(true);
                            }
                        }, 100);
                    }
                } else {
                    // Lần đầu làm bài - khởi tạo thời gian
                    setTimeLeft(timeLimit);
                    localStorage.setItem(storageKey, timeLimit.toString());
                    
                    const mins = Math.floor(timeLimit / 60);
                    const secs = timeLimit % 60;
                    notification.success(`Thời gian làm bài: ${mins} phút ${secs} giây`);
                }
            } else {
                console.log('Quiz không có giới hạn thời gian');
                notification.info('Bài quiz không giới hạn thời gian');
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

        // questionType: 1 = single choice, 2 = multiple choice
        if (questionType === 1) {
            // Single choice: chỉ chọn 1
            newAnswers[questionId] = [optionId];
        } else if (questionType === 2) {
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

        // Gửi câu trả lời lên server ngay lập tức
        try {
            await QuizService.submitAnswer(submission.id, {
                question_id: questionId,
                selected_option_ids: newAnswers[questionId] || [],
            });
            console.log(`Đã lưu câu trả lời cho câu ${questionId}`);
        } catch (error) {
            console.error('Error submitting answer:', error);
            notification.error('Không thể lưu câu trả lời. Vui lòng thử lại!');
            
            // Rollback về trạng thái cũ nếu lưu thất bại
            setAnswers(answers);
        }
    };

    const getUnansweredCount = useCallback(() => {
        const questions = submission?.quiz_snapshot?.questions || [];
        return questions.filter((q) => !answers[q.question_id] || answers[q.question_id].length === 0).length;
    }, [submission, answers]);

    const handleSubmitQuiz = useCallback(
        async (autoSubmit = false) => {
            if (submitting) return;

            const unansweredCount = getUnansweredCount();

            // Nếu không phải tự động nộp và còn câu chưa trả lời thì hỏi xác nhận
            if (!autoSubmit && unansweredCount > 0) {
                const confirm = window.confirm(
                    `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc muốn nộp bài?`,
                );
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
                    notification.warning('⏰ HẾT GIỜ! Bài làm đã được tự động nộp.');
                } else {
                    notification.success('✅ Nộp bài thành công!');
                }

                onComplete(result);
            } catch (error) {
                console.error('Error submitting quiz:', error);
                notification.error('Không thể nộp bài. Vui lòng thử lại!');
            } finally {
                setSubmitting(false);
            }
        },
        [submitting, submission, onComplete, getUnansweredCount],
    );

    // Cập nhật ref khi handleSubmitQuiz thay đổi
    useEffect(() => {
        handleSubmitQuizRef.current = handleSubmitQuiz;
    }, [handleSubmitQuiz]);

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

    // Debug: Log để kiểm tra
    console.log('Current answers state:', answers);
    console.log('Questions:', questions.map(q => ({ id: q.question_id, options: q.options.map(o => o.option_id) })));

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
                        {timeLeft !== null && timeLeft >= 0 ? (
                            <span className={`quiz-timer ${timeLeft < 60 ? 'warning' : ''}`}>
                                <FaClock /> {formatTime(timeLeft)}
                            </span>
                        ) : (
                            <span className="quiz-timer no-limit">
                                <FaClock /> Không giới hạn
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
                    questions.map((question, index) => {
                        // Flexible question ID mapping
                        const questionId = question.question_id || question.id;
                        
                        return (
                            <div key={questionId} className="quiz-question-card">
                                <div className="quiz-question-header">
                                    <span className="quiz-question-number">Câu {index + 1}</span>
                                    <span className="quiz-question-points">{question.points} điểm</span>
                                </div>
                                <div className="quiz-question-content">
                                    <p dangerouslySetInnerHTML={{ __html: question.content }} />
                                </div>
                                <div className="quiz-question-type">
                                    {question.question_type === 1 ? '(Chọn 1 đáp án)' : '(Chọn nhiều đáp án)'}
                                </div>
                                <div className="quiz-options-list">
                                    {question.options.map((option) => {
                                        // Flexible option ID mapping
                                        const optionId = option.option_id || option.id;
                                        const isSelected = answers[questionId]?.includes(optionId);
                                        
                                        return (
                                            <label
                                                key={optionId}
                                                className={`quiz-option ${isSelected ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type={question.question_type === 1 ? 'radio' : 'checkbox'}
                                                    name={`question-${questionId}`}
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        handleAnswerChange(
                                                            questionId,
                                                            optionId,
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
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default QuizTaking;
