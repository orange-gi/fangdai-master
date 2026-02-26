import { User } from '../types';

let MOCK_USER: User = {
  id: 'mock-user-001',
  openid: 'mock-openid',
  nickname: '张先生',
  avatar: undefined,
  createdAt: '2024-01-01',
};

const USE_MOCK = true;

export const userService = {
  async getCurrentUser(): Promise<User> {
    if (USE_MOCK) {
      return { ...MOCK_USER };
    }
    return MOCK_USER;
  },

  async updateProfile(data: Partial<User>): Promise<void> {
    if (USE_MOCK) {
      MOCK_USER = { ...MOCK_USER, ...data };
      return;
    }
  },

  async isLoggedIn(): Promise<boolean> {
    if (USE_MOCK) {
      return true;
    }
    return false;
  },
};
