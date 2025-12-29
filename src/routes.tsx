import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '授权验证',
    path: '/',
    element: <AuthPage />
  },
  {
    name: '赛博疗愈师',
    path: '/home',
    element: <HomePage />
  }
];

export default routes;
