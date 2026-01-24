import { create } from 'zustand';
import { api, version } from '../../Store/api';

// ============================================================================
// ТИПЫ ДЛЯ АВТОРИЗАЦИИ
// ============================================================================

/**
 * Полные данные пользователя включая профиль
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  surname: string;
  lastname: string;
  phone: string;
  token: string;
  pincode?: string;
  code?: string; // код телефона для восстановления
  
  // Дополнительные поля для работы с показаниями
  monthes?: number;
  borders?: {
    from: number;
    to: number;
  };
  
  // Дополнительные поля профиля
  passport?: {
    serial: string;
    number: string;
    issuedDate: string;
    issuedBy: string;
    codePodr: string;
  };
  
  // Настройки
  password?: string;
  consenttoemail?: boolean;
  consenttosms?: boolean;
}

export interface ApiResponse<T = any> {
  error: boolean;
  data?: T;
  message: string;
}

// ============================================================================
// КОНСТАНТЫ ДЛЯ LOCALSTORAGE
// ============================================================================

const STORAGE_KEYS = {
  TOKEN: 'token',
  PHONE: 'stngul.phone',
  PASS: 'stngul.pass',
} as const;

// ============================================================================
// HELPER ФУНКЦИИ ДЛЯ РАБОТЫ С ТОКЕНОМ
// ============================================================================

const tokenStorage = {
  save: (token: string) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },
  get: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },
  remove: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },
};

const credentialsStorage = {
  save: (phone: string, password: string) => {
    localStorage.setItem(STORAGE_KEYS.PHONE, phone);
    localStorage.setItem(STORAGE_KEYS.PASS, password);
  },
  remove: () => {
    localStorage.removeItem(STORAGE_KEYS.PHONE);
    localStorage.removeItem(STORAGE_KEYS.PASS);
  },
};

// ============================================================================
// НАЧАЛЬНЫЕ ЗНАЧЕНИЯ ПРОФИЛЯ
// ============================================================================

/**
 * Создает начальный профиль с дефолтными значениями
 */
const createInitialProfile = (): AuthUser => {
  const token = tokenStorage.get() || '';
  
  return {
    id: '',
    email: '',
    name: '',
    surname: '',
    lastname: '',
    phone: '',
    token: token,
    monthes: 0,
    borders: {
      from: 20,
      to: 25,
    },
  };
};

// ============================================================================
// AUTH STORE ИНТЕРФЕЙС
// ============================================================================

interface AuthStore {
  // State
  auth: boolean;
  reg: boolean;
  user: AuthUser | null;
  profile: AuthUser; // Полный профиль (никогда не null)
  token: string | null;
  phone: string | null;
  borders?: {
    from: number;
    to: number;
  };
  monthes?: number;
  isLoading: boolean;
  error: string | null;

  // Auth Actions
  login: (phone: string, password: string) => Promise<ApiResponse<AuthUser>>;
  create: (phone: string, name: string, terms: boolean) => Promise<ApiResponse<AuthUser>>;
  restore: (phone: string) => Promise<boolean>;
  compare: (sms: string) => boolean;
  password: (password: string) => Promise<boolean>;
  logout: () => void;
  setAuth: (auth: boolean) => void;
  setReg: (reg: boolean) => void;
  setUser: (user: AuthUser) => void;

  // Profile Actions
  getProfile: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  setProfile: (profile: AuthUser) => void;
  resetProfile: () => void;
  clearError: () => void;

  // Internal helpers
  _setToken: (token: string | null) => void;
  _clearAuth: () => void;
  _updateProfileFromUser: (user: AuthUser) => void;
}

