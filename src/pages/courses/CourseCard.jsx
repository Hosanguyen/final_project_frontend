import React from "react";
import { useNavigate } from "react-router-dom";
import "./CourseCard.css";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const defaultBannerUrl = `${API_URL}/media/files/uploads/banner_default.jpg`;
  const bannerUrl = course.banner_url ? `${API_URL}${course.banner_url}` : defaultBannerUrl;

  const handleClick = () => {
    navigate(`/courses/${course.slug}`);
  };

  return (
    <div className="course-card" onClick={handleClick}>
      <div className="course-banner">
        <img src={bannerUrl} alt={course.title} />
        <span className={`course-level ${course.level}`}>{course.level}</span>
      </div>

      <div className="course-body">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-desc">{course.short_description}</p>

        <div className="course-info">
          <span>🧩 {course.lessons_count} bài học</span>
          <span>👤 {course.created_by_name}</span>
        </div>

        <div className="course-tags">
          {course.languages?.map((lang) => (
            <span key={lang.id} className="tag blue">{lang.name}</span>
          ))}
          {course.tags?.map((tag) => (
            <span key={tag.id} className="tag gray">#{tag.name}</span>
          ))}
        </div>
      </div>

      <div className="course-footer">
        <div className="course-price">
          {Number(course.price) > 0 ? (
            <span className="price-amount">
              {Number(course.price).toLocaleString("vi-VN")}₫
            </span>
          ) : (
            <span className="price-free">Miễn phí</span>
          )}
        </div>
        <button className="course-card-btn btn-view">Xem chi tiết</button>
      </div>
    </div>
  );
};

export default CourseCard;
