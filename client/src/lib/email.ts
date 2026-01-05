/**
 * Client-side email service utility using EmailJS REST API.
 * Mapped to match the specific template placeholders.
 */

export interface EmailParams {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  password?: string;
  first_name?: string;
  [key: string]: any;
}

// EmailJS Configuration
const SERVICE_ID = 'service_v1qt4hi';
const PUBLIC_KEY = 'v34hG0heoHqlXDIId';
const TEMPLATE_ID = 'template_sendpwd'; 
const ADMIN_TEMPLATE_ID = 'template_newuser';

const COMPANY_NAME = 'JEC MCA ALUMNI';
const COMPANY_EMAIL = 'jecmcaalumni.noreply@gmail.com';

export const sendEmail = async (params: EmailParams, templateId: string = TEMPLATE_ID): Promise<boolean> => {
  console.log('EmailJS: Preparing to send email...', { templateId, to: params.to_email });
  
  // Mapping variables to match the template placeholders exactly
  // The 422 error "The recipients address is empty" suggests EmailJS is not finding the email field.
  // We'll provide it in multiple common formats to be safe.
  const templateParams = {
    ...params,
    to_email: params.to_email,       // Standard placeholder
    email: params.to_email,          // Common alternative
    recipient_email: params.to_email, // Another common alternative
    company_name: COMPANY_NAME,
    company_email: COMPANY_EMAIL,
    from_email: COMPANY_EMAIL,
    password: params.password || '',
    to_name: params.to_name,
    subject: params.subject,
    message: params.message,
    first_name: params.first_name || params.to_name.split(' ')[0],
    login_url: 'https://jecmcaalumni.web.app/auth'
  };

  const data = {
    service_id: SERVICE_ID,
    template_id: templateId,
    user_id: PUBLIC_KEY,
    template_params: templateParams
  };

  console.log('EmailJS: Sending payload:', JSON.stringify(data, null, 2));

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.text();
      console.log('EmailJS: Success!', result);
      return true;
    } else {
      const errorText = await response.text();
      console.error('EmailJS: Failed with status', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('EmailJS: Network or unexpected error:', error);
    return false;
  }
};

/**
 * Specifically for sending user credentials
 */
export const sendUserCredentials = async (email: string, name: string, password: string, isNewAccount: boolean = true) => {
  const firstName = name.split(' ')[0];
  const subject = isNewAccount 
    ? `Welcome to JEC MCA ALUMNI - ${firstName}` 
    : `Password Reset - JEC MCA ALUMNI - ${firstName}`;
    
  const message = isNewAccount 
    ? `Hello ${name},\n\nYour account has been approved. Your login credentials are provided below.`
    : `Hello ${name},\n\nYour password has been reset by the administrator. Your new login credentials are provided below.`;

  return sendEmail({
    to_email: email,
    to_name: name,
    first_name: firstName,
    subject,
    message,
    password
  }, TEMPLATE_ID);
};

export const sendAdminNotification = async (type: string, data: any) => {
  const adminEmail = COMPANY_EMAIL;
  
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
    ...data
  }, ADMIN_TEMPLATE_ID);
};
