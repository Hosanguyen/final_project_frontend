import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBook, FaChevronDown, FaChevronRight, FaVideo, FaFilePdf, FaFileAlt, FaLink, FaFile, FaClock, FaArrowLeft } from 'react-icons/fa';
import CourseService from '../../services/CourseService';
import CourseEnrollButton from './CourseEnrollButton';
import './CourseDetail.css';

// Backend API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const CourseDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [expandedLessons, setExpandedLessons] = useState({});
    const [selectedResource, setSelectedResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL;

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

            // Load lessons with resources
            const lessonsResponse = await CourseService.getLessonsByCourse(courseResponse.data.id);
            console.log('Lessons response:', lessonsResponse);
            
            const lessonsData = Array.isArray(lessonsResponse.data) ? lessonsResponse.data : [];
            setLessons(lessonsData);

            // Auto-expand first lesson and select first resource
            if (lessonsData.length > 0) {
                const firstLesson = lessonsData[0];
                setExpandedLessons({ [firstLesson.id]: true });
                
                if (firstLesson.resources && firstLesson.resources.length > 0) {
                    setSelectedResource(firstLesson.resources[0]);
                }
            }
        } catch (error) {
            console.error('Error loading course:', error);
            setError(error.response?.data?.detail || 'Không thể tải khóa học');
            setLessons([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleLesson = (lessonId) => {
        setExpandedLessons(prev => ({
            ...prev,
            [lessonId]: !prev[lessonId]
        }));
    };

    const handleResourceClick = (resource) => {
        setSelectedResource(resource);
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'video':
                return <FaVideo className="resource-icon" />;
            case 'pdf':
                return <FaFilePdf className="resource-icon" />;
            case 'text':
                return <FaFileAlt className="resource-icon" />;
            case 'link':
                return <FaLink className="resource-icon" />;
            default:
                return <FaFile className="resource-icon" />;
        }
    };

    const renderResourceContent = () => {
        if (!selectedResource) {
            return (
                <div className="no-resource-selected">
                    <FaBook size={64} />
                    <p>Chọn một tài liệu từ danh sách bên trái để bắt đầu học</p>
                </div>
            );
        }

        const { type, title, content, file_url, url } = selectedResource;

        switch (type) {
            case 'video':
                const videoUrl = file_url ? (file_url.startsWith('http') ? file_url : `${API_BASE_URL}/api/media-proxy/?path=${file_url}`) : url;
                return (
                    <div className="resource-content">
                        <h2>{title}</h2>
                        <div className="video-wrapper">
                            {videoUrl ? (
                                <iframe
                                    src={videoUrl}
                                    title={title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : file_url ? (
                                <video controls>
                                    <source src={file_url} />
                                    Trình duyệt của bạn không hỗ trợ video.
                                </video>
                            ) : (
                                <p>Video không khả dụng</p>
                            )}
                        </div>
                    </div>
                );

            case 'pdf':
                const pdfUrl = file_url ? (file_url.startsWith('http') ? file_url : `${API_BASE_URL}/api/media-proxy/?path=${file_url}`) : url;
                return (
                    <div className="resource-content">
                        <h2>{title}</h2>
                        <div className="pdf-wrapper">
                            {pdfUrl ? (
                                <iframe
                                    src={pdfUrl}
                                    title={title}
                                    style={{ border: 'none', width: '100%', height: '100%' }}
                                />
                            ) : (
                                <p>PDF không khả dụng</p>
                            )}
                        </div>
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <a 
                                href={pdfUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                    display: 'inline-block',
                                    padding: '0.5rem 1rem',
                                    color: '#667eea',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Mở trong tab mới →
                            </a>
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div className="resource-content">
                        <h2>{title}</h2>
                        <div className="text-content" dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                );

            case 'link':
                return (
                    <div className="resource-content">
                        <h2>{title}</h2>
                        <div className="link-content">
                            <p>Tài liệu liên kết:</p>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="external-link">
                                {url}
                            </a>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="resource-content">
                        <h2>{title}</h2>
                        <div className="file-content">
                            {file_url ? (
                                <a href={file_url} download className="download-btn">
                                    Tải xuống tài liệu
                                </a>
                            ) : (
                                <p>File không khả dụng</p>
                            )}
                        </div>
                    </div>
                );
        }
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
        <div className="course-detail-page">
            <div className="course-header">
                <button className="back-btn" onClick={() => navigate('/courses')}>
                    <FaArrowLeft /> Quay lại
                </button>
                <div className="header-content">
                    <div className="header-info">
                        <h1>{course.title}</h1>
                        {course.short_description && (
                            <p className="course-subtitle">{course.short_description}</p>
                        )}
                        <div className="course-meta">
                            <span className="meta-item">
                                <FaClock /> {lessons.length} bài học
                            </span>
                            {course.created_by_name && (
                                <span className="meta-item">
                                    👤 {course.created_by_name}
                                </span>
                            )}
                            {course.level && (
                                <span className={`level-badge ${course.level}`}>
                                    {course.level}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="header-actions">
                        <div className="price-section">
                            {course.price && Number(course.price) > 0 ? (
                                <div className="price-display">
                                    <span className="price-amount">
                                        {Number(course.price).toLocaleString('vi-VN')} VND
                                    </span>
                                </div>
                            ) : (
                                <div className="price-free">
                                    <span>Miễn phí</span>
                                </div>
                            )}
                        </div>
                        <CourseEnrollButton 
                            course={course} 
                            onEnrollSuccess={loadCourseData}
                        />
                    </div>
                </div>
            </div>

            <div className="course-content">
                {/* Sidebar - Danh sách lessons */}
                <div className="lessons-sidebar">
                    <div className="sidebar-header">
                        <h3>Nội dung khóa học</h3>
                        <span className="lessons-count">
                            {lessons.length} bài học
                        </span>
                    </div>

                    <div className="lessons-list">
                        {lessons.length === 0 ? (
                            <div className="no-lessons">
                                <p>Chưa có bài học nào</p>
                            </div>
                        ) : (
                            lessons.map((lesson, index) => (
                                <div key={lesson.id} className="lesson-item">
                                <div 
                                    className="lesson-header"
                                    onClick={() => toggleLesson(lesson.id)}
                                >
                                    <div className="lesson-info">
                                        {expandedLessons[lesson.id] ? 
                                            <FaChevronDown className="chevron" /> : 
                                            <FaChevronRight className="chevron" />
                                        }
                                        <span className="lesson-number">{index + 1}.</span>
                                        <span className="lesson-title">{lesson.title}</span>
                                    </div>
                                    {lesson.resources_count > 0 && (
                                        <span className="resources-count">
                                            {lesson.resources_count} tài liệu
                                        </span>
                                    )}
                                </div>

                                {expandedLessons[lesson.id] && lesson.resources && (
                                    <div className="resources-list">
                                        {lesson.resources.length === 0 ? (
                                            <div className="no-resources">
                                                <p>Chưa có tài liệu</p>
                                            </div>
                                        ) : (
                                            lesson.resources.map((resource) => (
                                                <div
                                                    key={resource.id}
                                                    className={`resource-item ${selectedResource?.id === resource.id ? 'active' : ''}`}
                                                    onClick={() => handleResourceClick(resource)}
                                                >
                                                    {getResourceIcon(resource.type)}
                                                    <span className="resource-title">
                                                        {resource.title || `${resource.type} resource`}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content - Hiển thị resource */}
                <div className="resource-display">
                    {renderResourceContent()}
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
