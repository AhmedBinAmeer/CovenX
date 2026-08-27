import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  X,
  Send,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { endpoints } from '../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: {
    type: string;
    label: string;
    url?: string;
  } | null;
  suggestions?: string[];
  timestamp: Date;
}

const INITIAL_SUGGESTIONS = [
  'What contracts are in review?',
  'How do approvals work in CovenX?',
  'How to track obligations & renewals?',
  'How to create an intake request?'
];

export const HelpdeskChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to CovenX Helpdesk! 👋\n\nI am your enterprise **AI Contract & Operations Assistant**.\n\nAsk me about:\n- **Contract Workflows**: Redlining, version diffing, and approvals.\n- **AI Insights**: Semantic clause search, risk audits, and playbook checks.\n- **Obligations & Renewals**: Milestones, SLA alerts, and key dates.\n- **Team & Governance**: User roles, permissions, and security settings.`,
      suggestions: INITIAL_SUGGESTIONS,
      timestamp: new Date(),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = (url: string) => {
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (userPrompt?: string) => {
    const textToSend = userPrompt || input.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userPrompt) setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await endpoints.helpdeskChat({
        message: textToSend,
        history,
      });

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.message,
        action: res.action,
        suggestions: res.suggestions?.length ? res.suggestions : undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered a temporary connection issue. Please check your network and try asking again.',
          timestamp: new Date(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        content: `Chat session refreshed. How can I help you across your contracts and workspace today?`,
        suggestions: INITIAL_SUGGESTIONS,
        timestamp: new Date(),
      }
    ]);
  };

  const renderFormattedMessage = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="helpdesk-markdown">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="helpdesk-h4">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={idx} className="helpdesk-h3">{line.replace('## ', '')}</h3>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const raw = line.slice(2);
            return (
              <div key={idx} className="helpdesk-bullet">
                <span className="helpdesk-bullet-dot" />
                <span>{parseBold(raw)}</span>
              </div>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} style={{ height: 6 }} />;
          }
          return <p key={idx} className="helpdesk-p">{parseBold(line)}</p>;
        })}
      </div>
    );
  };

  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="helpdesk-strong">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Capsule */}
      {!isOpen && (
        <button
          className="helpdesk-trigger-btn"
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          title="Open CovenX AI Helpdesk"
          aria-label="Open CovenX AI Helpdesk"
        >
          <span className="helpdesk-ripple-ring ring-1" aria-hidden="true" />
          <span className="helpdesk-ripple-ring ring-2" aria-hidden="true" />
          <div className="helpdesk-trigger-glow" aria-hidden="true" />
          <div className="helpdesk-sheen-sweep" aria-hidden="true" />
          <span className="helpdesk-trigger-icon">
            <Sparkles size={14} className="helpdesk-sparkle" />
            <Bot size={20} className="helpdesk-bot-icon" />
          </span>
          <span className="helpdesk-trigger-label">AI Helpdesk</span>
        </button>
      )}

      {/* Expandable Glass Chat Drawer */}
      {isOpen && (
        <aside className={`helpdesk-drawer ${isMinimized ? 'helpdesk-minimized' : ''}`}>
          {/* Header */}
          <header className="helpdesk-header">
            <div className="helpdesk-brand-badge">
              <div className="helpdesk-avatar">
                <Bot size={18} />
                <span className="helpdesk-online-dot" />
              </div>
              <div>
                <div className="helpdesk-title">
                  <strong>CovenX Helpdesk</strong>
                  <span className="helpdesk-tag">AI Agent</span>
                </div>
                <small className="helpdesk-status-text">Live Workspace & CLM Assistant</small>
              </div>
            </div>

            <div className="helpdesk-header-actions">
              <button
                className="helpdesk-icon-btn"
                onClick={handleReset}
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                className="helpdesk-icon-btn"
                onClick={() => setIsMinimized((prev) => !prev)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                aria-label="Toggle drawer size"
              >
                <ChevronDown size={15} style={{ transform: isMinimized ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
              </button>
              <button
                className="helpdesk-icon-btn helpdesk-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close Helpdesk"
                aria-label="Close Helpdesk"
              >
                <X size={15} />
              </button>
            </div>
          </header>

          {/* Drawer Body (Hidden if minimized) */}
          {!isMinimized && (
            <>
              <div className="helpdesk-messages-scroll">
                {messages.map((msg) => (
                  <article
                    key={msg.id}
                    className={`helpdesk-message-row ${msg.role === 'user' ? 'helpdesk-msg-user' : 'helpdesk-msg-assistant'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="helpdesk-msg-avatar">
                        <Bot size={14} />
                      </div>
                    )}

                    <div className="helpdesk-bubble-wrap">
                      <div className="helpdesk-bubble">
                        {renderFormattedMessage(msg.content)}

                        {/* Optional Action Card */}
                        {msg.action && (
                          <div className="helpdesk-action-card">
                            <button
                              className="helpdesk-action-btn"
                              onClick={() => {
                                if (msg.action?.url) {
                                  navigate(msg.action.url);
                                  if (window.innerWidth < 768) setIsOpen(false);
                                }
                              }}
                            >
                              <span>{msg.action.label}</span>
                              <ExternalLink size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Suggestions Chips */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="helpdesk-suggestions-wrap">
                          <span className="helpdesk-suggestions-label">
                            <HelpCircle size={11} /> Suggested questions:
                          </span>
                          <div className="helpdesk-chips-grid">
                            {msg.suggestions.map((suggestion, sIdx) => (
                              <button
                                key={sIdx}
                                className="helpdesk-chip"
                                onClick={() => handleSend(suggestion)}
                              >
                                <span>{suggestion}</span>
                                <ArrowRight size={11} className="helpdesk-chip-arrow" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                ))}

                {loading && (
                  <div className="helpdesk-message-row helpdesk-msg-assistant">
                    <div className="helpdesk-msg-avatar">
                      <Bot size={14} />
                    </div>
                    <div className="helpdesk-bubble helpdesk-typing-bubble">
                      <span className="helpdesk-dot" />
                      <span className="helpdesk-dot" />
                      <span className="helpdesk-dot" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <footer className="helpdesk-input-footer">
                <form
                  className="helpdesk-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    className="helpdesk-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about contracts, workflows, policies…"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className="helpdesk-send-btn"
                    disabled={!input.trim() || loading}
                    aria-label="Send message"
                  >
                    <Send size={15} />
                  </button>
                </form>
                <div className="helpdesk-footer-meta">
                  <span>AI answers are grounded in CovenX knowledge base</span>
                </div>
              </footer>
            </>
          )}
        </aside>
      )}
    </>
  );
};
