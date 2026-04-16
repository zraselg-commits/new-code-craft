'use client';

/**
 * WhatsApp Chat Widget — Code Craft BD
 * Floating bottom-left chat button.
 * User sees WhatsApp-style UI; messages are forwarded to Telegram bot in background.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface WhatsAppWidgetProps {
  waPhone?: string;
  agentName?: string;
  agentAvatar?: string;
  position?: 'left' | 'right';
  primaryColor?: string;
  headerColor?: string;
  autoOpenDelay?: number;
}

const DEFAULT: Required<WhatsAppWidgetProps> = {
  waPhone:        '8801700000000',
  agentName:      'Code Craft BD',
  agentAvatar:    '',
  position:       'left',
  primaryColor:   '#25D366',
  headerColor:    '#075E54',
  autoOpenDelay:  0,
};

const STORAGE_KEY = 'wc_visited_v1';

function getNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

type Stage = 'chat' | 'phone' | 'done';

interface Msg {
  id: string | number;
  text: string | null;
  who: 'bot' | 'user' | 'typing';
  time: string;
}

export default function WhatsAppWidget(userProps: WhatsAppWidgetProps = {}) {
  const cfg = { ...DEFAULT, ...userProps };
  const isLeft = cfg.position === 'left';

  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState<Msg[]>([]);
  const [input, setInput]         = useState('');
  const [stage, setStage]         = useState<Stage>('chat');
  const [phone, setPhone]         = useState('');
  const [phoneErr, setPhoneErr]   = useState(false);
  const [sending, setSending]     = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const [welcomed, setWelcomed]   = useState(false);
  const pendingMsg                = useRef('');
  const bodyRef                   = useRef<HTMLDivElement>(null);
  const phoneRef                  = useRef<HTMLInputElement>(null);

  const scrollBottom = useCallback(() => {
    setTimeout(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }, 50);
  }, []);

  useEffect(() => { scrollBottom(); }, [messages, scrollBottom]);

  const showWelcome = useCallback(() => {
    if (welcomed) return;
    setWelcomed(true);
    let isReturn = false;
    try { isReturn = !!localStorage.getItem(STORAGE_KEY); } catch {}
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    const greetNew    = 'হাই! 👋 আপনাকে কিভাবে সহযোগিতা করতে পারি?\nযেকোনো প্রশ্ন করুন — আমরা সাথে সাথে উত্তর দেব। 😊';
    const greetReturn = 'স্বাগত ফিরে আসলেন! 👋\nআবার কি কোনো সহায়তা দরকার? আমরা সবসময় আপনার পাশে আছি।';
    const msg = isReturn ? greetReturn : greetNew;
    const typingId = 'typing-' + Date.now();
    setMessages(prev => [...prev, { id: typingId, text: null, who: 'typing', time: getNow() }]);
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === typingId ? { ...m, text: msg, who: 'bot' } : m));
    }, 900);
  }, [welcomed]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setShowBadge(false);
    if (!welcomed) setTimeout(showWelcome, 350);
  }, [welcomed, showWelcome]);

  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (cfg.autoOpenDelay > 0) {
      const t = setTimeout(handleOpen, cfg.autoOpenDelay);
      return () => clearTimeout(t);
    }
  }, [cfg.autoOpenDelay, handleOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  const handleSend = useCallback(() => {
    const txt = input.trim();
    if (!txt) return;
    pendingMsg.current = txt;
    setMessages(prev => [...prev, { id: Date.now(), text: txt, who: 'user', time: getNow() }]);
    setInput('');
    setStage('phone');
    setTimeout(() => phoneRef.current?.focus(), 100);
  }, [input]);

  // Called when user clicks "Send" after entering phone number
  const handleSubmit = useCallback(async () => {
    const clean = phone.trim().replace(/\D/g, '');
    if (clean.length < 7) { setPhoneErr(true); phoneRef.current?.focus(); return; }
    setSending(true);

    // Fire-and-forget to Telegram bot in background — user never sees this
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: pendingMsg.current,
          phone:   clean,
          website: typeof window !== 'undefined' ? window.location.hostname : 'codecraftbd.info',
        }),
      });
    } catch {
      // Silently ignore — always show success to user
    }

    setSending(false);
    setStage('done');
    setMessages(prev => [...prev, {
      id: Date.now(), who: 'bot', time: getNow(),
      text: 'আপনার মেসেজ পাঠানো হয়েছে ✓\nআমাদের টিম খুব দ্রুত আপনার সাথে WhatsApp এ যোগাযোগ করবে।',
    }]);
  }, [phone]);

  /* ── Inline styles ── */
  const wrap: React.CSSProperties = {
    position: 'fixed',
    [isLeft ? 'left' : 'right']: 20,
    bottom: 24,
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: isLeft ? 'flex-start' : 'flex-end',
    gap: 12,
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
  };

  const winStyle: React.CSSProperties = {
    width: 360,
    maxWidth: 'calc(100vw - 24px)',
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 8px 40px rgba(0,0,0,.18)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'min(520px, calc(100vh - 120px))',
    transition: 'opacity .25s, transform .25s',
    opacity: open ? 1 : 0,
    transform: open ? 'scale(1) translateY(0)' : 'scale(.92) translateY(12px)',
    pointerEvents: open ? 'auto' : 'none',
    transformOrigin: `bottom ${isLeft ? 'left' : 'right'}`,
  };

  const ICON_WA_PATH = "M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z";

  const sendBtnStyle: React.CSSProperties = {
    width: '100%',
    background: '#25D366',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '13px 8px',
    fontSize: 14,
    fontWeight: 700,
    cursor: sending ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: sending ? 0.75 : 1,
    transition: 'opacity .15s',
    fontFamily: 'inherit',
    letterSpacing: '0.3px',
  };

  return (
    <div style={wrap} id="wc-widget-wrap">
      <style>{`
        @keyframes wc-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
        @keyframes wc-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
        #wc-widget-wrap button:focus{outline:none}
        #wc-send-btn:hover{opacity:0.9 !important}
      `}</style>

      {/* Chat window */}
      <div style={winStyle}>

        {/* Header */}
        <div style={{ background: cfg.headerColor, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#128C7E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
            {cfg.agentAvatar
              ? <img src={cfg.agentAvatar} alt="agent" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d={ICON_WA_PATH}/></svg>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cfg.agentName}</div>
            <div style={{ color: 'rgba(255,255,255,.78)', fontSize: 12, marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4cff91', display: 'inline-block' }} />
              Online — সাথে সাথে উত্তর দেওয়া হবে
            </div>
          </div>
          <button onClick={handleClose} aria-label="Close chat" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="rgba(255,255,255,0.85)" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', background: '#e5ddd5', display: 'flex', flexDirection: 'column', gap: 8, WebkitOverflowScrolling: 'touch' }}>
          {messages.map(m => (
            <div key={m.id} style={{
              maxWidth: '86%', padding: '8px 12px 6px',
              borderRadius: m.who === 'user' ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
              background: m.who === 'user' ? '#dcf8c6' : '#fff',
              alignSelf: m.who === 'user' ? 'flex-end' : 'flex-start',
              fontSize: 14, lineHeight: 1.55, wordBreak: 'break-word',
              boxShadow: '0 1px 2px rgba(0,0,0,.1)', color: '#111',
            }}>
              {m.who === 'typing' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 0' }}>
                  {[0, 180, 360].map((delay, i) => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#999', display: 'inline-block', animation: `wc-bounce .9s ${delay}ms infinite` }} />
                  ))}
                </span>
              ) : (
                m.text?.split('\n').map((ln, i, arr) => <span key={i}>{ln}{i < arr.length - 1 && <br />}</span>)
              )}
              {m.who !== 'typing' && (
                <div style={{ fontSize: 11, color: 'rgba(0,0,0,.4)', textAlign: 'right', marginTop: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                  {m.time}
                  {m.who === 'user' && <svg viewBox="0 0 16 8" width="14" height="8"><path d="M1 4l3 3 5-6M7 4l3 3 5-6" stroke="rgba(0,0,0,.35)" strokeWidth="1.5" fill="none"/></svg>}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ flexShrink: 0, background: '#f0f0f0', borderTop: '1px solid rgba(0,0,0,.08)' }}>

          {/* Stage: chat */}
          {stage === 'chat' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
              <textarea
                rows={1} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="মেসেজ লিখুন..."
                aria-label="Type your message"
                style={{ flex: 1, border: 'none', borderRadius: 24, padding: '10px 16px', fontSize: 14, background: '#fff', color: '#111', outline: 'none', resize: 'none', maxHeight: 90, overflowY: 'auto', lineHeight: 1.4, boxShadow: '0 1px 3px rgba(0,0,0,.1)', fontFamily: 'inherit' }}
              />
              <button
                onClick={handleSend}
                aria-label="Send"
                style={{ width: 42, height: 42, borderRadius: '50%', background: cfg.primaryColor, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          )}

          {/* Stage: phone — single Send button, no Telegram */}
          {stage === 'phone' && (
            <div style={{ padding: '12px 14px 14px' }}>
              <p style={{ fontSize: 13, color: '#555', marginBottom: 10, lineHeight: 1.6 }}>
                📱 আপনার WhatsApp নম্বর দিন — আমাদের টিম সরাসরি আপনার সাথে যোগাযোগ করবে
              </p>
              <input
                ref={phoneRef}
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setPhoneErr(false); }}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                placeholder="+880 1X XX XX XX XX"
                autoComplete="tel"
                style={{
                  width: '100%',
                  border: `1.5px solid ${phoneErr ? '#ff3b30' : '#ddd'}`,
                  borderRadius: 10,
                  padding: '11px 14px',
                  fontSize: 14,
                  color: '#111',
                  outline: 'none',
                  marginBottom: 10,
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  background: '#fff',
                  transition: 'border-color .15s',
                }}
              />
              {phoneErr && <p style={{ fontSize: 11, color: '#ff3b30', marginBottom: 8, marginTop: -6 }}>সঠিক নম্বর দিন</p>}
              <button
                id="wc-send-btn"
                onClick={handleSubmit}
                disabled={sending}
                style={sendBtnStyle}
              >
                {sending ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'wc-spin .7s linear infinite', display: 'inline-block' }} />
                    পাঠানো হচ্ছে...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d={ICON_WA_PATH}/></svg>
                    Send
                  </>
                )}
              </button>
              <style>{`@keyframes wc-spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {/* Stage: done */}
          {stage === 'done' && (
            <div style={{ padding: '14px 16px', textAlign: 'center', background: '#f0fff4' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
              <div style={{ fontSize: 13.5, color: '#155724', lineHeight: 1.7, fontWeight: 600 }}>
                মেসেজ পাঠানো হয়েছে!
              </div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 4, lineHeight: 1.6 }}>
                আমাদের টিম খুব শীঘ্রই আপনার WhatsApp নম্বরে যোগাযোগ করবে।
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAB Button */}
      <button
        onClick={open ? handleClose : handleOpen}
        aria-label="Open WhatsApp chat"
        aria-expanded={open}
        style={{
          width: 58, height: 58, borderRadius: '50%',
          background: cfg.primaryColor, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,.45)',
          transition: 'transform .2s, box-shadow .2s',
          position: 'relative', WebkitTapHighlightColor: 'transparent',
        }}
      >
        <svg viewBox="0 0 24 24" style={{ width: 30, height: 30, fill: '#fff', transition: 'transform .3s', transform: open ? 'rotate(90deg)' : 'rotate(0)' }}>
          {open
            ? <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            : <path d={ICON_WA_PATH}/>}
        </svg>
        {showBadge && (
          <span style={{ position: 'absolute', top: -3, right: -3, background: '#ff3b30', color: '#fff', fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', animation: 'wc-pulse 2s infinite' }}>1</span>
        )}
      </button>
    </div>
  );
}
