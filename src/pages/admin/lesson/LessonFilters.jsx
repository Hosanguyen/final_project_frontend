// src/pages/admin/lesson/LessonFilters.jsx
import React, { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import './LessonFilters.css';

const LessonFilters = ({ filters, courses, onFilterChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: '',
      course_id: '',
      ordering: 'sequence'
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const orderingOptions = [
    { value: 'sequence', label: 'Thứ tự tăng dần' },
    { value: '-sequence', label: 'Thứ tự giảm dần' },
    { value: 'title', label: 'Tên A-Z' },
    { value: '-title', label: 'Tên Z-A' },
    { value: '-created_at', label: 'Mới nhất' },
    { value: 'created_at', label: 'Cũ nhất' }
  ];

  return (
    <div className="lesson-filters">
      <div className="filters-header">
        <h3>Bộ lọc</h3>
        <div className="filters-actions">
          <button
            onClick={handleResetFilters}
            className="btn-reset"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw className="btn-icon" />
          </button>
          <button
            onClick={onClose}
            className="btn-close"
            title="Đóng"
          >
            <X className="btn-icon" />
          </button>
        </div>
      </div>

      <div className="filters-content">
        <div className="filter-group">
          <label className="filter-label">Khóa học</label>
          <select
            value={localFilters.course_id}
            onChange={(e) => handleFilterChange('course_id', e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả khóa học</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Sắp xếp</label>
          <select
            value={localFilters.ordering}
            onChange={(e) => handleFilterChange('ordering', e.target.value)}
            className="filter-select"
          >
            {orderingOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filters-footer">
        <button
          onClick={onClose}
          className="btn-cancel"
        >
          Hủy
        </button>
        <button
          onClick={handleApplyFilters}
          className="btn-apply"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default LessonFilters;
