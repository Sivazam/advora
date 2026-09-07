'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Send,
  Plus,
  LogOut,
  Bell,
  Clock,
  User,
  Shield,
  FileCheck,
  ChevronRight,
  Loader2,
  Trash2,
  RotateCcw,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { requestAndRegisterFcmToken, onFcmMessage } from '@/lib/fcmClient';

function ClientPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const yearParam = searchParams.get('year') || new Date().getFullYear().toString();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [activeYear, setActiveYear] = useState(yearParam);
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');
  const [isAddingYear, setIsAddingYear] = useState(false);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Question state
  const [questionSubject, setQuestionSubject] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [questionSuccess, setQuestionSuccess] = useState<string | null>(null);

  // Active Chat & Inquiries State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [isReopeningChat, setIsReopeningChat] = useState(false);
  const [chatReplyText, setChatReplyText] = useState('');
  const [isSendingChatReply, setIsSendingChatReply] = useState(false);
  const [isEndingChat, setIsEndingChat] = useState(false);
  const messagesBoxRef = React.useRef<HTMLDivElement>(null);
  const chatInputRef = React.useRef<HTMLInputElement>(null);

  // Live Toast for incoming messages & notifications dropdown
  const [liveToast, setLiveToast] = useState<{ title: string; body: string } | null>(null);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Cache of tax year data for instant zero-latency switching
  const yearCacheRef = React.useRef<Record<string, { application: any; documents: any }>>({});
  const [isSwitchingYear, setIsSwitchingYear] = useState(false);
  const activeYearRef = React.useRef(activeYear);

  useEffect(() => {
    activeYearRef.current = activeYear;
  }, [activeYear]);

  // Fetch Dashboard Data strictly by taxYear without browser caching
  const fetchDashboardData = async (year: string, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else if (!yearCacheRef.current[year]) {
        setIsSwitchingYear(true);
      }

      const res = await fetch(`/api/portal/client?year=${year}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!res.ok) {
        if (res.status === 401) {
          try {
            localStorage.removeItem('advora_session_role');
            localStorage.removeItem('advora_session_name');
            window.dispatchEvent(new Event('advora_auth_change'));
          } catch (e) {}
          window.location.replace('/portal');
          return;
        }
        throw new Error('Failed to load portal data');
      }

      const json = await res.json();

      // Store in memory cache for instant future switches
      yearCacheRef.current[json.activeYear] = {
        application: json.application,
        documents: json.documents,
      };

      setData((prev: any) => ({
        ...prev,
        ...json,
      }));
      setActiveYear(json.activeYear);
      activeYearRef.current = json.activeYear;
    } catch (error) {
      console.error('Portal data error:', error);
    } finally {
      if (isInitial) setLoading(false);
      setIsSwitchingYear(false);
    }
  };

  // Preload other available tax years silently in background for instant zero-latency switching
  useEffect(() => {
    if (!data?.taxYears?.length) return;
    const otherYears = data.taxYears.filter((y: string) => y !== activeYear && !yearCacheRef.current[y]);
    if (otherYears.length === 0) return;

    let isMounted = true;
    const preloadYears = async () => {
      for (const y of otherYears) {
        if (!isMounted) break;
        try {
          const res = await fetch(`/api/portal/client?year=${y}`, { cache: 'no-store' });
          if (res.ok) {
            const fresh = await res.json();
            yearCacheRef.current[y] = {
              application: fresh.application,
              documents: fresh.documents,
            };
          }
        } catch (e) {}
      }
    };
    preloadYears();

    return () => {
      isMounted = false;
    };
  }, [data?.taxYears]);

  // Initial load, background poller, and FCM notification listener (runs once on mount)
  useEffect(() => {
    fetchDashboardData(yearParam, true);
    requestAndRegisterFcmToken().catch(() => {});

    // Silent background poller (every 4.5s) for real-time chat replies and live status updates
    const livePoller = setInterval(() => {
      const currentYr = activeYearRef.current;
      fetch(`/api/portal/client?year=${currentYr}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((fresh) => {
          if (fresh && fresh.activeYear === activeYearRef.current) {
            yearCacheRef.current[currentYr] = {
              application: fresh.application,
              documents: fresh.documents,
            };
            setData((prev: any) => ({
              ...prev,
              user: fresh.user,
              taxYears: fresh.taxYears,
              tickets: fresh.tickets,
              notifications: fresh.notifications,
              application: fresh.application,
              documents: fresh.documents,
            }));
          }
        })
        .catch(() => {});
    }, 4500);

    // Foreground FCM push notification listener
    let unsubFcm: any;
    onFcmMessage((payload) => {
      console.log('Client received live FCM message:', payload);
      const title = payload.notification?.title || 'Tax Preparation Update';
      const body = payload.notification?.body || 'You have a new message from your tax advisor.';
      setLiveToast({ title, body });
      fetchDashboardData(activeYearRef.current, false);
    })
      .then((unsub) => {
        unsubFcm = unsub;
      })
      .catch(() => {});

    return () => {
      clearInterval(livePoller);
      if (typeof unsubFcm === 'function') unsubFcm();
    };
  }, []);

  // Ensure page remains at top upon dashboard load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash !== '#advisor-chat') {
      window.scrollTo(0, 0);
    }
  }, []);

  // Hash deep link scroll listener on load (only if URL explicitly has #advisor-chat)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#advisor-chat') {
      setTimeout(() => {
        const chatEl = document.getElementById('advisor-chat');
        if (chatEl) {
          chatEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setIsCreatingNewChat(false);
        // Clear hash so subsequent page actions and reloads don't jump to chat
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        setTimeout(() => {
          chatInputRef.current?.focus();
        }, 300);
      }, 500);
    }
  }, [loading]);

  // Auto-scroll ONLY the messages box internally without scrolling the browser window
  useEffect(() => {
    if (messagesBoxRef.current) {
      messagesBoxRef.current.scrollTop = messagesBoxRef.current.scrollHeight;
    }
  }, [data?.tickets, selectedTicketId]);

  // Handle switching tax years cleanly with URL sync & instant cache response
  const handleYearSwitch = (year: string) => {
    if (year === activeYear) return;

    // 1. Immediately activate tab with 0ms latency
    setActiveYear(year);
    activeYearRef.current = year;
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/portal/client?year=${year}`);
    }

    // 2. If cached, apply immediately with 0ms delay!
    const cached = yearCacheRef.current[year];
    if (cached) {
      setData((prev: any) => ({
        ...prev,
        activeYear: year,
        application: cached.application,
        documents: cached.documents,
      }));
      // Silently revalidate in background
      fetchDashboardData(year, false);
    } else {
      // First-time load for this year
      fetchDashboardData(year, false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      localStorage.removeItem('advora_session_role');
      localStorage.removeItem('advora_session_name');
      window.dispatchEvent(new Event('advora_auth_change'));
    } catch (e) {}
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    window.location.replace('/portal');
  };

  // Handle Add Tax Year
  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearInput || !/^\d{4}$/.test(newYearInput)) return;
    setIsAddingYear(true);

    try {
      const res = await fetch('/api/portal/tax-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: newYearInput }),
      });
      if (res.ok) {
        const addedYear = newYearInput;
        setShowAddYearModal(false);
        setNewYearInput('');
        handleYearSwitch(addedYear);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingYear(false);
    }
  };

  // Handle Client Supporting Document Upload
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('taxYear', activeYear);
      formData.append('category', 'SUPPORTING_DOC');

      const res = await fetch('/api/portal/documents', {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Upload failed');

      setUploadSuccess('Document uploaded successfully.');
      setUploadFile(null);
      fetchDashboardData(activeYear);
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Delete Document
  const handleDeleteDocument = async (documentId: string, docName: string) => {
    if (!confirm(`Are you sure you want to remove "${docName}" from your ${activeYear} tax records?`)) return;
    try {
      const res = await fetch('/api/portal/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });
      if (!res.ok) throw new Error('Failed to delete document');
      fetchDashboardData(activeYear);
    } catch (err: any) {
      alert(err.message || 'Unable to delete document.');
    }
  };

  // Handle Question Submission
  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setIsSubmittingQuestion(true);
    setQuestionSuccess(null);

    try {
      const res = await fetch('/api/portal/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: questionSubject.trim() || `Inquiry for ${activeYear} Tax Filing`,
          message: questionText.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to send question');

      setQuestionSuccess('Your question has been dispatched to your tax preparer.');
      setQuestionSubject('');
      setQuestionText('');
      fetchDashboardData(activeYear);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  // Handle direct instant message reply in active chat
  const handleSendChatReply = async (e: React.FormEvent, ticketId: string) => {
    e.preventDefault();
    if (!chatReplyText.trim()) return;
    setIsSendingChatReply(true);

    try {
      const res = await fetch('/api/portal/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          message: chatReplyText.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');
      setChatReplyText('');
      // Instant reload of ticket thread
      const freshRes = await fetch(`/api/portal/client?year=${activeYear}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (freshRes.ok) {
        const freshData = await freshRes.json();
        setData((prev: any) => ({ ...prev, ...freshData }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSendingChatReply(false);
    }
  };

  // Handle End / Close Chat
  const handleCloseChat = async (ticketId: string) => {
    if (!confirm('Are you sure you want to end this conversation? You can review the past transcript or reopen it at any time.')) return;
    setIsEndingChat(true);

    try {
      const res = await fetch('/api/portal/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          status: 'RESOLVED',
        }),
      });

      if (!res.ok) throw new Error('Failed to close conversation');
      setSelectedTicketId(ticketId);
      fetchDashboardData(activeYear);
    } catch (err: any) {
      alert(err.message || 'Failed to close conversation');
    } finally {
      setIsEndingChat(false);
    }
  };

  // Handle Reopen Closed Chat
  const handleReopenChat = async (ticketId: string) => {
    setIsReopeningChat(true);
    try {
      const res = await fetch('/api/portal/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          status: 'OPEN',
        }),
      });

      if (!res.ok) throw new Error('Failed to reopen conversation');
      setSelectedTicketId(ticketId);
      setIsCreatingNewChat(false);
      await fetchDashboardData(activeYear);
      setTimeout(() => {
        const chatEl = document.getElementById('advisor-chat');
        if (chatEl) chatEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        chatInputRef.current?.focus();
      }, 350);
    } catch (err: any) {
      alert(err.message || 'Failed to reopen conversation');
    } finally {
      setIsReopeningChat(false);
    }
  };

  // Handle Clicking Notification
  const handleNotificationClick = (notif: any) => {
    setShowNotifMenu(false);
    if (!notif) return;

    // Mark as read on server
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: notif.id }),
    }).catch(() => {});

    setIsCreatingNewChat(false);
    const chatEl = document.getElementById('advisor-chat');
    if (chatEl) {
      chatEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 450);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-slate-800 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Accessing your Advora client portal...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-slate-800 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Loading your workspace...</p>
          <div className="pt-2 flex justify-center gap-2">
            <Link href="/">
              <Button size="sm" variant="outline" className="text-xs border-stone-300">
                Back to Home
              </Button>
            </Link>
            <Button
              onClick={() => fetchDashboardData(activeYear)}
              size="sm"
              className="bg-slate-900 text-white text-xs"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // PENDING APPROVAL VIEW (ADMIN GATE)
  if (data?.user?.status === 'PENDING_APPROVAL') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 flex flex-col items-center justify-center">
        <Card className="max-w-md w-full bg-white border-stone-200 shadow-sm p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-800 border border-amber-200">
            <Clock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Account Under Review</h2>
            <p className="text-xs text-slate-600">
              Welcome, {data?.user?.firstName} {data?.user?.lastName}.
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 text-left text-xs space-y-2">
            <div className="flex justify-between items-center border-b border-stone-200 pb-2">
              <span className="text-slate-500">Access Status:</span>
              <span className="font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Pending Advisor Approval
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Your registration and submitted tax files have been received by our preparation desk. An advisor is reviewing your documents and will activate your client workspace shortly.
            </p>
          </div>

          <div className="pt-2 flex gap-2">
            <Link href="/" className="w-1/3">
              <Button
                variant="outline"
                className="w-full text-xs font-medium border-stone-300 h-9 rounded-lg flex items-center justify-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Button>
            </Link>
            <Button
              onClick={() => fetchDashboardData(activeYear)}
              className="w-1/3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-9 rounded-lg"
            >
              Check Status
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-1/3 text-xs font-medium border-stone-300 h-9 rounded-lg"
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ACTIVE CLIENT DASHBOARD
  const appStatus = data?.application?.status || 'INITIATED';
  const hasDocumentsThisYear = (data?.documents?.supporting?.length || 0) > 0 || (data?.documents?.estimates?.length || 0) > 0;

  // Status mapping
  const statuses = [
    { key: 'INITIATED', label: 'Initiated', desc: 'Tax filing intake submitted and queued for review.' },
    { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Tax return is currently being prepared and processed by our CPAs.' },
    { key: 'COMPLETED', label: 'Completed', desc: 'Tax return preparation complete; e-filing submitted to the IRS.' },
    { key: 'PAYMENT_RECEIVED', label: 'Payment Received', desc: 'All filing service fees processed; official filing archive issued.' },
  ];

  const currentStatusIndex = statuses.findIndex((s) => s.key === appStatus);

  const getMilestoneDescription = () => {
    if (appStatus === 'INITIATED') {
      return hasDocumentsThisYear
        ? `Documents for ${activeYear} received. Your filing is queued for CPA review and refund calculation.`
        : `Awaiting supporting documents for ${activeYear}. Please upload your W-2s, 1099s, or prior returns to begin tax calculation.`;
    }
    if (appStatus === 'IN_PROGRESS') {
      return `Your ${activeYear} tax return is actively being prepared and processed by our CPAs.`;
    }
    if (appStatus === 'COMPLETED') {
      return `Your ${activeYear} tax return preparation is complete and e-filed with the IRS.`;
    }
    if (appStatus === 'PAYMENT_RECEIVED') {
      return `All filing fees for ${activeYear} processed. Your official IRS return archive is available for download.`;
    }
    return `Status for ${activeYear}: ${appStatus}`;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 py-6 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-5">
        
        {/* Live Incoming Message Toast Notification */}
        {liveToast && (
          <div className="bg-slate-900 text-white rounded-xl shadow-xl p-3.5 border border-amber-400/40 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-2.5">
              <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-amber-200">{liveToast.title}</p>
                <p className="text-xs text-slate-300 mt-0.5 leading-snug">{liveToast.body}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => {
                  setLiveToast(null);
                  setIsCreatingNewChat(false);
                  const chatEl = document.getElementById('advisor-chat');
                  if (chatEl) chatEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setTimeout(() => {
                    chatInputRef.current?.focus();
                  }, 350);
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs h-7 px-3 rounded-lg"
              >
                Reply Now
              </Button>
              <button
                onClick={() => setLiveToast(null)}
                className="text-slate-400 hover:text-white text-xs p-1"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Institutional Top Header Bar */}
        <div className="relative z-50 bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-stone-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-lg bg-white p-1 border border-stone-200 flex items-center justify-center shrink-0">
              <img src="/navLogo.webp" alt="Advora" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 inline-block mb-1">
                {activeYear} {data?.user?.firstName ? `${data.user.firstName} ${data.user.lastName}`.toUpperCase() : 'CLIENT'} TAX FILED REPORT
              </span>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-raleway">
                  {data?.user?.firstName} {data?.user?.lastName}
                </h1>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active Client
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {data?.user?.phone} • Tax Year: {activeYear}
              </p>
            </div>
          </div>

          {/* Right Actions: Notifications & Logout */}
          <div className="flex items-center space-x-2 self-end md:self-auto">
            {/* Notification Bell */}
            <div className="relative z-50">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {data?.notifications?.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-600 rounded-full" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifMenu && (
                <>
                  <div
                    className="fixed inset-0 z-[60]"
                    onClick={() => setShowNotifMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-stone-300 p-3 z-[70] text-xs space-y-2">
                    <div className="flex justify-between items-center font-bold text-slate-800 border-b border-stone-100 pb-2">
                      <span>Recent Updates</span>
                      <span className="text-[10px] text-slate-400">Activity</span>
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-1.5">
                      {data?.notifications?.length ? (
                        data.notifications.map((n: any) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className="p-2 bg-stone-50 hover:bg-stone-100/90 rounded-lg border border-stone-200/60 cursor-pointer space-y-0.5 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <p className="font-semibold text-slate-900 text-xs truncate">{n.title}</p>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 py-3 text-center">No new notifications</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="border-stone-300 text-slate-700 hover:bg-stone-100 rounded-lg text-xs flex items-center gap-1.5 h-8"
                title="Return to Main Website"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Site Home</span>
              </Button>
            </Link>

            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-stone-300 text-slate-700 hover:bg-stone-100 rounded-lg text-xs flex items-center gap-1.5 h-8"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Multi-Year Segmented Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-xl border border-stone-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 px-3">Tax Years:</span>
          {data?.taxYears?.map((year: string) => (
            <button
              key={year}
              onClick={() => handleYearSwitch(year)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeYear === year
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-stone-50 hover:bg-stone-100 text-slate-700 border border-stone-200'
              }`}
            >
              {year} Tax Year
            </button>
          ))}

          {/* Add Year Button */}
          <button
            onClick={() => setShowAddYearModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-slate-800 border border-stone-300 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Year</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* IN-PORTAL ESTIMATION PROMPT (If no documents uploaded yet for this year)  */}
        {/* ========================================================================= */}
        {(!data?.documents?.supporting?.length && !data?.documents?.estimates?.length && data?.application?.status === 'INITIATED') && (
          <Card className="bg-gradient-to-r from-amber-50/90 via-white to-amber-50/60 border-amber-300 shadow-sm p-5 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-900 shrink-0 mt-0.5">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Submit Documents for {activeYear} Tax Estimation
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                    Our CPAs require your financial records to calculate your deductions, credits, and prepare your estimate quotation. Please upload your W-2s, 1099s, prior year returns, or statements.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded border border-amber-300 self-start sm:self-auto shrink-0">
                Action Required
              </span>
            </div>

            <form onSubmit={handleUploadDocument} className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="w-full sm:flex-1 border border-dashed border-amber-300/80 hover:border-amber-400 rounded-lg p-3 bg-white text-center relative cursor-pointer">
                <input
                  type="file"
                  id="estimation-doc"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="estimation-doc" className="cursor-pointer block text-xs">
                  {uploadFile ? (
                    <span className="font-semibold text-slate-900 truncate block">
                      Selected: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  ) : (
                    <span className="text-slate-600">
                      Click to browse or drop tax document (PDF, PNG, JPG, Excel, Word - max 25MB)
                    </span>
                  )}
                </label>
              </div>

              <Button
                type="submit"
                disabled={isUploading || !uploadFile}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-11 px-6 rounded-lg shrink-0"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Submit for Estimation'
                )}
              </Button>
            </form>

            {uploadSuccess && (
              <p className="text-emerald-700 text-xs font-semibold">
                ✓ {uploadSuccess}
              </p>
            )}
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 4-QUADRANT DASHBOARD LAYOUT                                              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ------------------------------------------------------------- */}
          {/* SECTION 1: STATUS (Tax Filing Progress Tracker)               */}
          {/* ------------------------------------------------------------- */}
          <Card className="bg-white border-stone-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    Filing Status Tracker ({activeYear})
                  </h2>
                  <p className="text-xs text-slate-500">Milestone progression for your {activeYear} tax return</p>
                </div>
                <span className="bg-slate-100 text-slate-800 font-mono font-bold text-xs px-2.5 py-1 rounded border border-stone-200">
                  {statuses[currentStatusIndex >= 0 ? currentStatusIndex : 0]?.label.toUpperCase()}
                </span>
              </div>

              {/* Progress Milestones */}
              <div className="pt-6 pb-2">
                <div className="relative flex items-center justify-between">
                  {/* Track line */}
                  <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1 bg-stone-200 rounded-full" />
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-1 bg-slate-900 rounded-full transition-all duration-500"
                    style={{
                      width: `${(Math.max(0, currentStatusIndex) / (statuses.length - 1)) * 92}%`,
                    }}
                  />

                  {statuses.map((s, idx) => {
                    const isPassed = idx <= currentStatusIndex;
                    const isCurrent = idx === currentStatusIndex;
                    return (
                      <div key={s.key} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                            isCurrent
                              ? 'bg-slate-900 text-white ring-4 ring-stone-200'
                              : isPassed
                              ? 'bg-slate-700 text-white'
                              : 'bg-white border-2 border-stone-300 text-stone-400'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                            isCurrent
                              ? 'text-slate-900 font-bold'
                              : isPassed
                              ? 'text-slate-700'
                              : 'text-stone-400'
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Note Box */}
              <div className="mt-5 bg-stone-50 p-3.5 rounded-lg border border-stone-200 text-xs text-slate-700 space-y-1.5">
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    <span>Current Milestone Note ({activeYear}):</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">
                    Tax Year {activeYear}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {getMilestoneDescription()}
                </p>

                {data?.application?.adminNotes && (
                  <div className="mt-2 pt-2 border-t border-stone-200">
                    <span className="font-semibold text-slate-800">CPA Preparer Note for {activeYear}:</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">{data.application.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Overview (Refund & Fee) */}
            {(data?.application?.estimatedRefund !== null || data?.application?.feeAmount !== null) && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {data?.application?.estimatedRefund !== null && (
                  <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
                    <span className="text-[10px] uppercase font-semibold text-emerald-800 block">Estimated Refund</span>
                    <span className="text-base font-bold text-emerald-900 font-mono">
                      ${data.application.estimatedRefund?.toLocaleString()}
                    </span>
                  </div>
                )}
                {data?.application?.feeAmount !== null && (
                  <div className="bg-stone-100/70 p-3 rounded-lg border border-stone-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-600 block">Preparation Fee</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      ${data.application.feeAmount?.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 2: IRS REFUND TRACKING GUIDE                          */}
          {/* ------------------------------------------------------------- */}
          <Card className="bg-white border-stone-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="border-b border-stone-100 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  IRS Refund Tracking Guide
                </h2>
                <p className="text-xs text-slate-500">Official instructions to monitor your federal refund</p>
              </div>

              <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                <p className="font-medium text-slate-800">
                  Follow these 3 official steps once your return has been filed with the IRS:
                </p>

                <ol className="space-y-2 pl-4 list-decimal text-[11px] leading-relaxed">
                  <li>
                    <strong className="text-slate-800">Verify Your Information:</strong> Have your Social Security Number (SSN) or ITIN, your filing status, and your exact refund amount ready.
                  </li>
                  <li>
                    <strong className="text-slate-800">Access IRS "Where's My Refund?":</strong> Open the official IRS portal tool (available 24-48 hours after electronic submission).
                  </li>
                  <li>
                    <strong className="text-slate-800">Direct Deposit Timeline:</strong> The IRS typically issues most refunds within 21 calendar days of electronic filing acceptance.
                  </li>
                </ol>
              </div>
            </div>

            {/* Direct Link Button */}
            <div className="pt-2">
              <Button
                asChild
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5"
              >
                <a href="https://www.irs.gov/refunds" target="_blank" rel="noopener noreferrer">
                  <span>Open Official IRS "Where's My Refund?" Tool</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </Button>
            </div>
          </Card>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 3: TAX DOCUMENTS MANAGEMENT                           */}
          {/* ------------------------------------------------------------- */}
          <Card className="bg-white border-stone-200 shadow-sm p-5 sm:p-6 space-y-5">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                {data?.user?.firstName ? `${data.user.firstName} ${data.user.lastName || ''}`.trim().toUpperCase() : 'CLIENT'} DOCUMENTS ({activeYear})
              </h2>
              <p className="text-xs text-slate-500">Review estimates, draft copies, final filed returns, and upload records</p>
            </div>

            {/* Categorized Document Groups */}
            <div className="space-y-4 text-xs">
              
              {/* Group 1: ESTIMATE */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <FileText className="w-3.5 h-3.5 text-amber-800" />
                  <span>1. Estimate Quotation</span>
                </div>
                {data?.documents?.estimates?.length ? (
                  data.documents.estimates.map((doc: any) => (
                    <div key={doc.id} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex justify-between items-center">
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-900 block truncate">{doc.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {(doc.fileSize / 1024).toFixed(0)} KB • {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Button asChild size="sm" variant="outline" className="text-xs h-7 border-stone-300">
                        <a href={doc.fileUrl} target="_blank" download>
                          <Download className="w-3 h-3 mr-1" /> Download
                        </a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-[11px] pl-5">No estimate quotation uploaded yet.</p>
                )}
              </div>

              {/* Group 2: DRAFT COPY */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <FileText className="w-3.5 h-3.5 text-slate-700" />
                  <span>2. Draft Return Copy</span>
                </div>
                {data?.documents?.drafts?.length ? (
                  data.documents.drafts.map((doc: any) => (
                    <div key={doc.id} className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex justify-between items-center">
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-900 block truncate">{doc.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {(doc.fileSize / 1024).toFixed(0)} KB • {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Button asChild size="sm" variant="outline" className="text-xs h-7 border-stone-300">
                        <a href={doc.fileUrl} target="_blank" download>
                          <Download className="w-3 h-3 mr-1" /> Download
                        </a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-[11px] pl-5">Draft return will be posted here for your review.</p>
                )}
              </div>

              {/* Group 3: FILED FINAL COPY */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>3. Official Filed Copy</span>
                </div>
                {data?.documents?.finals?.length ? (
                  data.documents.finals.map((doc: any) => (
                    <div key={doc.id} className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-200 flex justify-between items-center">
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-900 block truncate">{doc.name}</span>
                        <span className="text-[10px] text-emerald-800 font-mono">
                          Official Filed Copy • {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Button asChild size="sm" className="text-xs h-7 bg-emerald-800 hover:bg-emerald-900 text-white">
                        <a href={doc.fileUrl} target="_blank" download>
                          <Download className="w-3 h-3 mr-1" /> Download
                        </a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-[11px] pl-5">Final filed return will be posted upon acceptance.</p>
                )}
              </div>

              {/* Group 4: SUPPORTING DOCUMENTS & UPLOADER */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <FileText className="w-3.5 h-3.5 text-slate-700" />
                  <span>4. Supporting Client Documents</span>
                </div>

                {data?.documents?.supporting?.length ? (
                  <div className="space-y-1">
                    {data.documents.supporting.map((doc: any) => (
                      <div key={doc.id} className="p-2 bg-stone-50 rounded-lg border border-stone-200 flex justify-between items-center">
                        <div className="truncate pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-800 truncate text-[11px]">{doc.name}</span>
                            <span className="text-[9px] font-bold text-slate-700 bg-stone-200/70 px-1.5 py-0.2 rounded">
                              {doc.taxYear}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {(doc.fileSize / 1024).toFixed(0)} KB • Uploaded {new Date(doc.createdAt).toLocaleDateString()} at {new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button asChild size="sm" variant="ghost" className="text-xs h-7 text-slate-700" title="Download">
                            <a href={doc.fileUrl} target="_blank" download>
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDocument(doc.id, doc.name)}
                            className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                            title="Remove document from this year"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px] pl-5">No supporting files uploaded for {activeYear}.</p>
                )}

                {/* Upload More Files Form */}
                <form onSubmit={handleUploadDocument} className="pt-2">
                  <div className="border border-dashed border-stone-300 hover:border-slate-400 rounded-lg p-3 bg-stone-50/50 text-center relative cursor-pointer">
                    <input
                      type="file"
                      id="supporting-file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx"
                    />
                    <label htmlFor="supporting-file" className="cursor-pointer block">
                      <UploadCloud className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      {uploadFile ? (
                        <p className="text-xs font-semibold text-slate-900 truncate max-w-xs mx-auto">
                          Selected: {uploadFile.name}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-500">
                          Click to upload additional W-2 / 1099 for {activeYear}
                        </p>
                      )}
                    </label>
                  </div>

                  {uploadSuccess && (
                    <p className="text-emerald-700 text-xs mt-1.5 font-semibold text-center">
                      ✓ {uploadSuccess}
                    </p>
                  )}

                  {uploadFile && (
                    <Button
                      type="submit"
                      disabled={isUploading}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-1.5 rounded-lg text-xs mt-2"
                    >
                      {isUploading ? 'Uploading Document...' : 'Submit File'}
                    </Button>
                  )}
                </form>
              </div>

            </div>
          </Card>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 4: QUESTIONS & ADVISOR MESSAGING                      */}
          {/* ------------------------------------------------------------- */}
          {(() => {
            const allTickets: any[] = data?.tickets || [];
            const openTicket = allTickets.find((t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
            const pastTickets = allTickets.filter((t: any) => t.status !== 'OPEN' && t.status !== 'IN_PROGRESS');

            // Determine active displayed ticket
            let displayedTicket = null;
            if (selectedTicketId) {
              displayedTicket = allTickets.find((t: any) => t.id === selectedTicketId) || null;
            } else if (openTicket) {
              displayedTicket = openTicket;
            } else if (pastTickets.length > 0 && !isCreatingNewChat) {
              displayedTicket = pastTickets[0];
            }

            const isClosed = displayedTicket && (displayedTicket.status === 'RESOLVED' || displayedTicket.status === 'CLOSED');

            return (
              <Card id="advisor-chat" className="bg-white border-stone-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between space-y-4 scroll-mt-6">
                
                {/* Header with Title and Inquiries Switcher */}
                <div className="border-b border-stone-100 pb-3 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                          Advisor Messaging ({activeYear})
                        </h2>
                        {displayedTicket && !isCreatingNewChat && (
                          isClosed ? (
                            <span className="text-[10px] bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-full border border-stone-300">
                              Resolved / Read-Only
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Live Chat
                            </span>
                          )
                        )}
                      </div>
                      <p className="text-xs text-slate-500">Direct, secure communication with your tax preparer</p>
                    </div>

                    {/* Top Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {!isCreatingNewChat && displayedTicket && !isClosed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCloseChat(displayedTicket.id)}
                          disabled={isEndingChat}
                          className="text-[11px] h-7 border-stone-300 text-stone-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50 rounded-lg shrink-0"
                          title="End this conversation and archive it"
                        >
                          {isEndingChat ? 'Closing...' : 'End Chat'}
                        </Button>
                      )}

                      {!isCreatingNewChat && displayedTicket && isClosed && (
                        <Button
                          size="sm"
                          onClick={() => handleReopenChat(displayedTicket.id)}
                          disabled={isReopeningChat}
                          className="text-[11px] h-7 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 rounded-lg shrink-0 flex items-center gap-1"
                        >
                          {isReopeningChat ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                          Reopen Chat
                        </Button>
                      )}

                      {!isCreatingNewChat ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsCreatingNewChat(true)}
                          className="text-[11px] h-7 border-stone-300 text-slate-800 hover:bg-stone-100 rounded-lg shrink-0 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          New Inquiry
                        </Button>
                      ) : (
                        allTickets.length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsCreatingNewChat(false)}
                            className="text-[11px] h-7 text-slate-600 hover:text-slate-900 rounded-lg shrink-0"
                          >
                            Back to Chat
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Inquiry Tabs / Selector (if multiple tickets exist) */}
                  {allTickets.length > 1 && !isCreatingNewChat && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
                      {allTickets.map((t: any) => {
                        const isTClosed = t.status === 'RESOLVED' || t.status === 'CLOSED';
                        const isSelected = displayedTicket?.id === t.id;

                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedTicketId(t.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-slate-900 text-white font-bold shadow-xs'
                                : 'bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200'
                            }`}
                          >
                            <span className="truncate max-w-[140px]">{t.subject}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${isTClosed ? 'bg-stone-200 text-slate-600' : 'bg-emerald-200 text-emerald-900 font-bold'}`}>
                              {isTClosed ? 'Archived' : 'Live'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Main Body */}
                {isCreatingNewChat || (!displayedTicket && allTickets.length === 0) ? (
                  /* ========================================================= */
                  /* START NEW INQUIRY FORM                                    */
                  /* ========================================================= */
                  <div className="space-y-3">
                    <form onSubmit={handleSendQuestion} className="space-y-2.5 text-xs">
                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">Subject</label>
                        <Input
                          placeholder={`e.g. Schedule C clarification for ${activeYear}`}
                          value={questionSubject}
                          onChange={(e) => setQuestionSubject(e.target.value)}
                          className="rounded-lg border-stone-300 text-xs h-8"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-medium text-slate-700">Initial Message / Inquiry</label>
                        <Textarea
                          required
                          rows={3}
                          placeholder="Type your question for your CPA..."
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          className="rounded-lg border-stone-300 text-xs resize-none"
                        />
                      </div>

                      {questionSuccess && (
                        <p className="text-emerald-700 text-xs font-semibold">
                          ✓ {questionSuccess}
                        </p>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmittingQuestion}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5"
                      >
                        {isSubmittingQuestion ? 'Opening Conversation...' : 'Start Conversation'}
                        <Send className="w-3 h-3" />
                      </Button>
                    </form>
                  </div>
                ) : (
                  /* ========================================================= */
                  /* ACTIVE OR ARCHIVED CHAT THREAD VIEW                      */
                  /* ========================================================= */
                  <div className="flex flex-col h-full space-y-3">
                    <div className="text-xs font-semibold text-slate-800 truncate flex items-center justify-between">
                      <span className="truncate">Inquiry: <strong className="text-slate-900 font-bold">{displayedTicket.subject}</strong></span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">ID: {displayedTicket.id.slice(0, 8)}</span>
                    </div>

                    {/* Messages Scroll Container */}
                    <div
                      ref={messagesBoxRef}
                      className="flex-1 min-h-[220px] max-h-72 overflow-y-auto space-y-2.5 p-3 bg-stone-50/70 rounded-xl border border-stone-200/80"
                    >
                      {displayedTicket.messages?.map((m: any) => {
                        const isClient = m.senderRole === 'CLIENT';
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                                isClient
                                  ? 'bg-slate-900 text-white rounded-br-none'
                                  : 'bg-white text-slate-900 border border-stone-200 rounded-bl-none'
                              }`}
                            >
                              <div className={`flex justify-between items-center gap-3 text-[10px] mb-1 ${isClient ? 'text-slate-300' : 'text-slate-500 font-medium'}`}>
                                <span className="font-semibold">{isClient ? 'You' : m.senderName}</span>
                                <span className="font-mono">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="leading-relaxed whitespace-pre-wrap text-[11px]">{m.message}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer: Quick Chat Input OR Reopen Action Banner */}
                    {isClosed ? (
                      <div className="p-3 bg-stone-100/90 rounded-xl border border-stone-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-stone-600 text-[11px]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>This inquiry was marked resolved. Transcript is preserved in read-only mode.</span>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <Button
                            size="sm"
                            onClick={() => handleReopenChat(displayedTicket.id)}
                            disabled={isReopeningChat}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 px-3 rounded-lg flex items-center gap-1.5"
                          >
                            {isReopeningChat ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                            <span>Reopen Inquiry</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsCreatingNewChat(true)}
                            className="text-xs h-8 border-stone-300 rounded-lg text-slate-800"
                          >
                            + Start New
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={(e) => handleSendChatReply(e, displayedTicket.id)} className="flex items-center gap-2 pt-1">
                        <Input
                          ref={chatInputRef}
                          placeholder="Type a message to your advisor (Press Enter to send)..."
                          value={chatReplyText}
                          onChange={(e) => setChatReplyText(e.target.value)}
                          disabled={isSendingChatReply}
                          className="h-9 text-xs border-stone-300 rounded-lg flex-1 bg-white focus:border-slate-900"
                        />
                        <Button
                          type="submit"
                          disabled={isSendingChatReply || !chatReplyText.trim()}
                          className="h-9 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shrink-0"
                        >
                          {isSendingChatReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        </Button>
                      </form>
                    )}
                  </div>
                )}
              </Card>
            );
          })()}

        </div>

      </div>

      {/* MODAL: ADD TAX YEAR */}
      {showAddYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border border-stone-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Tax Year Section</h3>
            <p className="text-xs text-slate-600">
              Create an isolated section for another filing year (e.g. 2027, 2024, 2023).
            </p>
            <form onSubmit={handleAddYear} className="space-y-3">
              <Input
                type="number"
                placeholder="2027"
                min="2015"
                max="2035"
                required
                value={newYearInput}
                onChange={(e) => setNewYearInput(e.target.value)}
                className="font-mono text-center text-lg py-2 border-stone-300"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddYearModal(false)}
                  className="w-1/2 rounded-lg text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingYear}
                  className="w-1/2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs"
                >
                  {isAddingYear ? 'Creating...' : 'Create Year'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Copyright Footnote */}
      <div className="text-center text-[11px] text-slate-400 pt-6">
        © {new Date().getFullYear()} Advora Services. All rights reserved.
      </div>
    </div>
  );
}

export default function ClientPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
          <div className="text-center space-y-2">
            <Loader2 className="w-8 h-8 text-slate-800 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Loading Advora Portal...</p>
          </div>
        </div>
      }
    >
      <ClientPortalContent />
    </Suspense>
  );
}
