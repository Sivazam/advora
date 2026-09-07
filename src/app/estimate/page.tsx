'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Shield,
  Loader2,
  ArrowLeft,
  Phone,
  User,
} from 'lucide-react';

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.xlsx', '.xls', '.docx', '.doc'];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export default function GeneralPublicEstimatePage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      setIsLoggedIn(!!localStorage.getItem('advora_session_role'));
    } catch (e) {}
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const fileName = file.name.toLowerCase();
    const isAllowed = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

    if (!isAllowed) {
      setValidationError('Supported file formats: PDF, PNG, JPG, Excel, Word.');
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError('File exceeds the maximum limit of 25MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setValidationError('Please enter both your first and last name.');
      return;
    }

    const cleanDigits = phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!selectedFile) {
      setValidationError('Please select a tax document to upload.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('firstName', firstName.trim());
      formData.append('lastName', lastName.trim());
      formData.append('phone', phone.trim());
      formData.append('document', selectedFile);
      formData.append('taxYear', new Date().getFullYear().toString());

      const res = await fetch('/api/portal/intake', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'We were unable to upload your document. Please try again.');

      setSubmittedSuccess(true);
      setReferenceId(data.applicationId?.slice(0, 8)?.toUpperCase() || 'EST-' + Math.floor(10000 + Math.random() * 90000));
    } catch (err: any) {
      setValidationError(err.message || 'We were unable to upload your document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-900 flex flex-col justify-between py-4 px-4 sm:px-6">
      {/* Top Bar Navigation */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between pt-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-stone-200/80 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <Link
          href={isLoggedIn ? "/portal/client" : "/portal"}
          className="text-[11px] font-bold text-amber-900 hover:underline flex items-center gap-1"
        >
          <Shield className="w-3.5 h-3.5 text-amber-800" />
          <span>{isLoggedIn ? "Go to Portal →" : "Client Portal Login"}</span>
        </Link>
      </div>

      {/* Main Content Area (Compact zero-scroll desktop layout) */}
      <div className="w-full max-w-md mx-auto my-auto space-y-3.5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="mx-auto w-11 h-11 flex items-center justify-center bg-white rounded-xl shadow-2xs border border-stone-200 p-1.5">
            <img
              src="/navLogo.webp"
              alt="Advora Services"
              width={40}
              height={40}
              className="object-contain"
              loading="eager"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block">
              Tax Estimation Portal
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1 font-raleway">
              Submit Information for Estimation
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5 leading-snug">
              Upload your tax records to receive a complimentary refund calculation and quote from our licensed CPAs.
            </p>
          </div>
        </div>

        {/* Estimation Card */}
        <Card className="bg-white border-stone-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="px-5 py-3.5 border-b border-stone-100 bg-stone-50/60">
            <CardTitle className="text-sm font-bold text-slate-900">
              Personal Information & Document
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Mandatory fields are marked with *. Single-page instant submission.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5">
            {submittedSuccess ? (
              /* Success View */
              <div className="text-center space-y-3 py-3">
                <div className="w-11 h-11 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-slate-900">
                    Your estimation is in progress!
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                    We have received your tax records. Your account has been initialized and our tax preparers are reviewing your documents.
                  </p>
                </div>

                {referenceId && (
                  <div className="bg-stone-50 px-3.5 py-1.5 rounded-xl border border-stone-200 inline-block text-xs font-mono text-slate-700">
                    Reference ID: <strong className="text-slate-900">{referenceId}</strong>
                  </div>
                )}

                <div className="pt-2">
                  <Link href="/portal">
                    <Button className="text-xs h-10 w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs">
                      Sign In with Your Phone to Track Status →
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-3">
                {validationError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">First Name *</Label>
                    <Input
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="text-xs h-10 bg-white border-stone-300 rounded-xl focus:border-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">Last Name *</Label>
                    <Input
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="text-xs h-10 bg-white border-stone-300 rounded-xl focus:border-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <Input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 text-xs h-10 bg-white border-stone-300 rounded-xl focus:border-slate-900 font-mono tracking-wide"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Upload Document *</Label>
                  <div className="relative border-2 border-dashed border-stone-300 hover:border-amber-400/80 bg-stone-50/50 hover:bg-amber-50/30 rounded-xl p-3.5 text-center transition-all cursor-pointer group">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.docx,.doc"
                    />
                    <div className="space-y-1 pointer-events-none">
                      <UploadCloud className="w-6 h-6 text-stone-400 group-hover:text-amber-800 mx-auto transition-colors" />
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-950">
                          <FileText className="w-3.5 h-3.5 text-amber-800" />
                          <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            ({(selectedFile.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs font-semibold text-slate-800">
                            Click to select tax document
                          </p>
                          <p className="text-[10px] text-slate-400">
                            PDF, PNG, JPG, Excel, Word (Max 25MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-10 rounded-xl shadow-xs transition-all mt-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading & Processing...
                    </>
                  ) : (
                    'Submit / Get Estimation'
                  )}
                </Button>
              </form>
            )}

            <div className="pt-3 mt-3 border-t border-stone-100 text-center">
              <span className="text-xs text-slate-500">
                Already submitted or have an account?{' '}
                <Link href="/portal" className="text-amber-900 font-bold hover:underline">
                  Sign In to Client Portal →
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Security & Trust Footnote */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-3 pt-0.5">
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
      <div className="text-center text-[11px] text-slate-400 pb-1">
        © {new Date().getFullYear()} Advora Services. All rights reserved.
      </div>
    </div>
  );
}
