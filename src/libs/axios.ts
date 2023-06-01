import axios from 'axios';

const instance = axios.create();

instance.interceptors.request.use((config) => {
  console.info(`[${config.method?.toUpperCase()}] Request to: ${config.url}`);

  return config;
});

instance.interceptors.response.use((response) => {
  console.info(
    `[${response.config.method?.toUpperCase()}] ${response.status} ${
      response.statusText
    }`
  );

  return response;
});

export default instance;
