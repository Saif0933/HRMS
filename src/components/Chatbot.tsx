import { Bot, CheckCircle, FileDown, LogIn, MessageSquare, Send, Sparkles, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actions?: { label: string; actionId: string }[];
}

export const Chatbot: React.FC = () => {
  const { userRole, employees, leaveRequests, setLeaveRequests, addAuditLog } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      sender: 'bot', 
      text: "Hello! I am Factobot, your HR Assistant. You can ask me to apply for leave, punch in/out, check your salary, or regularize attendance. What can I do for you today?", 
      timestamp: "Just now",
      actions: [
        { label: "Check Leave Balance", actionId: "check_leave" },
        { label: "Punch In/Out", actionId: "punch_card" },
        { label: "Show Last Payslip", actionId: "view_payslip" },
        { label: "Help Desk Status", actionId: "ticket_status" }
      ]
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = employees.find(e => e.id === (userRole === 'HR Admin' ? 'EMP006' : userRole === 'Manager' ? 'EMP002' : 'EMP001')) || employees[0];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal("");

    // Simulate bot response
    setTimeout(() => {
      let botText = "";
      let actions: { label: string; actionId: string }[] | undefined;

      const lower = text.toLowerCase();
      if (lower.includes('leave') || lower.includes('balance') || lower.includes('check_leave')) {
        botText = `Hi ${currentUser.name}, here is your current leave balance:\n- Sick Leave: 5 days\n- Casual Leave: 8 days\n- Earned Leave: 12 days\nWould you like to apply for a leave?`;
        actions = [
          { label: "Apply Casual Leave (2 days)", actionId: "apply_casual_leave" },
          { label: "View Leave Calendar", actionId: "go_leave" }
        ];
      } else if (lower.includes('punch') || lower.includes('in') || lower.includes('out') || lower.includes('punch_card')) {
        botText = `Your current punch status: Checked Out.\nGeofence matched: Mumbai HQ (Safe zone).\nWould you like to Punch In now?`;
        actions = [
          { label: "Punch In (Selfie Verification)", actionId: "do_punch_in" }
        ];
      } else if (lower.includes('payslip') || lower.includes('salary') || lower.includes('view_payslip')) {
        botText = `Here is your payslip summary for June 2026:\n- Basic: ₹${currentUser.basic.toLocaleString()}\n- HRA: ₹${currentUser.hra.toLocaleString()}\n- Net Credited: ₹${currentUser.netSalary.toLocaleString()}\nBank Account: ${currentUser.bankName} (ending in ${currentUser.bankAccount.slice(-4)})`;
        actions = [
          { label: "Download PDF Payslip", actionId: "download_payslip" }
        ];
      } else if (lower.includes('ticket') || lower.includes('help') || lower.includes('ticket_status')) {
        botText = `You have 1 active IT support ticket (Subject: "VPN connection dropping repeatedly") currently in progress. The SLA deadline is tomorrow at 5:00 PM.`;
      } else if (lower.includes('thank') || lower.includes('bye')) {
        botText = `You are welcome! Let me know if you need anything else. Have a wonderful day!`;
      } else {
        botText = `I understand you are asking about "${text}". Let me connect you to a live HR representative, or you can check our Employee Directory.`;
        actions = [
          { label: "Go to Employee Directory", actionId: "go_directory" }
        ];
      }

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions
      }]);
    }, 800);
  };

  const handleActionClick = (actionId: string, label: string) => {
    // Treat action click as sending user query
    // In special cases, execute state changes
    if (actionId === "do_punch_in") {
      setMessages(prev => [...prev, {
        sender: 'user',
        text: label,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: `✅ Punch in verified at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!\nAttendance registered. GPS location matching verified. Have a great day at work!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        addAuditLog("Mobile/GPS Punch In", "Attendance Module", `${currentUser.name} punched in via Factobot (GPS verification successful)`);
      }, 700);
    } else if (actionId === "apply_casual_leave") {
      setMessages(prev => [...prev, {
        sender: 'user',
        text: label,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setTimeout(() => {
        // add to leave requests list dynamically
        const newReq = {
          id: `LRQ${Math.floor(Math.random() * 1000)}`,
          employeeId: currentUser.id,
          employeeName: currentUser.name,
          type: "Casual Leave",
          startDate: "2026-07-06",
          endDate: "2026-07-07",
          days: 2,
          reason: "Personal urgent work - Applied via Factobot",
          status: "Pending" as const,
          appliedOn: new Date().toISOString().split('T')[0]
        };
        setLeaveRequests(prev => [newReq, ...prev]);
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: `📝 Leave application submitted successfully!\nRequest ID: ${newReq.id}\nDuration: 2 days (Jul 6 - Jul 7)\nStatus: Pending Approval by manager.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        addAuditLog("Applied Leave", "Leave Management", `${currentUser.name} applied for Casual Leave via Factobot`);
      }, 700);
    } else if (actionId === "download_payslip") {
      // Mock download action
      setMessages(prev => [...prev, {
        sender: 'user',
        text: label,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: `📥 Payslip downloaded successfully to your local folder. File: Payslip_June_2026_${currentUser.id}.pdf`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 700);
    } else {
      handleSend(label);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Trigger Button */}
      <button 
        id="factobot-chat-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 relative group"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[380px] h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in z-50">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm flex items-center gap-1">
                  Factobot <Sparkles className="h-3 w-3 text-yellow-400" />
                </p>
                <p className="text-[10px] text-green-400 flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  HR Virtual Assistant
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Conversation Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : ''}`}>
                {m.sender === 'bot' && (
                  <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                )}
                
                <div className="max-w-[75%] space-y-1.5">
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-sm border ${
                    m.sender === 'user'
                      ? 'bg-primary text-white border-primary rounded-tr-none'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-100 dark:border-slate-800 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                  
                  {/* Action Suggestions */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.actions.map((act) => (
                        <button
                          key={act.actionId}
                          onClick={() => handleActionClick(act.actionId, act.label)}
                          className="bg-white dark:bg-slate-900 hover:bg-primary/10 hover:text-primary hover:border-primary border border-slate-200 dark:border-slate-800 rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-all shadow-sm"
                        >
                          {act.actionId === 'do_punch_in' && <LogIn className="inline h-3 w-3 mr-1" />}
                          {act.actionId === 'apply_casual_leave' && <CheckCircle className="inline h-3 w-3 mr-1" />}
                          {act.actionId === 'download_payslip' && <FileDown className="inline h-3 w-3 mr-1" />}
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <span className={`text-[9px] text-slate-400 block ${m.sender === 'user' ? 'text-right' : ''}`}>
                    {m.timestamp}
                  </span>
                </div>

                {m.sender === 'user' && (
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Ask anything (e.g. check leave)..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 dark:text-slate-250"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
