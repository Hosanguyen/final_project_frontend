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
                    <pre className="compile-output">{compile_output}</pre>
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
                                            {testCase.output && (
                                                <div className="detail-section">
                                                    <strong>Your Output:</strong>
                                                    <pre className="detail-output">{testCase.output}</pre>
                                                </div>
                                            )}

                                            {testCase.error && (
                                                <div className="detail-section error-section">
                                                    <strong>Error Message:</strong>
                                                    <pre className="detail-error">{testCase.error}</pre>
                                                </div>
                                            )}

                                            {testCase.diff && (
                                                <div className="detail-section diff-section">
                                                    <strong>Difference (Expected vs Your Output):</strong>
                                                    <pre className="detail-diff">{testCase.diff}</pre>
                                                </div>
                                            )}

                                            {testCase.system && (
                                                <div className="detail-section system-section">
                                                    <strong>System Message:</strong>
                                                    <pre className="detail-system">{testCase.system}</pre>
                                                </div>
                                            )}
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
