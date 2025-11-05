import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import CourseService from '../../../services/CourseService';
import LessonService from '../../../services/LessonService';
import './CourseLessonLinker.css';

const CourseLessonLinker = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [allLessons, setAllLessons] = useState([]);
    const [courseLessons, setCourseLessons] = useState([]);
    const [selectedLessons, setSelectedLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('title'); // title, sequence, resources

    useEffect(() => {
        loadData();
    }, [courseId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [courseData, allLessonsData, courseLessonsData] = await Promise.all([
                CourseService.getCourse(courseId),
                LessonService.getLessons(),
                LessonService.getLessonsByCourse(courseId)
            ]);
            
            setCourse(courseData);
            setAllLessons(allLessonsData);
            setCourseLessons(courseLessonsData);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleLesson = (lessonId) => {
        setSelectedLessons(prev => {
            if (prev.includes(lessonId)) {
                return prev.filter(id => id !== lessonId);
            } else {
                return [...prev, lessonId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedLessons.length === filteredLessons.length) {
            setSelectedLessons([]);
        } else {
            setSelectedLessons(filteredLessons.map(l => l.id));
        }
    };

    const handleAddLessons = async () => {
        if (selectedLessons.length === 0) {
            alert('Vui lòng chọn ít nhất một bài học');
            return;
        }

        try {
            // Update each selected lesson to link to this course
            for (const lessonId of selectedLessons) {
                await LessonService.patchLesson(lessonId, { course: parseInt(courseId) });
            }
            
            alert(`Đã thêm ${selectedLessons.length} bài học vào khóa học`);
            navigate(`/admin/courses/${courseId}`);
        } catch (error) {
            console.error('Error linking lessons:', error);
            alert('Không thể thêm bài học vào khóa học');
        }
    };

    // Filter out lessons already in course
    const courseLessonIds = courseLessons.map(l => l.id);
    const availableLessons = allLessons.filter(lesson => 
        !courseLessonIds.includes(lesson.id) &&
        (!lesson.course || lesson.course === parseInt(courseId))
    );

    let filteredLessons = availableLessons.filter(lesson =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lesson.description && lesson.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort lessons
    filteredLessons = filteredLessons.sort((a, b) => {
        if (sortBy === 'title') {
            return a.title.localeCompare(b.title);
        } else if (sortBy === 'sequence') {
            return a.sequence - b.sequence;
        } else if (sortBy === 'resources') {
            return (b.resources_count || 0) - (a.resources_count || 0);
        }
        return 0;
    });

    if (loading) {
        return (
            <div className="course-lesson-linker-loading">
                <div className="spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="course-lesson-linker">
            <div className="course-lesson-linker-header">
                <button 
                    className="btn-back"
                    onClick={() => navigate(`/admin/courses/${courseId}`)}
                >
                    <FaArrowLeft /> Quay lại
                </button>
                <h1>Thêm bài học vào: {course?.title}</h1>
            </div>

            <div className="course-lesson-linker-controls">
                <div className="course-lesson-linker-search">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài học..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select 
                    className="course-lesson-linker-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="title">Sắp xếp: Tên A-Z</option>
                    <option value="sequence">Sắp xếp: Thứ tự</option>
                    <option value="resources">Sắp xếp: Tài nguyên</option>
                </select>
            </div>

            <div className="course-lesson-linker-info">
                <div>
                    <p>Chọn các bài học bạn muốn thêm vào khóa học này</p>
                    <span className="info-available">Có sẵn: {filteredLessons.length} bài học</span>
                </div>
                <div className="info-actions">
                    <button 
                        className="btn-select-all"
                        onClick={handleSelectAll}
                    >
                        {selectedLessons.length === filteredLessons.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                    <span className="selected-count">
                        Đã chọn: {selectedLessons.length}
                    </span>
                </div>
            </div>

            <div className="course-lesson-linker-list">
                {filteredLessons.length === 0 ? (
                    <div className="empty-state">
                        <p>Không có bài học nào để thêm</p>
                        <button 
                            className="btn-create-lesson"
                            onClick={() => navigate(`/admin/courses/${courseId}/lessons/create`)}
                        >
                            <FaPlus /> Tạo bài học mới
                        </button>
                    </div>
                ) : (
                    <div className="lessons-grid">
                        {filteredLessons.map(lesson => (
                            <div 
                                key={lesson.id} 
                                className={`lesson-card ${selectedLessons.includes(lesson.id) ? 'selected' : ''}`}
                                onClick={() => handleToggleLesson(lesson.id)}
                            >
                                <div className="lesson-card-header">
                                    <div className="checkbox">
                                        {selectedLessons.includes(lesson.id) && <FaCheck />}
                                    </div>
                                    <span className="lesson-id">#{lesson.id}</span>
                                </div>
                                <div className="lesson-card-body">
                                    <h3>{lesson.title}</h3>
                                    {lesson.description && (
                                        <p className="lesson-description">
                                            {lesson.description.substring(0, 100)}
                                            {lesson.description.length > 100 ? '...' : ''}
                                        </p>
                                    )}
                                    <div className="lesson-meta">
                                        <span className="resources-count">
                                            {lesson.resources_count || 0} tài nguyên
                                        </span>
                                        {lesson.course_title && (
                                            <span className="current-course">
                                                {lesson.course_title}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedLessons.length > 0 && (
                <div className="course-lesson-linker-actions">
                    <button 
                        className="btn-cancel"
                        onClick={() => navigate(`/admin/courses/${courseId}`)}
                    >
                        <FaTimes /> Hủy
                    </button>
                    <button 
                        className="btn-confirm"
                        onClick={handleAddLessons}
                    >
                        <FaPlus /> Thêm {selectedLessons.length} bài học
                    </button>
                </div>
            )}
        </div>
    );
};

export default CourseLessonLinker;
