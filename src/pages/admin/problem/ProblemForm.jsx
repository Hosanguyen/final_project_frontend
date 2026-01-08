import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaPlus, FaTrash, FaFileArchive } from 'react-icons/fa';
import ProblemService from '../../../services/ProblemService';
import CourseService from '../../../services/CourseService';
import CKEditorComponent from '../../../components/CKEditor';
import './ProblemForm.css';
import notification from '../../../utils/notification';

const ProblemForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        slug: '',
        title: '',
        short_statement: '',
        statement_text: '',
        input_format: '',
        output_format: '',
        difficulty: 'medium',
        time_limit_ms: 1000,
        memory_limit_kb: 262144,
        source: '',
        validation_type: 'default',
        validator_language: 'python',
        custom_validator: '',
        is_public: true,
        editorial_text: '',
        tag_ids: [],
        language_ids: [],
    });

    const [testCases, setTestCases] = useState([
        {
            type: 'sample',
            sequence: 1,
            input_data: '',
            output_data: '',
            points: 10.0,
        },
    ]);

    // ============ ZIP MODE STATE ============
    const [testCaseMode, setTestCaseMode] = useState('manual'); // 'manual' | 'zip'
    const [zipFile, setZipFile] = useState(null);
    const [zipUploadOptions, setZipUploadOptions] = useState({
        auto_detect_type: true,
        default_type: 'secret',
        default_points: 10.0,
    });

    const [tags, setTags] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadTags();
        loadLanguages();
        if (isEditMode) {
            loadProblemData();
        }
    }, [id]);

    const loadTags = async () => {
        try {
            const data = await CourseService.getTags();
            setTags(data);
        } catch (error) {
            console.error('Failed to load tags:', error);
        }
    };

    const loadLanguages = async () => {
        try {
            const data = await CourseService.getLanguages();
            setLanguages(data.filter((lang) => lang.active));
        } catch (error) {
            console.error('Failed to load languages:', error);
        }
    };

    const loadProblemData = async () => {
        setLoading(true);
        try {
            const data = await ProblemService.getById(id);
            setFormData({
                slug: data.slug,
                title: data.title,
                short_statement: data.short_statement || '',
                statement_text: data.statement_text || '',
                input_format: data.input_format || '',
                output_format: data.output_format || '',
                difficulty: data.difficulty,
                time_limit_ms: data.time_limit_ms,
                memory_limit_kb: data.memory_limit_kb,
                source: data.source || '',
                validation_type: data.validation_type || 'default',
                validator_language: data.validator_language || 'python',
                custom_validator: data.custom_validator || '',
                is_public: data.is_public,
                editorial_text: data.editorial_text || '',
                tag_ids: data.tags.map((tag) => tag.id),
                language_ids: data.allowed_languages.map((lang) => lang.id),
            });

            if (data.test_cases && data.test_cases.length > 0) {
                setTestCases(
                    data.test_cases.map((tc) => ({
                        id: tc.id,
                        type: tc.type,
                        sequence: tc.sequence,
                        input_data: tc.input_data,
                        output_data: tc.output_data,
                        points: parseFloat(tc.points),
                    })),
                );
            }
        } catch (error) {
            console.error('Failed to load problem:', error);
            notification.error('Không thể tải thông tin bài toán');
            navigate('/admin/problems');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.slug.trim()) {
            newErrors.slug = 'Slug là bắt buộc';
        } else if (formData.slug.length > 10) {
            newErrors.slug = 'Slug không được quá 10 ký tự';
        } else if (!/^[a-z0-9]+$/.test(formData.slug)) {
            newErrors.slug = 'Slug chỉ được chứa chữ thường và số, không có dấu cách hoặc ký tự đặc biệt';
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Tiêu đề là bắt buộc';
        }

        if (!formData.statement_text.trim()) {
            newErrors.statement_text = 'Đề bài là bắt buộc';
        }

        // Validate test cases dựa trên mode
        if (testCaseMode === 'manual') {
            if (testCases.length === 0) {
                newErrors.test_cases = 'Phải có ít nhất 1 test case';
            }
        } else if (testCaseMode === 'zip') {
            if (!zipFile) {
                newErrors.test_cases_zip = 'Phải chọn file ZIP chứa test cases';
            }
        }

        setErrors(newErrors);
        const errorKeys = Object.keys(newErrors);
        if (errorKeys.length > 0) {
            const firstError = newErrors[errorKeys[0]];
            notification.error(firstError, 'Lỗi validation');
        }
        return errorKeys.length === 0;
    };

    const handleZipFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.name.endsWith('.zip')) {
                notification.warning('Chỉ chấp nhận file .zip');
                e.target.value = '';
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                notification.warning('File ZIP quá lớn (tối đa 50MB)');
                e.target.value = '';
                return;
            }
            setZipFile(file);
            // Clear error nếu có
            if (errors.test_cases_zip) {
                setErrors((prev) => ({ ...prev, test_cases_zip: '' }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        // ============ TẠO FormData (hỗ trợ cả JSON và multipart) ============
        const submitFormData = new FormData();

        // Basic fields
        submitFormData.append('slug', formData.slug);
        submitFormData.append('title', formData.title);
        submitFormData.append('statement_text', formData.statement_text);
        submitFormData.append('difficulty', formData.difficulty);
        submitFormData.append('time_limit_ms', formData.time_limit_ms);
        submitFormData.append('memory_limit_kb', formData.memory_limit_kb);
        submitFormData.append('is_public', formData.is_public);

        // Optional fields
        if (formData.short_statement) submitFormData.append('short_statement', formData.short_statement);
        if (formData.input_format) submitFormData.append('input_format', formData.input_format);
        if (formData.output_format) submitFormData.append('output_format', formData.output_format);
        if (formData.source) submitFormData.append('source', formData.source);
        if (formData.validation_type) submitFormData.append('validation_type', formData.validation_type);
        if (formData.validation_type === 'custom') {
            if (formData.validator_language) {
                submitFormData.append('validator_language', formData.validator_language);
            }
            if (formData.custom_validator) {
                submitFormData.append('custom_validator', formData.custom_validator);
            }
        }
        if (formData.editorial_text) submitFormData.append('editorial_text', formData.editorial_text);

        // Tags & Languages (gửi dưới dạng JSON array)
        if (formData.tag_ids && formData.tag_ids.length > 0) {
            formData.tag_ids.forEach((tagId) => {
                submitFormData.append('tag_ids', tagId);
            });
        }
        if (formData.language_ids && formData.language_ids.length > 0) {
            formData.language_ids.forEach((langId) => {
                submitFormData.append('language_ids', langId);
            });
        }

        // ============ TEST CASES - 2 MODES ============
        if (testCaseMode === 'manual') {
            // Manual mode: gửi test_cases array dưới dạng JSON string
            submitFormData.append(
                'test_cases',
                JSON.stringify(
                    testCases.map((tc) => ({
                        type: tc.type,
                        sequence: tc.sequence,
                        input_data: tc.input_data,
                        output_data: tc.output_data,
                        points: parseFloat(tc.points),
                    })),
                ),
            );
        } else if (testCaseMode === 'zip' && zipFile) {
            // ZIP mode: gửi file ZIP + options
            submitFormData.append('test_cases_zip', zipFile);
            submitFormData.append('zip_auto_detect_type', zipUploadOptions.auto_detect_type);
            submitFormData.append('zip_default_type', zipUploadOptions.default_type);
            submitFormData.append('zip_default_points', zipUploadOptions.default_points);
        }

        try {
            let response;
            if (isEditMode) {
                response = await ProblemService.update(id, submitFormData);
            } else {
                response = await ProblemService.create(submitFormData);
            }

            notification.success(response.detail || 'Lưu bài toán thành công');
            if (response.sync_message) {
                console.log('Sync status:', response.sync_status, response.sync_message);
            }
            navigate('/admin/problems');
        } catch (error) {
            console.error('Error saving problem:', error);

            if (error.response?.data) {
                const serverErrors = error.response.data;
                if (typeof serverErrors === 'object' && !serverErrors.detail) {
                    setErrors(serverErrors);
                } else if (serverErrors.detail) {
                    notification.error(serverErrors.detail);
                } else {
                    notification.error('Lưu bài toán thất bại');
                }
            } else {
                notification.error('Lưu bài toán thất bại');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let processedValue = type === 'checkbox' ? checked : value;

        // Xử lý đặc biệt cho slug
        if (name === 'slug') {
            // Chỉ cho phép chữ thường, số, loại bỏ tất cả ký tự khác
            processedValue = value
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '') // Loại bỏ tất cả ký tự không phải chữ thường và số
                .slice(0, 10); // Giới hạn 10 ký tự
        }

        setFormData((prev) => ({
            ...prev,
            [name]: processedValue,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleTagToggle = (tagId) => {
        setFormData((prev) => ({
            ...prev,
            tag_ids: prev.tag_ids.includes(tagId)
                ? prev.tag_ids.filter((id) => id !== tagId)
                : [...prev.tag_ids, tagId],
        }));
    };

    const handleLanguageToggle = (langId) => {
        setFormData((prev) => ({
            ...prev,
            language_ids: prev.language_ids.includes(langId)
                ? prev.language_ids.filter((id) => id !== langId)
                : [...prev.language_ids, langId],
        }));
    };

    const addTestCase = () => {
        const newSequence = testCases.length > 0 ? Math.max(...testCases.map((tc) => tc.sequence)) + 1 : 1;
        setTestCases([
            ...testCases,
            {
                type: 'secret',
                sequence: newSequence,
                input_data: '',
                output_data: '',
                points: 10.0,
            },
        ]);
    };

    const removeTestCase = (index) => {
        if (testCases.length === 1) {
            notification.warning('Phải có ít nhất 1 test case');
            return;
        }
        setTestCases(testCases.filter((_, i) => i !== index));
    };

    const updateTestCase = (index, field, value) => {
        const updated = [...testCases];
        updated[index][field] = value;
        setTestCases(updated);
    };

    if (loading && isEditMode) {
        return (
            <div className="problem-form-loading-container">
                <div className="problem-form-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="problem-form">
            <div className="problem-form-page-header">
                <div className="problem-form-header-left">
                    <h1>{isEditMode ? 'Chỉnh sửa bài toán' : 'Tạo bài toán mới'}</h1>
                    <p className="problem-form-subtitle">
                        {isEditMode ? 'Cập nhật thông tin bài toán' : 'Thêm bài toán lập trình mới vào hệ thống'}
                    </p>
                </div>
            </div>

            <div className="problem-form-container">
                <form onSubmit={handleSubmit}>
                    {/* Basic Info */}
                    <div className="problem-form-section">
                        <h3 className="problem-form-section-title">Thông tin cơ bản</h3>

                        <div className="problem-form-row">
                            <div className="problem-form-group">
                                <label htmlFor="slug">
                                    Mã bài <span className="problem-form-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="slug"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className={errors.slug ? 'problem-form-error' : ''}
                                    placeholder="twosum"
                                    maxLength={10}
                                    disabled={isEditMode}
                                />
                                {errors.slug && <span className="problem-form-error-message">{errors.slug}</span>}
                                <span className="problem-form-input-hint">
                                    Tối đa 10 ký tự, chỉ chữ thường và số (a-z, 0-9) - Ví dụ: twosum, dp01
                                </span>
                            </div>

                            <div className="problem-form-group">
                                <label htmlFor="difficulty">
                                    Độ khó <span className="problem-form-required">*</span>
                                </label>
                                <select
                                    id="difficulty"
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                >
                                    <option value="easy">Dễ</option>
                                    <option value="medium">Trung bình</option>
                                    <option value="hard">Khó</option>
                                </select>
                            </div>
                        </div>

                        <div className="problem-form-group">
                            <label htmlFor="title">
                                Tiêu đề <span className="problem-form-required">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={errors.title ? 'problem-form-error' : ''}
                                placeholder="Two Sum"
                            />
                            {errors.title && <span className="problem-form-error-message">{errors.title}</span>}
                        </div>

                        <div className="problem-form-group">
                            <label htmlFor="short_statement">Mô tả ngắn</label>
                            <input
                                type="text"
                                id="short_statement"
                                name="short_statement"
                                value={formData.short_statement}
                                onChange={handleChange}
                                placeholder="Tìm hai số trong mảng có tổng bằng target"
                                maxLength={512}
                            />
                            <span className="problem-form-input-hint">Tối đa 512 ký tự</span>
                        </div>

                        <div className="problem-form-group">
                            <label htmlFor="source">Nguồn</label>
                            <input
                                type="text"
                                id="source"
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                placeholder="ICPC 2023, LeetCode..."
                            />
                        </div>
                    </div>

                    {/* Problem Statement */}
                    <div className="problem-form-section">
                        <h3 className="problem-form-section-title">Đề bài</h3>

                        <div className="problem-form-group">
                            <label>
                                Nội dung đề bài <span className="problem-form-required">*</span>
                            </label>
                            <CKEditorComponent
                                value={formData.statement_text}
                                onChange={(data) => setFormData({ ...formData, statement_text: data })}
                                placeholder="Nhập nội dung đề bài chi tiết..."
                            />
                            {errors.statement_text && (
                                <span className="problem-form-error-message">{errors.statement_text}</span>
                            )}
                        </div>

                        <div className="problem-form-row">
                            <div className="problem-form-group">
                                <label htmlFor="input_format">Định dạng đầu vào</label>
                                <textarea
                                    id="input_format"
                                    name="input_format"
                                    value={formData.input_format}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Dòng 1: n (số lượng phần tử)&#10;Dòng 2: n số nguyên..."
                                />
                            </div>

                            <div className="problem-form-group">
                                <label htmlFor="output_format">Định dạng đầu ra</label>
                                <textarea
                                    id="output_format"
                                    name="output_format"
                                    value={formData.output_format}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="In ra 2 số nguyên cách nhau bởi dấu cách..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Constraints */}
                    <div className="problem-form-section">
                        <h3 className="problem-form-section-title">Giới hạn</h3>

                        <div className="problem-form-row">
                            <div className="problem-form-group">
                                <label htmlFor="time_limit_ms">Time Limit (ms)</label>
                                <input
                                    type="number"
                                    id="time_limit_ms"
                                    name="time_limit_ms"
                                    value={formData.time_limit_ms}
                                    onChange={handleChange}
                                    min="100"
                                    max="30000"
                                    step="100"
                                />
                                <span className="problem-form-input-hint">100ms - 30000ms</span>
                            </div>

                            <div className="problem-form-group">
                                <label htmlFor="memory_limit_kb">Memory Limit (KB)</label>
                                <input
                                    type="number"
                                    id="memory_limit_kb"
                                    name="memory_limit_kb"
                                    value={formData.memory_limit_kb}
                                    onChange={handleChange}
                                    min="1024"
                                    max="2097152"
                                    step="1024"
                                />
                                <span className="problem-form-input-hint">1MB - 2GB</span>
                            </div>
                        </div>
                    </div>

                    {/* Validation */}
                    <div className="problem-form-section">
                        <h3 className="problem-form-section-title">Phương thức chấm bài</h3>

                        <div className="problem-form-group">
                            <label htmlFor="validation_type">Loại validation</label>
                            <select
                                id="validation_type"
                                name="validation_type"
                                value={formData.validation_type}
                                onChange={handleChange}
                            >
                                <option value="default">Default (So sánh chính xác)</option>
                                <option value="custom">Custom Validator (Nhiều output đúng)</option>
                            </select>
                            <span className="problem-form-input-hint">
                                Chọn "Custom Validator" cho bài toán có nhiều đáp án đúng (ví dụ: tìm 2 số có tổng = 10)
                            </span>
                        </div>

                        {formData.validation_type === 'custom' && (
                            <>
                                <div className="problem-form-group">
                                    <label htmlFor="validator_language">
                                        Ngôn ngữ Validator <span className="problem-form-required">*</span>
                                    </label>
                                    <select
                                        id="validator_language"
                                        name="validator_language"
                                        value={formData.validator_language}
                                        onChange={handleChange}
                                    >
                                        <option value="python">Python</option>
                                        <option value="cpp">C++</option>
                                        <option value="java">Java</option>
                                        <option value="bash">Bash</option>
                                        <option value="node">Node.js</option>
                                        <option value="pascal">Pascal</option>
                                    </select>
                                    <span className="problem-form-input-hint">
                                        Chọn ngôn ngữ lập trình cho custom validator
                                    </span>
                                </div>

                                <div className="problem-form-group">
                                    <label htmlFor="custom_validator">
                                        Custom Validator Script (
                                        {formData.validator_language === 'python'
                                            ? 'Python 3'
                                            : formData.validator_language === 'cpp'
                                            ? 'C++'
                                            : formData.validator_language === 'java'
                                            ? 'Java'
                                            : formData.validator_language === 'bash'
                                            ? 'Bash'
                                            : formData.validator_language === 'node'
                                            ? 'Node.js'
                                            : 'Pascal'}
                                        )
                                    </label>
                                    <textarea
                                        id="custom_validator"
                                        name="custom_validator"
                                        value={formData.custom_validator}
                                        onChange={handleChange}
                                        rows="15"
                                        placeholder={`#!/usr/bin/env python3
import sys

def main():
    if len(sys.argv) < 4:
        sys.exit(1)
    
    input_file = sys.argv[1]
    answer_file = sys.argv[2]
    feedback_dir = sys.argv[3]
    
    with open(input_file, 'r') as f:
        input_data = f.read()
    
    with open(answer_file, 'r') as f:
        judge_answer = f.read()
    
    team_output = sys.stdin.read()
    
    # TODO: Implement validation logic
    # Exit code 42 = Accepted
    # Exit code 43 = Wrong Answer
    
    sys.exit(42)

if __name__ == '__main__':
    main()`}
                                        className="problem-form-code-textarea"
                                        style={{ fontFamily: 'monospace', fontSize: '13px' }}
                                    />
                                    <span className="problem-form-input-hint">
                                        Script để validate output. Exit code: 42 (AC), 43 (WA).
                                        {/* <a 
                                            href="/CUSTOM_VALIDATOR_GUIDE.md" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ marginLeft: '5px', color: '#0066cc' }}
                                        >
                                            Xem hướng dẫn chi tiết
                                        </a> */}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ============================================================
                        TEST CASES - 2 MODES (MANUAL | ZIP)
                        ============================================================ */}
                    <div className="problem-form-section">
                        <div className="problem-form-section-header">
                            <h3 className="problem-form-section-title">Test Cases</h3>
                            <div className="problem-form-testcase-mode-selector">
                                <button
                                    type="button"
                                    className={`problem-form-mode-btn ${testCaseMode === 'manual' ? 'active' : ''}`}
                                    onClick={() => setTestCaseMode('manual')}
                                >
                                    <FaPlus /> Nhập thủ công
                                </button>
                                <button
                                    type="button"
                                    className={`problem-form-mode-btn ${testCaseMode === 'zip' ? 'active' : ''}`}
                                    onClick={() => setTestCaseMode('zip')}
                                >
                                    <FaFileArchive /> Upload ZIP
                                </button>
                            </div>
                        </div>

                        {/* MANUAL MODE */}
                        {testCaseMode === 'manual' ? (
                            <>
                                <button type="button" className="problem-form-btn-add-testcase" onClick={addTestCase}>
                                    <FaPlus /> Thêm test case
                                </button>

                                {errors.test_cases && (
                                    <span className="problem-form-error-message">{errors.test_cases}</span>
                                )}

                                <div className="problem-form-testcases-list">
                                    {testCases.map((tc, index) => (
                                        <div key={index} className="problem-form-testcase-item">
                                            <div className="problem-form-testcase-header">
                                                <span className="problem-form-testcase-number">
                                                    Test Case #{index + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="problem-form-btn-remove-testcase"
                                                    onClick={() => removeTestCase(index)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>

                                            <div className="problem-form-testcase-body">
                                                <div className="problem-form-row">
                                                    <div className="problem-form-group">
                                                        <label>Loại</label>
                                                        <select
                                                            value={tc.type}
                                                            onChange={(e) =>
                                                                updateTestCase(index, 'type', e.target.value)
                                                            }
                                                        >
                                                            <option value="sample">Sample (Công khai)</option>
                                                            <option value="secret">Secret (Ẩn)</option>
                                                        </select>
                                                    </div>

                                                    <div className="problem-form-group">
                                                        <label>Điểm</label>
                                                        <input
                                                            type="number"
                                                            value={tc.points}
                                                            onChange={(e) =>
                                                                updateTestCase(index, 'points', e.target.value)
                                                            }
                                                            min="0"
                                                            step="0.1"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="problem-form-group">
                                                    <label>Input</label>
                                                    <textarea
                                                        value={tc.input_data}
                                                        onChange={(e) =>
                                                            updateTestCase(index, 'input_data', e.target.value)
                                                        }
                                                        rows="4"
                                                        placeholder="Nhập dữ liệu đầu vào..."
                                                        className="problem-form-code-textarea"
                                                    />
                                                </div>

                                                <div className="problem-form-group">
                                                    <label>Output</label>
                                                    <textarea
                                                        value={tc.output_data}
                                                        onChange={(e) =>
                                                            updateTestCase(index, 'output_data', e.target.value)
                                                        }
                                                        rows="4"
                                                        placeholder="Nhập kết quả mong đợi..."
                                                        className="problem-form-code-textarea"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            /* ZIP MODE */
                            <div className="problem-form-zip-upload-section">
                                <div className="problem-form-zip-upload-info">
                                    <h4>📋 Hướng dẫn upload ZIP:</h4>
                                    <ul>
                                        <li>
                                            File ZIP chứa các file test case với định dạng <code>.in</code> và{' '}
                                            <code>.out</code> (hoặc <code>.ans</code>)
                                        </li>
                                        <li>
                                            Các file có cùng tên sẽ được ghép thành 1 test case. Ví dụ:{' '}
                                            <code>test01.in</code> và <code>test01.out</code>
                                        </li>
                                        <li>
                                            Hỗ trợ 2 cấu trúc:
                                            <ul>
                                                <li>
                                                    <strong>Flat:</strong>{' '}
                                                    <code>test01.in, test01.out, test02.in, test02.out</code>
                                                </li>
                                                <li>
                                                    <strong>Folder:</strong>{' '}
                                                    <code>
                                                        sample/01.in, sample/01.ans, secret/01.in, secret/01.ans
                                                    </code>
                                                </li>
                                            </ul>
                                        </li>
                                        <li>
                                            Chỉ tạo test case khi có đủ cả file <code>.in</code> và <code>.out</code>
                                        </li>
                                    </ul>
                                </div>

                                <div className="problem-form-zip-upload-box">
                                    <input
                                        type="file"
                                        id="zip-upload"
                                        accept=".zip"
                                        onChange={handleZipFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="zip-upload" className="problem-form-zip-upload-label">
                                        <FaFileArchive size={40} color="#667eea" />
                                        <p>{zipFile ? zipFile.name : 'Chọn file ZIP chứa test cases'}</p>
                                        <span className="problem-form-zip-file-size">
                                            {zipFile ? `${(zipFile.size / 1024).toFixed(2)} KB` : 'Tối đa 50MB'}
                                        </span>
                                    </label>
                                </div>

                                {errors.test_cases_zip && (
                                    <span className="problem-form-error-message">{errors.test_cases_zip}</span>
                                )}

                                <div className="problem-form-zip-options">
                                    <h4>⚙️ Tùy chọn xử lý:</h4>

                                    <label className="problem-form-checkbox-item">
                                        <input
                                            type="checkbox"
                                            checked={zipUploadOptions.auto_detect_type}
                                            onChange={(e) =>
                                                setZipUploadOptions({
                                                    ...zipUploadOptions,
                                                    auto_detect_type: e.target.checked,
                                                })
                                            }
                                        />
                                        <span>Tự động nhận diện type từ tên folder (sample/secret)</span>
                                    </label>

                                    <div className="problem-form-row">
                                        <div className="problem-form-group">
                                            <label>Type mặc định (nếu không detect được):</label>
                                            <select
                                                value={zipUploadOptions.default_type}
                                                onChange={(e) =>
                                                    setZipUploadOptions({
                                                        ...zipUploadOptions,
                                                        default_type: e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="sample">Sample (Công khai)</option>
                                                <option value="secret">Secret (Ẩn)</option>
                                            </select>
                                        </div>

                                        <div className="problem-form-group">
                                            <label>Điểm mặc định cho mỗi test case:</label>
                                            <input
                                                type="number"
                                                value={zipUploadOptions.default_points}
                                                onChange={(e) =>
                                                    setZipUploadOptions({
                                                        ...zipUploadOptions,
                                                        default_points: parseFloat(e.target.value) || 0,
                                                    })
                                                }
                                                min="0"
                                                step="0.1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="problem-form-section">
                        <h3 className="problem-form-section-title">Thẻ (Tags)</h3>
                        <div className="problem-form-checkbox-group">
                            {tags.map((tag) => (
                                <label key={tag.id} className="problem-form-checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={formData.tag_ids.includes(tag.id)}
                                        onChange={() => handleTagToggle(tag.id)}
                                    />
                                    <span>{tag.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Languages */}
                    <div className="problem-form-section">
                        <h3 className="problem-form-section-title">Ngôn ngữ được phép</h3>
                        <div className="problem-form-checkbox-group">
                            {languages.map((lang) => (
                                <label key={lang.id} className="problem-form-checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={formData.language_ids.includes(lang.id)}
                                        onChange={() => handleLanguageToggle(lang.id)}
                                    />
                                    <span>{lang.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Editorial */}
                    <div className="problem-form-section">
                        <h3 className="problem-form-section-title">Lời giải (Editorial)</h3>
                        <div className="problem-form-group">
                            <CKEditorComponent
                                value={formData.editorial_text}
                                onChange={(data) => setFormData({ ...formData, editorial_text: data })}
                                placeholder="Nhập lời giải chi tiết..."
                            />
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="problem-form-section">
                        <h3 className="problem-form-section-title">Cài đặt</h3>
                        <label className="problem-form-checkbox-item">
                            <input
                                type="checkbox"
                                name="is_public"
                                checked={formData.is_public}
                                onChange={handleChange}
                            />
                            <span>Công khai bài toán</span>
                        </label>
                    </div>

                    {/* Form Actions */}
                    <div className="problem-form-actions">
                        <button
                            type="button"
                            className="problem-form-btn-cancel"
                            onClick={() => navigate('/admin/problems')}
                        >
                            <FaTimes /> Hủy
                        </button>
                        <button type="submit" className="problem-form-btn-submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="problem-form-btn-spinner"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <FaSave /> {isEditMode ? 'Cập nhật' : 'Tạo mới'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProblemForm;
