// src/pages/admin/course/CourseFilters.jsx
import React, { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import './CourseFilters.css';

const CourseFilters = ({ filters, languages, tags, onFilterChange, onClose }) => {
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
      level: '',
      is_published: '',
      language_id: '',
      tag_id: '',
      ordering: '-created_at'
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const levelOptions = [
    { value: '', label: 'Tất cả cấp độ' },
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung bình' },
    { value: 'advanced', label: 'Nâng cao' }
  ];

  const publishedOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'true', label: 'Đã xuất bản' },
    { value: 'false', label: 'Bản nháp' }
  ];

  const orderingOptions = [
    { value: '-created_at', label: 'Mới nhất' },
    { value: 'created_at', label: 'Cũ nhất' },
    { value: 'title', label: 'Tên A-Z' },
    { value: '-title', label: 'Tên Z-A' },
    { value: '-price', label: 'Giá cao nhất' },
    { value: 'price', label: 'Giá thấp nhất' },
    { value: '-lessons_count', label: 'Nhiều bài học nhất' },
    { value: 'lessons_count', label: 'Ít bài học nhất' }
  ];

  return (
    <div className="course-filters">
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
          <label className="filter-label">Cấp độ</label>
          <select
            value={localFilters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            className="filter-select"
          >
            {levelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Trạng thái</label>
          <select
            value={localFilters.is_published}
            onChange={(e) => handleFilterChange('is_published', e.target.value)}
            className="filter-select"
          >
            {publishedOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Ngôn ngữ</label>
          <select
            value={localFilters.language_id}
            onChange={(e) => handleFilterChange('language_id', e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả ngôn ngữ</option>
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Thẻ</label>
          <select
            value={localFilters.tag_id}
            onChange={(e) => handleFilterChange('tag_id', e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả thẻ</option>
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
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

export default CourseFilters;
