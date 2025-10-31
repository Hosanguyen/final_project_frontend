import React, { useState, useEffect } from 'react';
import { FaCode, FaPaperPlane, FaSpinner, FaCheckCircle, FaTimesCircle, FaSun, FaMoon } from 'react-icons/fa';
import CodeEditor from '../../../components/CodeEditor';
import SubmissionService from '../../../services/SubmissionService';
import { getTemplate } from '../../../utils/codeTemplates';
import './ProblemSubmission.css';

const ProblemSubmission = ({ problem, onSubmitSuccess }) => {
    const [selectedLanguage, setSelectedLanguage] = useState(
        problem.allowed_languages.length > 0 ? problem.allowed_languages[0].id : null
    );
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState('vs-dark'); // 'vs-dark' or 'vs'

    // Initialize code with template when language changes
    useEffect(() => {
        if (selectedLanguage && !code) {
            const lang = getLanguageById(selectedLanguage);
            if (lang) {
                const template = getTemplate(lang.code);
                setCode(template);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLanguage]);

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
            
            // Notify parent to refresh submission history
            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
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

    const handleLanguageChange = (langId) => {
        setSelectedLanguage(langId);
        const lang = getLanguageById(langId);
        if (lang) {
            const template = getTemplate(lang.code);
            setCode(template);
        }
    };

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'vs-dark' ? 'vs' : 'vs-dark'));
    };

    const selectedLangObj = getLanguageById(selectedLanguage);

    return (
        <div className="problem-submission">
            <div className="problem-submission-header">
                <h3>
                    <FaCode /> Nộp bài
                </h3>
                <button className="problem-submission-theme-toggle" onClick={toggleTheme} title="Toggle theme">
                    {theme === 'vs-dark' ? <FaSun /> : <FaMoon />}
                </button>
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
                                onClick={() => handleLanguageChange(lang.id)}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Code Editor */}
                <div className="problem-submission-editor">
                    <div className="problem-submission-editor-header">
                        <label>Nhập code của bạn:</label>
                        <span className="problem-submission-editor-info">
                            {selectedLangObj?.name || 'Unknown'} • {theme === 'vs-dark' ? 'Dark' : 'Light'} theme
                        </span>
                    </div>
                    <CodeEditor
                        value={code}
                        onChange={setCode}
                        language={selectedLangObj?.code || 'python'}
                        height="500px"
                        theme={theme}
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
