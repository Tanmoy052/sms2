const envEmails = process.env.ADMIN_EMAILS;

export const ALLOWED_ADMINS = envEmails
  ? envEmails.split(",").map((email) => email.trim())
  : [
      "tanmoypal99cse@gmail.com",
      "tanmoypal30102004@gmail.com",
      "tpal43694@gmail.com",
    ];
