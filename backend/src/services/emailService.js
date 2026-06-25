const nodemailer = require('nodemailer');

const getTransporter = () => {
  if (!process.env.EMAIL_HOST) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendMail = async (to, subject, html) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email service not configured. Skipping email send.');
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@careerai.com',
    to,
    subject,
    html,
  });
};

const sendWelcomeEmail = async (user) => {
  await sendMail(
    user.email,
    'Welcome to CareerAI!',
    `<h1>Welcome to CareerAI!</h1>
<p>Hi ${user.name},</p>
<p>Thank you for joining CareerAI! We're excited to help you advance your career.</p>
<p>Get started by uploading your resume for an ATS analysis or practice with our interview simulator.</p>
<p>Best regards,<br/>The CareerAI Team</p>`
  );
};

const sendResumeAnalyzedEmail = async (user, resume) => {
  await sendMail(
    user.email,
    'Your Resume Analysis is Complete!',
    `<h1>Resume Analysis Complete</h1>
<p>Hi ${user.name},</p>
<p>Your resume has been analyzed! Your ATS score is <strong>${resume.analysis?.atsScore || 'N/A'}</strong>.</p>
<p>Log in to CareerAI to see your detailed analysis, section scores, and personalized recommendations.</p>
<p>Best regards,<br/>The CareerAI Team</p>`
  );
};

const sendInterviewCompleteEmail = async (user, interview) => {
  await sendMail(
    user.email,
    'Your Interview Results Are Ready!',
    `<h1>Interview Complete</h1>
<p>Hi ${user.name},</p>
<p>Great job completing your ${interview.targetRole} interview!</p>
<p>Your score: <strong>${interview.totalScore || 'N/A'}</strong></p>
<p>Log in to CareerAI to see your detailed feedback, strengths, and areas for improvement.</p>
<p>Best regards,<br/>The CareerAI Team</p>`
  );
};

module.exports = {
  sendWelcomeEmail,
  sendResumeAnalyzedEmail,
  sendInterviewCompleteEmail,
};
