'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { adminAPI } from '@/lib/api';

export default function JournalAdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Authenticate against backend; supports username or shortcode
      const response = await adminAPI.login(username, password) as any;
      const token = (response?.data as any)?.token;
      if (token) {
        localStorage.setItem('journalAdminAuth', token);
        localStorage.setItem('journalAdminUser', username);
        router.push('/journal-admin/dashboard');
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex flex-col items-center justify-center gap-5 p-6">
      <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-2xl">
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-fuchsia-500 to-purple-600 rounded-t-2xl" />
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <i className="pi pi-book text-white text-2xl"></i>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Journal Admin Portal</h1>
            <p className="mt-1 text-sm text-gray-500">Wissen Publication Group · Manage journals and articles</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {error && <Message severity="error" text={error} className="w-full" />}

            <div className="space-y-3">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <InputText
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-200 placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full block"
                inputClassName="w-full py-3 px-4 border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-200 placeholder:text-gray-400"
                toggleMask
                feedback={false}
                required
              />
            </div>

            <Button
              type="submit"
              label="Sign In"
              icon="pi pi-sign-in"
              className="w-full py-3 rounded-xl font-semibold text-base text-white shadow-md hover:shadow-lg transition-all mt-2"
              style={{
                backgroundImage: 'linear-gradient(to right, rgb(37,99,235), rgb(126,34,206))',
                border: '0',
                color: '#fff'
              }}
              loading={loading}
              disabled={!username || !password}
            />
          </form>

          <Divider className="my-8" />

          {/* Default Credentials Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-800 font-medium mb-2">Default Credentials:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Username:</strong> admin</p>
              <p><strong>Password:</strong> Bharath@321</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full text-center text-gray-500 text-xs">
        &copy; 2024 Wissen Publication Group. All rights reserved.
      </div>
    </div>
  );
}


