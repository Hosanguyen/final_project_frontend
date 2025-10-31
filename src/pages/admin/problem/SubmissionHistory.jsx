import React, { useState, useEffect } from 'react';
import { FaList, FaCheckCircle, FaTimesCircle, FaClock, FaSync, FaChevronDown, FaChevronUp, FaCode } from 'react-icons/fa';
import SubmissionService from '../../../services/SubmissionService';
import SubmissionCodeViewer from './SubmissionCodeViewer';
import SubmissionDetailResults from './SubmissionDetailResults';
import './SubmissionHistory.css';

const SubmissionHistory = ({ problemId }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewingSubmission, setViewingSubmission] = useState(null);

    useEffect(() => {
        loadSubmissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [problemId, page]);

    const loadSubmissions = async (sync = false) => {
        if (sync) {
            setSyncing(true);
        } else {
            setLoading(true);
        }

        try {
            const data = await SubmissionService.getByProblem(problemId, {
                page,
                page_size: 10,
                sync: sync ? 'true' : 'false',
            });

            setSubmissions(data.results);
            setTotalPages(data.total_pages);
        } catch (error) {
            console.error('Failed to load submissions:', error);
        } finally {
            setLoading(false);
            setSyncing(false);
        }
    };

    const handleSync = () => {
        loadSubmissions(true);
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const loadFullSubmission = async (submissionId) => {
        try {
            const fullSubmission = await SubmissionService.getById(submissionId);
            // Update submission in list with full data
            setSubmissions(prev => prev.map(s => 
                s.id === submissionId ? { ...s, ...fullSubmission } : s
            ));
            return fullSubmission;
        } catch (error) {
            console.error('Failed to load full submission:', error);
            alert('Không thể tải chi tiết submission này');
            return null;
        }
    };

    const handleViewCode = async (submission) => {
        // If code_text is not loaded, fetch it
        if (!submission.code_text) {
            const fullSubmission = await loadFullSubmission(submission.id);
            if (fullSubmission) {
                setViewingSubmission(fullSubmission);
            }
        } else {
            setViewingSubmission(submission);
        }
    };

    const handleToggleExpand = async (submission) => {
        const newExpandedId = expandedId === submission.id ? null : submission.id;
        setExpandedId(newExpandedId);

        // Load full details if expanding and not already loaded
        if (newExpandedId && !submission.detailed_results) {
            await loadFullSubmission(submission.id);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { class: 'status-pending', icon: <FaClock />, label: 'Pending' },
            judging: { class: 'status-judging', icon: <FaClock />, label: 'Judging' },
            ac: { class: 'status-accepted', icon: <FaCheckCircle />, label: 'Accepted' },
            wa: { class: 'status-wrong', icon: <FaTimesCircle />, label: 'Wrong Answer' },
            tle: { class: 'status-tle', icon: <FaTimesCircle />, label: 'Time Limit' },
            mle: { class: 'status-mle', icon: <FaTimesCircle />, label: 'Memory Limit' },
            re: { class: 'status-error', icon: <FaTimesCircle />, label: 'Runtime Error' },
            ce: { class: 'status-error', icon: <FaTimesCircle />, label: 'Compile Error' },
            error: { class: 'status-error', icon: <FaTimesCircle />, label: 'Error' },
        };

        const statusInfo = statusMap[status?.toLowerCase()] || {
            class: 'status-unknown',
            icon: <FaClock />,
            label: status || 'Unknown',
        };

        return (
            <span className={`submission-status-badge ${statusInfo.class}`}>
                {statusInfo.icon}
                {statusInfo.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    if (loading && submissions.length === 0) {
        return (
            <div className="submission-history-loading">
                <div className="spinner"></div>
                <p>Đang tải lịch sử submissions...</p>
            </div>
        );
    }

    return (
        <div className="submission-history">
            <div className="submission-history-header">
                <h3>
                    <FaList /> Lịch sử nộp bài
                </h3>
                <button
                    className="submission-history-sync-btn"
                    onClick={handleSync}
                    disabled={syncing}
                >
                    <FaSync className={syncing ? 'spinning' : ''} />
                    {syncing ? 'Đang đồng bộ...' : 'Đồng bộ kết quả'}
                </button>
            </div>

            {submissions.length === 0 ? (
                <div className="submission-history-empty">
                    <p>Chưa có submission nào cho bài này.</p>
                </div>
            ) : (
                <>
                    <div className="submission-history-list">
                        {submissions.map((submission) => (
                            <div key={submission.id} className="submission-history-item">
                                <div
                                    className="submission-history-item-header"
                                    onClick={() => handleToggleExpand(submission)}
                                >
                                    <div className="submission-history-item-info">
                                        <span className="submission-id">#{submission.id}</span>
                                        <span className="submission-language">
                                            {submission.language?.name || 'N/A'}
                                        </span>
                                        <span className="submission-date">
                                            {formatDate(submission.submitted_at)}
                                        </span>
                                    </div>
                                    <div className="submission-history-item-status">
                                        {getStatusBadge(submission.status)}
                                        {/* {submission.score !== null && (
                                            <span className="submission-score">{submission.score} điểm</span>
                                        )} */}
                                        <button 
                                            className="submission-view-code-btn-inline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewCode(submission);
                                            }}
                                            title="Xem code"
                                        >
                                            <FaCode />
                                        </button>
                                        <button className="submission-expand-btn">
                                            {expandedId === submission.id ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </div>
                                </div>

                                {expandedId === submission.id && (
                                    <div className="submission-history-item-details">
                                        <div className="submission-detail-row">
                                            <strong>User:</strong>
                                            <span>{submission.user?.full_name || 'N/A'}</span>
                                        </div>
                                        <div className="submission-detail-row">
                                            <strong>Thời gian:</strong>
                                            <span>{formatDate(submission.submitted_at)}</span>
                                        </div>
                                        
                                        {/* Detailed Results */}
                                        {submission.detailed_results && (
                                            <SubmissionDetailResults detailedResults={submission.detailed_results} />
                                        )}
                                        
                                        {submission.feedback && !submission.detailed_results && (
                                            <div className="submission-detail-row">
                                                <strong>Feedback:</strong>
                                                <pre className="submission-feedback">{submission.feedback}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="submission-history-pagination">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="pagination-btn"
                            >
                                ← Trước
                            </button>
                            <span className="pagination-info">
                                Trang {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="pagination-btn"
                            >
                                Sau →
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Code Viewer Modal */}
            {viewingSubmission && (
                <SubmissionCodeViewer
                    submission={viewingSubmission}
                    onClose={() => setViewingSubmission(null)}
                />
            )}
        </div>
    );
};

export default SubmissionHistory;
