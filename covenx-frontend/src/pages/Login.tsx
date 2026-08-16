import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Lock, Mail, UserCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail]       = useState('architect@covenx.io');
  const [password, setPassword] = useState('password123');
  const [role, setRole]         = useState('ADMIN');
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setCredentials({ user: { id: 'usr_architect', name: 'Lead Architect', email, role }, token: 'mock_jwt_token_covenx_enterprise' }));
    navigate('/dashboard');
  };

  const handleRoleQuickSwitch = (selectedRole: string, defaultEmail: string) => {
    setEmail(defaultEmail);
    setRole(selectedRole);
    dispatch(setCredentials({ user: { id: `usr_${selectedRole.toLowerCase()}`, name: selectedRole.replace('_', ' '), email: defaultEmail, role: selectedRole }, token: 'mock_jwt_token_covenx_enterprise' }));
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto pt-8 space-y-6">
      {/* --- Main login card --- */}
      <Card className="p-8">
        {/* Branding header */}
        <div className="text-center mb-8">
          {/* Shield + node icon, logo-accurate */}
          <div className="inline-block bg-white rounded-2xl px-6 py-4 shadow-brand-md mb-3">
            <img
              src="/logo.png"
              alt="CovenX"
              className="h-24 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-navy-500 dark:text-white">
            Coven<span className="text-ember-500">X</span> Sign In
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Enterprise Contract Lifecycle Management · RBAC Auth
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-navy-500 dark:text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-navy-300 dark:text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-navy-200 dark:border-navy-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ember-400/40 focus:border-ember-500 text-sm transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-navy-500 dark:text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-navy-300 dark:text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-navy-200 dark:border-navy-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ember-400/40 focus:border-ember-500 text-sm transition-all"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
            Sign In to Platform
          </Button>
        </form>
      </Card>

      {/* --- RBAC quick-switch --- */}
      <Card className="p-5 space-y-3">
        <h3 className="text-xs font-bold text-navy-500 dark:text-slate-300 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-ember-500" /> Demo Persona Quick-Switch (RBAC)
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { role: 'ADMIN',           email: 'admin@covenx.io',     label: 'System Admin',      desc: 'Full platform permissions',    color: 'text-navy-600 dark:text-navy-300',   border: 'border-navy-200 dark:border-navy-700',   hover: 'hover:bg-navy-50 dark:hover:bg-navy-900/40'  },
            { role: 'LEGAL_REVIEWER',  email: 'legal@covenx.io',     label: 'Legal Reviewer',    desc: 'Clause & approval access',     color: 'text-forest-600 dark:text-forest-400', border: 'border-forest-200 dark:border-forest-800', hover: 'hover:bg-forest-50 dark:hover:bg-forest-900/20' },
            { role: 'FINANCE_APPROVER',email: 'finance@covenx.io',   label: 'Finance Approver',  desc: 'Budget & value review',        color: 'text-ember-600 dark:text-ember-400',   border: 'border-ember-200 dark:border-ember-800',   hover: 'hover:bg-ember-50 dark:hover:bg-ember-900/20'  },
            { role: 'EXECUTIVE',       email: 'executive@covenx.io', label: 'Executive Signer',  desc: 'Digital signature authority',  color: 'text-navy-500 dark:text-navy-300',    border: 'border-navy-100 dark:border-navy-800',   hover: 'hover:bg-navy-50 dark:hover:bg-navy-900/30'  },
          ].map((p) => (
            <button
              key={p.role}
              onClick={() => handleRoleQuickSwitch(p.role, p.email)}
              className={`p-2.5 border ${p.border} rounded-lg text-left transition-all ${p.hover}`}
            >
              <p className={`font-bold ${p.color}`}>{p.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};
