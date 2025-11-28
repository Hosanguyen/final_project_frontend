import React, { useState, useEffect } from 'react';
import notification from '../../../utils/notification';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FaBookOpen, FaEdit, FaTrash, FaPlus, FaArrowLeft, 
    FaFileAlt, FaVideo, FaFilePdf, FaLink, FaCheckCircle
} from 'react-icons/fa';
import LessonService from '../../../services/LessonService';
import './LessonDetailPage.css';

const LessonDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [lesson, setLesson] = useState(null);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    useEffect(() => {
        loadLessonData();
    }, [id]);

    const loadLessonData = async () => {
        setLoading(true);
        try {
            const lessonData = await LessonService.getLesson(id);
            setLesson(lessonData);
            
            if (lessonData.resources) {
                setResources(lessonData.resources);
            }
        } catch (error) {
            console.error('Error loading lesson:', error);
            notification.error('Không thể tải dữ liệu bài học');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResource = async () => {
        if (!selectedResource) return;

        try {
            await LessonService.deleteLessonResource(selectedResource.id);
            notification.success('Xóa tài nguyên thành công');
            loadLessonData();
            setShowDeleteModal(false);
            setSelectedResource(null);
        } catch (error) {
            console.error('Error deleting resource:', error);
            notification.error('Xóa tài nguyên thất bại');
        }
    };

    const openDeleteModal = (resource) => {
        setSelectedResource(resource);
        setShowDeleteModal(true);
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'video': return <FaVideo className="resource-icon video" />;
            case 'pdf': return <FaFilePdf className="resource-icon pdf" />;
            case 'file': return <FaFileAlt className="resource-icon file" />;
            case 'link': return <FaLink className="resource-icon link" />;
            default: return <FaFileAlt className="resource-icon text" />;
        }
    };

    const getResourceTypeLabel = (type) => {
        const labels = {
            text: 'Văn bản',
            video: 'Video',
            pdf: 'PDF',
            file: 'File',
            link: 'Link'
        };
        return labels[type] || type;
    };

    if (loading) {
        return (
            <div className="lesson-detail-loading">
                <div className="lesson-detail-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="lesson-detail-error">
                <p>Không tìm thấy bài học</p>
                <button onClick={() => navigate('/admin/lessons')}>
                    <FaArrowLeft /> Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="lesson-detail-page">
            {/* Header */}
            <div className="lesson-detail-header">
                <button 
                    className="lesson-detail-btn-back"
                    onClick={() => lesson.course ? navigate(`/admin/courses/${lesson.course}`) : navigate('/admin/lessons')}
                >
                    <FaArrowLeft /> Quay lại
                </button>
                <div className="lesson-detail-header-actions">
                    <button 
                        className="lesson-detail-btn-edit"
                        onClick={() => {
                            if (lesson.course) {
                                navigate(`/admin/courses/${lesson.course}/lessons/edit/${id}`);
                            } else {
                                navigate(`/admin/lessons/edit/${id}`);
                            }
                        }}
                    >
                        <FaEdit /> Chỉnh sửa
                    </button>
                </div>
            </div>

            {/* Lesson Info Card */}
            <div className="lesson-detail-card">
                <div className="lesson-detail-card-header">
                    <FaBookOpen className="lesson-detail-icon" />
                    <h1>{lesson.title}</h1>
                </div>

                <div className="lesson-detail-info-grid">
                    {lesson.course_title && (
                        <div className="lesson-detail-info-item">
                            <label>Khóa học:</label>
                            <span>{lesson.course_title}</span>
                        </div>
                    )}
                    
                    <div className="lesson-detail-info-item">
                        <label>Thứ tự:</label>
                        <span className="lesson-sequence">{lesson.sequence}</span>
                    </div>

                    {lesson.description && (
                        <div className="lesson-detail-info-item full-width">
                            <label>Mô tả:</label>
                            <p>{lesson.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Resources Section */}
            <div className="lesson-detail-card">
                <div className="lesson-detail-resources-header">
                    <h2>Tài nguyên bài học ({resources.length})</h2>
                    <button 
                        className="lesson-detail-btn-add-resource"
                        onClick={() => {
                            if (lesson.course) {
                                navigate(`/admin/courses/${lesson.course}/lessons/edit/${id}`);
                            } else {
                                navigate(`/admin/lessons/edit/${id}`);
                            }
                        }}
                    >
                        <FaPlus /> Thêm tài nguyên
                    </button>
                </div>

                {resources.length === 0 ? (
                    <div className="lesson-detail-empty">
                        <FaFileAlt className="empty-icon" />
                        <p>Chưa có tài nguyên nào</p>
                    </div>
                ) : (
                    <div className="lesson-detail-resources-list">
                        {resources.map((resource) => (
                            <div key={resource.id} className="lesson-detail-resource-item">
                                <div className="resource-item-left">
                                    <div className="resource-type-icon">
                                        {getResourceIcon(resource.type)}
                                    </div>
                                    <div className="resource-item-info">
                                        <div className="resource-item-header">
                                            <h3 className="resource-title">{resource.title || 'Không có tiêu đề'}</h3>
                                            <span className="resource-type-badge">
                                                {getResourceTypeLabel(resource.type)}
                                            </span>
                                        </div>
                                        
                                        <div className="resource-item-details">
                                            {resource.type === 'text' && resource.content && (
                                                <p className="resource-preview">
                                                    {resource.content.substring(0, 100)}
                                                    {resource.content.length > 100 && '...'}
                                                </p>
                                            )}
                                            
                                            {resource.type === 'link' && resource.url && (
                                                <a 
                                                    href={resource.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="resource-link-url"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <FaLink /> {resource.url}
                                                </a>
                                            )}
                                            
                                            {(resource.type === 'file' || resource.type === 'pdf' || resource.type === 'video') && resource.file_url && (
                                                <div className="resource-file-info">
                                                    <FaFileAlt />
                                                    <span>{resource.filename || 'File đã tải lên'}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="resource-item-meta">
                                            <span className="resource-sequence-badge">Thứ tự: {resource.sequence}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="resource-item-actions">
                                    {(resource.type === 'file' || resource.type === 'pdf' || resource.type === 'video') && resource.file_url && (
                                        <a 
                                            href={`${API_BASE_URL}/api/media-proxy/?path=${resource.file_url}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="lessons-detail btn-view"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Xem
                                        </a>
                                    )}
                                    <button
                                        className="btn-delete-resource"
                                        onClick={() => openDeleteModal(resource)}
                                        title="Xóa tài nguyên"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="lesson-detail-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="lesson-detail-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="lesson-detail-modal-header">
                            <h3>Xác nhận xóa tài nguyên</h3>
                        </div>
                        <div className="lesson-detail-modal-body">
                            <p>
                                Bạn có chắc chắn muốn xóa tài nguyên <strong>"{selectedResource?.title || 'này'}"</strong>?
                            </p>
                        </div>
                        <div className="lesson-detail-modal-footer">
                            <button 
                                className="lesson-detail-btn-cancel"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className="lesson-detail-btn-confirm-delete"
                                onClick={handleDeleteResource}
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

export default LessonDetailPage;
