import axios from 'axios';

export const useProfileApi = (baseUrl: string) => {
  const uploadImage = async (userId: string, formData: FormData) => {
    return axios.post(`${baseUrl}/api/user/${userId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  return { uploadImage };
};