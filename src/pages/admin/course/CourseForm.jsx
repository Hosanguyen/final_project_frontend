// src/pages/admin/course/CourseForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import './CourseForm.css';
import notification from '../../../utils/notification';

const CourseForm = ({ course, languages, tags, onSubmit, onClose }) => {
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        slug: course.slug || '',
        short_description: course.short_description || '',
        long_description: course.long_description || '',
        level: course.level || 'beginner',
        price: course.price || 0,
        is_published: course.is_published || false,
        language_ids: course.languages ? course.languages.map(lang => lang.id) : [],
        tag_ids: course.tags ? course.tags.map(tag => tag.id) : []
      });
    }
  }, [course]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from title
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMultiSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
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
    
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      notification.error(firstError, 'Lỗi validation');
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (course) {
        await onSubmit(course.id, formData);
      } else {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const levelOptions = [
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung bình' },
    { value: 'advanced', label: 'Nâng cao' }
  ];

  return (
    <div className="course-form-overlay">
      <div className="course-form-modal">
        <div className="form-header">
          <h2>{course ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}</h2>
          <button onClick={onClose} className="close-btn">
            <X className="close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="title" className="form-label">
                Tiêu đề khóa học *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="Nhập tiêu đề khóa học"
              />
              {errors.title && (
                <div className="course-form-error-message">
                  <AlertCircle className="error-icon" />
                  {errors.title}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="slug" className="form-label">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={`form-input ${errors.slug ? 'error' : ''}`}
                placeholder="slug-khoa-hoc"
              />
              {errors.slug && (
                <div className="course-form-error-message">
                  <AlertCircle className="error-icon" />
                  {errors.slug}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="level" className="form-label">
                Cấp độ
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="form-select"
              >
                {levelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Giá (VNĐ)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={`form-input ${errors.price ? 'error' : ''}`}
                placeholder="0"
                min="0"
                step="1000"
              />
              {errors.price && (
                <div className="course-form-error-message">
                  <AlertCircle className="error-icon" />
                  {errors.price}
                </div>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="short_description" className="form-label">
                Mô tả ngắn
              </label>
              <textarea
                id="short_description"
                name="short_description"
                value={formData.short_description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Mô tả ngắn về khóa học"
                rows="3"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="long_description" className="form-label">
                Mô tả chi tiết
              </label>
              <textarea
                id="long_description"
                name="long_description"
                value={formData.long_description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Mô tả chi tiết về khóa học"
                rows="6"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ngôn ngữ</label>
              <div className="multi-select">
                {languages.map(lang => (
                  <label key={lang.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.language_ids.includes(lang.id)}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...formData.language_ids, lang.id]
                          : formData.language_ids.filter(id => id !== lang.id);
                        handleMultiSelectChange('language_ids', newIds);
                      }}
                    />
                    <span className="checkbox-label">{lang.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Thẻ</label>
              <div className="multi-select">
                {tags.map(tag => (
                  <label key={tag.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.tag_ids.includes(tag.id)}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...formData.tag_ids, tag.id]
                          : formData.tag_ids.filter(id => id !== tag.id);
                        handleMultiSelectChange('tag_ids', newIds);
                      }}
                    />
                    <span className="checkbox-label">{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group full-width">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleInputChange}
                />
                <span className="checkbox-label">Xuất bản khóa học</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner" />
              ) : (
                <>
                  <Save className="btn-icon" />
                  {course ? 'Cập nhật' : 'Tạo khóa học'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;
