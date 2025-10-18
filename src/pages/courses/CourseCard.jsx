// src/pages/courses/CourseCard.jsx
import React from 'react';
import { Star, Clock, Users, BookOpen, Play, ArrowRight } from 'lucide-react';
import './CourseCard.css';

const CourseCard = ({ 
  course, 
  getLevelBadgeColor, 
  getLevelText 
}) => {
  const formatPrice = (price) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleEnroll = () => {
    // TODO: Implement enrollment logic
    console.log('Enroll in course:', course.id);
  };

  return (
    <div className="course-card">
      <div className="course-image">
        <div className="course-level-badge">
          <span className={`level-badge ${getLevelBadgeColor(course.level)}`}>
            {getLevelText(course.level)}
          </span>
        </div>
        <div className="course-overlay">
          <button className="play-button">
            <Play className="play-icon" />
          </button>
        </div>
      </div>

      <div className="course-content">
        <div className="course-header">
          <h3 className="course-title">{course.title}</h3>
          <div className="course-rating">
            <Star className="star-icon filled" />
            <Star className="star-icon filled" />
            <Star className="star-icon filled" />
            <Star className="star-icon filled" />
            <Star className="star-icon" />
            <span className="rating-text">4.5</span>
          </div>
        </div>

        <p className="course-description">
          {course.short_description || 'Khóa học chất lượng cao với nội dung chi tiết và dễ hiểu.'}
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
            <Clock className="meta-icon" />
            <span>2 giờ</span>
          </div>
        </div>

        {course.languages && course.languages.length > 0 && (
          <div className="course-languages">
            <span className="languages-label">Ngôn ngữ:</span>
            <div className="language-tags">
              {course.languages.slice(0, 3).map(lang => (
                <span key={lang.id} className="language-tag">
                  {lang.name}
                </span>
              ))}
              {course.languages.length > 3 && (
                <span className="language-more">
                  +{course.languages.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {course.tags && course.tags.length > 0 && (
          <div className="course-tags">
            {course.tags.slice(0, 3).map(tag => (
              <span key={tag.id} className="tag">
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="course-footer">
          <div className="course-price">
            <span className="price-value">
              {formatPrice(course.price)}
            </span>
            {course.price > 0 && (
              <span className="price-original">500,000₫</span>
            )}
          </div>
          <button 
            onClick={handleEnroll}
            className="enroll-button"
          >
            <span>Đăng ký ngay</span>
            <ArrowRight className="arrow-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
