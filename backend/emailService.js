import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}


export async function notifyAllUsersOnNewMedia(users, mediaTitle) {
  const subject = "New Media Added!";
  const text = `A new media "${mediaTitle}" has been added to FilmLore. Check it out now!`;
  for (const user of users) {
    await sendEmail(user.email, subject, text);
  }
}

export async function congratulateSubmitter(submitterEmail, mediaTitle) {
  const subject = "Submission Approved 🎉";
  const text = `Congratulations! Your submission "${mediaTitle}" has been approved and added to FilmLore.`;
  await sendEmail(submitterEmail, subject, text);
}

export async function rejectSubmission(submitterEmail, mediaTitle) {
  const subject = "Submission Rejected";
  const text = `Sorry, your submission "${mediaTitle}" was not approved. Please try again with another entry.`;
  await sendEmail(submitterEmail, subject, text);
}
