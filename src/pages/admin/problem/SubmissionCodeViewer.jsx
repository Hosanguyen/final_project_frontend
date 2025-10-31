import React, { useState } from 'react';
import { FaCode, FaTimes } from 'react-icons/fa';
import CodeEditor from '../../../components/CodeEditor';
import './SubmissionCodeViewer.css';

const SubmissionCodeViewer = ({ submission, onClose }) => {
    const [theme, setTheme] = useState('vs-dark');

    if (!submission) return null;

    return (
        <div className="submission-code-viewer-overlay" onClick={onClose}>
            <div className="submission-code-viewer-modal" onClick={(e) => e.stopPropagation()}>
                <div className="submission-code-viewer-header">
                    <div className="submission-code-viewer-title">
                        <FaCode />
                        <span>Submission #{submission.id}</span>
                        <span className="submission-code-viewer-language">
                            {submission.language?.name}
                        </span>
                    </div>
                    <button className="submission-code-viewer-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="submission-code-viewer-body">
                    <CodeEditor
                        value={submission.code_text || '// No code available'}
                        language={submission.language?.code || 'plaintext'}
                        readOnly={true}
                        height="600px"
                        theme={theme}
                    />
                </div>
            </div>
        </div>
    );
};

export default SubmissionCodeViewer;
