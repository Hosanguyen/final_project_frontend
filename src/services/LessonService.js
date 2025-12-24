// src/services/LessonService.js
import api from './api';

const LessonService = {
  // Lấy danh sách lessons
  getLessons: async (params = {}) => {
    try {
      const response = await api.get('/api/lessons/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết lesson
  getLesson: async (id) => {
    try {
      const response = await api.get(`/api/lessons/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo lesson mới
  createLesson: async (lessonData) => {
    try {
      const response = await api.post('/api/lessons/', lessonData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật lesson
  updateLesson: async (id, lessonData) => {
    try {
      const response = await api.put(`/api/lessons/${id}/`, lessonData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật một phần lesson
  patchLesson: async (id, lessonData) => {
    try {
      const response = await api.patch(`/api/lessons/${id}/`, lessonData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa lesson
  deleteLesson: async (id) => {
    try {
      await api.delete(`/api/lessons/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Lấy lessons theo course
  getLessonsByCourse: async (courseId) => {
    try {
      const response = await api.get(`/api/lessons/?course_id=${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách lesson resources
  getLessonResources: async (params = {}) => {
    try {
      const response = await api.get('/api/lesson-resources/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết lesson resource
  getLessonResource: async (id) => {
    try {
      const response = await api.get(`/api/lesson-resources/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo lesson resource mới
  createLessonResource: async (resourceData) => {
    try {
      // Kiểm tra xem resourceData đã là FormData chưa
      let formData;
      if (resourceData instanceof FormData) {
        formData = resourceData;
      } else {
        // Nếu là object thì tạo FormData mới
        formData = new FormData();
        for (const key in resourceData) {
          if (resourceData[key] !== null && resourceData[key] !== undefined) {
            formData.append(key, resourceData[key]);
          }
        }
      }

      const response = await api.post('/api/lesson-resources/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Cập nhật lesson resource
  updateLessonResource: async (id, resourceData) => {
    try {
      // Kiểm tra xem resourceData đã là FormData chưa
      let formData;
      if (resourceData instanceof FormData) {
        formData = resourceData;
      } else {
        // Nếu là object thì tạo FormData mới
        formData = new FormData();
        for (const key in resourceData) {
          if (resourceData[key] !== null && resourceData[key] !== undefined) {
            formData.append(key, resourceData[key]);
          }
        }
      }

      const response = await api.put(`/api/lesson-resources/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật một phần lesson resource
  patchLessonResource: async (id, resourceData) => {
    try {
      const response = await api.patch(`/api/lesson-resources/${id}/`, resourceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa lesson resource
  deleteLessonResource: async (id) => {
    try {
      await api.delete(`/api/lesson-resources/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Lấy resources theo lesson
  getResourcesByLesson: async (lessonId) => {
    try {
      const response = await api.get(`/api/lesson-resources/?lesson_id=${lessonId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy lessons theo filter
  getLessonsByFilter: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.course_id) params.append('course_id', filters.course_id);
      
      const response = await api.get(`/api/lessons/?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default LessonService;
