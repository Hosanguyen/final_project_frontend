// src/pages/admin/lesson/LessonManagement.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, BookOpen, FileText, Play, Link } from 'lucide-react';
import LessonService from '../../../services/LessonService';
import CourseService from '../../../services/CourseService';
import LessonForm from './LessonForm';
import LessonCard from './LessonCard';
import LessonFilters from './LessonFilters';
import './LessonManagement.css';

const LessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    course_id: '',
    ordering: 'sequence'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadLessons();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lessonsData, coursesData] = await Promise.all([
        LessonService.getLessonsByFilter(filters),
        CourseService.getCourses()
      ]);
      
      setLessons(lessonsData);
      setCourses(coursesData);
    } catch (err) {
      setError('Không thể tải dữ liệu');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async () => {
    try {
      const lessonsData = await LessonService.getLessonsByFilter(filters);
      setLessons(lessonsData);
    } catch (err) {
      setError('Không thể tải danh sách bài học');
      console.error('Error loading lessons:', err);
    }
  };

  const handleCreateLesson = async (lessonData) => {
    try {
      const newLesson = await LessonService.createLesson(lessonData);
      setLessons([newLesson, ...lessons]);
      setShowForm(false);
      setError(null);
      return newLesson;
    } catch (err) {
      setError('Không thể tạo bài học');
      console.error('Error creating lesson:', err);
    }
  };

  const handleUpdateLesson = async (id, lessonData) => {
    try {
      const updatedLesson = await LessonService.updateLesson(id, lessonData);
      setLessons(lessons.map(lesson => 
        lesson.id === id ? updatedLesson : lesson
      ));
      setShowForm(false);
      setEditingLesson(null);
      setError(null);
      return updatedLesson;
    } catch (err) {
      setError('Không thể cập nhật bài học');
      console.error('Error updating lesson:', err);
    }
  };

  const handleDeleteLesson = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
      try {
        await LessonService.deleteLesson(id);
        setLessons(lessons.filter(lesson => lesson.id !== id));
        setError(null);
      } catch (err) {
        setError('Không thể xóa bài học');
        console.error('Error deleting lesson:', err);
      }
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLesson(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleSearch = (searchTerm) => {
    setFilters({ ...filters, search: searchTerm });
  };

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Play className="resource-icon" />;
      case 'pdf': return <FileText className="resource-icon" />;
      case 'link': return <Link className="resource-icon" />;
      default: return <FileText className="resource-icon" />;
    }
  };

  const getResourceTypeColor = (type) => {
    switch (type) {
      case 'video': return 'text-red-600 bg-red-100';
      case 'pdf': return 'text-red-600 bg-red-100';
      case 'slide': return 'text-blue-600 bg-blue-100';
      case 'text': return 'text-gray-600 bg-gray-100';
      case 'link': return 'text-green-600 bg-green-100';
      case 'file': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="lesson-management">
      <div className="lesson-header">
        <div className="header-content">
          <div className="header-title">
            <BookOpen className="header-icon" />
            <h1>Quản lý Bài học</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <Plus className="btn-icon" />
            Tạo bài học mới
          </button>
        </div>

        <div className="search-filters">
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm bài học..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'active' : ''}`}
          >
            <Filter className="btn-icon" />
            Bộ lọc
          </button>
        </div>

        {showFilters && (
          <LessonFilters
            filters={filters}
            courses={courses}
            onFilterChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="lesson-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen />
          </div>
          <div className="stat-content">
            <div className="stat-number">{lessons.length}</div>
            <div className="stat-label">Tổng bài học</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FileText />
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {lessons.reduce((sum, lesson) => sum + lesson.resources_count, 0)}
            </div>
            <div className="stat-label">Tổng tài nguyên</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Play />
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {lessons.filter(lesson => 
                lesson.resources.some(resource => resource.type === 'video')
              ).length}
            </div>
            <div className="stat-label">Bài có video</div>
          </div>
        </div>
      </div>

      <div className="lesson-grid">
        {lessons.length === 0 ? (
          <div className="empty-state">
            <BookOpen className="empty-icon" />
            <h3>Chưa có bài học nào</h3>
            <p>Hãy tạo bài học đầu tiên của bạn</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="btn-icon" />
              Tạo bài học
            </button>
          </div>
        ) : (
          lessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onEdit={handleEditLesson}
              onDelete={handleDeleteLesson}
              getResourceTypeIcon={getResourceTypeIcon}
              getResourceTypeColor={getResourceTypeColor}
            />
          ))
        )}
      </div>

      {showForm && (
        <LessonForm
          lesson={editingLesson}
          courses={courses}
          onSubmit={editingLesson ? handleUpdateLesson : handleCreateLesson}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default LessonManagement;
