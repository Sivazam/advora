// SMS Dispatcher supporting Fast2SMS DLT & Dev Mode

interface SendOtpResult {
  success: boolean;
  message: string;
  devOtp?: string;
}

export async function sendOtpSms(phone: string, otp: string): Promise<SendOtpResult> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  const dltSenderId = process.env.FAST2SMS_DLT_SENDER_ID;
  const templateId = process.env.FAST2SMS_DLT_MESSAGE_TEMPLATE_ID;
  const isDevMode = process.env.DEV_MODE_OTP === 'true' || !apiKey;

  // Clean phone number (extract 10 digits for Indian numbers, or full E.164)
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

  if (isDevMode) {
    console.log(`\n========================================`);
    console.log(`📱 [DEV MODE OTP DISPATCH]`);
    console.log(`To: ${phone} (Clean: ${cleanPhone})`);
    console.log(`OTP Code: >>> ${otp} <<<`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`========================================\n`);

    return {
      success: true,
      message: 'OTP sent in Dev Mode',
      devOtp: otp,
    };
  }

  try {
    // Fast2SMS DLT API payload
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'dlt',
        sender_id: dltSenderId,
        message: templateId,
        variables_values: otp,
        flash: 0,
        numbers: cleanPhone,
      }),
    });

    const data = await response.json();

    if (data.return === true || data.status_code === 200) {
      return {
        success: true,
        message: 'SMS sent successfully',
      };
    } else {
      console.error('Fast2SMS Error:', data);
      return {
        success: false,
        message: data.message || 'Failed to send SMS via Fast2SMS',
      };
    }
  } catch (error: any) {
    console.error('SMS Send Exception:', error);
    return {
      success: false,
      message: error.message || 'Network error while sending SMS',
    };
  }
}
