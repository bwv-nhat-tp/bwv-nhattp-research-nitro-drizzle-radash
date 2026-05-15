export const APP_ROUTES = {
  FRONTEND: {
    LOGIN: 'Login',
    REGISTER: 'Register',
    DASHBOARD: 'Dashboard',
    USER_PROFILE: 'UserProfile',
    TRANSACTIONS_LOGS: 'TransactionsLogs',
  },
  BACKEND: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      CHANGE_PASSWORD: '/auth/change-password',
    },
    USER: {
      BASE: '/users',
      GET_BY_ID: (id: string | number) => `/users/${id}`,
    },
    TRANSFER: {
      BASE: '/transfers',
      LOGS: '/transfers/logs/all',
      LOGS_USER: (userId: string | number) => `/transfers/logs/user/${userId}`,
    },
  },
};
