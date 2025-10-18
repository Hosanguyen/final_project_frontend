// src/pages/admin/course/CourseCard.jsx
import React from 'react';
import { Edit, Trash2, Eye, EyeOff, BookOpen, Users, Tag, Calendar } from 'lucide-react';
import './CourseCard.css';

const CourseCard = ({ 
  course, 
  onEdit, 
  onDelete, 
  getLevelBadgeColor, 
  getLevelText 
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="course-card">
      <div className="course-card-header">
        <div className="course-title-section">
          <h3 className="course-title">{course.title}</h3>
          <div className="course-badges">
            <span className={`level-badge ${getLevelBadgeColor(course.level)}`}>
              {getLevelText(course.level)}
            </span>
            {course.is_published ? (
              <span className="status-badge published">
                <Eye className="badge-icon" />
                Đã xuất bản
              </span>
            ) : (
              <span className="status-badge draft">
                <EyeOff className="badge-icon" />
                Bản nháp
              </span>
            )}
          </div>
        </div>
        <div className="course-actions">
          <button
            onClick={() => onEdit(course)}
            className="action-btn edit"
            title="Chỉnh sửa"
          >
            <Edit className="action-icon" />
          </button>
          <button
            onClick={() => onDelete(course.id)}
            className="action-btn delete"
            title="Xóa"
          >
            <Trash2 className="action-icon" />
          </button>
        </div>
      </div>

      <div className="course-content">
        <p className="course-description">
          {course.short_description || 'Chưa có mô tả'}
        </p>

        <div className="course-meta">
          <div className="meta-item">
            <BookOpen className="meta-icon" />
            <span>{course.lessons_count} bài học</span>
          </div>
          <div className="meta-item">
            <Users className="meta-icon" />
            <span>{course.enrollments_count} học viên</span>
          </div>
          <div className="meta-item">
            <Calendar className="meta-icon" />
            <span>{formatDate(course.created_at)}</span>
          </div>
        </div>

        {course.languages && course.languages.length > 0 && (
          <div className="course-languages">
            <span className="meta-label">Ngôn ngữ:</span>
            <div className="language-tags">
              {course.languages.map(lang => (
                <span key={lang.id} className="language-tag">
                  {lang.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {course.tags && course.tags.length > 0 && (
          <div className="course-tags">
            <Tag className="meta-icon" />
            <div className="tag-list">
              {course.tags.map(tag => (
                <span key={tag.id} className="tag">
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="course-price">
          <span className="price-label">Giá:</span>
          <span className="price-value">
            {course.price > 0 ? formatPrice(course.price) : 'Miễn phí'}
          </span>
        </div>
      </div>

      <div className="course-footer">
        <div className="course-author">
          <span className="author-label">Tạo bởi:</span>
          <span className="author-name">{course.created_by_name || 'N/A'}</span>
        </div>
        {course.updated_by_name && course.updated_by_name !== course.created_by_name && (
          <div className="course-updated">
            <span className="updated-label">Cập nhật bởi:</span>
            <span className="updated-name">{course.updated_by_name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
