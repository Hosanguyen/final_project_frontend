import React, { useState, useEffect } from 'react';
import './CodeEditor.css';

const CodeEditor = ({ 
    value = '', 
    onChange, 
    language = 'python', 
    readOnly = false,
    height = '400px'
}) => {
    const [code, setCode] = useState(value);
    const [lineCount, setLineCount] = useState(1);

    useEffect(() => {
        setCode(value);
        updateLineCount(value);
    }, [value]);

    const updateLineCount = (text) => {
        const lines = text.split('\n').length;
        setLineCount(lines);
    };

    const handleChange = (e) => {
        const newCode = e.target.value;
        setCode(newCode);
        updateLineCount(newCode);
        if (onChange) {
            onChange(newCode);
        }
    };

    const handleKeyDown = (e) => {
        // Tab support
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newCode = code.substring(0, start) + '    ' + code.substring(end);
            setCode(newCode);
            updateLineCount(newCode);
            if (onChange) {
                onChange(newCode);
            }
            // Set cursor position after tab
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
        }
    };

    return (
        <div className="code-editor-container" style={{ height }}>
            <div className="code-editor-line-numbers">
                {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i + 1} className="line-number">
                        {i + 1}
                    </div>
                ))}
            </div>
            <textarea
                className={`code-editor-textarea language-${language}`}
                value={code}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                readOnly={readOnly}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
            />
        </div>
    );
};

export default CodeEditor;
