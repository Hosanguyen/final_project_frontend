// src/pages/admin/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Play, FileText, TrendingUp, Clock } from 'lucide-react';
import CourseService from '../../../services/CourseService';
import LessonService from '../../../services/LessonService';
import TagService from '../../../services/TagService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalLessons: 0,
    totalEnrollments: 0,
    totalResources: 0,
    totalTags: 0,
    recentCourses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [courses, lessons, tags] = await Promise.all([
        CourseService.getCourses(),
        LessonService.getLessons(),
        TagService.getTags()
      ]);

      const publishedCourses = courses.filter(course => course.is_published);
      const totalEnrollments = courses.reduce((sum, course) => sum + course.enrollments_count, 0);
      const totalResources = lessons.reduce((sum, lesson) => sum + lesson.resources_count, 0);
      const recentCourses = courses.slice(0, 5);

      setStats({
        totalCourses: courses.length,
        publishedCourses: publishedCourses.length,
        totalLessons: lessons.length,
        totalEnrollments,
        totalResources,
        totalTags: tags.length,
        recentCourses
      });
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Quản trị</h1>
        <p>Tổng quan về hệ thống quản lý khóa học</p>
      </div>

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card dashboard">
          <div className="stat-icon courses">
            <BookOpen />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalCourses}</div>
            <div className="stat-label">Tổng khóa học</div>
            <div className="stat-sublabel">{stats.publishedCourses} đã xuất bản</div>
          </div>
        </div>

        <div className="stat-card dashboard">
          <div className="stat-icon lessons">
            <FileText />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalLessons}</div>
            <div className="stat-label">Tổng bài học</div>
            <div className="stat-sublabel">Tất cả khóa học</div>
          </div>
        </div>

        <div className="stat-card dashboard">
          <div className="stat-icon users">
            <Users />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalEnrollments}</div>
            <div className="stat-label">Tổng đăng ký</div>
            <div className="stat-sublabel">Học viên tham gia</div>
          </div>
        </div>

        <div className="stat-card dashboard">
          <div className="stat-icon resources">
            <Play />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalResources}</div>
            <div className="stat-label">Tài nguyên</div>
            <div className="stat-sublabel">Video, PDF, Slide...</div>
          </div>
        </div>

        <div className="stat-card dashboard">
          <div className="stat-icon tags">
            <FileText />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalTags}</div>
            <div className="stat-label">Thẻ phân loại</div>
            <div className="stat-sublabel">Tags cho khóa học</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-courses">
          <div className="section-header">
            <h2>Khóa học gần đây</h2>
            <a href="/admin/courses" className="view-all-link">
              Xem tất cả
            </a>
          </div>
          
          <div className="courses-list">
            {stats.recentCourses.length === 0 ? (
              <div className="empty-state">
                <BookOpen className="empty-icon" />
                <p>Chưa có khóa học nào</p>
              </div>
            ) : (
              stats.recentCourses.map(course => (
                <div key={course.id} className="course-item">
                  <div className="course-info">
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-description">
                      {course.short_description || 'Chưa có mô tả'}
                    </p>
                    <div className="course-meta">
                      <span className="course-level">{course.level}</span>
                      <span className="course-date">
                        <Clock className="meta-icon" />
                        {formatDate(course.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="course-stats">
                    <div className="stat-item">
                      <FileText className="stat-icon" />
                      <span>{course.lessons_count} bài</span>
                    </div>
                    <div className="stat-item">
                      <Users className="stat-icon" />
                      <span>{course.enrollments_count} học viên</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="quick-actions">
          <div className="section-header">
            <h2>Thao tác nhanh</h2>
          </div>
          
          <div className="actions-grid">
            <a href="/admin/courses" className="action-card">
              <BookOpen className="action-icon" />
              <div className="action-content">
                <h3>Quản lý khóa học</h3>
                <p>Tạo và chỉnh sửa khóa học</p>
              </div>
            </a>
            
            <a href="/admin/lessons" className="action-card">
              <FileText className="action-icon" />
              <div className="action-content">
                <h3>Quản lý bài học</h3>
                <p>Tạo và chỉnh sửa bài học</p>
              </div>
            </a>
            
            <a href="/admin/users" className="action-card">
              <Users className="action-icon" />
              <div className="action-content">
                <h3>Quản lý người dùng</h3>
                <p>Xem và quản lý học viên</p>
              </div>
            </a>
            
            <a href="/admin/tags" className="action-card">
              <FileText className="action-icon" />
              <div className="action-content">
                <h3>Quản lý thẻ</h3>
                <p>Tạo và quản lý tags</p>
              </div>
            </a>
            
            <a href="/admin/statistics" className="action-card">
              <TrendingUp className="action-icon" />
              <div className="action-content">
                <h3>Thống kê</h3>
                <p>Xem báo cáo chi tiết</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
