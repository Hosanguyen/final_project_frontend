import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaArrowLeft, FaBook, FaUser, FaLanguage, FaChartLine, FaCheckCircle, FaPlay } from 'react-icons/fa';
import CourseService from '../../services/CourseService';
import CourseEnrollButton from './CourseEnrollButton';
import './CourseDetail.css';

const CourseDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCourseData();
    }, [slug]);

    const loadCourseData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Load course details
            const courseResponse = await CourseService.getCourseBySlug(slug);
            console.log('Course response:', courseResponse);
            setCourse(courseResponse.data);

            // Load lessons để hiển thị số lượng
            const lessonsResponse = await CourseService.getLessonsByCourse(courseResponse.data.id);
            console.log('Lessons response:', lessonsResponse);
            
            const lessonsData = Array.isArray(lessonsResponse.data) ? lessonsResponse.data : [];
            setLessons(lessonsData);
        } catch (error) {
            console.error('Error loading course:', error);
            setError(error.response?.data?.detail || 'Không thể tải khóa học');
            setLessons([]);
        } finally {
            setLoading(false);
        }
    };

    // Tính tổng số tài nguyên
    const getTotalResources = () => {
        return lessons.reduce((total, lesson) => total + (lesson.resources_count || 0), 0);
    };

    if (loading) {
        return <div className="loading">Đang tải khóa học...</div>;
    }

    if (error) {
        return (
            <div className="error">
                <p>{error}</p>
                <button onClick={() => navigate('/courses')} className="back-btn">
                    Quay lại danh sách khóa học
                </button>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="error">
                <p>Không tìm thấy khóa học</p>
                <button onClick={() => navigate('/courses')} className="back-btn">
                    Quay lại danh sách khóa học
                </button>
            </div>
        );
    }

    return (
        <div className="course-detail-container">
            <button className="back-link" onClick={() => navigate('/courses')}>
                <FaArrowLeft /> Quay lại danh sách khóa học
            </button>

            <div className="course-detail-wrapper">
                {/* Hero Section */}
                <div className="course-hero">
                    <div className="course-hero-content">
                        <div className="course-breadcrumb">
                            <span>Khóa học</span>
                            <span className="separator">›</span>
                            <span>{course.title}</span>
                        </div>

                        <h1 className="course-title-main">{course.title}</h1>
                        
                        {course.short_description && (
                            <p className="course-description">{course.short_description}</p>
                        )}

                        <div className="course-stats">
                            <div className="stat-item">
                                <FaBook />
                                <span>{lessons.length} bài học</span>
                            </div>
                            <div className="stat-item">
                                <FaPlay />
                                <span>{getTotalResources()} tài liệu</span>
                            </div>
                            {(course.created_by_full_name || course.created_by_name) && (
                                <div className="stat-item">
                                    <FaUser />
                                    <span>{course.created_by_full_name || course.created_by_name}</span>
                                </div>
                            )}
                            {course.level && (
                                <div className="stat-item">
                                    <FaChartLine />
                                    <span className={`level ${course.level}`}>{course.level}</span>
                                </div>
                            )}
                        </div>

                        {/* Price & Enroll Section */}
                        <div className="course-action-section">
                            <div className="course-price-box">
                                {course.price && Number(course.price) > 0 ? (
                                    <div className="price-info">
                                        <span className="price-label">Giá khóa học</span>
                                        <span className="price-value">
                                            {Number(course.price).toLocaleString('vi-VN')} VND
                                        </span>
                                    </div>
                                ) : (
                                    <div className="price-info">
                                        <span className="price-label">Khóa học</span>
                                        <span className="price-free">Miễn phí</span>
                                    </div>
                                )}
                            </div>
                            <CourseEnrollButton 
                                course={course} 
                                onEnrollSuccess={loadCourseData}
                            />
                        </div>
                    </div>

                    {/* Thumbnail */}
                    {course.thumbnail && (
                        <div className="course-thumbnail">
                            <img src={course.thumbnail} alt={course.title} />
                        </div>
                    )}
                </div>

                {/* Course Content Sections */}
                <div className="course-sections">
                    {/* Mô tả chi tiết */}
                    {course.description && (
                        <section className="course-section">
                            <h2 className="section-title">
                                <FaBook />
                                Về khóa học này
                            </h2>
                            <div 
                                className="section-content" 
                                dangerouslySetInnerHTML={{ __html: course.description }}
                            />
                        </section>
                    )}

                    {/* Nội dung khóa học */}
                    {lessons.length > 0 && (
                        <section className="course-section">
                            <h2 className="section-title">
                                <FaCheckCircle />
                                Nội dung khóa học
                            </h2>
                            <div className="section-content">
                                <div className="lessons-overview">
                                    {lessons.map((lesson, index) => (
                                        <div key={lesson.id} className="lesson-overview-item">
                                            <div className="lesson-number">{index + 1}</div>
                                            <div className="lesson-details">
                                                <h3>{lesson.title}</h3>
                                                {lesson.description && (
                                                    <p>{lesson.description}</p>
                                                )}
                                                {lesson.resources_count > 0 && (
                                                    <span className="resources-badge">
                                                        {lesson.resources_count} tài liệu
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Thông tin giảng viên */}
                    {(course.created_by_full_name || course.created_by_name) && (
                        <section className="course-section">
                            <h2 className="section-title">
                                <FaUser />
                                Giảng viên
                            </h2>
                            <div className="section-content">
                                <div className="instructor-info">
                                    <div className="instructor-avatar">
                                        {(course.created_by_full_name || course.created_by_name).charAt(0).toUpperCase()}
                                    </div>
                                    <div className="instructor-details">
                                        <h3>{course.created_by_full_name || course.created_by_name}</h3>
                                        <p>Giảng viên khóa học</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
