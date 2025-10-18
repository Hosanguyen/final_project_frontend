import api from './api';

export const updateUserProfile = async (formData, avatarFile) => {
  const formDataToSend = new FormData();

  // Thêm các trường từ formData
  Object.keys(formData).forEach((key) => {
    if (key === 'avatar_url') return;
    if (formData[key] !== null && formData[key] !== undefined)
      formDataToSend.append(key, formData[key]);
  });
  // Thêm avatar (nếu có)
  if (avatarFile) {
    const blob = avatarFile;
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
    formDataToSend.append('avatar_url', file);
  }

  // Gọi API
  const response = await api.put('/api/users/profile/update/', formDataToSend, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};
