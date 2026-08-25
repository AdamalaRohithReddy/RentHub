import { api } from '../api/client';

export const resourceService = {
  createResource: async (formData) => {
    const response = await api.createResource(formData);
    return response.data;
  },
  getAllResources: async () => {
    const response = await api.getResources();
    return response.data;
  },
  getResourceById: async (id) => {
    const response = await api.getResourceById(id);
    return response.data;
  },
  getMyProducts: async () => {
    const response = await api.getMyProducts();
    return response.data;
  },
  updateResource: async (id, data) => {
    const response = await api.updateResource(id, data);
    return response.data;
  },
  addProductImage: async (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.addProductImage(id, formData);
    return response.data;
  },
  deleteProductImage: async (id, imageId) => {
    const response = await api.deleteProductImage(id, imageId);
    return response.data;
  },
  getConditionHistory: async (id) => {
    const response = await api.getConditionHistory(id);
    return response.data;
  },
};

export default resourceService;
