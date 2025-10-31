import React, { useState } from 'react';
import { FaCode, FaPaperPlane, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import CodeEditor from '../../../components/CodeEditor';
import SubmissionService from '../../../services/SubmissionService';
import './ProblemSubmission.css';

const ProblemSubmission = ({ problem }) => {
    const [selectedLanguage, setSelectedLanguage] = useState(
        problem.allowed_languages.length > 0 ? problem.allowed_languages[0].id : null
    );
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!selectedLanguage) {
            setError('Vui lòng chọn ngôn ngữ lập trình');
            return;
        }

        if (!code.trim()) {
            setError('Vui lòng nhập code');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSubmissionResult(null);

        try {
            const result = await SubmissionService.submit(problem.id, {
                language_id: selectedLanguage,
                code: code,
            });

            setSubmissionResult(result);
            setError(null);
        } catch (err) {
            console.error('Submit failed:', err);
            setError(err.response?.data?.error || 'Gửi bài thất bại. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getLanguageById = (id) => {
        return problem.allowed_languages.find((lang) => lang.id === id);
    };

    const selectedLangObj = getLanguageById(selectedLanguage);

    return (
        <div className="problem-submission">
            <div className="problem-submission-header">
                <h3>
                    <FaCode /> Nộp bài
                </h3>
            </div>

            <div className="problem-submission-body">
                {/* Language Selector */}
                <div className="problem-submission-language-selector">
                    <label>Chọn ngôn ngữ lập trình:</label>
                    <div className="problem-submission-languages">
                        {problem.allowed_languages.map((lang) => (
                            <button
                                key={lang.id}
                                className={`problem-submission-lang-btn ${
                                    selectedLanguage === lang.id ? 'active' : ''
                                }`}
                                onClick={() => setSelectedLanguage(lang.id)}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Code Editor */}
                <div className="problem-submission-editor">
                    <label>Nhập code của bạn:</label>
                    <CodeEditor
                        value={code}
                        onChange={setCode}
                        language={selectedLangObj?.code || 'python'}
                        height="500px"
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="problem-submission-error">
                        <FaTimesCircle /> {error}
                    </div>
                )}

                {/* Submission Result */}
                {submissionResult && (
                    <div className="problem-submission-result">
                        <div className="problem-submission-result-header">
                            <FaCheckCircle /> Nộp bài thành công!
                        </div>
                        <div className="problem-submission-result-body">
                            <p>
                                <strong>Submission ID:</strong> {submissionResult.submission?.id}
                            </p>
                            <p>
                                <strong>Status:</strong>{' '}
                                <span className="status-badge status-judging">
                                    {submissionResult.submission?.status}
                                </span>
                            </p>
                            <p className="problem-submission-result-note">
                                Bài của bạn đang được chấm. Vui lòng chờ kết quả.
                            </p>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="problem-submission-actions">
                    <button
                        className="problem-submission-btn-submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedLanguage}
                    >
                        {isSubmitting ? (
                            <>
                                <FaSpinner className="spinner" /> Đang gửi...
                            </>
                        ) : (
                            <>
                                <FaPaperPlane /> Nộp bài
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProblemSubmission;
