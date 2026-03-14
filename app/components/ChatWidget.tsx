'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { apiClient } from '@/lib/utils/api';
import {
  ChatMessage,
  ChatConversation,
  ChatAccessResponse,
} from '@/lib/types';
import {
  MessageCircle,
  X,
  Send,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Bot,
  AlertCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

type View = 'list' | 'chat';

// ────────────────────────────────────────────────────────────────────────────
// ChatWidget – floating button + slide-out drawer
// ────────────────────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Panel state
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('chat');

  // Conversations
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Input
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  // Access check
  const [access, setAccess] = useState<ChatAccessResponse | null>(null);

  // Loading
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── Load conversations list ─────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    setLoadingConvos(true);
    try {
      const resp = await apiClient.getChatConversations();
      setConversations(resp.conversations);
    } catch {
      // silent fail — user will see empty list
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  // ── Load access info ────────────────────────────────────────────────────

  const loadAccess = useCallback(async () => {
    try {
      const resp = await apiClient.getChatAccess();
      setAccess(resp);
    } catch {
      // silent
    }
  }, []);

  // ── On open → load convos + access ─────────────────────────────────────

  useEffect(() => {
    if (open && user) {
      loadConversations();
      loadAccess();
    }
  }, [open, user, loadConversations, loadAccess]);

  // ── Load conversation messages ──────────────────────────────────────────

  const openConversation = useCallback(async (convId: string) => {
    setActiveConvId(convId);
    setView('chat');
    setLoadingMessages(true);
    try {
      const detail = await apiClient.getChatConversationDetail(convId);
      setMessages(detail.messages);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // ── New conversation ────────────────────────────────────────────────────

  const startNewConversation = useCallback(() => {
    setActiveConvId(null);
    setMessages([]);
    setView('chat');
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // ── Send message ────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    // Optimistic UI — add user message immediately
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setSending(true);

    try {
      const resp = await apiClient.sendChatMessage(trimmed, activeConvId ?? undefined);
      // Update conversation id if new
      if (!activeConvId) {
        setActiveConvId(resp.conversation_id);
      }
      // Replace temp message ids with real ones, add assistant response
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === tempUserMsg.id
            ? { ...m, id: `user-${Date.now()}` }
            : m
        );
        return [...updated, resp.message];
      });
      // Update access info
      if (access) {
        setAccess({
          ...access,
          used: access.used + 1,
          remaining: access.remaining !== null ? Math.max(0, access.remaining - 1) : null,
        });
      }
    } catch (err: unknown) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      // Show error as a temporary assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ ${errorMsg}`,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, sending, activeConvId, access]);

  // ── Delete conversation ─────────────────────────────────────────────────

  const handleDelete = useCallback(async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.deleteChatConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConvId === convId) {
        startNewConversation();
      }
    } catch {
      // silent
    }
  }, [activeConvId, startNewConversation]);

  // ── Keyboard submit ─────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // ── Don't render for unauthenticated users or on landing page ───────────

  if (!user) return null;
  if (pathname === '/') return null;

  // ── Access bar ──────────────────────────────────────────────────────────

  const accessBar = access ? (
    <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-500 border-t border-slate-200 bg-slate-50">
      <span>
        {access.limit !== null
          ? `${access.used}/${access.limit} messages today`
          : 'Unlimited messages'}
      </span>
      {access.remaining !== null && access.remaining <= 2 && access.remaining > 0 && (
        <span className="text-amber-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {access.remaining} left
        </span>
      )}
    </div>
  ) : null;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-6 z-[55] w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center"
          aria-label="Open AI Career Coach"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* Slide-out panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[55] w-[380px] max-h-[600px] rounded-2xl shadow-2xl bg-white border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center gap-2">
              {view === 'list' && (
                <button
                  onClick={startNewConversation}
                  className="p-1 rounded hover:bg-white/20 transition"
                  title="New chat"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              {view === 'chat' && conversations.length > 0 && (
                <button
                  onClick={() => setView('list')}
                  className="p-1 rounded hover:bg-white/20 transition"
                  title="Back to conversations"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <Bot className="w-5 h-5" />
              <span className="font-semibold text-sm">
                {view === 'list' ? 'Conversations' : 'AI Career Coach'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {view === 'chat' && (
                <button
                  onClick={() => setView('list')}
                  className="p-1 rounded hover:bg-white/20 transition"
                  title="Conversation history"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-white/20 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── List view ──────────────────────────────────────────── */}
          {view === 'list' && (
            <div className="flex-1 overflow-y-auto">
              {loadingConvos ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Bot className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">No conversations yet</p>
                  <button
                    onClick={startNewConversation}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Start a conversation
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => openConversation(conv.id)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {conv.title || 'New conversation'}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {conv.message_count} messages · {new Date(conv.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDelete(conv.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {accessBar}
            </div>
          )}

          {/* ── Chat view ──────────────────────────────────────────── */}
          {view === 'chat' && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[300px] max-h-[420px]">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bot className="w-10 h-10 text-blue-400 mb-3" />
                    <p className="text-sm font-medium text-slate-700">
                      Hi! I&apos;m your AI Career Coach
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-[260px]">
                      Ask me about your resume, interview prep, job search strategy, or career growth.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-slate-100 text-slate-800 rounded-bl-md'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        ) : (
                          <div className="prose prose-sm prose-slate max-w-none break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h1]:font-bold [&_h2]:font-semibold [&_h3]:font-semibold [&_code]:bg-slate-200 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-slate-800 [&_pre]:text-slate-100 [&_pre]:rounded-lg [&_pre]:p-2 [&_pre]:text-xs [&_pre]:overflow-x-auto [&_a]:text-blue-600 [&_a]:underline">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl rounded-bl-md px-3.5 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Access bar */}
              {accessBar}

              {/* Input */}
              <div className="border-t border-slate-200 px-3 py-2">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      access && !access.allowed
                        ? 'Daily message limit reached'
                        : 'Ask your career coach...'
                    }
                    disabled={sending || (access !== null && !access.allowed)}
                    rows={4}
                    className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 max-h-[120px] overflow-y-auto"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending || (access !== null && !access.allowed)}
                    className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
