import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowLeft, FaClock, FaMemory, FaCheck, FaTimes } from 'react-icons/fa';
import ProblemService from '../../../services/ProblemService';
import ContestService from '../../../services/ContestService';
import ProblemSubmission from './ProblemSubmission';
import SubmissionHistory from './SubmissionHistory';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import './ProblemDetail.css';
import notification from '../../../utils/notification';

const ProblemDetail = () => {
    const navigate = useNavigate();
    const { id, contestProblemId } = useParams();
    const [problem, setProblem] = useState(null);
    const [contestProblem, setContestProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [submissionRefreshKey, setSubmissionRefreshKey] = useState(0);

    useDocumentTitle(problem ? `Quản trị - ${problem.title}` : 'Chi tiết bài toán');

    useEffect(() => {
        loadProblemDetail();
    }, [id, contestProblemId]);

    const handleSubmitSuccess = () => {
        // Trigger refresh của SubmissionHistory
        setSubmissionRefreshKey((prev) => prev + 1);
    };

    const loadProblemDetail = async () => {
        setLoading(true);
        try {
            const data = contestProblemId
                ? await ContestService.getByContestProblemId(contestProblemId)
                : await ProblemService.getById(id);
            setProblem(contestProblemId ? data.problem : data);
            setContestProblem(contestProblemId ? data : null);
        } catch (error) {
            console.error('Failed to load problem:', error);
            notification.error('Không thể tải thông tin bài toán');
            navigate('/admin/problems');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await ProblemService.delete(id);
            notification.success(response.detail);
            navigate('/admin/problems');
        } catch (error) {
            console.error('Delete failed:', error);
            notification.error('Xóa bài toán thất bại');
        }
    };

    const getDifficultyBadge = (difficulty) => {
        const badges = {
            easy: { class: 'problem-detail-badge-easy', label: 'Dễ' },
            medium: { class: 'problem-detail-badge-medium', label: 'Trung bình' },
            hard: { class: 'problem-detail-badge-hard', label: 'Khó' },
        };
        return badges[difficulty] || { class: '', label: difficulty };
    };

    if (loading) {
        return (
            <div className="problem-detail-loading-container">
                <div className="problem-detail-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (!problem) {
        return <div>Không tìm thấy bài toán</div>;
    }

    return (
        <div className="problem-detail">
            <div className="problem-detail-page-header">
                <div className="problem-detail-header-left">
                    <button className="problem-detail-btn-back" onClick={() => navigate('/admin/problems')}>
                        <FaArrowLeft /> Quay lại
                    </button>
                    <div>
                        <h1>{problem.title}</h1>
                        <p className="problem-detail-subtitle">Chi tiết bài toán lập trình</p>
                    </div>
                </div>
                <div className="problem-detail-header-actions">
                    <button
                        className="problem-detail-btn-edit"
                        onClick={() => navigate(`/admin/problems/edit/${problem.id}`)}
                    >
                        <FaEdit /> Chỉnh sửa
                    </button>
                    <button className="problem-detail-btn-delete" onClick={() => setShowDeleteModal(true)}>
                        <FaTrash /> Xóa
                    </button>
                </div>
            </div>

            <div className="problem-detail-content">
                {/* Basic Info */}
                <div className="problem-detail-info-card">
                    <h3 className="problem-detail-card-title">Thông tin cơ bản</h3>
                    <div className="problem-detail-info-grid">
                        <div className="problem-detail-info-item">
                            <span className="problem-detail-info-label">Slug:</span>
                            <code className="problem-detail-code-badge">{problem.slug}</code>
                        </div>
                        <div className="problem-detail-info-item">
                            <span className="problem-detail-info-label">Độ khó:</span>
                            <span
                                className={`problem-detail-difficulty-badge ${
                                    getDifficultyBadge(problem.difficulty).class
                                }`}
                            >
                                {getDifficultyBadge(problem.difficulty).label}
                            </span>
                        </div>
                        <div className="problem-detail-info-item">
                            <span className="problem-detail-info-label">Trạng thái:</span>
                            {problem.is_public ? (
                                <span className="problem-detail-status-badge problem-detail-status-public">
                                    <FaCheck /> Công khai
                                </span>
                            ) : (
                                <span className="problem-detail-status-badge problem-detail-status-private">
                                    <FaTimes /> Riêng tư
                                </span>
                            )}
                        </div>
                        <div className="problem-detail-info-item">
                            <span className="problem-detail-info-label">DOMjudge:</span>
                            {problem.is_synced_to_domjudge ? (
                                <span className="problem-detail-sync-badge problem-detail-synced">
                                    <FaCheck /> Đã đồng bộ
                                </span>
                            ) : (
                                <span className="problem-detail-sync-badge problem-detail-not-synced">
                                    <FaTimes /> Chưa đồng bộ
                                </span>
                            )}
                        </div>
                    </div>

                    {problem.short_statement && (
                        <div className="problem-detail-info-item problem-detail-full-width">
                            <span className="problem-detail-info-label">Mô tả ngắn:</span>
                            <p>{problem.short_statement}</p>
                        </div>
                    )}

                    {problem.source && (
                        <div className="problem-detail-info-item">
                            <span className="problem-detail-info-label">Nguồn:</span>
                            <span>{problem.source}</span>
                        </div>
                    )}

                    <div className="problem-detail-info-item">
                        <span className="problem-detail-info-label">Validation:</span>
                        <span
                            className={`problem-detail-validation-badge ${
                                problem.validation_type === 'custom' ? 'custom' : 'default'
                            }`}
                        >
                            {problem.validation_type === 'custom' ? 'Custom Validator' : 'Default'}
                        </span>
                    </div>

                    {problem.validation_type === 'custom' && problem.validator_language && (
                        <div className="problem-detail-info-item">
                            <span className="problem-detail-info-label">Validator Language:</span>
                            <code className="problem-detail-code-badge">
                                {problem.validator_language === 'python'
                                    ? 'Python'
                                    : problem.validator_language === 'cpp'
                                    ? 'C++'
                                    : problem.validator_language === 'java'
                                    ? 'Java'
                                    : problem.validator_language === 'bash'
                                    ? 'Bash'
                                    : problem.validator_language === 'node'
                                    ? 'Node.js'
                                    : problem.validator_language === 'pascal'
                                    ? 'Pascal'
                                    : problem.validator_language}
                            </code>
                        </div>
                    )}
                </div>

                {/* Custom Validator */}
                {problem.validation_type === 'custom' && problem.custom_validator && (
                    <div className="problem-detail-info-card">
                        <h3 className="problem-detail-card-title">Custom Validator Code</h3>
                        <pre className="problem-detail-code-block">{problem.custom_validator}</pre>
                    </div>
                )}

                {/* Constraints */}
                <div className="problem-detail-info-card">
                    <h3 className="problem-detail-card-title">Giới hạn</h3>
                    <div className="problem-detail-constraints-grid">
                        <div className="problem-detail-constraint-item">
                            <FaClock className="problem-detail-constraint-icon" />
                            <div>
                                <div className="problem-detail-constraint-label">Time Limit</div>
                                <div className="problem-detail-constraint-value">{problem.time_limit_ms} ms</div>
                            </div>
                        </div>
                        <div className="problem-detail-constraint-item">
                            <FaMemory className="problem-detail-constraint-icon" />
                            <div>
                                <div className="problem-detail-constraint-label">Memory Limit</div>
                                <div className="problem-detail-constraint-value">{problem.memory_limit_kb} KB</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Problem Statement */}
                <div className="problem-detail-info-card">
                    <h3 className="problem-detail-card-title">Đề bài</h3>
                    <div
                        className="problem-detail-content-html"
                        dangerouslySetInnerHTML={{ __html: problem.statement_text }}
                    />
                </div>

                {/* Input/Output Format */}
                {(problem.input_format || problem.output_format) && (
                    <div className="problem-detail-info-card">
                        <h3 className="problem-detail-card-title">Định dạng Input/Output</h3>
                        {problem.input_format && (
                            <div className="problem-detail-format-section">
                                <h4>Đầu vào:</h4>
                                <pre className="problem-detail-format-text">{problem.input_format}</pre>
                            </div>
                        )}
                        {problem.output_format && (
                            <div className="problem-detail-format-section">
                                <h4>Đầu ra:</h4>
                                <pre className="problem-detail-format-text">{problem.output_format}</pre>
                            </div>
                        )}
                    </div>
                )}

                {/* Test Cases */}
                <div className="problem-detail-info-card">
                    <h3 className="problem-detail-card-title">Test Cases ({problem.test_case_count})</h3>
                    <div className="problem-detail-testcases-list">
                        {problem.test_cases.map((tc) => (
                            <div key={tc.id} className="problem-detail-testcase-item">
                                <div className="problem-detail-testcase-header">
                                    <span className="problem-detail-testcase-number">Test Case #{tc.sequence}</span>
                                    <div className="problem-detail-testcase-meta">
                                        <span className={`problem-detail-type-badge problem-detail-type-${tc.type}`}>
                                            {tc.type === 'sample' ? 'Sample' : 'Secret'}
                                        </span>
                                        <span className="problem-detail-points-badge">{tc.points} điểm</span>
                                    </div>
                                </div>
                                {tc.type === 'sample' && (
                                    <div className="problem-detail-testcase-body">
                                        <div className="problem-detail-testcase-data">
                                            <strong>Input:</strong>
                                            <pre>{tc.input_data}</pre>
                                        </div>
                                        <div className="problem-detail-testcase-data">
                                            <strong>Output:</strong>
                                            <pre>{tc.output_data}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tags & Languages */}
                <div className="problem-detail-info-card">
                    <h3 className="problem-detail-card-title">Tags & Languages</h3>
                    <div className="problem-detail-tags-languages-grid">
                        <div>
                            <h4>Tags:</h4>
                            <div className="problem-detail-tags-list">
                                {problem.tags.length > 0 ? (
                                    problem.tags.map((tag) => (
                                        <span key={tag.id} className="problem-detail-tag-item">
                                            {tag.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="problem-detail-text-muted">Chưa có tag</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <h4>Ngôn ngữ được phép:</h4>
                            <div className="problem-detail-languages-list">
                                {problem.allowed_languages.length > 0 ? (
                                    problem.allowed_languages.map((lang) => (
                                        <span key={lang.id} className="problem-detail-language-item">
                                            {lang.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="problem-detail-text-muted">Tất cả ngôn ngữ</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editorial */}
                {problem.editorial_text && (
                    <div className="problem-detail-info-card">
                        <h3 className="problem-detail-card-title">Lời giải</h3>
                        <div
                            className="problem-detail-content-html"
                            dangerouslySetInnerHTML={{ __html: problem.editorial_text }}
                        />
                    </div>
                )}

                {/* Submission Section */}
                {contestProblem && problem.is_synced_to_domjudge && problem.allowed_languages.length > 0 && (
                    <>
                        <ProblemSubmission
                            contestProblem={contestProblem}
                            problem={problem}
                            onSubmitSuccess={handleSubmitSuccess}
                        />
                        <SubmissionHistory
                            problemId={problem.id}
                            contestId={contestProblem ? contestProblem.contest.id : null}
                            contestMode={contestProblem?.contest?.contest_mode}
                            isShowResult={contestProblem?.contest?.is_show_result}
                            key={submissionRefreshKey}
                        />
                    </>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="problem-detail-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="problem-detail-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="problem-detail-modal-header">
                            <h3>Xác nhận xóa</h3>
                        </div>
                        <div className="problem-detail-modal-body">
                            <p>
                                Bạn có chắc chắn muốn xóa bài toán <strong>"{problem.title}"</strong>?
                            </p>
                            <p className="problem-detail-warning-text">
                                Lưu ý: Bài toán sẽ bị xóa khỏi cả DOMjudge và tất cả dữ liệu liên quan sẽ bị mất.
                            </p>
                        </div>
                        <div className="problem-detail-modal-footer">
                            <button className="problem-detail-btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                Hủy
                            </button>
                            <button className="problem-detail-btn-confirm-delete" onClick={handleDelete}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProblemDetail;
