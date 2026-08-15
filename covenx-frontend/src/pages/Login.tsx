import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Lock, Mail, Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login response
    dispatch(
      setCredentials({
        user: { id: 'usr_1', name: 'Architect', email, role: 'admin' },
        token: 'jwt_mock_token_sample',
      })
    );
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto pt-12">
      <Card className="p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-brand-500/10 text-brand-500 mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Sign in to CovenX</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Enter your platform credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-400 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@covenx.io"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
};
