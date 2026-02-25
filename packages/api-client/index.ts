import axios from "axios";
const API = process.env.EXPO_PUBLIC_API_URL!;

export const useProfileApi = () => {
  const uploadImage = async (userId: string, formData: FormData) => {
    return axios.post(`${API}/api/user/${userId}/upload-image`, formData);
  };

  return { uploadImage };
};

/*  export const useProfileApi = (baseUrl: string) => {
  const uploadImage = async (userId: string, formData: FormData) => {
    return axios.post(`${baseUrl}/api/user/${userId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  return { uploadImage };
}; */
