import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLightbulb, FaFire, FaChartLine, FaCode } from 'react-icons/fa';
import ProblemService from '../services/ProblemService';
import './RecommendedProblems.css';

const RecommendedProblems = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRecommendations();
    }, []);

    const loadRecommendations = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await ProblemService.getRecommendations(5);
            const data = res.recommendations || [];

            // Giới hạn số lượng hiển thị (ví dụ: 5-6 bài)
            const limitedData = Array.isArray(data) ? data.slice(0, 5) : data.results?.slice(0, 5) || [];
            setRecommendations(limitedData);
        } catch (err) {
            console.error('Error loading recommendations:', err);
            setError('Không thể tải danh sách gợi ý');
        } finally {
            setLoading(false);
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

    const getDifficultyIcon = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return <FaCode />;
            case 'medium':
                return <FaChartLine />;
            case 'hard':
                return <FaFire />;
            default:
                return <FaCode />;
        }
    };

    if (loading) {
        return (
            <div className="recommended-problems-container">
                <div className="recommended-problems-header">
                    <FaLightbulb className="recommended-problems-icon" />
                    <h2 className="recommended-problems-title">Gợi Ý Cho Bạn</h2>
                </div>
                <div className="recommended-problems-loading">
                    <div className="recommended-problems-spinner"></div>
                    <p>Đang tải gợi ý...</p>
                </div>
            </div>
        );
    }

    if (error || !recommendations || recommendations.length === 0) {
        return null; // Không hiển thị gì nếu có lỗi hoặc không có gợi ý
    }

    return (
        <div className="recommended-problems-container">
            <div className="recommended-problems-header">
                <FaLightbulb className="recommended-problems-icon" />
                <h2 className="recommended-problems-title">Gợi Ý Cho Bạn</h2>
                <p className="recommended-problems-subtitle">Dựa trên lịch sử giải bài và kỹ năng của bạn</p>
            </div>

            <div className="recommended-problems-grid">
                {recommendations.map((problem) => (
                    <Link
                        key={problem.problem_id}
                        to={`/contest-problems/${problem.contest_problem_id}`}
                        className="recommended-problem-card"
                    >
                        <div className="recommended-problem-card-header">
                            <div className="recommended-problem-icon-wrapper">
                                {getDifficultyIcon(problem.difficulty)}
                            </div>
                            <span
                                className={`recommended-problem-difficulty-badge ${getDifficultyClass(
                                    problem.difficulty,
                                )}`}
                            >
                                {getDifficultyLabel(problem.difficulty)}
                            </span>
                        </div>

                        <h3 className="recommended-problem-title">{problem.title}</h3>

                        {problem.slug && <p className="recommended-problem-slug">{problem.slug}</p>}

                        {problem.tags && problem.tags.length > 0 && (
                            <div className="recommended-problem-tags">
                                {problem.tags.slice(0, 3).map((tag, index) => (
                                    <span key={index} className="recommended-problem-tag">
                                        {tag.name || tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="recommended-problem-footer">
                            <div className="recommended-problem-action">
                                <span>Thử thách →</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RecommendedProblems;
