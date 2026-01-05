
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DepartmentId, Ticket, QueueState } from './types';
import { DEPARTMENTS } from './constants';
import { announceTicket } from './services/geminiTts';

enum View {
  KIOSK = 'kiosk',
  DISPLAY = 'display',
  ADMIN = 'admin'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.KIOSK);
  const [queue, setQueue] = useState<QueueState>(() => {
    const saved = localStorage.getItem('queue_state');
    if (saved) return JSON.parse(saved);
    return {
      tickets: [],
      lastNumbers: Object.fromEntries(DEPARTMENTS.map(d => [d.id, 0])) as Record<DepartmentId, number>
    };
  });

  const [activeAdminDept, setActiveAdminDept] = useState<DepartmentId | null>(null);
  const [lastGeneratedTicket, setLastGeneratedTicket] = useState<Ticket | null>(null);

  // Sync with Local Storage
  useEffect(() => {
    localStorage.setItem('queue_state', JSON.stringify(queue));
  }, [queue]);

  // Handle URL Parameters for QR Codes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deptParam = params.get('dept') as DepartmentId;
    if (deptParam && DEPARTMENTS.some(d => d.id === deptParam)) {
      // Auto-trigger kiosk view for specific department if needed
      // Or just highlight it. For now, we keep KIOSK view.
    }
  }, []);

  const generateTicket = (deptId: DepartmentId) => {
    const dept = DEPARTMENTS.find(d => d.id === deptId);
    if (!dept) return;

    const nextNum = (queue.lastNumbers[deptId] || 0) + 1;
    const displayId = `${dept.prefix}-${nextNum.toString().padStart(3, '0')}`;
    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      number: nextNum,
      displayId,
      deptId,
      status: 'waiting',
      timestamp: Date.now()
    };

    setQueue(prev => ({
      tickets: [...prev.tickets, newTicket],
      lastNumbers: { ...prev.lastNumbers, [deptId]: nextNum }
    }));

    setLastGeneratedTicket(newTicket);
    // Auto-clear success message after 5 seconds
    setTimeout(() => setLastGeneratedTicket(null), 5000);
  };

  const callTicket = async (ticket: Ticket) => {
    const dept = DEPARTMENTS.find(d => d.id === ticket.deptId);
    if (!dept) return;

    setQueue(prev => ({
      ...prev,
      tickets: prev.tickets.map(t => 
        t.id === ticket.id ? { ...t, status: 'called' as const } : t
      )
    }));
    
    await announceTicket(
      ticket.displayId, 
      dept.nameAr, 
      dept.nameEn, 
      dept.roomNameAr, 
      dept.roomNameEn
    );
  };

  const completeTicket = (ticketId: string) => {
    setQueue(prev => ({
      ...prev,
      tickets: prev.tickets.map(t => 
        t.id === ticketId ? { ...t, status: 'completed' as const } : t
      )
    }));
  };

  const calledTickets = useMemo(() => 
    queue.tickets.filter(t => t.status === 'called').slice(-6).reverse()
  , [queue.tickets]);

  const baseUrl = useMemo(() => window.location.origin + window.location.pathname, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      {/* Dynamic Header - Hidden on Display Mode for cleaner TV look */}
      {currentView !== View.DISPLAY && (
        <nav className="bg-white border-b px-6 py-4 flex flex-wrap justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-700 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">Z</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-emerald-900">شركة الزهراني <span className="text-emerald-600">2025</span></h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Smart Queue System</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0">
            {[View.KIOSK, View.DISPLAY, View.ADMIN].map((v) => (
              <button 
                key={v}
                onClick={() => setCurrentView(v)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${currentView === v ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-200'}`}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${currentView === View.DISPLAY ? 'p-0' : 'p-6'} max-w-[1920px] mx-auto w-full`}>
        
        {/* KIOSK VIEW */}
        {currentView === View.KIOSK && (
          <div className="max-w-4xl mx-auto space-y-8 py-10">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black text-slate-800 arabic">مرحباً بكم في شركة الزهراني</h2>
              <p className="text-xl text-slate-500 font-medium">Welcome to Al Zahrani Co. - Please select a service</p>
            </div>
            
            {lastGeneratedTicket && (
              <div className="bg-emerald-500 text-white p-6 rounded-2xl shadow-2xl animate-bounce text-center">
                <p className="text-lg font-bold">تم استخراج تذكرتك بنجاح!</p>
                <div className="text-5xl font-black my-2">{lastGeneratedTicket.displayId}</div>
                <p>يرجى الانتظار حتى يتم النداء عليك</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEPARTMENTS.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => generateTicket(dept.id)}
                  className="group bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-emerald-500 hover:shadow-xl transition-all flex items-center gap-6 text-right"
                >
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center text-3xl font-black group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                    {dept.prefix}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-800 arabic">{dept.nameAr}</h3>
                    <p className="text-slate-400 font-medium">{dept.nameEn}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DISPLAY VIEW - Optimized for Android TV */}
        {currentView === View.DISPLAY && (
          <div className="h-screen w-screen bg-slate-900 text-white flex flex-col overflow-hidden">
            {/* TV Header */}
            <div className="bg-emerald-800 p-8 flex justify-between items-center border-b-4 border-emerald-600">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-emerald-800 text-5xl font-black shadow-2xl">Z</div>
                 <div>
                    <h1 className="text-5xl font-black arabic leading-tight">شركة الزهراني ٢٠٢٥</h1>
                    <p className="text-2xl text-emerald-200 font-bold uppercase tracking-[0.2em]">Al Zahrani Company 2025</p>
                 </div>
              </div>
              <div className="text-right">
                <div className="text-6xl font-mono font-bold" id="clock">
                  {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xl text-emerald-300 font-bold arabic">نظام إدارة التذاكر الذكي</div>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Main Calling Area */}
              <div className="w-2/3 p-12 flex flex-col justify-center items-center relative border-r border-slate-700">
                <div className="absolute top-10 left-10 text-emerald-500 font-black text-2xl tracking-widest uppercase opacity-50">Now Serving / نداء الآن</div>
                
                {calledTickets.length > 0 ? (
                  <div className="text-center animate-in zoom-in duration-500">
                    <div className="text-[25rem] font-black leading-none text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                      {calledTickets[0].displayId}
                    </div>
                    <div className="space-y-4">
                       <h2 className="text-7xl font-black arabic text-emerald-400">{DEPARTMENTS.find(d => d.id === calledTickets[0].deptId)?.nameAr}</h2>
                       <p className="text-4xl font-bold text-slate-400">{DEPARTMENTS.find(d => d.id === calledTickets[0].deptId)?.nameEn}</p>
                       <div className="mt-12 bg-emerald-600/20 border-2 border-emerald-500 text-emerald-400 px-12 py-4 rounded-full text-5xl font-bold inline-block arabic">
                         {DEPARTMENTS.find(d => d.id === calledTickets[0].deptId)?.roomNameAr}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-5xl font-bold text-slate-600 animate-pulse arabic">بانتظار العملاء...</div>
                )}
              </div>

              {/* Sidebar: History */}
              <div className="w-1/3 bg-slate-800/50 p-8 flex flex-col gap-6">
                <h3 className="text-3xl font-black border-b-2 border-slate-700 pb-4 text-emerald-500 arabic">التذاكر السابقة / History</h3>
                <div className="flex-1 space-y-4 overflow-hidden">
                  {calledTickets.slice(1).map((ticket, idx) => (
                    <div key={ticket.id} className="bg-slate-800 p-6 rounded-3xl border-l-[16px] border-emerald-600 flex justify-between items-center animate-in slide-in-from-right duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div>
                        <div className="text-7xl font-black leading-tight">{ticket.displayId}</div>
                        <div className="text-2xl font-bold text-slate-400 arabic">{DEPARTMENTS.find(d => d.id === ticket.deptId)?.nameAr}</div>
                      </div>
                      <div className="text-right bg-emerald-900/40 px-4 py-2 rounded-xl border border-emerald-800">
                        <div className="text-emerald-400 text-xl font-bold arabic">{DEPARTMENTS.find(d => d.id === ticket.deptId)?.roomNameAr}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* TV News Ticker */}
            <div className="bg-white text-slate-900 py-3 overflow-hidden whitespace-nowrap border-t-4 border-emerald-500">
                <div className="inline-block animate-marquee text-2xl font-bold px-4 arabic italic">
                  شركة الزهراني ٢٠٢٥ ترحب بكم .. يرجى الالتزام بالهدوء وانتظار دوركم .. شكراً لتعاونكم .. Al Zahrani Company 2025 Welcomes You .. Please wait for your turn .. Thank you for your cooperation
                </div>
            </div>
          </div>
        )}

        {/* ADMIN VIEW */}
        {currentView === View.ADMIN && (
          <div className="space-y-6">
            {!activeAdminDept ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border">
                  <h3 className="text-xl font-bold mb-6 arabic">دخول الموظفين / Staff Login</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {DEPARTMENTS.map(dept => (
                      <button
                        key={dept.id}
                        onClick={() => setActiveAdminDept(dept.id)}
                        className="w-full p-4 text-left border rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all flex justify-between items-center group"
                      >
                        <div>
                          <div className="font-bold text-lg arabic group-hover:text-emerald-700">{dept.nameAr}</div>
                          <div className="text-xs text-slate-400">{dept.nameEn}</div>
                        </div>
                        <span className="text-emerald-300 text-xl">→</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border">
                   <h3 className="text-xl font-bold mb-6 arabic">روابط الباركود / QR Code Links</h3>
                   <p className="text-sm text-slate-500 mb-4 italic">استخدم هذه الروابط لإنشاء الباركود لكل قسم</p>
                   <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {DEPARTMENTS.map(d => (
                        <div key={d.id} className="p-3 bg-slate-50 rounded-lg text-xs font-mono border flex justify-between items-center">
                          <span className="font-bold text-emerald-700 w-24 truncate">{d.nameEn}:</span>
                          <span className="flex-1 mx-2 text-slate-400 truncate">{baseUrl}?dept={d.id}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`${baseUrl}?dept=${d.id}`);
                              alert('Copied!');
                            }}
                            className="text-emerald-600 font-bold hover:underline"
                          >
                            Copy
                          </button>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-2xl border-b-4 border-emerald-500 shadow-sm gap-4">
                  <div>
                    <h2 className="text-3xl font-black text-emerald-900 arabic">{DEPARTMENTS.find(d => d.id === activeAdminDept)?.nameAr}</h2>
                    <p className="text-slate-500 font-medium">{DEPARTMENTS.find(d => d.id === activeAdminDept)?.nameEn}</p>
                  </div>
                  <button onClick={() => setActiveAdminDept(null)} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200 transition">خروج / Exit</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Waiting List */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                      قائمة الانتظار / Waiting List
                    </h3>
                    <div className="space-y-3">
                      {queue.tickets.filter(t => t.deptId === activeAdminDept && t.status === 'waiting').map(ticket => (
                        <div key={ticket.id} className="bg-white p-6 rounded-2xl border shadow-sm flex justify-between items-center hover:shadow-md transition">
                          <div>
                            <span className="text-4xl font-black text-slate-800">{ticket.displayId}</span>
                            <div className="text-xs text-emerald-600 font-bold mt-1 uppercase">Waiting since {new Date(ticket.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          </div>
                          <button 
                            onClick={() => callTicket(ticket)}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95 transition"
                          >
                            نـداء / CALL
                          </button>
                        </div>
                      ))}
                      {queue.tickets.filter(t => t.deptId === activeAdminDept && t.status === 'waiting').length === 0 && (
                        <div className="text-center py-20 text-slate-400 bg-white border border-dashed rounded-3xl">
                          <p className="text-lg arabic">لا يوجد عملاء بانتظار الخدمة حالياً</p>
                          <p className="text-sm">Queue is currently empty</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Service */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                      قيد النداء الآن / Active
                    </h3>
                    <div className="space-y-3">
                      {queue.tickets.filter(t => t.deptId === activeAdminDept && t.status === 'called').map(ticket => (
                        <div key={ticket.id} className="bg-emerald-900 text-white p-8 rounded-3xl border-4 border-emerald-500 shadow-2xl space-y-6">
                          <div className="flex justify-between items-start">
                            <span className="text-7xl font-black">{ticket.displayId}</span>
                            <div className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-black animate-pulse">SERVING</div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => callTicket(ticket)}
                              className="bg-white/10 border-2 border-white/20 text-white py-4 rounded-2xl font-bold hover:bg-white/20 transition flex flex-col items-center"
                            >
                              <span className="text-xl arabic">إعادة نداء</span>
                              <span className="text-xs opacity-60">RECALL</span>
                            </button>
                            <button 
                              onClick={() => completeTicket(ticket.id)}
                              className="bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-400 transition shadow-lg shadow-emerald-900/50 flex flex-col items-center"
                            >
                              <span className="text-xl arabic">إنهاء الخدمة</span>
                              <span className="text-xs font-black">COMPLETE</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Branding */}
      {currentView !== View.DISPLAY && (
        <footer className="p-8 text-center bg-white border-t mt-auto shadow-inner">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
            <div className="text-emerald-800 font-black text-lg arabic">شركة الزهراني ٢٠٢٥</div>
            <div className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
              © 2025 Al Zahrani Company | Advanced Smart Queuing Systems
            </div>
            <div className="mt-2 text-[9px] text-slate-300 italic">Powered by Gemini AI - Bilingual Voice & Logic Engine</div>
          </div>
        </footer>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
