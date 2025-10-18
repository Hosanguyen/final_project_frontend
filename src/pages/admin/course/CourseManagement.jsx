// src/pages/admin/course/CourseManagement.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, BookOpen, Users, Tag } from 'lucide-react';
import CourseService from '../../../services/CourseService';
import CourseForm from './CourseForm';
import CourseCard from './CourseCard';
import CourseFilters from './CourseFilters';
import './CourseManagement.css';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    is_published: '',
    language_id: '',
    tag_id: '',
    ordering: '-created_at'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, languagesData, tagsData] = await Promise.all([
        CourseService.getCoursesByFilter(filters),
        CourseService.getLanguages(),
        CourseService.getTags()
      ]);
      
      setCourses(coursesData);
      setLanguages(languagesData);
      setTags(tagsData);
    } catch (err) {
      setError('Không thể tải dữ liệu');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const coursesData = await CourseService.getCoursesByFilter(filters);
      setCourses(coursesData);
    } catch (err) {
      setError('Không thể tải danh sách khóa học');
      console.error('Error loading courses:', err);
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      const newCourse = await CourseService.createCourse(courseData);
      setCourses([newCourse, ...courses]);
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError('Không thể tạo khóa học');
      console.error('Error creating course:', err);
    }
  };

  const handleUpdateCourse = async (id, courseData) => {
    try {
      const updatedCourse = await CourseService.updateCourse(id, courseData);
      setCourses(courses.map(course => 
        course.id === id ? updatedCourse : course
      ));
      setShowForm(false);
      setEditingCourse(null);
      setError(null);
    } catch (err) {
      setError('Không thể cập nhật khóa học');
      console.error('Error updating course:', err);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      try {
        await CourseService.deleteCourse(id);
        setCourses(courses.filter(course => course.id !== id));
        setError(null);
      } catch (err) {
        setError('Không thể xóa khóa học');
        console.error('Error deleting course:', err);
      }
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleSearch = (searchTerm) => {
    setFilters({ ...filters, search: searchTerm });
  };

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level) => {
    switch (level) {
      case 'beginner': return 'Cơ bản';
      case 'intermediate': return 'Trung bình';
      case 'advanced': return 'Nâng cao';
      default: return level;
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
    <div className="course-management">
      <div className="course-header">
        <div className="header-content">
          <div className="header-title">
            <BookOpen className="header-icon" />
            <h1>Quản lý Khóa học</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <Plus className="btn-icon" />
            Tạo khóa học mới
          </button>
        </div>

        <div className="search-filters">
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
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
          <CourseFilters
            filters={filters}
            languages={languages}
            tags={tags}
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

      <div className="course-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen />
          </div>
          <div className="stat-content">
            <div className="stat-number">{courses.length}</div>
            <div className="stat-label">Tổng khóa học</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Eye />
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {courses.filter(c => c.is_published).length}
            </div>
            <div className="stat-label">Đã xuất bản</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {courses.reduce((sum, c) => sum + c.enrollments_count, 0)}
            </div>
            <div className="stat-label">Tổng đăng ký</div>
          </div>
        </div>
      </div>

      <div className="course-grid">
        {courses.length === 0 ? (
          <div className="empty-state">
            <BookOpen className="empty-icon" />
            <h3>Chưa có khóa học nào</h3>
            <p>Hãy tạo khóa học đầu tiên của bạn</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              <Plus className="btn-icon" />
              Tạo khóa học
            </button>
          </div>
        ) : (
          courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
              getLevelBadgeColor={getLevelBadgeColor}
              getLevelText={getLevelText}
            />
          ))
        )}
      </div>

      {showForm && (
        <CourseForm
          course={editingCourse}
          languages={languages}
          tags={tags}
          onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default CourseManagement;
