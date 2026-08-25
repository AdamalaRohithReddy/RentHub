import { api } from '../api/client';

export const returnService = {
  requestReturn: async (orderId, returnNote) => {
    const response = await api.requestReturn(orderId, { returnNote });
    return response.data;
  },
  getOwnerPendingReturns: async () => {
    const response = await api.getOwnerPendingReturns();
    return response.data;
  },
  getReturnOrder: async (orderId) => {
    const response = await api.getReturnOrder(orderId);
    return response.data;
  },
  scanReturnedProduct: async (orderId, photos) => {
    const formData = new FormData();
    photos.forEach((p) => {
      if (p.file) {
        formData.append('images', p.file);
      }
    });
    const response = await api.scanReturnedProduct(orderId, formData);
    return response.data;
  },
  confirmReturn: async (orderId) => {
    const response = await api.confirmReturn(orderId);
    return response.data;
  },
  reportDamage: async (orderId, damageData) => {
    const response = await api.reportDamage(orderId, damageData);
    return response.data;
  },
};

export default returnService;
