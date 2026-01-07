import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaMemory, FaCode, FaListUl } from 'react-icons/fa';
import ProblemService from '../../services/ProblemService';
import ContestService from '../../services/ContestService';
import ProblemSubmission from '../admin/problem/ProblemSubmission';
import SubmissionHistory from '../admin/problem/SubmissionHistory';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import './ProblemDetailUser.css';
import notification from '../../utils/notification';

const ProblemDetailUser = () => {
    const { contestProblemId } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [contestProblem, setContestProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description'); // 'description' or 'submissions'
    const [submissionRefreshKey, setSubmissionRefreshKey] = useState(0);

    useDocumentTitle(problem ? problem.title : 'Chi tiết bài toán');

    const loadProblemDetail = async () => {
        setLoading(true);
        try {
            const data = await ContestService.getByContestProblemId(contestProblemId);
            setContestProblem(data);
            setProblem(data.problem);
        } catch (error) {
            console.error('Failed to load problem:', error);
            notification.error('Không thể tải thông tin bài toán');
            navigate('/contests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProblemDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contestProblemId]);

    const handleSubmitSuccess = () => {
        setSubmissionRefreshKey((prev) => prev + 1);
    };

    const getDifficultyClass = (difficulty) => {
        const difficultyMap = {
            easy: 'user-problem-difficulty-easy',
            medium: 'user-problem-difficulty-medium',
            hard: 'user-problem-difficulty-hard',
        };
        return difficultyMap[difficulty] || 'user-problem-difficulty-medium';
    };

    const getDifficultyLabel = (difficulty) => {
        const labelMap = {
            easy: 'Dễ',
            medium: 'Trung bình',
            hard: 'Khó',
        };
        return labelMap[difficulty] || difficulty;
    };

    const handleBackNavigation = () => {
        if (contestProblem?.contest?.slug === 'practice') {
            navigate('/practice');
        } else if (contestProblem?.contest?.id) {
            navigate(`/contests/${contestProblem.contest.id}`);
        } else {
            navigate('/practice');
        }
    };

    if (loading) {
        return (
            <div className="user-problem-loading-container">
                <div className="user-problem-spinner"></div>
                <p>Đang tải bài toán...</p>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="user-problem-not-found">
                <h2>Không tìm thấy bài toán</h2>
                <button onClick={handleBackNavigation}>Quay lại danh sách</button>
            </div>
        );
    }

    return (
        <div className="user-problem-detail-container">
            {/* Problem Header */}
            <div className="user-problem-header">
                <div className="user-problem-header-content">
                    <div className="user-problem-breadcrumb">
                        <span onClick={handleBackNavigation} className="user-problem-breadcrumb-link">
                            {contestProblem?.contest?.slug === 'practice' ? 'Danh sách bài tập' : contestProblem?.contest?.title}
                        </span>
                        <span className="user-problem-breadcrumb-separator">/</span>
                        <span className="user-problem-breadcrumb-current">{problem.slug}</span>
                    </div>
                    <h1 className="user-problem-title">{problem.title}</h1>
                    <div className="user-problem-meta">
                        <span className={`user-problem-difficulty ${getDifficultyClass(problem.difficulty)}`}>
                            {getDifficultyLabel(problem.difficulty)}
                        </span>
                        {problem.tags && problem.tags.length > 0 && (
                            <div className="user-problem-tags">
                                {problem.tags.map((tag) => (
                                    <span key={tag.id} className="user-problem-tag">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content - Split View */}
            <div className="user-problem-main-content">
                {/* Left Panel - Problem Description */}
                <div className="user-problem-left-panel">
                    {/* Tab Navigation */}
                    <div className="user-problem-tabs">
                        <button
                            className={`user-problem-tab ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            <FaListUl /> Đề bài
                        </button>
                        <button
                            className={`user-problem-tab ${activeTab === 'submissions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('submissions')}
                        >
                            <FaCode /> Lịch sử nộp bài
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="user-problem-tab-content">
                        {activeTab === 'description' ? (
                            <div className="user-problem-description">
                                {/* Short Statement */}
                                {problem.short_statement && (
                                    <div className="user-problem-short-desc">
                                        <p>{problem.short_statement}</p>
                                    </div>
                                )}

                                {/* Constraints */}
                                <div className="user-problem-constraints">
                                    <div className="user-problem-constraint-item">
                                        <FaClock className="user-problem-constraint-icon" />
                                        <div>
                                            <span className="user-problem-constraint-label">Time Limit</span>
                                            <span className="user-problem-constraint-value">
                                                {problem.time_limit_ms} ms
                                            </span>
                                        </div>
                                    </div>
                                    <div className="user-problem-constraint-item">
                                        <FaMemory className="user-problem-constraint-icon" />
                                        <div>
                                            <span className="user-problem-constraint-label">Memory Limit</span>
                                            <span className="user-problem-constraint-value">
                                                {problem.memory_limit_kb} KB
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Problem Statement */}
                                <div className="user-problem-section">
                                    <h3 className="user-problem-section-title">Đề bài</h3>
                                    <div
                                        className="user-problem-html-content"
                                        dangerouslySetInnerHTML={{ __html: problem.statement_text }}
                                    />
                                </div>

                                {/* Input Format */}
                                {problem.input_format && (
                                    <div className="user-problem-section">
                                        <h3 className="user-problem-section-title">Định dạng đầu vào</h3>
                                        <pre className="user-problem-format-text">{problem.input_format}</pre>
                                    </div>
                                )}

                                {/* Output Format */}
                                {problem.output_format && (
                                    <div className="user-problem-section">
                                        <h3 className="user-problem-section-title">Định dạng đầu ra</h3>
                                        <pre className="user-problem-format-text">{problem.output_format}</pre>
                                    </div>
                                )}

                                {/* Sample Test Cases */}
                                {problem.test_cases &&
                                    problem.test_cases.filter((tc) => tc.type === 'sample').length > 0 && (
                                        <div className="user-problem-section">
                                            <h3 className="user-problem-section-title">Ví dụ</h3>
                                            <div className="user-problem-examples">
                                                {problem.test_cases
                                                    .filter((tc) => tc.type === 'sample')
                                                    .map((tc, index) => (
                                                        <div key={tc.id} className="user-problem-example">
                                                            <div className="user-problem-example-header">
                                                                Ví dụ {index + 1}
                                                            </div>
                                                            <div className="user-problem-example-body">
                                                                <div className="user-problem-example-io">
                                                                    <div className="user-problem-io-label">Input:</div>
                                                                    <pre className="user-problem-io-content">
                                                                        {tc.input_data}
                                                                    </pre>
                                                                </div>
                                                                <div className="user-problem-example-io">
                                                                    <div className="user-problem-io-label">Output:</div>
                                                                    <pre className="user-problem-io-content">
                                                                        {tc.output_data}
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                {/* Editorial */}
                                {problem.editorial_text && (
                                    <div className="user-problem-section">
                                        <h3 className="user-problem-section-title">Lời giải</h3>
                                        <div
                                            className="user-problem-html-content"
                                            dangerouslySetInnerHTML={{ __html: problem.editorial_text }}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="user-problem-submissions-tab">
                                <SubmissionHistory 
                                    problemId={problem.id} 
                                    contestId={contestProblem.contest.id} 
                                    contestMode={contestProblem.contest.contest_mode}
                                    isShowResult={contestProblem.contest.is_show_result}
                                    key={submissionRefreshKey} 
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - Code Editor & Submission */}
                <div className="user-problem-right-panel">
                    {problem.is_synced_to_domjudge && problem.allowed_languages.length > 0 ? (
                        <ProblemSubmission contestProblem={contestProblem} problem={problem} onSubmitSuccess={handleSubmitSuccess} />
                    ) : (
                        <div className="user-problem-no-submission">
                            <p>Bài toán này chưa thể nộp bài.</p>
                            {!problem.is_synced_to_domjudge && <p>Chưa được đồng bộ với hệ thống chấm bài.</p>}
                            {problem.allowed_languages.length === 0 && <p>Chưa có ngôn ngữ lập trình được phép.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProblemDetailUser;
