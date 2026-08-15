import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Lock, Mail, Shield, UserCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('architect@covenx.io');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('ADMIN');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      setCredentials({
        user: { id: 'usr_architect', name: 'Lead Architect', email, role },
        token: 'mock_jwt_token_covenx_enterprise',
      })
    );
    navigate('/dashboard');
  };

  const handleRoleQuickSwitch = (selectedRole: string, defaultEmail: string) => {
    setEmail(defaultEmail);
    setRole(selectedRole);
    dispatch(
      setCredentials({
        user: { id: `usr_${selectedRole.toLowerCase()}`, name: selectedRole.replace('_', ' '), email: defaultEmail, role: selectedRole },
        token: 'mock_jwt_token_covenx_enterprise',
      })
    );
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto pt-8 space-y-6">
      <Card className="p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-brand-500/10 text-brand-500 mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">CovenX Platform Sign In</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Enterprise RBAC & Authentication</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none text-xs"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2 text-xs font-bold">
            Sign In with Credentials
          </Button>
        </form>
      </Card>

      {/* Role Quick Switch */}
      <Card className="p-5 space-y-3">
        <h3 className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-brand-500" /> Demo Persona Quick-Switch (RBAC)
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleRoleQuickSwitch('ADMIN', 'admin@covenx.io')}
            className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            <p className="font-bold text-brand-600 dark:text-brand-400">System Admin</p>
            <p className="text-[10px] text-gray-400">Full platform permissions</p>
          </button>

          <button
            onClick={() => handleRoleQuickSwitch('LEGAL_REVIEWER', 'legal@covenx.io')}
            className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            <p className="font-bold text-emerald-600 dark:text-emerald-400">Legal Reviewer</p>
            <p className="text-[10px] text-gray-400">Clause & approval access</p>
          </button>

          <button
            onClick={() => handleRoleQuickSwitch('FINANCE_APPROVER', 'finance@covenx.io')}
            className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            <p className="font-bold text-amber-600 dark:text-amber-400">Finance Approver</p>
            <p className="text-[10px] text-gray-400">Budget & value review</p>
          </button>

          <button
            onClick={() => handleRoleQuickSwitch('EXECUTIVE', 'executive@covenx.io')}
            className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            <p className="font-bold text-purple-600 dark:text-purple-400">Executive Signer</p>
            <p className="text-[10px] text-gray-400">Digital signature authority</p>
          </button>
        </div>
      </Card>
    </div>
  );
};
