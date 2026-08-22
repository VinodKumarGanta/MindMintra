import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, GameType } from '../types';
import { LanguageProvider } from '../i18n';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;
  isOnline: boolean;
  currentDifficulty: Record<GameType, number>;
  setGameDifficulty: (gameType: GameType, difficulty: number) => void;
}

const defaultDifficulty: Record<GameType, number> = {
  memory_match: 1,
  daily_routine: 1,
  object_recognition: 1,
  pattern_recall: 1,
};

const AppContext = createContext<AppContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  currentSession: null,
  setCurrentSession: () => {},
  isOnline: true,
  currentDifficulty: defaultDifficulty,
  setGameDifficulty: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mindmitra_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [currentDifficulty, setCurrentDifficulty] = useState<Record<GameType, number>>(defaultDifficulty);

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('mindmitra_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mindmitra_current_user');
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setGameDifficulty = (gameType: GameType, difficulty: number) => {
    setCurrentDifficulty(prev => ({ ...prev, [gameType]: difficulty }));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser: handleSetCurrentUser,
      currentSession,
      setCurrentSession,
      isOnline,
      currentDifficulty,
      setGameDifficulty
    }}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
export const useApp = useAppContext;
