// src/pages/admin/lesson/LessonForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';
import './LessonForm.css';
import LessonService from '../../../services/LessonService';
import notification from '../../../utils/notification';

const LessonForm = ({ lesson, courses, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    course: '',
    title: '',
    description: '',
    sequence: 0
  });
  const [resources, setResources] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const resourceTypes = [
    { value: 'video', label: 'Video' },
    { value: 'pdf', label: 'PDF' },
    { value: 'slide', label: 'Slide' },
    { value: 'text', label: 'Văn bản' },
    { value: 'link', label: 'Liên kết' },
    { value: 'file', label: 'Tệp' }
  ];

  useEffect(() => {
    if (lesson) {
      setFormData({
        course: lesson.course || '',
        title: lesson.title || '',
        description: lesson.description || '',
        sequence: lesson.sequence || 0
      });
      setResources(lesson.resources || []);
    }
  }, [lesson]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleResourceChange = (index, field, value) => {
    const newResources = [...resources];
    newResources[index] = {
      ...newResources[index],
      [field]: value
    };
    setResources(newResources);
  };

  const addResource = () => {
    setResources([...resources, {
      type: 'text',
      title: '',
      content: '',
      url: '',
      sequence: resources.length
    }]);
  };

  const removeResource = (index) => {
    const newResources = resources.filter((_, i) => i !== index);
    setResources(newResources);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.course) {
      newErrors.course = 'Khóa học là bắt buộc';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }

    if (formData.sequence < 0) {
      newErrors.sequence = 'Thứ tự không được âm';
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
  
    if (!validateForm()) return;
    setLoading(true);
  
    try {
      let createdLesson;
  
      // Nếu là edit thì update lesson
      if (lesson) {
        createdLesson = await onSubmit(lesson.id, formData);
      } else {
        createdLesson = await onSubmit(formData);
      }
  
      // Sau khi tạo lesson, nếu có resources thì gửi từng cái
      if (!lesson && createdLesson && createdLesson.id && resources.length > 0) {
        for (const res of resources) {
          const resourceData = new FormData();
          resourceData.append('lesson', createdLesson.id);
          resourceData.append('type', res.type);
          if (res.title) resourceData.append('title', res.title);
          if (res.content) resourceData.append('content', res.content);
          if (res.url) resourceData.append('url', res.url);
          resourceData.append('sequence', res.sequence || 0);
          if (res.file) resourceData.append('file', res.file);
  
          await LessonService.createLessonResource(resourceData);
        }
      }
  
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="lesson-form-overlay">
      <div className="lesson-form-modal">
        <div className="form-header">
          <h2>{lesson ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}</h2>
          <button onClick={onClose} className="close-btn">
            <X className="close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="lesson-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="course" className="form-label">
                Khóa học *
              </label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                className={`form-select ${errors.course ? 'error' : ''}`}
              >
                <option value="">Chọn khóa học</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {errors.course && (
                <div className="lesson-form-error-message">
                  <AlertCircle className="error-icon" />
                  {errors.course}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="sequence" className="form-label">
                Thứ tự
              </label>
              <input
                type="number"
                id="sequence"
                name="sequence"
                value={formData.sequence}
                onChange={handleInputChange}
                className={`form-input ${errors.sequence ? 'error' : ''}`}
                placeholder="0"
                min="0"
              />
              {errors.sequence && (
                <div className="lesson-form-error-message">
                  <AlertCircle className="error-icon" />
                  {errors.sequence}
                </div>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="title" className="form-label">
                Tiêu đề bài học *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="Nhập tiêu đề bài học"
              />
              {errors.title && (
                <div className="lesson-form-error-message">
                  <AlertCircle className="error-icon" />
                  {errors.title}
                </div>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="description" className="form-label">
                Mô tả bài học
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Mô tả chi tiết về bài học"
                rows="4"
              />
            </div>
          </div>

          <div className="resources-section">
            <div className="resources-header">
              <h3>Tài nguyên bài học</h3>
              <button
                type="button"
                onClick={addResource}
                className="btn-add-resource"
              >
                <Plus className="btn-icon" />
                Thêm tài nguyên
              </button>
            </div>

            <div className="resources-list">
              {resources.map((resource, index) => (
                <div key={index} className="resource-item">
                  <div className="resource-header">
                    <span className="resource-number">#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeResource(index)}
                      className="btn-remove-resource"
                    >
                      <Trash2 className="btn-icon" />
                    </button>
                  </div>

                  <div className="resource-fields">
                    <div className="form-group">
                      <label className="form-label">Loại tài nguyên</label>
                      <select
                        value={resource.type}
                        onChange={(e) => handleResourceChange(index, 'type', e.target.value)}
                        className="form-select"
                      >
                        {resourceTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tiêu đề</label>
                      <input
                        type="text"
                        value={resource.title}
                        onChange={(e) => handleResourceChange(index, 'title', e.target.value)}
                        className="form-input"
                        placeholder="Tiêu đề tài nguyên"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nội dung/URL</label>
                      <input
                        type="text"
                        value={resource.content || resource.url}
                        onChange={(e) => {
                          if (resource.type === 'link') {
                            handleResourceChange(index, 'url', e.target.value);
                          } else {
                            handleResourceChange(index, 'content', e.target.value);
                          }
                        }}
                        className="form-input"
                        placeholder={resource.type === 'link' ? 'URL liên kết' : 'Nội dung'}
                      />
                    </div>
                    {['pdf', 'file', 'slide'].includes(resource.type) && (
                      <div className="form-group">
                        <label className="form-label">Tệp tải lên</label>

                        {/* Nếu đã có file_url -> hiển thị link tải */}
                        {resource.file_url && (
                          <div className="current-file">
                            <p>
                              📄 <strong>File hiện tại:</strong>{' '}
                              {resource.filename || resource.file_url.split('/').pop()}
                            </p>
                            <a
                              href={`http://localhost:8000${resource.file_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-link"
                            >
                              🔗 Xem
                            </a>
                          </div>
                        )}

                        {/* Input để chọn file mới (vẫn cho phép thay thế file cũ) */}
                        <input
                          type="file"
                          onChange={(e) =>
                            handleResourceChange(index, 'file', e.target.files[0])
                          }
                          className="form-input"
                          accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.rar,.mp4"
                        />
                      </div>
                    )}


                    <div className="form-group">
                      <label className="form-label">Thứ tự</label>
                      <input
                        type="number"
                        value={resource.sequence}
                        onChange={(e) => handleResourceChange(index, 'sequence', parseInt(e.target.value) || 0)}
                        className="form-input"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {resources.length === 0 && (
                <div className="empty-resources">
                  <p>Chưa có tài nguyên nào. Hãy thêm tài nguyên cho bài học.</p>
                </div>
              )}
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
                  {lesson ? 'Cập nhật' : 'Tạo bài học'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonForm;
