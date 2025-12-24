// src/pages/courses/Courses.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, Users, BookOpen, Play } from 'lucide-react';
import CourseService from '../../services/CourseService';
import CourseCard from './CourseCard';
import CourseFilters from './CourseFilters';
import './Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    level: '',
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
        CourseService.getCoursesByFilter({ ...filters, is_published: 'true' }),
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
      const coursesData = await CourseService.getCoursesByFilter({ ...filters, is_published: 'true' });
      setCourses(coursesData);
    } catch (err) {
      setError('Không thể tải danh sách khóa học');
      console.error('Error loading courses:', err);
    }
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
    <div className="courses-page">
      <div className="courses-hero">
        <div className="hero-content">
          <h1>Khóa học lập trình</h1>
          <p>Học lập trình từ cơ bản đến nâng cao với các khóa học chất lượng cao</p>
        </div>
      </div>

      <div className="courses-container">
        <div className="courses-header">
          <div className="search-filters">
            <div className="course-search-bar">
              <Search className="course-search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="course-search-input"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary ${showFilters ? 'active' : ''}`}
            >
              <Filter className="course-btn-icon" />
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
          <div className="courses-error-message">
            {error}
          </div>
        )}

        <div className="courses-grid">
          {courses.length === 0 ? (
            <div className="empty-state">
              <BookOpen className="empty-icon" />
              <h3>Không tìm thấy khóa học nào</h3>
              <p>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                getLevelBadgeColor={getLevelBadgeColor}
                getLevelText={getLevelText}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
