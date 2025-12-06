import React from 'react';
import { FaClipboardList, FaClock } from 'react-icons/fa';
import './QuizItem.css';

const QuizItem = ({ quiz, onStartQuiz, isActive }) => {
    const formatTime = (seconds) => {
        if (!seconds) return 'Không giới hạn';
        const minutes = Math.floor(seconds / 60);
        return `${minutes} phút`;
    };

    // Quiz có thể là object từ LessonQuizSerializer (quiz_title, quiz_time_limit)
    // hoặc trực tiếp từ Quiz (title, time_limit_seconds)
    const title = quiz.quiz_title || quiz.title;
    const timeLimit = quiz.quiz_time_limit || quiz.time_limit_seconds;

    return (
        <div className={`quiz-item ${isActive ? 'active' : ''}`} onClick={() => onStartQuiz(quiz)}>
            <FaClipboardList className="quiz-item-icon" />
            <div className="quiz-item-content">
                <span className="quiz-item-title">{title}</span>
                {timeLimit && (
                    <div className="quiz-item-meta">
                        <span className="quiz-item-time">
                            <FaClock /> {formatTime(timeLimit)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizItem;
