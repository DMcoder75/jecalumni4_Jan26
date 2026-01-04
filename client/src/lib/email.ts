/**
 * Client-side email service utility.
 * This can be integrated with services like EmailJS, SendGrid (via API), or simply a mailto link.
 * For now, we'll implement a mock that logs to console and can be easily replaced with EmailJS.
 */

export interface EmailParams {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  [key: string]: any;
}

export const sendEmail = async (params: EmailParams): Promise<boolean> => {
  console.log('Sending email via client-side service:', params);
  
  // Example integration with EmailJS (requires account setup)
  /*
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'YOUR_SERVICE_ID',
        template_id: 'YOUR_TEMPLATE_ID',
        user_id: 'YOUR_PUBLIC_KEY',
        template_params: params
      })
    });
    return response.ok;
  } catch (error) {
    console.error('EmailJS error:', error);
    return false;
  }
  */

  // Mock success
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Email sent successfully (mock)');
      resolve(true);
    }, 1000);
  });
};

export const sendAdminNotification = async (type: string, data: any) => {
  const adminEmail = 'admin@jecmcaalumni.com'; // Replace with actual admin email
  
  let subject = '';
  let message = '';

  switch (type) {
    case 'signup-request':
      subject = 'New Signup Request - JEC MCA Alumni';
      message = `New signup request from ${data.firstName} ${data.lastName} (${data.email}).\n\nDescription: ${data.description}`;
      break;
    case 'password-reset':
      subject = 'Password Reset Request - JEC MCA Alumni';
      message = `Password reset request for ${data.email}.`;
      break;
    default:
      subject = 'Notification - JEC MCA Alumni';
      message = JSON.stringify(data);
  }

  return sendEmail({
    to_email: adminEmail,
    to_name: 'Admin',
    subject,
    message
  });
};
