// src/pages/admin/course/CourseManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaCheck, FaTimes, FaBookOpen, FaUsers } from 'react-icons/fa';
import CourseService from '../../../services/CourseService';
import './CourseManagement.css';
import notification from '../../../utils/notification';

const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    level: '',
    is_published: '',
    language_id: '',
    tag_id: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [filters]);

  const loadData = async () => {
    try {
      const [languagesData, tagsData] = await Promise.all([
        CourseService.getLanguages(),
        CourseService.getTags()
      ]);
      
      setLanguages(languagesData);
      setTags(tagsData);
      loadCourses();
    } catch (err) {
      console.error('Error loading data:', err);
      notification.error('Không thể tải dữ liệu');
    }
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        ...filters,
      };
      
      const coursesData = await CourseService.getCoursesByFilter(params);
      setCourses(coursesData);
    } catch (err) {
      console.error('Error loading courses:', err);
      notification.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadCourses();
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleDelete = async () => {
    if (!selectedCourse) return;

    try {
      await CourseService.deleteCourse(selectedCourse.id);
      notification.success('Xóa khóa học thành công');
      loadCourses();
      setShowDeleteModal(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Delete failed:', error);
      notification.error('Xóa khóa học thất bại');
    }
  };

  const openDeleteModal = (course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const getLevelBadge = (level) => {
    const badges = {
      beginner: { class: 'course-list-badge-beginner', label: 'Cơ bản' },
      intermediate: { class: 'course-list-badge-intermediate', label: 'Trung bình' },
      advanced: { class: 'course-list-badge-advanced', label: 'Nâng cao' },
    };
    return badges[level] || { class: '', label: level };
  };

  if (loading && courses.length === 0) {
    return (
      <div className="course-list-loading-container">
        <div className="course-list-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="course-list">
      <div className="course-list-page-header">
        <div className="course-list-header-left">
          <h1>Quản lý Khóa học</h1>
          <p className="course-list-subtitle">Quản lý các khóa học lập trình và tài liệu học tập</p>
        </div>
        <button className="course-list-btn-create" onClick={() => navigate('/admin/courses/create')}>
          <FaPlus /> Tạo khóa học mới
        </button>
      </div>

      <div className="course-list-content-card">
        <div className="course-list-card-header">
          <div className="course-list-search-box">
            <FaSearch className="course-list-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="course-list-filters">
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="course-list-filter-select"
            >
              <option value="">Tất cả cấp độ</option>
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung bình</option>
              <option value="advanced">Nâng cao</option>
            </select>

            <select
              value={filters.is_published}
              onChange={(e) => handleFilterChange('is_published', e.target.value)}
              className="course-list-filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đã xuất bản</option>
              <option value="false">Nháp</option>
            </select>

            {languages.length > 0 && (
              <select
                value={filters.language_id}
                onChange={(e) => handleFilterChange('language_id', e.target.value)}
                className="course-list-filter-select"
              >
                <option value="">Tất cả ngôn ngữ</option>
                {languages.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="course-list-stats">
            <span className="course-list-stat-item">
              Tổng số: <strong>{courses.length}</strong>
            </span>
          </div>
        </div>

        <div className="course-list-table-container">
          <table className="course-list-data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Tiêu đề</th>
                <th style={{ width: '120px' }}>Cấp độ</th>
                <th style={{ width: '150px' }}>Ngôn ngữ</th>
                <th style={{ width: '100px' }}>Bài học</th>
                <th style={{ width: '100px' }}>Học viên</th>
                <th style={{ width: '120px' }}>Trạng thái</th>
                <th style={{ width: '150px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="course-list-no-data">
                    {searchTerm || filters.level || filters.is_published || filters.language_id
                      ? 'Không tìm thấy kết quả phù hợp'
                      : 'Chưa có khóa học nào'}
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <span className="course-list-id-badge">{course.id}</span>
                    </td>
                    <td>
                      <div className="course-list-title-cell">
                        <div className="course-list-title">{course.title}</div>
                        {course.description && (
                          <div className="course-list-short-desc">
                            {course.description.substring(0, 80)}
                            {course.description.length > 80 ? '...' : ''}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`course-list-level-badge ${
                          getLevelBadge(course.level).class
                        }`}
                      >
                        {getLevelBadge(course.level).label}
                      </span>
                    </td>
                    <td>
                      {course.languages && course.languages.length > 0
                        ? course.languages.map(lang => lang.name).join(', ')
                        : 'N/A'}
                    </td>
                    <td className="course-list-text-center">
                      <FaBookOpen className="course-list-inline-icon" />
                      {course.lessons_count || 0}
                    </td>
                    <td className="course-list-text-center">
                      <FaUsers className="course-list-inline-icon" />
                      {course.enrollments_count || 0}
                    </td>
                    <td>
                      {course.is_published ? (
                        <span className="course-list-status-badge course-list-status-published">
                          <FaCheck /> Đã xuất bản
                        </span>
                      ) : (
                        <span className="course-list-status-badge course-list-status-draft">
                          <FaTimes /> Nháp
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="course-list-action-buttons">
                        <button
                          className="course-list-btn-action course-list-btn-view"
                          onClick={() => navigate(`/admin/courses/${course.id}`)}
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="course-list-btn-action course-list-btn-edit"
                          onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="course-list-btn-action course-list-btn-delete"
                          onClick={() => openDeleteModal(course)}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="course-list-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="course-list-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="course-list-modal-header">
              <h3>Xác nhận xóa</h3>
            </div>
            <div className="course-list-modal-body">
              <p>
                Bạn có chắc chắn muốn xóa khóa học <strong>"{selectedCourse?.title}"</strong>?
              </p>
              <p className="course-list-warning-text">
                Lưu ý: Tất cả bài học và dữ liệu liên quan sẽ bị xóa vĩnh viễn.
              </p>
            </div>
            <div className="course-list-modal-footer">
              <button className="course-list-btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Hủy
              </button>
              <button className="course-list-btn-confirm-delete" onClick={handleDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
