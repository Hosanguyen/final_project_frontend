import React, { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import './CodeEditor.css';

const CodeEditor = ({ 
    value = '', 
    onChange, 
    language = 'python', 
    readOnly = false,
    height = '500px',
    theme = 'vs-dark'
}) => {
    const editorRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    // Map language codes to Monaco Editor language identifiers
    const getMonacoLanguage = (lang) => {
        const languageMap = {
            'py': 'python',
            'python': 'python',
            'python3': 'python',
            'cpp': 'cpp',
            'c++': 'cpp',
            'c': 'c',
            'java': 'java',
            'js': 'javascript',
            'javascript': 'javascript',
            'ts': 'typescript',
            'typescript': 'typescript',
            'cs': 'csharp',
            'csharp': 'csharp',
            'php': 'php',
            'rb': 'ruby',
            'ruby': 'ruby',
            'go': 'go',
            'rust': 'rust',
            'swift': 'swift',
            'kotlin': 'kotlin',
            'sql': 'sql',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'xml': 'xml',
            'yaml': 'yaml',
            'markdown': 'markdown',
            'md': 'markdown',
        };
        return languageMap[lang?.toLowerCase()] || 'plaintext';
    };

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        setIsLoading(false);

        // Configure editor options
        editor.updateOptions({
            fontSize: 14,
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'all',
            scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                verticalScrollbarSize: 12,
                horizontalScrollbarSize: 12,
            },
            readOnly: readOnly,
        });

        // Focus editor
        editor.focus();
    };

    const handleEditorChange = (newValue) => {
        if (onChange) {
            onChange(newValue || '');
        }
    };

    const monacoLanguage = getMonacoLanguage(language);

    return (
        <div className="monaco-editor-wrapper">
            {isLoading && (
                <div className="monaco-editor-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải editor...</p>
                </div>
            )}
            <Editor
                height={height}
                language={monacoLanguage}
                value={value}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme={theme}
                options={{
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: readOnly,
                    cursorStyle: 'line',
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
