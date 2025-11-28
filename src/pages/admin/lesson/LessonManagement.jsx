// src/pages/admin/lesson/LessonManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaBook } from 'react-icons/fa';
import LessonService from '../../../services/LessonService';
import CourseService from '../../../services/CourseService';
import './LessonManagement.css';
import notification from '../../../utils/notification';

const LessonManagement = () => {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [lessonsData, coursesData] = await Promise.all([
                LessonService.getLessons(),
                CourseService.getCourses()
            ]);
            setLessons(lessonsData);
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading data:', error);
            notification.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!lessonToDelete) return;

        try {
            await LessonService.deleteLesson(lessonToDelete.id);
            setLessons(lessons.filter(l => l.id !== lessonToDelete.id));
            setShowDeleteModal(false);
            setLessonToDelete(null);
            notification.success('Xóa bài học thành công');
        } catch (error) {
            console.error('Error deleting lesson:', error);
            notification.error('Xóa bài học thất bại');
        }
    };

    const openDeleteModal = (lesson) => {
        setLessonToDelete(lesson);
        setShowDeleteModal(true);
    };

    const filteredLessons = lessons.filter(lesson => {
        const matchSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (lesson.description && lesson.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchCourse = !courseFilter || lesson.course === parseInt(courseFilter);
        return matchSearch && matchCourse;
    });

    if (loading) {
        return (
            <div className="lesson-list-loading-container">
                <div className="lesson-list-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="lesson-list">
            {/* Header */}
            <div className="lesson-list-page-header">
                <div className="lesson-list-header-left">
                    <h1>Quản lý Bài học</h1>
                </div>
                <button 
                    className="lesson-list-btn-create"
                    onClick={() => navigate('/admin/lessons/create')}
                >
                    <FaPlus /> Tạo bài học mới
                </button>
            </div>

            {/* Content Card */}
            <div className="lesson-list-content-card">
                {/* Search and Filters */}
                <div className="lesson-list-card-header">
                    <div className="lesson-list-search-box">
                        <FaSearch className="lesson-list-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài học..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="lesson-list-filters">
                        <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="lesson-list-filter-select"
                        >
                            <option value="">Tất cả khóa học</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="lesson-list-stats">
                        <div className="lesson-list-stat-item">
                            <strong>{filteredLessons.length}</strong> bài học
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="lesson-list-table-container">
                    <table className="lesson-list-data-table">
                        <thead>
                            <tr>
                                <th style={{width: '60px'}}>ID</th>
                                <th>Tiêu đề</th>
                                <th style={{width: '200px'}}>Khóa học</th>
                                <th style={{width: '100px'}}>Thứ tự</th>
                                <th style={{width: '120px'}}>Resources</th>
                                <th style={{width: '150px'}}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLessons.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="lesson-list-no-data">
                                        Không tìm thấy bài học nào
                                    </td>
                                </tr>
                            ) : (
                                filteredLessons.map(lesson => (
                                    <tr key={lesson.id}>
                                        <td className="lesson-list-text-center">
                                            <span className="lesson-list-id-badge">#{lesson.id}</span>
                                        </td>
                                        <td>
                                            <div className="lesson-list-title-cell">
                                                <div className="lesson-list-title">{lesson.title}</div>
                                                {lesson.description && (
                                                    <div className="lesson-list-short-desc">
                                                        {lesson.description.substring(0, 80)}
                                                        {lesson.description.length > 80 ? '...' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="lesson-list-code-badge">
                                                {lesson.course_title || '-'}
                                            </span>
                                        </td>
                                        <td className="lesson-list-text-center">
                                            <span className="lesson-list-id-badge">{lesson.sequence}</span>
                                        </td>
                                        <td className="lesson-list-text-center">
                                            {lesson.resources_count || 0}
                                        </td>
                                        <td className="lesson-list-text-center">
                                            <div className="lesson-list-action-buttons">
                                                <button
                                                    className="lesson-list-btn-action lesson-list-btn-view"
                                                    onClick={() => navigate(`/admin/lessons/${lesson.id}`)}
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    className="lesson-list-btn-action lesson-list-btn-edit"
                                                    onClick={() => navigate(`/admin/lessons/edit/${lesson.id}`)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="lesson-list-btn-action lesson-list-btn-delete"
                                                    onClick={() => openDeleteModal(lesson)}
                                                    title="Xóa"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="lesson-list-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="lesson-list-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="lesson-list-modal-header">
                            <h3>Xác nhận xóa</h3>
                        </div>
                        <div className="lesson-list-modal-body">
                            <p>
                                Bạn có chắc chắn muốn xóa bài học <strong>"{lessonToDelete?.title}"</strong>?
                            </p>
                            <p className="lesson-list-warning-text">
                                Lưu ý: Tất cả tài nguyên của bài học cũng sẽ bị xóa.
                            </p>
                        </div>
                        <div className="lesson-list-modal-footer">
                            <button 
                                className="lesson-list-btn-cancel"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className="lesson-list-btn-confirm-delete"
                                onClick={handleDelete}
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

export default LessonManagement;
