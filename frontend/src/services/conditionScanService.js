import { api } from '../api/client';

export const conditionScanService = {
  scanSinglePhoto: async (formData) => {
    const response = await api.scanSinglePhoto(formData);
    return response.data;
  },
  scanCombinedFinal: async (formData) => {
    const response = await api.scanCombinedFinal(formData);
    return response.data;
  },
  scanProductCondition: async (formData) => {
    const response = await api.scanProductCondition(formData);
    return response.data;
  },
};

export default conditionScanService;
