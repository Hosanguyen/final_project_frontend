import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './CKEditor.css';

const CKEditorComponent = ({ value, onChange, placeholder = 'Nhập nội dung...', disabled = false }) => {
    return (
        <div className="ckeditor-wrapper">
            <CKEditor
                editor={ClassicEditor}
                data={value || ''}
                disabled={disabled}
                config={{
                    placeholder: placeholder,
                    toolbar: [
                        'heading',
                        '|',
                        'bold',
                        'italic',
                        'link',
                        'bulletedList',
                        'numberedList',
                        '|',
                        'blockQuote',
                        'insertTable',
                        'code',
                        'codeBlock',
                        '|',
                        'undo',
                        'redo',
                    ],
                    licenseKey: 'GPL',
                }}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    onChange(data);
                }}
            />
        </div>
    );
};

export default CKEditorComponent;
