import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import './SubmissionDetailResults.css';

const SubmissionDetailResults = ({ detailedResults }) => {
    if (!detailedResults) {
        return null;
    }

    const { verdict, compile_output, test_cases } = detailedResults;

    const getVerdictInfo = (verdictCode) => {
        const verdictMap = {
            'correct': { label: 'Accepted', class: 'verdict-ac', icon: <FaCheckCircle /> },
            'wrong-answer': { label: 'Wrong Answer', class: 'verdict-wa', icon: <FaTimesCircle /> },
            'timelimit': { label: 'Time Limit Exceeded', class: 'verdict-tle', icon: <FaClock /> },
            'run-error': { label: 'Runtime Error', class: 'verdict-re', icon: <FaExclamationTriangle /> },
            'compiler-error': { label: 'Compile Error', class: 'verdict-ce', icon: <FaExclamationTriangle /> },
            'no-output': { label: 'No Output', class: 'verdict-no-output', icon: <FaTimesCircle /> },
            'pending': { label: 'Pending', class: 'verdict-pending', icon: <FaClock /> },
        };

        return verdictMap[verdictCode] || {
            label: verdictCode || 'Unknown',
            class: 'verdict-unknown',
            icon: <FaClock />
        };
    };

    const verdictInfo = getVerdictInfo(verdict);

    return (
        <div className="submission-detail-results">
            {/* Overall Verdict */}
            <div className="overall-verdict">
                <h4>Kết quả chấm bài:</h4>
                <div className={`verdict-badge ${verdictInfo.class}`}>
                    {verdictInfo.icon}
                    <span>{verdictInfo.label}</span>
                </div>
            </div>

            {/* Compile Error */}
            {verdict === 'compiler-error' && compile_output && (
                <div className="compile-error-section">
                    <h4>
                        <FaExclamationTriangle /> Lỗi biên dịch:
                    </h4>
                    <div className="compile-output-wrapper">
                        <pre className="compile-output">
                            {compile_output.split('\n').map((line, i) => {
                                // Highlight error lines
                                if (line.includes('error:') || line.includes('Error')) {
                                    return <div key={i} className="compile-line error-line">{line}</div>;
                                } else if (line.includes('warning:') || line.includes('Warning')) {
                                    return <div key={i} className="compile-line warning-line">{line}</div>;
                                } else if (line.includes('^')) {
                                    return <div key={i} className="compile-line pointer-line">{line}</div>;
                                } else if (line.trim()) {
                                    return <div key={i} className="compile-line">{line}</div>;
                                }
                                return <div key={i} className="compile-line empty-line">&nbsp;</div>;
                            })}
                        </pre>
                    </div>
                </div>
            )}

            {/* Test Cases Results */}
            {test_cases && test_cases.length > 0 && (
                <div className="test-cases-section">
                    <h4>Chi tiết test cases:</h4>
                    <div className="test-cases-list">
                        {test_cases.map((testCase, index) => {
                            const testVerdictInfo = getVerdictInfo(testCase.verdict);
                            const hasError = testCase.verdict !== 'correct';

                            return (
                                <div key={index} className={`test-case-item ${hasError ? 'has-error' : ''}`}>
                                    <div className="test-case-header">
                                        <div className="test-case-number">
                                            Test Case #{testCase.test_number}
                                            {testCase.description && (
                                                <span className="test-description">
                                                    {testCase.description}
                                                </span>
                                            )}
                                        </div>
                                        <div className="test-case-info">
                                            <span className={`test-verdict ${testVerdictInfo.class}`}>
                                                {testVerdictInfo.icon}
                                                {testVerdictInfo.label}
                                            </span>
                                            <span className="test-runtime">
                                                {testCase.runtime.toFixed(3)}s
                                            </span>
                                        </div>
                                    </div>

                                    {/* Show error details if not accepted */}
                                    {hasError && (
                                        <div className="test-case-details">
                                            {/* Wrong Answer - Show diff comparison */}
                                            {testCase.verdict === 'wrong-answer' && testCase.diff && (
                                                <div className="detail-section diff-section">
                                                    <strong>❌ Kết quả sai:</strong>
                                                    <div className="diff-content">
                                                        {testCase.diff.split('\n').map((line, i) => {
                                                            if (line.includes('Judge:')) {
                                                                return (
                                                                    <div key={i} className="diff-line expected">
                                                                        <span className="diff-label">Kỳ vọng:</span>
                                                                        <span className="diff-value">{line.replace('Judge:', '').trim()}</span>
                                                                    </div>
                                                                );
                                                            } else if (line.includes('Team:')) {
                                                                return (
                                                                    <div key={i} className="diff-line actual">
                                                                        <span className="diff-label">Của bạn:</span>
                                                                        <span className="diff-value">{line.replace('Team:', '').trim()}</span>
                                                                    </div>
                                                                );
                                                            } else if (line.trim()) {
                                                                return <div key={i} className="diff-line info">{line}</div>;
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Time Limit Exceeded */}
                                            {testCase.verdict === 'timelimit' && (
                                                <div className="detail-section tle-section">
                                                    <strong>⏱️ Vượt quá thời gian cho phép:</strong>
                                                    <div className="tle-info">
                                                        <p>Chương trình của bạn chạy quá {testCase.runtime.toFixed(1)}s</p>
                                                        {testCase.system && testCase.system.includes('timelimit exceeded') && (
                                                            <p className="hint">💡 Gợi ý: Tối ưu thuật toán hoặc giảm độ phức tạp</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Runtime Error */}
                                            {testCase.verdict === 'run-error' && (
                                                <div className="detail-section error-section">
                                                    <strong>💥 Lỗi runtime:</strong>
                                                    {testCase.error && (
                                                        <pre className="detail-error">{testCase.error}</pre>
                                                    )}
                                                    {testCase.system && (
                                                        <pre className="detail-system">{testCase.system}</pre>
                                                    )}
                                                </div>
                                            )}

                                            {/* Output (if available and not shown in diff) */}
                                            {testCase.output && testCase.verdict !== 'wrong-answer' && (
                                                <div className="detail-section output-section">
                                                    <strong>📄 Output của bạn:</strong>
                                                    <pre className="detail-output">{testCase.output}</pre>
                                                </div>
                                            )}

                                            {/* System info (memory, cpu) */}
                                            {testCase.system && (
                                                <div className="detail-section system-section">
                                                    <strong>ℹ️ Thông tin hệ thống:</strong>
                                                    <div className="system-info">
                                                        {testCase.system.split('\n').map((line, i) => {
                                                            if (line.includes('memory used:')) {
                                                                const bytes = parseInt(line.match(/\d+/)?.[0] || '0');
                                                                const mb = (bytes / (1024 * 1024)).toFixed(2);
                                                                return <div key={i}>💾 Bộ nhớ: {mb} MB</div>;
                                                            } else if (line.includes('cpu') || line.includes('wall')) {
                                                                return <div key={i}>⏱️ {line.trim()}</div>;
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Show success info */}
                                    {!hasError && testCase.system && (
                                        <div className="test-case-success">
                                            <div className="success-info">
                                                {testCase.system.split('\n').map((line, i) => {
                                                    if (line.includes('memory used:')) {
                                                        const bytes = parseInt(line.match(/\d+/)?.[0] || '0');
                                                        const mb = (bytes / (1024 * 1024)).toFixed(2);
                                                        return <span key={i}>💾 {mb} MB</span>;
                                                    } else if (line.includes('cpu')) {
                                                        const time = line.match(/[\d.]+s/)?.[0];
                                                        return <span key={i}>⏱️ {time} CPU</span>;
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubmissionDetailResults;
