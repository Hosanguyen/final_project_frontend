import React, { useState, useEffect } from 'react';
import { FaCode, FaPaperPlane, FaSpinner, FaCheckCircle, FaTimesCircle, FaSun, FaMoon, FaKeyboard, FaUpload, FaFile } from 'react-icons/fa';
import CodeEditor from '../../../components/CodeEditor';
import SubmissionService from '../../../services/SubmissionService';
import { getTemplate } from '../../../utils/codeTemplates';
import './ProblemSubmission.css';

const ProblemSubmission = ({ contestProblem, problem, onSubmitSuccess }) => {
    problem = contestProblem ? contestProblem.problem : problem;
    const [selectedLanguage, setSelectedLanguage] = useState(
        problem.allowed_languages.length > 0 ? problem.allowed_languages[0].id : null
    );
    const [code, setCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState('vs'); // 'vs-dark' or 'vs'
    const [inputMode, setInputMode] = useState('editor'); // 'editor' or 'file'
    const [selectedFile, setSelectedFile] = useState(null);

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

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file size (max 1MB)
            if (file.size > 1024 * 1024) {
                setError('File quá lớn. Kích thước tối đa là 1MB');
                return;
            }

            setSelectedFile(file);
            setError(null);

            // Read file content
            const reader = new FileReader();
            reader.onload = (e) => {
                setCode(e.target.result);
            };
            reader.onerror = () => {
                setError('Không thể đọc file. Vui lòng thử lại.');
            };
            reader.readAsText(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setCode('');
        // Reset file input
        const fileInput = document.getElementById('code-file-input');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!selectedLanguage) {
            setError('Vui lòng chọn ngôn ngữ lập trình');
            return;
        }

        if (!code.trim()) {
            setError(inputMode === 'file' ? 'Vui lòng chọn file code' : 'Vui lòng nhập code');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSubmissionResult(null);

        try {
            debugger;
            const result = await SubmissionService.submit(problem.id, {
                language_id: selectedLanguage,
                code: code,
                contest_id: contestProblem ? contestProblem.contest.id : null,
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
        // Load template if in editor mode (always load new template for new language)
        if (inputMode === 'editor') {
            const lang = getLanguageById(langId);
            if (lang) {
                const template = getTemplate(lang.code);
                setCode(template);
            }
        }
    };

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'vs-dark' ? 'vs' : 'vs-dark'));
    };

    const handleInputModeChange = (mode) => {
        setInputMode(mode);
        setError(null);
        
        if (mode === 'editor' && !code && !selectedFile) {
            // Load template when switching to editor mode
            const lang = getLanguageById(selectedLanguage);
            if (lang) {
                const template = getTemplate(lang.code);
                setCode(template);
            }
        }
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

                {/* Input Mode Tabs */}
                <div className="problem-submission-input-mode">
                    <button
                        className={`problem-submission-mode-btn ${inputMode === 'editor' ? 'active' : ''}`}
                        onClick={() => handleInputModeChange('editor')}
                    >
                        <FaKeyboard /> Code Editor
                    </button>
                    <button
                        className={`problem-submission-mode-btn ${inputMode === 'file' ? 'active' : ''}`}
                        onClick={() => handleInputModeChange('file')}
                    >
                        <FaUpload /> Upload File
                    </button>
                </div>

                {/* Code Editor Mode */}
                {inputMode === 'editor' && (
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
                )}

                {/* File Upload Mode */}
                {inputMode === 'file' && (
                    <div className="problem-submission-file-upload">
                        {!selectedFile ? (
                            <div className="problem-submission-file-input-area">
                                <input
                                    type="file"
                                    id="code-file-input"
                                    accept=".py,.cpp,.c,.java,.js,.ts,.cs,.php,.rb,.go,.rs,.swift,.kt,.txt"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="code-file-input" className="problem-submission-file-label">
                                    <FaUpload size={48} />
                                    <h4>Chọn file code</h4>
                                    <p>Kéo thả hoặc click để chọn file</p>
                                    <small>Hỗ trợ: .py, .cpp, .c, .java, .js, .ts, .cs, .php, .rb, .go, .rs, .swift, .kt (Tối đa 1MB)</small>
                                </label>
                            </div>
                        ) : (
                            <div className="problem-submission-file-selected">
                                <div className="problem-submission-file-info">
                                    <FaFile size={32} />
                                    <div className="problem-submission-file-details">
                                        <h4>{selectedFile.name}</h4>
                                        <p>{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <button
                                        className="problem-submission-file-remove"
                                        onClick={handleRemoveFile}
                                        title="Xóa file"
                                    >
                                        <FaTimesCircle />
                                    </button>
                                </div>
                                <div className="problem-submission-file-preview">
                                    <div className="problem-submission-editor-header">
                                        <label>Nội dung file:</label>
                                    </div>
                                    <CodeEditor
                                        value={code}
                                        onChange={() => {}} // Read-only in file mode
                                        language={selectedLangObj?.code || 'python'}
                                        height="400px"
                                        theme={theme}
                                        readOnly={true}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
                        disabled={isSubmitting || !selectedLanguage || !code.trim()}
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
