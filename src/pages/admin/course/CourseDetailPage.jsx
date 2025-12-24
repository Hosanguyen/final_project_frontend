import React, { useState, useEffect } from 'react';
import notification from '../../../utils/notification';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FaBook, FaEdit, FaTrash, FaPlus, FaList, FaEye, FaCheckCircle, FaTimesCircle,
    FaArrowLeft, FaBookOpen, FaUsers, FaTags, FaCode, FaTimes
} from 'react-icons/fa';
import CourseService from '../../../services/CourseService';
import LessonService from '../../../services/LessonService';
import './CourseDetailPage.css';

const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);

    useEffect(() => {
        loadCourseData();
    }, [id]);

    const loadCourseData = async () => {
        setLoading(true);
        try {
            const [courseData, lessonsData] = await Promise.all([
                CourseService.getCourse(id),
                LessonService.getLessonsByCourse(id)
            ]);
            
            setCourse(courseData);
            setLessons(lessonsData);
        } catch (error) {
            console.error('Error loading course:', error);
            notification.error('Không thể tải dữ liệu khóa học');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLesson = async () => {
        if (!selectedLesson) return;

        try {
            await LessonService.deleteLesson(selectedLesson.id);
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'course-detail-success-toast';
            successMsg.textContent = 'Xóa bài học thành công!';
            document.body.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 3000);
            
            loadCourseData();
            setShowDeleteModal(false);
            setSelectedLesson(null);
        } catch (error) {
            console.error('Error deleting lesson:', error);
            notification.error('Xóa bài học thất bại: ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleUnlinkLesson = async (lessonId) => {
        const result = await notification.confirm(
            'Bạn có chắc muốn gỡ bài học này khỏi khóa học? (Bài học vẫn tồn tại nhưng không còn thuộc khóa học này)',
            'Xác nhận gỡ bài học'
        );
        
        if (!result.isConfirmed) {
            return;
        }

        try {
            await LessonService.patchLesson(lessonId, { course: null });
            loadCourseData();
            
            const successMsg = document.createElement('div');
            successMsg.className = 'course-detail-success-toast';
            successMsg.textContent = 'Đã gỡ bài học khỏi khóa học!';
            document.body.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 3000);
        } catch (error) {
            console.error('Error unlinking lesson:', error);
            notification.error('Không thể gỡ bài học: ' + (error.response?.data?.detail || error.message));
        }
    };

    const openDeleteModal = (lesson) => {
        setSelectedLesson(lesson);
        setShowDeleteModal(true);
    };

    const getLevelBadge = (level) => {
        const badges = {
            beginner: { class: 'level-beginner', label: 'Cơ bản' },
            intermediate: { class: 'level-intermediate', label: 'Trung bình' },
            advanced: { class: 'level-advanced', label: 'Nâng cao' },
        };
        return badges[level] || { class: '', label: level };
    };

    if (loading) {
        return (
            <div className="course-detail-loading">
                <div className="course-detail-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="course-detail-error">
                <p>Không tìm thấy khóa học</p>
                <button onClick={() => navigate('/admin/courses')}>
                    <FaArrowLeft /> Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="course-detail-page">
            {/* Header */}
            <div className="course-detail-header">
                <button 
                    className="course-detail-btn-back"
                    onClick={() => navigate('/admin/courses')}
                >
                    <FaArrowLeft /> Quay lại
                </button>
                <div className="course-detail-header-actions">
                    <button 
                        className="course-detail-btn-edit"
                        onClick={() => navigate(`/admin/courses/edit/${id}`)}
                    >
                        <FaEdit /> Chỉnh sửa
                    </button>
                </div>
            </div>

            {/* Course Info Card */}
            <div className="course-detail-card">
                <div className="course-detail-card-header">
                    <FaBook className="course-detail-icon" />
                    <h1>{course.title}</h1>
                </div>

                {/* Banner Display */}
                {course.banner_url && (
                    <div className="course-detail-banner">
                        <img 
                            src={course.banner_url.startsWith('http') ? course.banner_url : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${course.banner_url}`} 
                            alt={course.title} 
                        />
                    </div>
                )}

                <div className="course-detail-info-grid">
                    <div className="course-detail-info-item">
                        <label>Slug:</label>
                        <code>{course.slug}</code>
                    </div>
                    
                    <div className="course-detail-info-item">
                        <label>Cấp độ:</label>
                        <span className={`course-detail-badge ${getLevelBadge(course.level).class}`}>
                            {getLevelBadge(course.level).label}
                        </span>
                    </div>

                    <div className="course-detail-info-item">
                        <label>Giá:</label>
                        <span className="course-detail-price">
                            {new Intl.NumberFormat('vi-VN', { 
                                style: 'currency', 
                                currency: 'VND' 
                            }).format(course.price)}
                        </span>
                    </div>

                    <div className="course-detail-info-item">
                        <label>Trạng thái:</label>
                        {course.is_published ? (
                            <span className="course-detail-status published">
                                <FaCheckCircle /> Đã xuất bản
                            </span>
                        ) : (
                            <span className="course-detail-status draft">
                                <FaTimesCircle /> Nháp
                            </span>
                        )}
                    </div>

                    {course.short_description && (
                        <div className="course-detail-info-item full-width">
                            <label>Mô tả ngắn:</label>
                            <p>{course.short_description}</p>
                        </div>
                    )}

                    {course.long_description && (
                        <div className="course-detail-info-item full-width">
                            <label>Mô tả chi tiết:</label>
                            <p>{course.long_description}</p>
                        </div>
                    )}

                    {course.languages && course.languages.length > 0 && (
                        <div className="course-detail-info-item full-width">
                            <label><FaCode /> Ngôn ngữ lập trình:</label>
                            <div className="course-detail-tags">
                                {course.languages.map(lang => (
                                    <span key={lang.id} className="course-detail-tag">
                                        {lang.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {course.tags && course.tags.length > 0 && (
                        <div className="course-detail-info-item full-width">
                            <label><FaTags /> Tags:</label>
                            <div className="course-detail-tags">
                                {course.tags.map(tag => (
                                    <span key={tag.id} className="course-detail-tag">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="course-detail-stats">
                    <div className="course-detail-stat-item">
                        <FaBookOpen className="stat-icon" />
                        <div>
                            <div className="stat-number">{course.lessons_count || 0}</div>
                            <div className="stat-label">Bài học</div>
                        </div>
                    </div>
                    <div className="course-detail-stat-item">
                        <FaUsers className="stat-icon" />
                        <div>
                            <div className="stat-number">{course.enrollments_count || 0}</div>
                            <div className="stat-label">Học viên</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lessons Section */}
            <div className="course-detail-card">
                <div className="course-detail-lessons-header">
                    <h2><FaList /> Danh sách bài học</h2>
                    <button 
                        className="course-detail-btn-add-lesson"
                        onClick={() => navigate(`/admin/courses/${id}/add-lessons`)}
                    >
                        <FaPlus /> Thêm bài học có sẵn
                    </button>
                </div>

                {lessons.length === 0 ? (
                    <div className="course-detail-empty">
                        <FaBookOpen className="empty-icon" />
                        <p>Chưa có bài học nào</p>
                        <button 
                            className="course-detail-btn-add-lesson"
                            onClick={() => navigate(`/admin/courses/${id}/add-lessons`)}
                        >
                            <FaPlus /> Thêm bài học
                        </button>
                    </div>
                ) : (
                    <div className="course-detail-lessons-table">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{width: '60px'}}>STT</th>
                                    <th>Tiêu đề</th>
                                    <th style={{width: '120px'}}>Resources</th>
                                    <th style={{width: '150px'}}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lessons.map((lesson, index) => (
                                    <tr key={lesson.id}>
                                        <td className="text-center">
                                            <span className="lesson-sequence">{lesson.sequence || index + 1}</span>
                                        </td>
                                        <td>
                                            <div className="lesson-title">{lesson.title}</div>
                                            {lesson.description && (
                                                <div className="lesson-description">
                                                    {lesson.description.substring(0, 100)}
                                                    {lesson.description.length > 100 ? '...' : ''}
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <span className="resource-count">
                                                {lesson.resources_count || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="course-detail-action-buttons">
                                                <button
                                                    className="course-detail-btn-action btn-view"
                                                    onClick={() => navigate(`/admin/lessons/${lesson.id}`)}
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    className="course-detail-btn-action btn-edit"
                                                    onClick={() => navigate(`/admin/courses/${id}/lessons/edit/${lesson.id}`)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="course-detail-btn-action btn-warning"
                                                    onClick={() => handleUnlinkLesson(lesson.id)}
                                                    title="Gỡ khỏi khóa học"
                                                >
                                                    <FaTimes />
                                                </button>
                                                <button
                                                    className="course-detail-btn-action btn-delete"
                                                    onClick={() => openDeleteModal(lesson)}
                                                    title="Xóa bài học"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="course-detail-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="course-detail-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="course-detail-modal-header">
                            <h3>Xác nhận xóa bài học</h3>
                        </div>
                        <div className="course-detail-modal-body">
                            <p>
                                Bạn có chắc chắn muốn xóa bài học <strong>"{selectedLesson?.title}"</strong>?
                            </p>
                            <p className="course-detail-warning-text">
                                Lưu ý: Tất cả tài nguyên (resources) của bài học cũng sẽ bị xóa.
                            </p>
                        </div>
                        <div className="course-detail-modal-footer">
                            <button 
                                className="course-detail-btn-cancel"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className="course-detail-btn-confirm-delete"
                                onClick={handleDeleteLesson}
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetailPage;
