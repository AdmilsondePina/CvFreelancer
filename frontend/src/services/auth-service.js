import HttpService from "./http.service";

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/password-forgot',
  RESET_PASSWORD: '/auth/password-reset',
  PROFILE: '/me',
  CHECK_NAME: '/auth/check-name' // Endpoint para verificar o nome
};

class AuthService {
  authEndpoint = process.env.API_URL;

  login = async (payload) => {
    try {
      
      // Envia a requisição de login
      const response = await HttpService.post(AUTH_ENDPOINTS.LOGIN, payload);
  
      console.log("Login response:", response);
  
      // Verifica se o token está presente na resposta
      if (response.token) {
        localStorage.setItem('token', response.token); // Armazena o token
        console.log("Token stored successfully:", localStorage.getItem('token'));
      } else {
        console.error("Token not found in response");
      }
  
      return response;
    } catch (error) {
      console.error("Error during login:", error);
      throw error;  
    }
  };    
  
  register = async (credentials) => {

    try {
      // Verifica se o nome já está em uso
    
      const nameCheckResponse = await this.checkname(credentials.data.attributes.name);
      
  
      if (!nameCheckResponse) {
        throw new Error("Nome de utilizador já está em uso.");
      }
  
      // Se o nome estiver disponível, continua com o registro
      return await HttpService.post(AUTH_ENDPOINTS.REGISTER, credentials);
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;  
    }
  };
  
  logout = async () => {
    return await HttpService.post(AUTH_ENDPOINTS.LOGOUT);
  };

  checkname = async (name) => {
    try {
      const response = await HttpService.post(AUTH_ENDPOINTS.CHECK_NAME, { name });
      return response.available; // Supondo que a resposta tenha uma propriedade `available`
    } catch (error) {
      console.error("Error checking name availability:", error);
      throw error;
    }
  };
   

  forgotPassword = async (payload) => {
    return await HttpService.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, payload);
  }

  resetPassword = async (credentials) => {
    return await HttpService.post(AUTH_ENDPOINTS.RESET_PASSWORD, credentials);
  }

  getProfile = async() => {
    return await HttpService.post(AUTH_ENDPOINTS.PROFILE);
  }

  updateProfile = async (newInfo) => {
    return await HttpService.patch(AUTH_ENDPOINTS.PROFILE, newInfo);
  }
}

export default new AuthService();
