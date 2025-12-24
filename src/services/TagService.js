// src/services/TagService.js
import api from './api';

const TagService = {
  // Lấy danh sách tags
  getTags: async () => {
    try {
      const response = await api.get('/api/tags/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết tag
  getTag: async (id) => {
    try {
      const response = await api.get(`/api/tags/${id}/`);
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

  // Cập nhật tag
  updateTag: async (id, tagData) => {
    try {
      const response = await api.put(`/api/tags/${id}/`, tagData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật một phần tag
  patchTag: async (id, tagData) => {
    try {
      const response = await api.patch(`/api/tags/${id}/`, tagData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa tag
  deleteTag: async (id) => {
    try {
      await api.delete(`/api/tags/${id}/`);
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default TagService;
