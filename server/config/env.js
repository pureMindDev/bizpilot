import dotenv from 'dotenv';
dotenv.config();

const required = (name, fallback) => process.env[name] ?? fallback;

export const env = {
  nodeEnv: required('NODE_ENV', 'development'),
  port: Number(required('PORT', 5000)),
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/bizpilot'),
  clientUrl: required('CLIENT_URL', 'http://localhost:5174'),
  jwt: {
    businessSecret: required('JWT_BUSINESS_SECRET', 'dev_business_secret_change_me'),
    adminSecret: required('JWT_ADMIN_SECRET', 'dev_admin_secret_change_me'),
    expiresIn: required('JWT_EXPIRES_IN', '7d'),
  },
  brevo: {
    apiKey: required('BREVO_API_KEY', ''),
    senderEmail: required('BREVO_SENDER_EMAIL', 'noreply@bizpilot.ng'),
    senderName: required('BREVO_SENDER_NAME', 'BizPilot'),
  },
};

export default env;
