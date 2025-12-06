import React from 'react';
import { FaClipboardList, FaClock } from 'react-icons/fa';
import './QuizItem.css';

const QuizItem = ({ quiz, onStartQuiz, isActive }) => {
    const formatTime = (seconds) => {
        if (!seconds) return 'Không giới hạn';
        const minutes = Math.floor(seconds / 60);
        return `${minutes} phút`;
    };

    return (
        <div className={`quiz-item ${isActive ? 'active' : ''}`} onClick={() => onStartQuiz(quiz)}>
            <FaClipboardList className="quiz-item-icon" />
            <div className="quiz-item-content">
                <span className="quiz-item-title">{quiz.title}</span>
                <div className="quiz-item-meta">
                    <span className="quiz-item-questions">{quiz.questions_count || 0} câu hỏi</span>
                    {quiz.time_limit_seconds && (
                        <>
                            <span className="quiz-item-divider">•</span>
                            <span className="quiz-item-time">
                                <FaClock /> {formatTime(quiz.time_limit_seconds)}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizItem;
