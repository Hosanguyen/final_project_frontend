import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaBook,
    FaChevronDown,
    FaChevronRight,
    FaVideo,
    FaFilePdf,
    FaFileAlt,
    FaLink,
    FaFile,
    FaArrowLeft,
    FaClipboardList,
    FaHistory,
} from 'react-icons/fa';
import CourseService from '../../services/CourseService';
import QuizItem from './QuizItem';
import QuizTaking from './QuizTaking';
import QuizResult from './QuizResult';
import QuizHistory from './QuizHistory';
import VideoPlayer from './VideoPlayer';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import './CourseLearning.css';

// Backend API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const CourseLearning = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [expandedLessons, setExpandedLessons] = useState({});
    const [selectedResource, setSelectedResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Tab state: 'content' or 'history'
    const [activeTab, setActiveTab] = useState('content');

    // Quiz states
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizMode, setQuizMode] = useState(null); // 'taking', 'result'
    const [currentSubmissionId, setCurrentSubmissionId] = useState(null);
    const [currentLessonId, setCurrentLessonId] = useState(null);

    useDocumentTitle(course ? `Học: ${course.title}` : 'Đang tải khóa học...');

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
        setExpandedLessons((prev) => ({
            ...prev,
            [lessonId]: !prev[lessonId],
        }));
    };

    const handleResourceClick = (resource) => {
        setSelectedResource(resource);
        setActiveQuiz(null);
        setQuizMode(null);
    };

    const handleQuizClick = (quiz, lessonId) => {
        setActiveQuiz(quiz);
        setCurrentLessonId(lessonId);
        setQuizMode('taking');
        setSelectedResource(null);
    };

    const handleQuizComplete = (submission) => {
        setCurrentSubmissionId(submission.id);
        setQuizMode('result');
    };

    const handleBackFromQuiz = () => {
        setActiveQuiz(null);
        setQuizMode(null);
        setCurrentSubmissionId(null);
        setCurrentLessonId(null);
    };

    const handleViewHistoryResult = (submissionId) => {
        setCurrentSubmissionId(submissionId);
        setQuizMode('result');
        setActiveTab('content');
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

        const { type, title, content, file_url, url, id } = selectedResource;

        switch (type) {
            case 'video':
                // Sử dụng VideoPlayer component mới với streaming
                return (
                    <div className="resource-content">
                        <h2>{title}</h2>
                        <VideoPlayer resourceId={id} title={title} />
                    </div>
                );

            case 'pdf':
                const pdfUrl = file_url
                    ? file_url.startsWith('http')
                        ? file_url
                        : `${API_BASE_URL}/api/media-proxy/?path=${file_url}`
                    : url;
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
                                    fontSize: '0.9rem',
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
            <div className="error-lesson">
                <p>{error}</p>
                <button onClick={() => navigate(`/courses/${slug}`)} className="back-btn">
                    Quay lại khóa học
                </button>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="error-lesson">
                <p>Không tìm thấy khóa học</p>
                <button onClick={() => navigate('/courses')} className="back-btn">
                    Quay lại danh sách khóa học
                </button>
            </div>
        );
    }

    return (
        <div className="course-learning-page">
            {/* Header - Compact */}
            <div className="learning-header">
                <button className="back-btn" onClick={() => navigate(`/courses/${slug}`)}>
                    <FaArrowLeft /> Quay lại khóa học
                </button>
                <h1 className="course-title">{course.title}</h1>
            </div>

            <div className="learning-content">
                {/* Sidebar - Danh sách lessons */}
                <div className="lessons-sidebar">
                    <div className="sidebar-header">
                        <div className="sidebar-tabs">
                            <button
                                className={`sidebar-tab ${activeTab === 'content' ? 'active' : ''}`}
                                onClick={() => setActiveTab('content')}
                            >
                                <FaBook /> Nội dung
                            </button>
                            <button
                                className={`sidebar-tab ${activeTab === 'history' ? 'active' : ''}`}
                                onClick={() => setActiveTab('history')}
                            >
                                <FaHistory /> Lịch sử
                            </button>
                        </div>
                    </div>

                    {activeTab === 'content' ? (
                        <div className="lessons-list">
                            {lessons.length === 0 ? (
                                <div className="no-lessons">
                                    <p>Chưa có bài học nào</p>
                                </div>
                            ) : (
                                lessons.map((lesson, index) => (
                                    <div key={lesson.id} className="lesson-item">
                                        <div className="lesson-header" onClick={() => toggleLesson(lesson.id)}>
                                            <div className="lesson-info">
                                                {expandedLessons[lesson.id] ? (
                                                    <FaChevronDown className="chevron" />
                                                ) : (
                                                    <FaChevronRight className="chevron" />
                                                )}
                                                <span className="lesson-number">{index + 1}.</span>
                                                <span className="lesson-title">{lesson.title}</span>
                                            </div>
                                            {(lesson.resources_count > 0 ||
                                                (lesson.quizzes && lesson.quizzes.length > 0)) && (
                                                <span className="resources-count">
                                                    {(lesson.resources_count || 0) + (lesson.quizzes?.length || 0)} mục
                                                </span>
                                            )}
                                        </div>

                                        {expandedLessons[lesson.id] && lesson.resources && (
                                            <div className="resources-list">
                                                {lesson.resources.length === 0 &&
                                                (!lesson.quizzes || lesson.quizzes.length === 0) ? (
                                                    <div className="no-resources">
                                                        <p>Chưa có tài liệu</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {lesson.resources.length > 0 && (
                                                            <>
                                                                <div className="resource-section-label">
                                                                    <span>Tài liệu</span>
                                                                </div>
                                                                {lesson.resources.map((resource) => (
                                                                    <div
                                                                        key={resource.id}
                                                                        className={`resource-item ${
                                                                            selectedResource?.id === resource.id
                                                                                ? 'active'
                                                                                : ''
                                                                        }`}
                                                                        onClick={() => handleResourceClick(resource)}
                                                                    >
                                                                        {getResourceIcon(resource.type)}
                                                                        <span className="resource-title">
                                                                            {resource.title ||
                                                                                `${resource.type} resource`}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </>
                                                        )}
                                                        {lesson.quizzes && lesson.quizzes.length > 0 && (
                                                            <>
                                                                <div className="resource-section-label">
                                                                    <span>Bài tập</span>
                                                                </div>
                                                                {lesson.quizzes.map((quiz) => (
                                                                    <QuizItem
                                                                        key={quiz.id}
                                                                        quiz={quiz}
                                                                        onStartQuiz={(q) =>
                                                                            handleQuizClick(q, lesson.id)
                                                                        }
                                                                        isActive={activeQuiz?.id === quiz.id}
                                                                    />
                                                                ))}
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="quiz-history-wrapper">
                            <QuizHistory courseId={course?.id} lessonId={null} onViewResult={handleViewHistoryResult} />
                        </div>
                    )}
                </div>

                {/* Main Content - Hiển thị resource hoặc quiz */}
                <div className="resource-display">
                    {quizMode === 'taking' && activeQuiz ? (
                        <QuizTaking
                            quiz={activeQuiz}
                            lessonId={currentLessonId}
                            onBack={handleBackFromQuiz}
                            onComplete={handleQuizComplete}
                        />
                    ) : quizMode === 'result' && currentSubmissionId ? (
                        <QuizResult
                            submissionId={currentSubmissionId}
                            onBack={handleBackFromQuiz}
                            onViewHistory={() => setActiveTab('history')}
                        />
                    ) : (
                        renderResourceContent()
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseLearning;
