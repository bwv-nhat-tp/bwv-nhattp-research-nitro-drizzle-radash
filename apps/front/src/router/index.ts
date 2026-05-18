import { createRouter, createWebHistory } from 'vue-router';
import UserList from '../views/Dashboard.vue';
import UserProfile from '../views/UserProfile.vue';
import TransactionLogs from '../views/TransactionLogs.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import NotFound from '../views/NotFound.vue';
import { useAuthStore } from '../stores/authStore';
import { APP_ROUTES } from '@intern/factory';

const routes = [
  {
    path: '/login',
    name: APP_ROUTES.FRONTEND.LOGIN,
    component: Login,
    meta: { requiresGuest: true, showLoading: true },
  },
  {
    path: '/register',
    name: APP_ROUTES.FRONTEND.REGISTER,
    component: Register,
    meta: { requiresGuest: true, showLoading: true },
  },
  {
    path: '/',
    name: APP_ROUTES.FRONTEND.DASHBOARD,
    component: UserList,
    meta: { requiresAuth: true, showLoading: true },
  },
  {
    path: '/user/:id',
    name: APP_ROUTES.FRONTEND.USER_PROFILE,
    component: UserProfile,
    props: true,
    meta: { requiresAuth: true, showLoading: true },
  },
  
  {
    path: '/transactions',
    name: APP_ROUTES.FRONTEND.TRANSACTIONS_LOGS,
    component: TransactionLogs,
    meta: { requiresAuth: true, showLoading: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { showLoading: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: APP_ROUTES.FRONTEND.LOGIN });
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: APP_ROUTES.FRONTEND.DASHBOARD });
  } else {
    next();
  }
});
export default router;
