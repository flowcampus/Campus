import axios from 'axios';

const { SMS_API_KEY, SMS_USERNAME, SMS_API_URL, SMS_SENDER_ID } = process.env;

if (!SMS_API_URL) {
  // eslint-disable-next-line no-console
  console.warn('SMS_API_URL is not set. SMS sending will be disabled.');
}

export interface SendSmsOptions {
  to: string | string[];
  message: string;
  fromOverride?: string;
}

function normalizeRecipients(to: string | string[]): string {
  return Array.isArray(to) ? to.join(',') : to;
}

export async function sendSms({ to, message, fromOverride }: SendSmsOptions) {
  if (!SMS_API_URL || !SMS_API_KEY || !SMS_USERNAME) {
    throw new Error('SMS is not configured. Please set SMS_API_URL, SMS_API_KEY, and SMS_USERNAME.');
  }

  const payload = new URLSearchParams({
    username: SMS_USERNAME as string,
    to: normalizeRecipients(to),
    message,
  });

  const from = fromOverride || SMS_SENDER_ID;
  if (from) payload.append('from', from);

  const res = await axios.post(SMS_API_URL as string, payload.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      apikey: SMS_API_KEY as string,
    },
    timeout: 15000,
  });

  return res.data;
}

export async function sendBulkSms(items: SendSmsOptions[]) {
  const results: any[] = [];
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    const r = await sendSms(item);
    results.push(r);
  }
  return results;
}