// ============================================================================
// AUTH STORE РЕАЛИЗАЦИЯ
// ============================================================================

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  auth: false,
  reg: false,
  user: null,
  profile: createInitialProfile(),
  token: tokenStorage.get(),
  phone: null,
  isLoading: false,
  error: null,

  // ========================================================================
  // INTERNAL HELPERS
  // ========================================================================

  _setToken: (token: string | null) => {
    if (token) {
      tokenStorage.save(token);
      set({ token });
    } else {
      tokenStorage.remove();
      set({ token: null });
    }
  },

  _clearAuth: () => {
    credentialsStorage.remove();
    tokenStorage.remove();
    set({
      user: null,
      profile: createInitialProfile(),
      token: null,
      auth: false,
      phone: null,
    });
  },

  /**
   * Обновляет profile из user данных
   */
  _updateProfileFromUser: (user: AuthUser) => {
    const currentProfile = get().profile;
    
    // Объединяем данные из user с текущим профилем
    const profile: AuthUser = {
      id: user.id || currentProfile.id || '',
      email: user.email || currentProfile.email || '',
      name: user.name || currentProfile.name || '',
      surname: user.surname || currentProfile.surname || '',
      lastname: user.lastname || currentProfile.lastname || '',
      phone: user.phone || currentProfile.phone || '',
      token: user.token || currentProfile.token || '',
      pincode: user.pincode ?? currentProfile.pincode,
      code: user.code ?? currentProfile.code,
      monthes: user.monthes ?? currentProfile.monthes ?? 0,
      borders: user.borders ?? currentProfile.borders ?? {
        from: 20,
        to: 25,
      },
      // Сохраняем существующие поля профиля, если их нет в user
      passport: (user as any).passport ?? currentProfile.passport,
      password: (user as any).password ?? currentProfile.password,
      consenttoemail: (user as any).consenttoemail ?? currentProfile.consenttoemail,
      consenttosms: (user as any).consenttosms ?? currentProfile.consenttosms,
    };

    set({ profile });
  },

  // ========================================================================
  // AUTH ACTIONS
  // ========================================================================

  login: async (phone, password) => {
    set({ isLoading: true, error: null });

    try {
      const res = await api('authorization', {
        phone,
        password,
        version,
        mode: 'android',
      });

      console.log('authorization', res.data )

      if (!res.error && res.data) {
        const user = res.data as AuthUser;
        
        // Сохраняем токен в localStorage
        get()._setToken(user.token);

        // Сохраняем учетные данные
        credentialsStorage.save(phone, password);

        set({
          user,
          token: user.token,
          phone: user.code || user.phone,
          borders: user.borders,
          monthes: user.monthes,
          auth: true,
          isLoading: false,
        });

        // Обновляем профиль из данных пользователя
        get()._updateProfileFromUser(user);
      } else {
        set({
          isLoading: false,
          error: res.message || 'Ошибка авторизации',
        });
      }

      return res as ApiResponse<AuthUser>;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка сети';
      set({
        isLoading: false,
        error: errorMessage,
      });
      return {
        error: true,
        message: errorMessage,
      };
    }
  },

  create: async (phone, name, terms) => {
    if (!phone || !terms) {
      return {
        error: true,
        message: 'Необходимо заполнить все поля',
      } as ApiResponse<AuthUser>;
    }

    set({ isLoading: true, error: null });

    try {
      const res = await api('registration', {
        phone,
        name,
        terms,
      });

      console.log('registration', res.data )
      if (!res.error && res.data) {
        const user = res.data as AuthUser;
        
        // Сохраняем токен в localStorage
        get()._setToken(user.token);

        set({
          user,
          token:      user.token,
          auth:       false,
          isLoading:  false,
        });

        // Обновляем профиль из данных пользователя
        get()._updateProfileFromUser(user);
      } else {
        set({
          isLoading: false,
          error: res.message || 'Ошибка регистрации',
        });
      }

      return res as ApiResponse<AuthUser>;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка сети';
      set({
        isLoading: false,
        error: errorMessage,
      });
      return {
        error: true,
        message: errorMessage,
      };
    }
  },

  restore: async (phone) => {
    set({ isLoading: true, error: null });

    try {
      const res = await api('restore', { phone });

      if (!res.error && res.data?.data) {
        const user = res.data.data as AuthUser;
        
        // Сохраняем токен в localStorage
        get()._setToken(user.token);

        set({
          user,
          token: user.token,
          isLoading: false,
        });

        // Обновляем профиль из данных пользователя
        get()._updateProfileFromUser(user);

        return true;
      }

      set({
        isLoading: false,
        error: res.message || 'Ошибка восстановления',
      });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка сети';
      set({
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  },

  compare: (sms) => {
    const { user } = get();
    return sms === user?.pincode;
  },

  password: async (password) => {
    const { token } = get();
    if (!token) {
      set({ error: 'Токен не найден' });
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const res = await api('profile', { token, password });

      if (!res.error) {
        set({ auth: true, isLoading: false });
        return true;
      }

      set({
        isLoading: false,
        error: res.message || 'Ошибка смены пароля',
      });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка сети';
      set({
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  },

  logout: () => {
    get()._clearAuth();
  },

  // ========================================================================
  // SIMPLE SETTERS
  // ========================================================================

  setAuth: (auth) => set({ auth }),

  setReg: (reg) => set({ reg }),

  setUser: (user) => {
    get()._setToken(user.token);
    set({
      user,
      token: user.token,
      phone: user.phone,
      auth: true,
      isLoading: false,
    });

    // Обновляем профиль из данных пользователя
    get()._updateProfileFromUser(user);
  },

  // ========================================================================
  // PROFILE ACTIONS
  // ========================================================================

  getProfile: async () => {
    const { token } = get();
    
    if (!token) {
      set({ error: 'Токен не найден' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const res = await api('profile', { token });

      if (!res.error && res.data) {
        // Объединяем загруженные данные с текущим профилем
        const currentProfile = get().profile;
        const updatedProfile = { ...currentProfile, ...res.data } as AuthUser;
        
        set({ 
          profile: updatedProfile,
          user: updatedProfile, // Также обновляем user
          isLoading: false 
        });
      } else {
        set({
          error: res.message || 'Ошибка загрузки профиля',
          isLoading: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка сети';
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  updateProfile: async (data) => {
    const { token, profile } = get();
    
    if (!token) {
      set({ error: 'Токен не найден' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const params = { token, ...data };
      const res = await api('set_profile', params);

      if (!res.error) {
        const updatedProfile = { ...profile, ...data } as AuthUser;
        set({ 
          profile: updatedProfile,
          user: updatedProfile, // Также обновляем user
          isLoading: false 
        });
      } else {
        set({
          error: res.message || 'Ошибка обновления профиля',
          isLoading: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка сети';
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  setProfile: (profile) => {
    set({ profile });
    // Также обновляем user, если он существует
    if (get().user) {
      set({ user: profile });
    }
  },

  resetProfile: () => {
    set({ profile: createInitialProfile() });
  },

  clearError: () => set({ error: null }),
}));

// ============================================================================
// SELECTORS (для оптимизации ре-рендеров)
// ============================================================================

// Auth selectors
export const useToken = () => useAuthStore((state) => state.token);
export const useAuth = () => useAuthStore((state) => state.auth);
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// Profile selectors (для обратной совместимости)
export const useProfileData = () => useAuthStore((state) => state.profile);
export const useProfileLoading = () => useAuthStore((state) => state.isLoading);
export const useProfileError = () => useAuthStore((state) => state.error);

// ============================================================================
// GETTERS (для использования вне компонентов)
// ============================================================================

export const authGetters = {
  getToken: () => useAuthStore.getState().token,
  getUser: () => useAuthStore.getState().user,
  getProfile: () => useAuthStore.getState().profile,
  getMonthes: () => useAuthStore.getState().profile.monthes,
  getBorders: () => useAuthStore.getState().profile.borders,
  isAuthenticated: () => {
    const state = useAuthStore.getState();
    return !!(state.token && state.auth);
  },
};

// Для обратной совместимости
export const profileGetters = authGetters;
