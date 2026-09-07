'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  Phone,
  User,
  Mail,
  Shield,
  Loader2,
  Calendar,
  UploadCloud,
} from 'lucide-react';

export default function PortalLandingPage() {
  const router = useRouter();

  // Auth steps: 'PHONE' -> 'OTP' -> 'REGISTER' (only for new users)
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'REGISTER'>('PHONE');

  // Phone & OTP state
  const [phone, setPhone] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New User Registration Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const currentYearStr = new Date().getFullYear().toString();
  const [taxYear, setTaxYear] = useState(currentYearStr);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanDigits = phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSendingOtp(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code.');

      setVerifiedPhone(phone);
      setStep('OTP');
      setSuccessMessage('A 6-digit verification code has been dispatched to your number.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to dispatch verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (otp.length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: verifiedPhone, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed.');

      if (data.isNewUser) {
        // New client: transition to registration form
        setStep('REGISTER');
        setSuccessMessage('Phone verified. Please enter your profile details.');
      } else {
        // Existing client or admin: redirect directly
        router.push(data.redirectUrl || '/portal/client');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Step 3: Complete Registration for New Users
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Please provide both your First Name and Last Name.');
      return;
    }

    setIsRegistering(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: verifiedPhone,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || null,
          taxYear,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      // Successfully registered and session issued
      router.push(data.redirectUrl || '/portal/client');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not complete registration. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-900 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full space-y-5">
        
        {/* Enterprise Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="mx-auto w-14 h-14 flex items-center justify-center bg-white rounded-2xl shadow-xs border border-stone-200 p-2">
            <img
              src="/navLogo.webp"
              alt="Advora Services"
              width={48}
              height={48}
              className="object-contain"
              loading="eager"
            />
          </div>

          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block">
              Tax & Financial Services Portal
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1.5 font-raleway">
              Advora Client Portal
            </h1>
            <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1 leading-relaxed">
              Secure client access for tax return preparation, document management, and refund tracking.
            </p>
          </div>
        </div>

        {/* Main Authentication Card */}
        <Card className="bg-white border-stone-200 shadow-sm rounded-2xl overflow-hidden">
          {/* STEP 1: PHONE ENTRY */}
          {step === 'PHONE' && (
            <>
              <CardHeader className="px-6 py-4 border-b border-stone-100 bg-stone-50/60">
                <CardTitle className="text-base font-bold text-slate-900">
                  Sign In with Mobile Number
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Enter your mobile number. New clients and existing users will be automatically recognized.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 block">Mobile Phone Number</Label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <Input
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 text-xs h-10 bg-white border-stone-300 rounded-xl focus:border-slate-900 font-mono tracking-wide"
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 pl-0.5">
                      We will send a 6-digit one-time verification code.
                    </p>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs text-slate-600 flex items-center justify-between">
                    <span className="text-[11px] font-medium">Demo Verification Code:</span>
                    <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-stone-300">
                      123456
                    </span>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-11 rounded-xl shadow-xs transition-all"
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Dispatching Verification Code...
                      </>
                    ) : (
                      'Continue with Mobile Number'
                    )}
                  </Button>
                </form>

                {/* Quick Link to Free Estimation */}
                <div className="pt-4 border-t border-stone-100 text-center space-y-2">
                  <p className="text-[11px] text-slate-500">
                    Need a complimentary tax calculation or quote first?
                  </p>
                  <Link
                    href="/estimate"
                    className="inline-flex items-center justify-center gap-1.5 w-full text-xs font-bold text-amber-950 bg-amber-50/90 hover:bg-amber-100 border border-amber-300 py-2.5 px-3 rounded-xl transition-all shadow-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-amber-800" />
                    <span>Upload Documents for Free Estimate (No Login Required) →</span>
                  </Link>
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'OTP' && (
            <>
              <CardHeader className="px-6 py-4 border-b border-stone-100 bg-stone-50/60">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Verify Mobile Number
                  </CardTitle>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('PHONE');
                      setOtp('');
                      setErrorMessage(null);
                    }}
                    className="text-xs text-amber-900 hover:underline font-semibold"
                  >
                    Change Number
                  </button>
                </div>
                <CardDescription className="text-xs text-slate-500 mt-1">
                  Verification code dispatched to <strong className="font-mono text-slate-800">{verifiedPhone}</strong>.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {successMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="space-y-2 text-center">
                    <Label className="text-xs font-semibold text-slate-700 block">Enter 6-Digit Code</Label>
                    <Input
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="text-center font-mono text-xl tracking-[0.3em] h-12 bg-white border-stone-300 rounded-xl focus:border-slate-900 max-w-[220px] mx-auto block"
                      required
                      autoFocus
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isVerifyingOtp || otp.length < 6}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-11 rounded-xl shadow-xs"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying Code...
                      </>
                    ) : (
                      'Verify & Continue'
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {/* STEP 3: NEW USER REGISTRATION */}
          {step === 'REGISTER' && (
            <>
              <CardHeader className="px-6 py-4 border-b border-stone-100 bg-stone-50/60">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold w-fit mb-1 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>Number Verified: {verifiedPhone}</span>
                </div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Complete Your Profile
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Please provide your details to initialize your tax client workspace.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">First Name *</Label>
                      <Input
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="text-xs h-10 bg-white border-stone-300 rounded-xl focus:border-slate-900"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Last Name *</Label>
                      <Input
                        placeholder="Smith"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="text-xs h-10 bg-white border-stone-300 rounded-xl focus:border-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Email Address (Optional)</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 text-xs h-10 bg-white border-stone-300 rounded-xl focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Primary Tax Year</Label>
                    <Select value={taxYear} onValueChange={setTaxYear}>
                      <SelectTrigger className="text-xs h-10 bg-white border-stone-300 rounded-xl">
                        <SelectValue placeholder="Select Tax Year" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-stone-200 rounded-xl">
                        <SelectItem value="2026" className="text-xs">
                          2026 Tax Year (Current Year / Advance Estimate)
                        </SelectItem>
                        <SelectItem value="2025" className="text-xs">
                          2025 Tax Year (Filing Return Year)
                        </SelectItem>
                        <SelectItem value="2024" className="text-xs">
                          2024 Tax Year (Prior Year Filing)
                        </SelectItem>
                        <SelectItem value="2023" className="text-xs">
                          2023 Tax Year (Prior Year Filing)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-11 rounded-xl shadow-xs mt-2"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Setting Up Workspace...
                      </>
                    ) : (
                      'Create Profile & Enter Portal'
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>

        {/* Security & Trust Footnote */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-3 pt-1">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" /> 256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-slate-400" /> Authorized IRS e-file Provider
          </span>
        </div>

      </div>

      {/* Global Copyright */}
      <div className="text-center text-[11px] text-slate-400 pt-6">
        © {new Date().getFullYear()} Advora Services. All rights reserved.
      </div>
    </div>
  );
}
