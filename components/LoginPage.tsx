import React, { useState, useEffect } from 'react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
  error: string;
  isLoading: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error, isLoading }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  useEffect(() => {
    const storedUsername = localStorage.getItem('tickup_username');
    const storedPassword = localStorage.getItem('tickup_password');
    if (storedUsername && storedPassword) {
      setUsername(storedUsername);
      setPassword(storedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    onLogin(username, password);
    if (rememberMe) {
        localStorage.setItem('tickup_username', username);
        localStorage.setItem('tickup_password', password);
    } else {
        localStorage.removeItem('tickup_username');
        localStorage.removeItem('tickup_password');
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 px-4 text-right" dir="rtl">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <img src="https://ravanbonyan.com/Gemini_Generated_Image_3747nu3747nu3747.png" alt="tickup logo" className="w-16 h-16 mx-auto" />
            <h1 className="text-4xl font-bold text-brand-text dark:text-slate-100 mt-4">
              tickup
            </h1>
            <p className="text-brand-subtext dark:text-slate-400 mt-2">به فضای کاری خود وارد شوید</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-brand-subtext sr-only">
                نام کاربری
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری"
                  className="appearance-none block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-medium text-brand-subtext sr-only">
                رمز عبور
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور"
                  className="appearance-none block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                />
              </div>
            </div>
            
            <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded ml-2"
                />
                <label htmlFor="remember-me" className="block text-sm text-brand-subtext dark:text-slate-400">
                  مرا به خاطر بسپار
                </label>
              </div>

            {localError && <p className="text-sm text-red-600 text-center">{localError}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-brand-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'در حال ورود...' : 'ورود'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;