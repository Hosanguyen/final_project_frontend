import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import ProblemService from '../../../services/ProblemService';
import CourseService from '../../../services/CourseService';
import CKEditorComponent from '../../../components/CKEditor';
import './ProblemForm.css';

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
            alert('Không thể tải thông tin bài toán');
            navigate('/admin/problems');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.slug.trim()) {
            newErrors.slug = 'Slug là bắt buộc';
        } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            newErrors.slug = 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang';
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Tiêu đề là bắt buộc';
        }

        if (!formData.statement_text.trim()) {
            newErrors.statement_text = 'Đề bài là bắt buộc';
        }

        if (testCases.length === 0) {
            newErrors.test_cases = 'Phải có ít nhất 1 test case';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const submitData = {
            ...formData,
            test_cases: testCases.map((tc) => ({
                type: tc.type,
                sequence: tc.sequence,
                input_data: tc.input_data,
                output_data: tc.output_data,
                points: parseFloat(tc.points),
            })),
        };

        try {
            let response;
            if (isEditMode) {
                response = await ProblemService.update(id, submitData);
            } else {
                response = await ProblemService.create(submitData);
            }

            alert(response.detail);
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
                    alert(serverErrors.detail);
                } else {
                    alert('Lưu bài toán thất bại');
                }
            } else {
                alert('Lưu bài toán thất bại');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
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
            alert('Phải có ít nhất 1 test case');
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
                                    Slug <span className="problem-form-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="slug"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className={errors.slug ? 'problem-form-error' : ''}
                                    placeholder="two-sum"
                                    disabled={isEditMode}
                                />
                                {errors.slug && <span className="problem-form-error-message">{errors.slug}</span>}
                                <span className="problem-form-input-hint">
                                    Chỉ sử dụng chữ thường, số và dấu gạch ngang (-)
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
                                placeholder="LeetCode, Codeforces..."
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

                    {/* Test Cases */}
                    <div className="problem-form-section">
                        <div className="problem-form-section-header">
                            <h3 className="problem-form-section-title">Test Cases</h3>
                            <button type="button" className="problem-form-btn-add-testcase" onClick={addTestCase}>
                                <FaPlus /> Thêm test case
                            </button>
                        </div>

                        {errors.test_cases && <span className="problem-form-error-message">{errors.test_cases}</span>}

                        <div className="problem-form-testcases-list">
                            {testCases.map((tc, index) => (
                                <div key={index} className="problem-form-testcase-item">
                                    <div className="problem-form-testcase-header">
                                        <span className="problem-form-testcase-number">Test Case #{index + 1}</span>
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
                                                    onChange={(e) => updateTestCase(index, 'type', e.target.value)}
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
                                                    onChange={(e) => updateTestCase(index, 'points', e.target.value)}
                                                    min="0"
                                                    step="0.1"
                                                />
                                            </div>
                                        </div>

                                        <div className="problem-form-group">
                                            <label>Input</label>
                                            <textarea
                                                value={tc.input_data}
                                                onChange={(e) => updateTestCase(index, 'input_data', e.target.value)}
                                                rows="4"
                                                placeholder="Nhập dữ liệu đầu vào..."
                                                className="problem-form-code-textarea"
                                            />
                                        </div>

                                        <div className="problem-form-group">
                                            <label>Output</label>
                                            <textarea
                                                value={tc.output_data}
                                                onChange={(e) => updateTestCase(index, 'output_data', e.target.value)}
                                                rows="4"
                                                placeholder="Nhập kết quả mong đợi..."
                                                className="problem-form-code-textarea"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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
