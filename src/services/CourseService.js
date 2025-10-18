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
      
      if (filters.search) params.append('search', filters.search);
      if (filters.level) params.append('level', filters.level);
      if (filters.is_published !== undefined) params.append('is_published', filters.is_published);
      if (filters.language_id) params.append('language_id', filters.language_id);
      if (filters.tag_id) params.append('tag_id', filters.tag_id);
      if (filters.ordering) params.append('ordering', filters.ordering);
      
      const response = await api.get(`/api/courses/?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default CourseService;
