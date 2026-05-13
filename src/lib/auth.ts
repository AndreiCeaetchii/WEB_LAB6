let _accessToken: string | null = null;

export const getAccessToken = () => _accessToken;
export const setAccessToken = (t: string | null) => {
  _accessToken = t;
};

export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const setRefreshToken = (t: string | null) => {
  if (t) localStorage.setItem('refreshToken', t);
  else localStorage.removeItem('refreshToken');
};
