import axios from 'axios';

interface SmsOptions {
  to: string;
  message: string;
}

class SmsService {
  private apiKey: string;
  private username: string;
  private apiUrl: string;
  private senderId: string;

  constructor() {
    this.apiKey = process.env.SMS_API_KEY || '';
    this.username = process.env.SMS_USERNAME || 'sandbox';
    this.apiUrl = process.env.SMS_API_URL || 'https://api.sandbox.africastalking.com/version1/messaging';
    this.senderId = process.env.SMS_SENDER_ID || 'Campus';
  }

  async sendSms(options: SmsOptions): Promise<boolean> {
    try {
      // Format phone number for Africa's Talking (ensure it starts with +)
      let phoneNumber = options.to;
      if (!phoneNumber.startsWith('+')) {
        // Assume Nigerian number if no country code
        phoneNumber = phoneNumber.startsWith('0') ? `+234${phoneNumber.slice(1)}` : `+234${phoneNumber}`;
      }

      const payload = {
        username: this.username,
        to: phoneNumber,
        message: options.message,
        from: this.senderId,
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'apiKey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      });

      console.log('SMS sent successfully:', response.data);
      return response.data.SMSMessageData?.Recipients?.[0]?.status === 'Success';
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  async sendPasswordResetSms(phone: string, resetCode: string): Promise<boolean> {
    const message = `Your Campus password reset code is: ${resetCode}. This code expires in 10 minutes. If you didn't request this, please ignore.`;
    
    return this.sendSms({
      to: phone,
      message,
    });
  }

  async sendOtpSms(phone: string, code: string, purpose: string): Promise<boolean> {
    const message = `Your Campus verification code for ${purpose} is: ${code}. This code expires in 10 minutes.`;
    
    return this.sendSms({
      to: phone,
      message,
    });
  }

  async sendWelcomeSms(phone: string, firstName: string): Promise<boolean> {
    const message = `Welcome to Campus, ${firstName}! Your account has been created successfully. Download our app and stay connected with your school community.`;
    
    return this.sendSms({
      to: phone,
      message,
    });
  }

  async sendParentLinkNotification(phone: string, childName: string): Promise<boolean> {
    const message = `You have been successfully linked to ${childName}'s account on Campus. You can now view their progress, attendance, and school updates.`;
    
    return this.sendSms({
      to: phone,
      message,
    });
  }
}

export default new SmsService();
