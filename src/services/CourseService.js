// src/services/CourseService.js
import api from './api';

const CourseService = {
  // Lấy danh sách courses
  getCourses: async (params = {}) => {
    try {
      const response = await api.get('/api/courses/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết course
  getCourse: async (id) => {
    try {
      const response = await api.get(`/api/courses/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo course mới
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/api/courses/', courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật course
  updateCourse: async (id, courseData) => {
    try {
      const response = await api.put(`/api/courses/${id}/`, courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật một phần course
  patchCourse: async (id, courseData) => {
    try {
      const response = await api.patch(`/api/courses/${id}/`, courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa course
  deleteCourse: async (id) => {
    try {
      await api.delete(`/api/courses/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách languages
  getLanguages: async () => {
    try {
      const response = await api.get('/api/languages/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách tags
  getTags: async () => {
    try {
      const response = await api.get('/api/tags/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo tag mới
  createTag: async (tagData) => {
    try {
      const response = await api.post('/api/tags/', tagData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy courses theo filter
  getCoursesByFilter: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined)
          params.append(key, value);
      });
      const response = await api.get(`/api/courses/?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy course theo slug
  getCourseBySlug: async (slug) => {
    try {
      const response = await api.get(`/api/courses/slug/${slug}/`);
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  },

  // Lấy lessons của một course
  getLessonsByCourse: async (courseId) => {
    try {
      const response = await api.get('/api/lessons/', { params: { course: courseId } });
      // Backend trả về array trực tiếp, không có pagination
      return { data: response.data || [] };
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  },

  // Kiểm tra enrollment status
  checkEnrollment: async (courseId) => {
    try {
      const response = await api.get(`/api/enrollment/check/${courseId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách courses đã đăng ký
  getMyEnrollments: async () => {
    try {
      const response = await api.get('/api/enrollment/list/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
};

export default CourseService;
