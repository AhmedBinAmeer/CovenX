import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext.js';
import { Button } from '../components/ui/Button.js';
import { Save, Send, Eye } from 'lucide-react';

export const Editor: React.FC = () => {
  const { setTheme } = useTheme();
  const [title, setTitle] = useState('Service Level Agreement - 2026');
  const [content, setContent] = useState(
    'THIS AGREEMENT is entered into on this 15th day of August, 2026, by and between CovenX Inc. and the Client...\n\n1. OBLIGATIONS & SCOPE\n1.1 Provider agrees to render Cloud and Monorepo management services as detailed in Exhibit A.\n1.2 Client agrees to maintain active credentials and role permissions.'
  );

  useEffect(() => {
    // Steering rule: Light minimalist for contract authoring
    setTheme('light');
  }, [setTheme]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">Contract Authoring</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold text-gray-900 bg-transparent border-none focus:outline-none w-full mt-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Eye className="w-4 h-4 mr-1.5" /> Preview
          </Button>
          <Button variant="primary" size="sm">
            <Save className="w-4 h-4 mr-1.5" /> Save Draft
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 min-h-[500px]">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-[420px] font-mono text-sm leading-relaxed text-gray-800 bg-transparent resize-none focus:outline-none"
          placeholder="Start drafting your contract here..."
        />
      </div>
    </div>
  );
};
