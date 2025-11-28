import React, { useState, useEffect } from 'react';
import notification from '../../../utils/notification';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaBook, FaInfoCircle } from 'react-icons/fa';
import CourseService from '../../../services/CourseService';
import './CourseFormPage.css';

const CourseFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        short_description: '',
        long_description: '',
        level: 'beginner',
        price: 0,
        is_published: false,
        language_ids: [],
        tag_ids: []
    });

    const [languages, setLanguages] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [languagesData, tagsData] = await Promise.all([
                CourseService.getLanguages(),
                CourseService.getTags()
            ]);
            
            setLanguages(languagesData);
            setTags(tagsData);

            if (isEdit) {
                const courseData = await CourseService.getCourse(id);
                setFormData({
                    title: courseData.title || '',
                    slug: courseData.slug || '',
                    short_description: courseData.short_description || '',
                    long_description: courseData.long_description || '',
                    level: courseData.level || 'beginner',
                    price: courseData.price || 0,
                    is_published: courseData.is_published || false,
                    language_ids: courseData.languages ? courseData.languages.map(lang => lang.id) : [],
                    tag_ids: courseData.tags ? courseData.tags.map(tag => tag.id) : []
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
            notification.error('Không thể tải dữ liệu');
        }
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Auto-generate slug from title
        if (name === 'title' && !isEdit) {
            setFormData(prev => ({
                ...prev,
                slug: generateSlug(value)
            }));
        }

        // Clear error
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleLanguageToggle = (languageId) => {
        setFormData(prev => ({
            ...prev,
            language_ids: prev.language_ids.includes(languageId)
                ? prev.language_ids.filter(id => id !== languageId)
                : [...prev.language_ids, languageId]
        }));
    };

    const handleTagToggle = (tagId) => {
        setFormData(prev => ({
            ...prev,
            tag_ids: prev.tag_ids.includes(tagId)
                ? prev.tag_ids.filter(id => id !== tagId)
                : [...prev.tag_ids, tagId]
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Tiêu đề là bắt buộc';
        }

        if (!formData.slug.trim()) {
            newErrors.slug = 'Slug là bắt buộc';
        }

        if (formData.price < 0) {
            newErrors.price = 'Giá không được âm';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            if (isEdit) {
                await CourseService.updateCourse(id, formData);
                notification.success('Cập nhật khóa học thành công!');
            } else {
                await CourseService.createCourse(formData);
                notification.success('Tạo khóa học thành công!');
            }
            navigate('/admin/courses');
        } catch (error) {
            console.error('Error saving course:', error);
            if (error.response?.data) {
                const serverErrors = error.response.data;
                setErrors(serverErrors);
            }
            notification.error('Lưu khóa học thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="course-form-page">
            <div className="course-form-page-header">
                <div className="course-form-page-header-left">
                    <FaBook className="course-form-page-header-icon" />
                    <h1>{isEdit ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}</h1>
                </div>
                <button 
                    className="course-form-page-btn-back" 
                    onClick={() => navigate('/admin/courses')}
                >
                    <FaTimes /> Hủy
                </button>
            </div>

            <form onSubmit={handleSubmit} className="course-form-page-form">
                <div className="course-form-page-card">
                    <h2>Thông tin cơ bản</h2>
                    
                    <div className="course-form-page-form-group">
                        <label>
                            Tiêu đề <span className="course-form-page-required">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Nhập tiêu đề khóa học"
                            className={errors.title ? 'error' : ''}
                        />
                        {errors.title && (
                            <span className="course-form-page-error-text">
                                <FaInfoCircle /> {errors.title}
                            </span>
                        )}
                    </div>

                    <div className="course-form-page-form-group">
                        <label>
                            Slug <span className="course-form-page-required">*</span>
                        </label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="khoa-hoc-lap-trinh"
                            className={errors.slug ? 'error' : ''}
                        />
                        {errors.slug && (
                            <span className="course-form-page-error-text">
                                <FaInfoCircle /> {errors.slug}
                            </span>
                        )}
                    </div>

                    <div className="course-form-page-form-group">
                        <label>Mô tả ngắn</label>
                        <textarea
                            name="short_description"
                            value={formData.short_description}
                            onChange={handleChange}
                            placeholder="Mô tả ngắn gọn về khóa học (tối đa 512 ký tự)"
                            rows="3"
                            maxLength="512"
                        />
                    </div>

                    <div className="course-form-page-form-group">
                        <label>Mô tả chi tiết</label>
                        <textarea
                            name="long_description"
                            value={formData.long_description}
                            onChange={handleChange}
                            placeholder="Mô tả chi tiết về khóa học, nội dung, mục tiêu học tập..."
                            rows="6"
                        />
                    </div>

                    <div className="course-form-page-form-row">
                        <div className="course-form-page-form-group">
                            <label>Cấp độ</label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                            >
                                <option value="beginner">Cơ bản</option>
                                <option value="intermediate">Trung bình</option>
                                <option value="advanced">Nâng cao</option>
                            </select>
                        </div>

                        <div className="course-form-page-form-group">
                            <label>Giá (VND)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="1000"
                                className={errors.price ? 'error' : ''}
                            />
                            {errors.price && (
                                <span className="course-form-page-error-text">
                                    <FaInfoCircle /> {errors.price}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="course-form-page-form-group">
                        <label className="course-form-page-checkbox-label">
                            <input
                                type="checkbox"
                                name="is_published"
                                checked={formData.is_published}
                                onChange={handleChange}
                            />
                            Xuất bản khóa học
                        </label>
                    </div>
                </div>

                <div className="course-form-page-card">
                    <h2>Ngôn ngữ lập trình</h2>
                    <div className="course-form-page-checkbox-grid">
                        {languages.map(language => (
                            <label key={language.id} className="course-form-page-checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={formData.language_ids.includes(language.id)}
                                    onChange={() => handleLanguageToggle(language.id)}
                                />
                                {language.name}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="course-form-page-card">
                    <h2>Tags</h2>
                    <div className="course-form-page-checkbox-grid">
                        {tags.map(tag => (
                            <label key={tag.id} className="course-form-page-checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={formData.tag_ids.includes(tag.id)}
                                    onChange={() => handleTagToggle(tag.id)}
                                />
                                {tag.name}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="course-form-page-actions">
                    <button 
                        type="button" 
                        className="course-form-page-btn-cancel"
                        onClick={() => navigate('/admin/courses')}
                    >
                        <FaTimes /> Hủy
                    </button>
                    <button 
                        type="submit" 
                        className="course-form-page-btn-submit"
                        disabled={loading}
                    >
                        <FaSave /> {loading ? 'Đang lưu...' : 'Lưu khóa học'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CourseFormPage;
