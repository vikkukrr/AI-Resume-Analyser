const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const t = getTransporter();
    await t.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
};

const welcomeEmail = (name, email) =>
  sendEmail({
    to: email,
    subject: '🚀 Welcome to CareerAI!',
    html: `<div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#6366f1">Welcome aboard, ${name}! 🎉</h2>
      <p>Your CareerAI account is ready. Start by uploading your resume to get your ATS score and personalized improvement tips.</p>
      <a href="${process.env.FRONTEND_URL}/resume/upload" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:12px">Analyze My Resume →</a>
      <p style="color:#64748b;font-size:13px;margin-top:24px">CareerAI Team</p>
    </div>`,
  });

const resumeAnalyzedEmail = (name, email, atsScore) =>
  sendEmail({
    to: email,
    subject: `✅ Your Resume ATS Score: ${atsScore}/100`,
    html: `<div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#6366f1">Resume Analysis Complete</h2>
      <p>Hi ${name}, your resume has been analyzed!</p>
      <div style="background:#f1f5f9;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
        <span style="font-size:48px;font-weight:bold;color:${atsScore>=75?'#10b981':atsScore>=50?'#f59e0b':'#ef4444'}">${atsScore}</span>
        <span style="font-size:24px;color:#64748b">/100</span>
        <p style="color:#64748b;margin:8px 0 0">ATS Score</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">View Full Analysis →</a>
    </div>`,
  });

const interviewCompleteEmail = (name, email, score, role) =>
  sendEmail({
    to: email,
    subject: `🎯 Interview Complete: ${score}/100 — ${role}`,
    html: `<div style="font-family:sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#6366f1">Mock Interview Results</h2>
      <p>Hi ${name}, you completed your ${role} mock interview!</p>
      <div style="background:#f1f5f9;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
        <span style="font-size:48px;font-weight:bold;color:${score>=75?'#10b981':score>=50?'#f59e0b':'#ef4444'}">${score}</span>
        <span style="font-size:24px;color:#64748b">/100</span>
      </div>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">View Detailed Feedback →</a>
    </div>`,
  });

module.exports = { sendEmail, welcomeEmail, resumeAnalyzedEmail, interviewCompleteEmail };
