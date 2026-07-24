import axios from "axios";


// export const Production_URL = "https://attendance.symbosys.com/api/v1";
export const BASE_URL = "http://192.168.1.9:5000/api/v1";
export const IMAGE_BASE_URL = "http://192.168.1.9:5000"; //
//  Assuming images are served from root or specific uploads folder
//192.168.1.9, localhost
  
export const api = axios.create({
  // baseURL: Production_URL,
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor for debugging and Authorization
api.interceptors.request.use((request) => {
  const token = localStorage.getItem('token');

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  
  // Debugging request data safely
  const isFormData = request.data && (request.data instanceof FormData || request.data._parts);
  
  if (isFormData) {
    console.log('Starting Request (FormData):', request.url);
  } else {
    console.log('Starting Request:', request.url, JSON.stringify(request.data, null, 2));
  }
  
  return request;
});

// Add a response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response;
  },
  (error) => {
    console.log('Response Error:', JSON.stringify(error, null, 2));
    return Promise.reject(error);
  }
);

export default api;
