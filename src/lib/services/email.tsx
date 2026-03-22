"use server";

import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { DocumentInviteEmail } from "@/emails/document-invite";
import React from "react";

export async function sendInviteEmails(
  documentId: string, 
  emails: string[], 
  role: string,
  inviterName: string,  
  inviterEmail: string,
  documentTitle: string = "Shared Document" 
) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://document-editor-nine.vercel.app";
    const documentLink = `${appUrl}/documents/${documentId}`;

    // 1. Set up the connection to your Gmail account mailroom
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, 
      },
    });

    // 2. Loop through the recipients and send!
    await Promise.all(
        emails.map(async (email) => {
            // A. Convert your React template into standard HTML
            const emailHtml = await render(
              <DocumentInviteEmail 
                inviterName={inviterName} 
                documentTitle={documentTitle} 
                documentLink={documentLink} 
                role={role} 
              />
            );

            // B. Send the email using Nodemailer
            await transporter.sendMail({
                // Dynamic Name + Official App Email
                from: `"${inviterName} (via AppName)" <${process.env.EMAIL_USER}>`, 
                // If they click reply, it goes straight to the inviter
                replyTo: inviterEmail, 
                to: email, 
                subject: `${inviterName} invited you to edit "${documentTitle}"`,
                html: emailHtml, // Pass the compiled HTML here!
            });
            
            console.log(`Nodemailer successfully sent invite to ${email}`);
        })
    );

    return { success: true };

  } catch (error) {
    console.error("Failed to send email via Nodemailer:", error);
    return { success: false, error }; 
  }
}