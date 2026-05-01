import { createContext, useContext, useState, useEffect } from 'react';
import { getHealth, authGetMe } from '../services/api';

const UserContext = createContext(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be inside UserProvider');
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('votepath_token'));
  const [aiStatus, setAiStatus] = useState({ ollama: false, gemini: false, activeProvider: null });
  const [loading, setLoading] = useState(true); // true until we've checked auth

  // On mount: verify stored token by calling /auth/me
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('votepath_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authGetMe();
        if (data.success) {
          setUser(data.data.user);
          setChecklist(data.data.checklist);
          setToken(storedToken);
        } else {
          clearAuth();
        }
      } catch (e) {
        // Token expired or invalid
        clearAuth();
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  // Poll AI health
  useEffect(() => {
    const checkAI = async () => {
      try {
        const { data } = await getHealth();
        if (data.success) setAiStatus(data.ai);
      } catch (e) {
        console.warn('Backend not available');
      }
    };
    checkAI();
    const interval = setInterval(checkAI, 30000);
    return () => clearInterval(interval);
  }, []);

  const loginUser = (userData, authToken, checklistData = null) => {
    setUser(userData);
    setToken(authToken);
    setChecklist(checklistData);
    localStorage.setItem('votepath_token', authToken);
    localStorage.setItem('votepath_user', JSON.stringify(userData));
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('votepath_user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    clearAuth();
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setChecklist(null);
    localStorage.removeItem('votepath_token');
    localStorage.removeItem('votepath_user');
  };

  const updateReadinessScore = (score) => {
    if (user) setUser(prev => ({ ...prev, readinessScore: score }));
  };

  return (
    <UserContext.Provider value={{
      user, setUser, checklist, setChecklist, token,
      aiStatus, setAiStatus, loading, setLoading,
      loginUser, logoutUser, updateUser, updateReadinessScore,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
