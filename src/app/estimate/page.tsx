'use client';

import React, { useState } from 'react';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const fileName = file.name.toLowerCase();
    const isAllowed = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

    if (!isAllowed) {
      setValidationError('The selected file type is not supported. Please upload a supported document (PDF, PNG, JPG, Excel, Word).');
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError('The selected file exceeds the maximum allowed file size of 25MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation Rules
    if (!firstName.trim()) {
      setValidationError('Please enter your first name.');
      return;
    }

    if (!lastName.trim()) {
      setValidationError('Please enter your last name.');
      return;
    }

    const cleanDigits = phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      setValidationError('Please enter a valid phone number.');
      return;
    }

    if (!selectedFile) {
      setValidationError('Please upload a document to continue.');
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
    <div className="min-h-screen bg-[#FBFBFA] text-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm border border-stone-200 p-2">
            <img
              src="/navLogo.webp"
              alt="Advora Services"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>

          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              Tax Estimation Portal
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2 font-raleway">
              Submit Information for Estimation
            </h1>
            <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
              Upload your tax records to receive a complimentary refund calculation and quote from our licensed CPAs.
            </p>
          </div>
        </div>

        {/* Estimation Card */}
        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-stone-100">
            <CardTitle className="text-base font-bold text-slate-900">
              Personal Information & Document
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Mandatory fields are marked with *. Single-page instant submission.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5">
            {submittedSuccess ? (
              /* Success View on Same Page */
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-slate-900">
                    Your estimation is in progress.
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                    We have received your information and document successfully. Our preparation desk will calculate your estimate and send details to your mobile number.
                  </p>
                </div>

                {referenceId && (
                  <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 inline-block text-xs font-mono text-slate-700">
                    Reference ID: <strong className="text-slate-900">{referenceId}</strong>
                  </div>
                )}

                <div className="pt-2">
                  <Link href="/portal">
                    <Button variant="outline" className="text-xs h-9 border-stone-300">
                      Sign in to Client Portal
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-slate-700">First Name *</Label>
                    <Input
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="text-xs h-9 bg-white border-stone-300"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-slate-700">Last Name *</Label>
                    <Input
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="text-xs h-9 bg-white border-stone-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-700">Phone Number *</Label>
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-xs h-9 bg-white border-stone-300 font-mono"
                    required
                  />
                </div>

                {/* Document Upload Area */}
                <div className="space-y-1 pt-1">
                  <Label className="text-xs font-medium text-slate-700">Upload Document *</Label>
                  <div className="border border-dashed border-stone-300 hover:border-slate-500 rounded-lg p-4 bg-stone-50/50 text-center relative cursor-pointer transition-colors">
                    <input
                      type="file"
                      id="estimate-file-upload"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx"
                    />
                    <label htmlFor="estimate-file-upload" className="cursor-pointer block">
                      <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                      {selectedFile ? (
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {selectedFile.name} uploaded successfully
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for submission
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium text-slate-700">
                            Click to select tax document (PDF, PNG, JPG, Excel, Word)
                          </p>
                          <p className="text-[10px] text-slate-400">Maximum file size: 25MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-10 rounded-lg shadow-sm mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting for Estimation...
                    </>
                  ) : (
                    'Submit / Get Estimation'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Navigation Link to Portal */}
        <div className="text-center text-xs text-slate-500">
          Already a client?{' '}
          <Link href="/portal" className="font-semibold text-slate-900 hover:underline">
            Sign In to Client Portal
          </Link>
        </div>

        {/* Security Footnote */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-3 pt-2">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" /> 256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-slate-400" /> Authorized IRS e-file Provider
          </span>
        </div>

      </div>
    </div>
  );
}
