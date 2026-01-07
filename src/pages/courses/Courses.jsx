// src/pages/courses/Courses.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import CourseService from '../../services/CourseService';
import CourseCard from './CourseCard';
import CourseFilters from './CourseFilters';
import Pagination from '../../components/Pagination';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import './Courses.css';

const Courses = () => {
  useDocumentTitle('Khóa học');
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(12);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadCourses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesResponse, languagesData, tagsData] = await Promise.all([
        CourseService.getCoursesByFilter({ ...filters, is_published: 'true', page: 1, page_size: pageSize }),
        CourseService.getLanguages(),
        CourseService.getTags()
      ]);
      
      setCourses(coursesResponse.results || []);
      setTotalItems(coursesResponse.total || 0);
      setTotalPages(coursesResponse.total_pages || 1);
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
      const response = await CourseService.getCoursesByFilter({ 
        ...filters, 
        is_published: 'true',
        page: currentPage,
        page_size: pageSize 
      });
      setCourses(response.results || []);
      setTotalItems(response.total || 0);
      setTotalPages(response.total_pages || 1);
    } catch (err) {
      setError('Không thể tải danh sách khóa học');
      console.error('Error loading courses:', err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setCurrentPage(1);
    setFilters({ ...filters, ...newFilters });
  };

  const handleSearch = (searchTerm) => {
    setCurrentPage(1);
    setFilters({ ...filters, search: searchTerm });
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
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
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          itemsPerPage={pageSize}
        />
      </div>
    </div>
  );
};

export default Courses;
