import { api } from '../api/client';

export const userService = {
  getProfile: async () => {
    const response = await api.getUserProfile();
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.updateUserProfile(data);
    return response.data;
  },

  uploadProfilePhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.uploadProfilePhoto(formData);
    return response.data;
  },

  getProfileStatistics: async () => {
    const response = await api.getUserStatistics();
    return response.data;
  },
};

export default userService;
