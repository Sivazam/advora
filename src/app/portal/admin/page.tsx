'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  UploadCloud,
  Send,
  LogOut,
  Edit,
  Download,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  MessageSquare,
  History,
  X,
  UserCheck,
  RotateCcw,
  Bell,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { requestAndRegisterFcmToken, onFcmMessage } from '@/lib/fcmClient';

function AdminPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Client for Detailed View
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientDetail, setClientDetail] = useState<any | null>(null);
  const [activeYear, setActiveYear] = useState(new Date().getFullYear().toString());
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Edit Phone Modal
  const [showEditPhoneModal, setShowEditPhoneModal] = useState(false);
  const [editClient, setEditClient] = useState<any | null>(null);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Status Change State
  const [statusLoading, setStatusLoading] = useState(false);
  const [estimateRefundInput, setEstimateRefundInput] = useState('');
  const [feeAmountInput, setFeeAmountInput] = useState('');
  const [adminNotesInput, setAdminNotesInput] = useState('');

  // Admin Document Upload
  const [uploadCategory, setUploadCategory] = useState<'ESTIMATE' | 'DRAFT_COPY' | 'FILED_FINAL'>('ESTIMATE');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Admin Ticket Reply & Reopening
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isReopeningTicket, setIsReopeningTicket] = useState(false);
  const adminReplyInputRef = useRef<HTMLInputElement>(null);

  // Admin Notifications & Live Incoming Message Toast
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [showAdminNotifMenu, setShowAdminNotifMenu] = useState(false);
  const [liveToast, setLiveToast] = useState<{ title: string; body: string; clientId?: string } | null>(null);

  // Fetch Clients
  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/clients?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/portal');
          return;
        }
        throw new Error('Failed to fetch clients');
      }
      const data = await res.json();
      setClients(data.clients || []);
      setStats(data.stats || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // Register Admin FCM push notification token
    requestAndRegisterFcmToken().catch(() => {});
  }, [statusFilter, searchQuery]);

  // Fetch Client Detail strictly by year with no cache
  const fetchClientDetail = async (id: string, year = activeYear) => {
    try {
      setLoadingDetail(true);
      const res = await fetch(`/api/admin/clients/${id}?year=${year}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        setClientDetail(data);
        setActiveYear(data.activeYear);
        setEstimateRefundInput(data.activeApplication?.estimatedRefund?.toString() || '');
        setFeeAmountInput(data.activeApplication?.feeAmount?.toString() || '');
        setAdminNotesInput(data.activeApplication?.adminNotes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Add a new tax year for the selected client
  const handleAddYearForClient = async () => {
    if (!clientDetail?.client?.id) return;
    const yearPrompt = prompt('Enter 4-digit Tax Year for client (e.g. 2027, 2024):');
    if (!yearPrompt || !/^\d{4}$/.test(yearPrompt.trim())) return;
    try {
      const res = await fetch('/api/portal/tax-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: yearPrompt.trim(), targetUserId: clientDetail.client.id }),
      });
      if (res.ok) {
        const yr = yearPrompt.trim();
        setActiveYear(yr);
        fetchClientDetail(clientDetail.client.id, yr);
        fetchClients();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete an unnecessary tax year for the selected client
  const handleDeleteYearForClient = async (yearToDelete: string) => {
    if (!clientDetail?.client?.id) return;
    if (clientDetail.taxYears?.length <= 1) {
      alert('Cannot delete the only remaining tax year for this client.');
      return;
    }
    const confirmed = confirm(
      `Are you sure you want to delete Tax Year ${yearToDelete} for this client? Any filing records and documents under ${yearToDelete} will be permanently removed.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch('/api/portal/tax-years', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: yearToDelete,
          targetUserId: clientDetail.client.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete tax year.');
        return;
      }

      // Switch active year to remaining year if we deleted the currently active year
      const remaining: string[] = data.remainingYears || clientDetail.taxYears.filter((y: string) => y !== yearToDelete);
      const nextYear = activeYear === yearToDelete ? remaining[0] || '2026' : activeYear;
      setActiveYear(nextYear);
      fetchClientDetail(clientDetail.client.id, nextYear);
      fetchClients();
    } catch (err) {
      console.error('Error deleting tax year:', err);
      alert('An error occurred while deleting the tax year.');
    }
  };

  // Auto-refresh client drawer for live chat replies and document uploads
  useEffect(() => {
    if (!selectedClientId) return;
    const interval = setInterval(() => {
      fetch(`/api/admin/clients/${selectedClientId}?year=${activeYear}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setClientDetail(data);
          }
        })
        .catch(() => {});
    }, 3500);

    return () => clearInterval(interval);
  }, [selectedClientId, activeYear]);

  // Handle Admin Closing a Support Ticket
  const handleCloseAdminTicket = async (ticketId: string) => {
    if (!confirm('Mark this inquiry as RESOLVED and close the chat?')) return;
    try {
      const res = await fetch('/api/portal/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status: 'RESOLVED' }),
      });
      if (res.ok && selectedClientId) {
        fetchClientDetail(selectedClientId, activeYear);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Admin Reopening a Closed Ticket
  const handleReopenAdminTicket = async (ticketId: string) => {
    try {
      setIsReopeningTicket(true);
      const res = await fetch('/api/portal/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status: 'OPEN' }),
      });
      if (res.ok && selectedClientId) {
        setReplyTicketId(ticketId);
        await fetchClientDetail(selectedClientId, activeYear);
        setTimeout(() => {
          const el = document.getElementById(`admin-reply-${ticketId}`);
          if (el) (el as HTMLInputElement).focus();
        }, 300);
      }
    } catch (err) {
      console.error('Error reopening ticket:', err);
    } finally {
      setIsReopeningTicket(false);
    }
  };

  // Fetch admin notifications
  const fetchAdminNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setAdminNotifications(data.notifications || []);
      }
    } catch {}
  };

  // Handle Clicking Admin Notification
  const handleAdminNotificationClick = (notif: any) => {
    setShowAdminNotifMenu(false);
    if (!notif) return;

    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: notif.id }),
    }).catch(() => {});

    let targetClientId: string | undefined;
    if (notif.link) {
      const match = notif.link.match(/clientId=([^&#]+)/);
      if (match) targetClientId = match[1];
    }

    if (targetClientId) {
      setSelectedClientId(targetClientId);
      fetchClientDetail(targetClientId, activeYear);
      setTimeout(() => {
        const chatEl = document.getElementById('advisor-chat');
        if (chatEl) chatEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  };

  // URL search param deep link listener
  useEffect(() => {
    const cid = searchParams.get('clientId');
    if (cid && cid !== selectedClientId) {
      setSelectedClientId(cid);
      fetchClientDetail(cid, activeYear);
      setTimeout(() => {
        const chatEl = document.getElementById('advisor-chat');
        if (chatEl) chatEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [searchParams]);

  // Live FCM notification listener for admin
  useEffect(() => {
    fetchAdminNotifications();

    let unsubFcm: any;
    onFcmMessage((payload) => {
      console.log('Admin live FCM message received:', payload);
      const title = payload.notification?.title || 'Client Message Received';
      const body = payload.notification?.body || '';
      const link = payload.data?.link || '';

      let incomingClientId: string | undefined;
      if (link) {
        const match = link.match(/clientId=([^&#]+)/);
        if (match) incomingClientId = match[1];
      }

      setLiveToast({ title, body, clientId: incomingClientId });
      fetchClients();
      fetchAdminNotifications();
      if (selectedClientId) {
        fetchClientDetail(selectedClientId, activeYear);
      }
    }).then((unsub) => {
      unsubFcm = unsub;
    });

    return () => {
      if (typeof unsubFcm === 'function') unsubFcm();
    };
  }, [selectedClientId, activeYear]);

  const handleSelectClient = (client: any) => {
    setSelectedClientId(client.id);
    fetchClientDetail(client.id);
  };

  // Handle Approve Account (Admin Gate)
  const handleApproveClient = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        fetchClients();
        if (selectedClientId === userId) {
          fetchClientDetail(userId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Edit Phone
  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClient || !newPhoneInput) return;
    setEditLoading(true);

    try {
      const res = await fetch('/api/admin/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editClient.id,
          phone: newPhoneInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update phone');

      setShowEditPhoneModal(false);
      fetchClients();
      if (selectedClientId === editClient.id) {
        fetchClientDetail(editClient.id);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Status Transition
  const handleStatusChange = async (newStatus: string) => {
    if (!clientDetail?.client?.id) return;
    setStatusLoading(true);

    try {
      const res = await fetch('/api/admin/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: clientDetail.client.id,
          taxYear: activeYear,
          newStatus,
          estimatedRefund: estimateRefundInput,
          feeAmount: feeAmountInput,
          adminNotes: adminNotesInput,
        }),
      });

      if (res.ok) {
        fetchClientDetail(clientDetail.client.id, activeYear);
        fetchClients();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle Admin Document Upload
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !clientDetail?.client?.id) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('taxYear', activeYear);
      formData.append('category', uploadCategory);
      formData.append('targetUserId', clientDetail.client.id);

      const res = await fetch('/api/portal/documents', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      setUploadFile(null);
      fetchClientDetail(clientDetail.client.id, activeYear);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Admin Ticket Reply
  const handleSendTicketReply = async (ticketId: string) => {
    if (!replyText.trim() || !clientDetail?.client?.id) return;
    setIsSendingReply(true);

    try {
      const res = await fetch('/api/portal/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          message: replyText.trim(),
          targetUserId: clientDetail.client.id,
        }),
      });

      if (res.ok) {
        setReplyText('');
        fetchClientDetail(clientDetail.client.id, activeYear);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingReply(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/portal');
  };

  const statusOptions = [
    { key: 'ALL', label: 'All Clients' },
    { key: 'PENDING_APPROVAL', label: 'Pending Approval' },
    { key: 'INITIATED', label: 'Initiated' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'PAYMENT_RECEIVED', label: 'Payment Received' },
  ];

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f7f4c8' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Live Incoming Message Toast for Admin */}
        {liveToast && (
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-4 border border-amber-400/40 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-amber-200">{liveToast.title}</p>
                <p className="text-xs text-slate-300 mt-0.5 leading-snug">{liveToast.body}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {liveToast.clientId && (
                <Button
                  size="sm"
                  onClick={() => {
                    const cid = liveToast.clientId;
                    setLiveToast(null);
                    if (cid) {
                      setSelectedClientId(cid);
                      fetchClientDetail(cid, activeYear);
                      setTimeout(() => {
                        const chatEl = document.getElementById('advisor-chat');
                        if (chatEl) chatEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 400);
                    }
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs h-7 px-3 rounded-lg"
                >
                  Open & Reply
                </Button>
              )}
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

        {/* Admin Header */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-lg border border-amber-200/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-sm border border-amber-100 flex items-center justify-center shrink-0">
              <img src="/navLogo.webp" alt="Advora" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/70 text-amber-900 text-[10px] font-bold tracking-wide">
                <ShieldCheck className="w-3 h-3 text-amber-800" />
                <span>Advora Tax Practice Management</span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 font-raleway">
                Admin Command Center
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Admin Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAdminNotifMenu(!showAdminNotifMenu);
                  fetchAdminNotifications();
                }}
                className="p-2 rounded-xl bg-amber-100/70 hover:bg-amber-200/80 text-amber-950 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {adminNotifications.some((n) => !n.isRead) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                )}
              </button>

              {/* Notification Popover */}
              {showAdminNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-amber-200 p-3 z-50 text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold text-gray-900 border-b border-gray-100 pb-2">
                    <span>Client Inquiries & Alerts</span>
                    <button
                      onClick={() => {
                        fetch('/api/notifications', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ markAllAsRead: true }),
                        }).then(() => fetchAdminNotifications());
                      }}
                      className="text-[10px] text-amber-800 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                    {adminNotifications.length ? (
                      adminNotifications.map((n: any) => (
                        <div
                          key={n.id}
                          onClick={() => handleAdminNotificationClick(n)}
                          className="p-2.5 bg-amber-50/50 hover:bg-amber-100/70 rounded-xl border border-amber-200/60 cursor-pointer space-y-1 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <p className="font-bold text-gray-900 text-xs truncate">{n.title}</p>
                            <span className="text-[9px] text-gray-400 font-mono">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-600 text-[11px] line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 py-4 text-center">No notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-amber-400/40 text-amber-950 hover:bg-amber-100 rounded-xl text-xs flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white/90 p-3.5 rounded-2xl border border-amber-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Clients</span>
            <span className="text-xl font-black text-gray-900">{stats.totalClients || 0}</span>
          </div>
          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-300 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">Pending Review</span>
            <span className="text-xl font-black text-amber-900">{stats.pendingApprovalCount || 0}</span>
          </div>
          <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-blue-800 block">In Progress</span>
            <span className="text-xl font-black text-blue-900">{stats.inProgressCount || 0}</span>
          </div>
          <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-purple-800 block">Completed</span>
            <span className="text-xl font-black text-purple-900">{stats.completedCount || 0}</span>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 shadow-sm col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Paid & Settled</span>
            <span className="text-xl font-black text-emerald-900">{stats.paymentReceivedCount || 0}</span>
          </div>
        </div>

        {/* Controls: Search & Filters */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-md border border-amber-200 flex flex-col md:flex-row justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-amber-200 text-xs py-2"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === opt.key
                    ? 'gradient-brand text-white shadow-sm'
                    : 'bg-amber-50 hover:bg-amber-100 text-gray-700 border border-amber-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Client Directory Table */}
        <Card className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-amber-200/60 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-amber-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold font-raleway text-gray-900">Client Tax Filings</h2>
              <p className="text-xs text-gray-500">Click a client's name to view their complete tax details and documents</p>
            </div>
            <span className="text-xs font-bold text-gray-500">{clients.length} Clients Found</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/70 text-gray-700 font-bold border-b border-amber-200/60 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Tax Years</th>
                  <th className="py-3 px-4">Application Status</th>
                  <th className="py-3 px-4">Account Gate</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((c) => {
                  const latestApp = c.applications?.[0];
                  const status = latestApp?.status || 'INITIATED';

                  return (
                    <tr key={c.id} className="hover:bg-amber-50/40 transition-colors">
                      {/* Name */}
                      <td className="py-3 px-4 font-bold text-amber-900 cursor-pointer hover:underline" onClick={() => handleSelectClient(c)}>
                        {c.firstName} {c.lastName}
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 font-mono font-medium text-gray-800">
                        {c.phone}
                      </td>

                      {/* Tax Years */}
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {c.taxYears?.map((ty: any) => (
                            <span key={ty.id} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold">
                              {ty.year}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            status === 'COMPLETED'
                              ? 'bg-purple-100 text-purple-900'
                              : status === 'PAYMENT_RECEIVED'
                              ? 'bg-emerald-100 text-emerald-900'
                              : status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Gate */}
                      <td className="py-3 px-4">
                        {c.status === 'PENDING_APPROVAL' ? (
                          <span className="text-amber-800 font-bold bg-amber-200/70 px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> Pending
                          </span>
                        ) : (
                          <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(c.updatedAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1">
                        {c.status === 'PENDING_APPROVAL' && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveClient(c.id)}
                            className="text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white py-1 px-2.5 rounded-lg h-7"
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditClient(c);
                            setNewPhoneInput(c.phone);
                            setShowEditPhoneModal(true);
                          }}
                          className="text-[11px] border-amber-300 text-amber-900 py-1 px-2 h-7"
                          title="Edit phone number without losing data"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSelectClient(c)}
                          className="text-[11px] gradient-brand text-white py-1 px-2.5 rounded-lg h-7"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* ===================================================================== */}
      {/* CLIENT DETAIL MODAL / DRAWER                                          */}
      {/* ===================================================================== */}
      {selectedClientId && clientDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-amber-300 p-6 space-y-6 relative">
            
            {/* Close Button */}
            <button
              onClick={() => { setSelectedClientId(null); setClientDetail(null); }}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Details */}
            <div className="border-b border-amber-100 pb-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-raleway text-gray-900">
                  {clientDetail.client.firstName} {clientDetail.client.lastName}
                </h2>
                <span className="text-xs font-mono bg-amber-100 px-2 py-0.5 rounded-lg text-amber-900">
                  ID: {clientDetail.client.id.slice(0, 8)}
                </span>
                {clientDetail.client.status === 'PENDING_APPROVAL' && (
                  <Button
                    size="sm"
                    onClick={() => handleApproveClient(clientDetail.client.id)}
                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg h-7 ml-2"
                  >
                    Approve Portal Access
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <span>Phone: <strong className="font-mono text-gray-900">{clientDetail.client.phone}</strong></span>
                {clientDetail.client.email && <span>Email: <strong>{clientDetail.client.email}</strong></span>}
                <span>Current Status: <strong className="text-amber-900">{clientDetail.activeApplication?.status}</strong></span>
                <span>Last Updated: <strong>{new Date(clientDetail.client.updatedAt).toLocaleDateString()}</strong></span>
              </div>

              {/* Tax Year Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-bold text-gray-500">Tax Year:</span>
                {clientDetail.taxYears?.map((yr: string) => (
                  <div
                    key={yr}
                    className={`inline-flex items-center rounded-xl p-0.5 border transition-all ${
                      activeYear === yr ? 'bg-amber-800 text-white border-amber-900 shadow-sm' : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveYear(yr);
                        fetchClientDetail(clientDetail.client.id, yr);
                      }}
                      className="px-2.5 py-1 text-xs font-bold"
                    >
                      {yr}
                    </button>
                    {clientDetail.taxYears.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteYearForClient(yr);
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          activeYear === yr
                            ? 'text-amber-200 hover:text-white hover:bg-amber-700/60'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title={`Delete Tax Year ${yr} for this client`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleAddYearForClient}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1"
                  title="Add another tax year for this client"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Year</span>
                </button>
              </div>
            </div>

            {/* STATUS TRANSITION CONTROLS (Stage 1 to 5) */}
            <div className="space-y-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                Application Status Workflow Progression ({activeYear})
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  onClick={() => handleStatusChange('INITIATED')}
                  disabled={statusLoading}
                  className={`text-xs py-2.5 rounded-xl font-bold ${
                    clientDetail.activeApplication?.status === 'INITIATED'
                      ? 'bg-amber-800 text-white ring-2 ring-amber-400'
                      : 'bg-white text-gray-700 border hover:bg-amber-100'
                  }`}
                >
                  1. INITIATED
                </Button>

                <Button
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  disabled={statusLoading}
                  className={`text-xs py-2.5 rounded-xl font-bold ${
                    clientDetail.activeApplication?.status === 'IN_PROGRESS'
                      ? 'bg-blue-700 text-white ring-2 ring-blue-400'
                      : 'bg-white text-gray-700 border hover:bg-blue-50'
                  }`}
                >
                  2. IN PROGRESS
                </Button>

                <Button
                  onClick={() => handleStatusChange('COMPLETED')}
                  disabled={statusLoading}
                  className={`text-xs py-2.5 rounded-xl font-bold ${
                    clientDetail.activeApplication?.status === 'COMPLETED'
                      ? 'bg-purple-700 text-white ring-2 ring-purple-400'
                      : 'bg-white text-gray-700 border hover:bg-purple-50'
                  }`}
                >
                  3. COMPLETED
                </Button>

                <Button
                  onClick={() => handleStatusChange('PAYMENT_RECEIVED')}
                  disabled={statusLoading}
                  className={`text-xs py-2.5 rounded-xl font-bold ${
                    clientDetail.activeApplication?.status === 'PAYMENT_RECEIVED'
                      ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                      : 'bg-white text-gray-700 border hover:bg-emerald-50'
                  }`}
                >
                  4. PAYMENT RECEIVED
                </Button>
              </div>

              {/* Estimate / Pricing / Notes Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Estimated Refund ($)</label>
                  <Input
                    type="number"
                    placeholder="3500.00"
                    value={estimateRefundInput}
                    onChange={(e) => setEstimateRefundInput(e.target.value)}
                    className="rounded-xl border-amber-200 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Preparation Fee ($)</label>
                  <Input
                    type="number"
                    placeholder="250.00"
                    value={feeAmountInput}
                    onChange={(e) => setFeeAmountInput(e.target.value)}
                    className="rounded-xl border-amber-200 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Preparer Notes for Client</label>
                  <Input
                    placeholder="e.g. 1040 draft is ready"
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    className="rounded-xl border-amber-200 text-xs"
                  />
                </div>
              </div>

              <div className="text-right pt-1">
                <Button
                  size="sm"
                  onClick={() => handleStatusChange(clientDetail.activeApplication?.status || 'INITIATED')}
                  disabled={statusLoading}
                  className="gradient-brand text-white text-xs px-4 py-1.5 rounded-xl"
                >
                  Save Estimates & Notes
                </Button>
              </div>
            </div>

            {/* DOCUMENT MANAGEMENT SECTION */}
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-gray-900 border-b pb-2">
                Document Management & Uploads ({activeYear})
              </h3>

              {/* Upload New Document Form */}
              <form onSubmit={handleUploadDocument} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <span className="font-bold text-gray-800 block">Upload Document as Tax Preparer</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-600 block mb-1">Select Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(e: any) => setUploadCategory(e.target.value)}
                      className="w-full py-1.5 px-3 rounded-xl border border-gray-300 text-xs"
                    >
                      <option value="ESTIMATE">Estimate Quotation Document</option>
                      <option value="DRAFT_COPY">Draft Tax Return Copy</option>
                      <option value="FILED_FINAL">Filed Final Copy</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-600 block mb-1">Choose File</label>
                    <input
                      type="file"
                      required
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadFile(e.target.files[0]);
                        }
                      }}
                      className="text-xs file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-900 file:font-semibold"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="gradient-brand text-white text-xs py-1.5 px-4 rounded-xl"
                >
                  {isUploading ? 'Uploading...' : 'Upload & Notify Client'}
                </Button>
              </form>

              {/* Categorized Document Listing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Admin Files */}
                <div className="space-y-2 bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-900 block">Prepared Files (Estimate, Draft, Final)</span>
                  {[...(clientDetail.documents.estimates || []), ...(clientDetail.documents.drafts || []), ...(clientDetail.documents.finals || [])].map((d: any) => (
                    <div key={d.id} className="p-2 bg-white rounded-lg border border-amber-100 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-semibold block truncate max-w-[180px]">{d.name}</span>
                        <span className="text-[10px] text-gray-400">{d.category}</span>
                      </div>
                      <Button asChild size="sm" variant="ghost" className="h-6 w-6 p-0 text-amber-900">
                        <a href={d.fileUrl} target="_blank" download>
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Client Supporting Files */}
                <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-800 block">Client Uploaded Supporting Files</span>
                  {clientDetail.documents.supporting?.length ? (
                    clientDetail.documents.supporting.map((d: any) => (
                      <div key={d.id} className="p-2 bg-white rounded-lg border border-gray-200 flex justify-between items-center text-[11px]">
                        <div>
                          <span className="font-semibold block truncate max-w-[180px]">{d.name}</span>
                          <span className="text-[10px] text-gray-400">{(d.fileSize / 1024).toFixed(0)} KB</span>
                        </div>
                        <Button asChild size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-700">
                          <a href={d.fileUrl} target="_blank" download>
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic text-[11px]">No supporting files uploaded yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* AUDIT TRAIL LOG */}
            <div className="space-y-2 text-xs pt-2 border-t">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-800" />
                <span>Audit History Trail</span>
              </h3>
              <div className="max-h-40 overflow-y-auto space-y-1.5 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                {clientDetail.auditLogs?.map((log: any) => (
                  <div key={log.id} className="text-[11px] flex justify-between text-gray-600 border-b border-gray-200 pb-1">
                    <span>
                      <strong className="text-gray-900">{log.action}:</strong> {log.details}
                    </span>
                    <span className="font-mono text-gray-400 shrink-0 ml-2">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SUPPORT CHAT THREAD */}
            <div id="advisor-chat" className="space-y-3 text-xs pt-2 border-t scroll-mt-6">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-800" />
                <span>Support Inquiries & Chat</span>
              </h3>

              {clientDetail.tickets?.map((t: any) => {
                const isClosed = t.status === 'RESOLVED' || t.status === 'CLOSED';

                return (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-2xl border space-y-2.5 transition-all ${
                      isClosed ? 'bg-stone-50/80 border-stone-200' : 'bg-amber-50/60 border-amber-200'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold text-gray-900">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="truncate">{t.subject}</span>
                        {isClosed ? (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold shrink-0">
                            Archived (Closed)
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Live ({t.status})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isClosed ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReopenAdminTicket(t.id)}
                            disabled={isReopeningTicket}
                            className="text-[10px] h-6 text-amber-900 border-amber-300 hover:bg-amber-100 rounded-full flex items-center gap-1 font-semibold"
                            title="Reopen this inquiry to resume messaging"
                          >
                            {isReopeningTicket ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RotateCcw className="w-2.5 h-2.5" />}
                            Reopen Chat
                          </Button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCloseAdminTicket(t.id)}
                            className="text-[10px] text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full font-semibold"
                            title="Close this conversation"
                          >
                            End Chat
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Messages Scroll List */}
                    <div className="space-y-1.5 max-h-60 overflow-y-auto p-2.5 bg-white/80 rounded-xl border border-stone-200/70">
                      {t.messages?.map((m: any) => (
                        <div
                          key={m.id}
                          className={`p-2 rounded-xl text-xs ${
                            m.senderRole === 'CLIENT'
                              ? 'bg-white shadow-xs border border-stone-200/80 text-slate-900'
                              : 'bg-amber-100/90 text-amber-950 font-medium'
                          }`}
                        >
                          <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                            <span className="font-bold">{m.senderName}</span>
                            <span className="font-mono">
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{m.message}</p>
                        </div>
                      ))}
                    </div>

                    {/* Action Bar: If Closed -> Show archived notice; If Open -> Show reply input */}
                    {isClosed ? (
                      <div className="p-2.5 bg-stone-100/90 rounded-xl text-xs text-stone-600 border border-stone-200 flex items-center justify-between">
                        <span>Chat ended. Past conversation is preserved in read-only mode.</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReopenAdminTicket(t.id)}
                          className="text-xs h-6 text-amber-900 font-bold hover:bg-amber-100"
                        >
                          Reopen to reply
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-1">
                        <Input
                          ref={replyTicketId === t.id ? adminReplyInputRef : undefined}
                          id={`admin-reply-${t.id}`}
                          placeholder="Type response to client (Press Enter to send)..."
                          value={replyTicketId === t.id ? replyText : ''}
                          onChange={(e) => {
                            setReplyTicketId(t.id);
                            setReplyText(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendTicketReply(t.id);
                            }
                          }}
                          className="rounded-xl border-amber-200 text-xs py-1.5 bg-white"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSendTicketReply(t.id)}
                          disabled={isSendingReply || (replyTicketId === t.id && !replyText.trim())}
                          className="gradient-brand text-white text-xs px-4 rounded-xl shrink-0"
                        >
                          {isSendingReply && replyTicketId === t.id ? 'Sending...' : 'Reply'}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* EDIT PHONE MODAL                                                      */}
      {/* ===================================================================== */}
      {showEditPhoneModal && editClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-amber-300 space-y-4">
            <h3 className="text-base font-bold font-raleway text-gray-900">
              Update Client Phone Number
            </h3>
            <p className="text-xs text-gray-600">
              Updating the phone number for <strong>{editClient.firstName} {editClient.lastName}</strong>. All tax documents, applications, and history linked to ID <code className="font-mono font-bold bg-gray-100 px-1">{editClient.id.slice(0, 8)}</code> will remain 100% intact.
            </p>
            <form onSubmit={handleUpdatePhone} className="space-y-3">
              <Input
                type="tel"
                required
                placeholder="e.g. +919493395299"
                value={newPhoneInput}
                onChange={(e) => setNewPhoneInput(e.target.value)}
                className="font-mono text-center text-base py-2"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditPhoneModal(false)}
                  className="w-1/2 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editLoading}
                  className="w-1/2 gradient-brand text-white font-bold rounded-xl text-xs"
                >
                  {editLoading ? 'Updating...' : 'Save Phone'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7f4c8' }}>
          <div className="text-center space-y-2">
            <Loader2 className="w-8 h-8 text-amber-900 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-amber-950">Loading Admin Command Center...</p>
          </div>
        </div>
      }
    >
      <AdminPortalContent />
    </Suspense>
  );
}
