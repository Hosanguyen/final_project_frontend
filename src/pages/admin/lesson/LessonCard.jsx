// src/pages/admin/lesson/LessonCard.jsx
import React from 'react';
import { Edit, Trash2, BookOpen, FileText, Calendar, Hash } from 'lucide-react';
import './LessonCard.css'

const LessonCard = ({ 
  lesson, 
  onEdit, 
  onDelete, 
  getResourceTypeIcon,
  getResourceTypeColor 
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getResourceTypeText = (type) => {
    const typeMap = {
      'video': 'Video',
      'pdf': 'PDF',
      'slide': 'Slide',
      'text': 'Văn bản',
      'link': 'Liên kết',
      'file': 'Tệp'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="lesson-card">
      <div className="lesson-card-header">
        <div className="lesson-title-section">
          <div className="lesson-sequence">
            <Hash className="sequence-icon" />
            <span className="sequence-number">{lesson.sequence}</span>
          </div>
          <h3 className="lesson-title">{lesson.title}</h3>
        </div>
        <div className="lesson-actions">
          <button
            onClick={() => onEdit(lesson)}
            className="action-btn edit"
            title="Chỉnh sửa"
          >
            <Edit className="lesson-action-icon" />
          </button>
          <button
            onClick={() => onDelete(lesson.id)}
            className="action-btn delete"
            title="Xóa"
          >
            <Trash2 className="lesson-action-icon" />
          </button>
        </div>
      </div>

      <div className="lesson-content">
        <p className="lesson-description">
          {lesson.description || 'Chưa có mô tả'}
        </p>

        <div className="lesson-meta">
          <div className="meta-item">
            <BookOpen className="meta-icon" />
            <span>{lesson.course_title}</span>
          </div>
          <div className="meta-item">
            <FileText className="meta-icon" />
            <span>{lesson.resources_count} tài nguyên</span>
          </div>
          <div className="meta-item">
            <Calendar className="meta-icon" />
            <span>{formatDate(lesson.created_at)}</span>
          </div>
        </div>

        {lesson.resources && lesson.resources.length > 0 && (
          <div className="lesson-resources">
            <div className="resources-header">
              <FileText className="resources-icon" />
              <span className="resources-label">Tài nguyên:</span>
            </div>
            <div className="resources-list">
              {lesson.resources.slice(0, 3).map(resource => (
                <div key={resource.id} className="resource-item">
                  <div className={`resource-type ${getResourceTypeColor(resource.type)}`}>
                    {getResourceTypeIcon(resource.type)}
                    <span className="resource-type-text">
                      {getResourceTypeText(resource.type)}
                    </span>
                  </div>
                  <span className="resource-title">
                    {resource.title || resource.filename || 'Không có tiêu đề'}
                  </span>
                </div>
              ))}
              {lesson.resources.length > 3 && (
                <div className="resource-more">
                  +{lesson.resources.length - 3} tài nguyên khác
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="lesson-footer">
        <div className="lesson-info">
          <span className="lesson-id">ID: {lesson.id}</span>
          <span className="lesson-sequence-info">
            Thứ tự: {lesson.sequence}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LessonCard;
