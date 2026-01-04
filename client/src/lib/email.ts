import emailjs from '@emailjs/browser';

/**
 * Client-side email service utility using EmailJS.
 */

export interface EmailParams {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  password?: string; // Added for password sharing
  [key: string]: any;
}

// EmailJS Configuration from environment variables
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_v1qt4hi';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'v34hG0heoHqlXDIId';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_sendpwd'; 
const ADMIN_TEMPLATE_ID = 'template_newuser';

export const sendEmail = async (params: EmailParams, templateId: string = TEMPLATE_ID): Promise<boolean> => {
  console.log('Sending email via EmailJS:', params);
  
  try {
    const result = await emailjs.send(
      SERVICE_ID,
      templateId,
      {
        to_email: params.to_email,
        to_name: params.to_name,
        subject: params.subject,
        message: params.message,
        password: params.password || '', // Ensure password is sent if available
        ...params
      },
      PUBLIC_KEY
    );
    
    console.log('EmailJS Success:', result.text);
    return true;
  } catch (error) {
    console.error('EmailJS Error:', error);
    return false;
  }
};

/**
 * Specifically for sending user credentials
 */
export const sendUserCredentials = async (email: string, name: string, password: string, isNewAccount: boolean = true) => {
  const subject = isNewAccount ? 'Account Approved - JEC MCA Alumni' : 'Password Reset - JEC MCA Alumni';
  const message = isNewAccount 
    ? `Hello ${name},\n\nYour account has been approved. Your login credentials are provided below.`
    : `Hello ${name},\n\nYour password has been reset by the administrator. Your new login credentials are provided below.`;

  return sendEmail({
    to_email: email,
    to_name: name,
    subject,
    message,
    password, // This will be mapped to {{password}} in EmailJS template
    login_url: 'https://jecmcaalumni.web.app/auth'
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
    message,
    ...data // Pass all data to template
  }, ADMIN_TEMPLATE_ID);
};
