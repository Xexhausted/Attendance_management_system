// JWT Token Management Utilities

export const getStoredToken = () => {
  return localStorage.getItem('authToken');
};

export const getStoredUser = () => {
  const userStr = localStorage.getItem('authUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const setStoredAuth = (token, user) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('authUser', JSON.stringify(user));
};

export const clearStoredAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
};

export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const getTokenExpiration = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
};

export const formatTokenExpiration = (token) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return 'Invalid token';
  
  return expiration.toLocaleString();
}; 