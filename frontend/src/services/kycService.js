import { api } from '../api/client';

export const kycService = {
  uploadKycDocument: async (documentType, documentNumber, file) => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('documentNumber', documentNumber);
    formData.append('file', file);
    const response = await api.uploadKycDocument(formData);
    return response.data;
  },
  getKycStatus: async () => {
    const response = await api.getKycStatus();
    return response.data;
  },
};

export default kycService;
