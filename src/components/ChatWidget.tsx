'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { useLocale } from 'next-intl';
import { MessageSquare, X, Send, Phone, Lock, Circle, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWidget() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');
  const [chatError, setChatError] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Destructure Zustand chat actions
  const {
    user,
    profile,
    activeChat,
    activeChatMessages,
    fetchUserChat,
    sendChatMessage,
    endUserChat,
    settings,
    fetchAutoResponses
  } = useStore();

  // Load auto responses on mount
  useEffect(() => {
    fetchAutoResponses();
  }, [fetchAutoResponses]);

  // If user logs in/out, re-verify connection
  useEffect(() => {
    if (user && profile?.phone) {
      setIsConnected(true);
      setIsLoadingChat(true);
      fetchUserChat().then(() => setIsLoadingChat(false));
    } else {
      // Check if there is a saved guest phone number
      if (typeof window !== 'undefined') {
        const savedPhone = localStorage.getItem('ff_chat_phone');
        if (savedPhone) {
          setPhoneInput(savedPhone);
          setIsConnected(true);
          setIsLoadingChat(true);
          fetchUserChat(savedPhone).then(() => setIsLoadingChat(false));
        } else {
          setIsConnected(false);
        }
      }
    }
  }, [user, profile?.phone]);

  // Trigger greeting if chat is empty
  useEffect(() => {
    if (activeChat && activeChatMessages.length === 0 && !isLoadingChat) {
      const greeting = settings.chat_greeting_message || 
        (locale === 'ar' 
          ? 'مرحباً بك في دعم فاندوم فيت! كيف يمكننا مساعدتك اليوم؟' 
          : 'Welcome to Fandom Fit Support! How can we help you today?');
          
      // Trigger a system greeting message
      sendChatMessage(activeChat.id, greeting, 'system');
    }
  }, [activeChat, activeChatMessages.length, isLoadingChat]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatMessages]);

  const handleGuestConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setChatError('');
    setIsLoadingChat(true);

    if (!/^01[0-25]\d{8}$/.test(phoneInput.trim())) {
      setChatError(locale === 'ar' ? 'الرجاء إدخال رقم هاتف مصري صحيح' : 'Invalid Egyptian phone number');
      setIsLoadingChat(false);
      return;
    }

    try {
      const chat = await fetchUserChat(phoneInput.trim());
      if (chat) {
        setIsConnected(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('ff_chat_phone', phoneInput.trim());
        }
      } else {
        setChatError(
          locale === 'ar'
            ? 'لا توجد سجلات تواصل سابقة لهذا الرقم كزائر. يرجى إنشاء حساب لتتمكن من التحدث معنا.'
            : 'No guest order records found for this phone. Please sign up to start a chat.'
        );
      }
    } catch (err) {
      setChatError('Failed to fetch chat details.');
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChat) return;

    // Guard if user is blocked
    if (activeChat.is_blocked) {
      alert(locale === 'ar' ? 'تم حظرك من إرسال الرسائل.' : 'You have been blocked from sending messages.');
      return;
    }

    const msg = typedMessage.trim();
    setTypedMessage('');
    await sendChatMessage(activeChat.id, msg, 'user');
  };

  const handleEndChat = async () => {
    if (!activeChat) return;
    if (confirm(locale === 'ar' ? 'هل أنت متأكد من رغبتك في حذف وحذف المحادثة؟' : 'Are you sure you want to end and delete this chat?')) {
      await endUserChat(activeChat.id);
      setIsConnected(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ff_chat_phone');
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-sans text-black">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            className="w-[350px] sm:w-[380px] h-[520px] bg-[#EDE0D0] border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden mb-4 relative"
          >
            {/* Chat Window Header */}
            <div className="bg-black text-[#EDE0D0] p-4 flex items-center justify-between border-b-4 border-black">
              <div className="flex items-center gap-2">
                <Circle size={10} className="fill-green-500 text-green-500 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    {locale === 'ar' ? 'دعم فاندوم فيت' : 'Fandom Fit Support'}
                  </h4>
                  <span className="text-[8px] font-black text-[#EDE0D0]/60 uppercase">
                    {locale === 'ar' ? 'مباشر الآن' : 'Live Chat Agent'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isConnected && activeChat && (
                  <button
                    onClick={handleEndChat}
                    title={locale === 'ar' ? 'إنهاء وحذف المحادثة' : 'End & Delete Chat'}
                    className="p-1 border border-[#EDE0D0]/20 hover:bg-[#EDE0D0]/10 rounded cursor-pointer transition-colors text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 border border-[#EDE0D0]/20 hover:bg-[#EDE0D0]/10 rounded cursor-pointer transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col">
              {!isConnected ? (
                /* CONNECT SCREEN FOR GUESTS/NOT LOGGED IN */
                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <MessageSquare size={20} className="text-brand-accent" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black uppercase">
                      {locale === 'ar' ? 'ابدأ محادثة مع الدعم' : 'Start a Conversation'}
                    </h5>
                    <p className="text-[10px] font-semibold text-black/60 max-w-[280px] mx-auto mt-1 leading-relaxed">
                      {locale === 'ar'
                        ? 'تواصل معنا فوراً. يجب تسجيل الدخول أو إدخال رقم هاتفك كزائر للتحقق من طلباتك.'
                        : 'Connect with support. Please log in or input your phone number to access chats.'}
                    </p>
                  </div>

                  {chatError && (
                    <p className="text-[9px] font-bold text-red-500 max-w-[260px]">⚠️ {chatError}</p>
                  )}

                  {/* Guest Lookup Form */}
                  <form onSubmit={handleGuestConnect} className="w-full space-y-2 pt-2 px-4">
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
                      <input
                        type="tel"
                        required
                        placeholder={locale === 'ar' ? 'رقم الهاتف كزائر (مثال: 01012345678)' : 'Guest phone number (e.g. 01012345678)'}
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black rounded-xl text-[10px] font-black focus:outline-none placeholder-zinc-400 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoadingChat}
                      className="w-full py-2 bg-black hover:bg-brand-accent text-[#EDE0D0] hover:text-white border-2 border-black rounded-xl font-black uppercase text-[10px] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none cursor-pointer flex justify-center items-center gap-1.5"
                    >
                      {isLoadingChat ? (locale === 'ar' ? 'جاري التحقق...' : 'Connecting...') : (locale === 'ar' ? 'توصيل كزائر' : 'Connect Guest Chat')}
                      <ArrowRight size={12} />
                    </button>
                  </form>

                  <div className="w-full border-t border-black/10 my-1"></div>

                  <a
                    href={`/${locale}/account`}
                    onClick={() => setIsOpen(false)}
                    className="w-full max-w-[200px] py-2 bg-white hover:bg-black/5 text-black border-2 border-black rounded-xl font-black uppercase text-[10px] transition-all flex justify-center items-center gap-1.5"
                  >
                    <Lock size={11} />
                    {locale === 'ar' ? 'تسجيل الدخول / كعضو' : 'Sign In / Register'}
                  </a>
                </div>
              ) : isLoadingChat ? (
                /* LOADING CHAT SCREEN */
                <div className="flex-1 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
                </div>
              ) : (
                /* CHAT LOG SCREEN */
                <>
                  {activeChatMessages.map((m) => {
                    const isUser = m.sender === 'user';
                    const isSystem = m.sender === 'system';

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col max-w-[80%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        <div
                          className={`p-3 rounded-2xl border-2 border-black text-xs font-semibold leading-relaxed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                            isUser
                              ? 'bg-white text-black rounded-tr-none'
                              : isSystem
                              ? 'bg-zinc-100 text-zinc-600 rounded-tl-none border-dashed'
                              : 'bg-brand-accent text-white rounded-tl-none'
                          }`}
                        >
                          {m.message}
                        </div>
                        <span className="text-[7px] font-black text-black/45 mt-0.5 font-mono uppercase">
                          {isSystem ? 'system' : m.sender} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Footer Input */}
            {isConnected && !isLoadingChat && (
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t-4 border-black flex gap-2">
                <input
                  type="text"
                  required
                  placeholder={
                    activeChat?.is_blocked
                      ? (locale === 'ar' ? 'تم حظرك من المحادثة...' : 'You have been blocked...')
                      : (locale === 'ar' ? 'اكتب رسالة...' : 'Type your message...')
                  }
                  disabled={activeChat?.is_blocked}
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#EDE0D0]/10 border-2 border-black rounded-xl text-xs font-semibold focus:outline-none focus:bg-white placeholder-zinc-400"
                />
                <button
                  type="submit"
                  disabled={activeChat?.is_blocked}
                  className="p-2 bg-black hover:bg-brand-accent text-[#EDE0D0] hover:text-white border-2 border-black rounded-xl cursor-pointer disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-accent hover:bg-brand-accent/95 text-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        aria-label="Toggle Live Chat"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
}
