import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface DocumentInviteEmailProps {
  inviterName: string;
  documentTitle: string;
  documentLink: string;
  role: string;
}

export const DocumentInviteEmail = ({
  inviterName = "Chaitanya Zunzurkar",
  documentTitle = "Untitled Document",
  documentLink = "https://your-app.com",
  role = "VIEWER",
}: DocumentInviteEmailProps) => {
  const previewText = `${inviterName} invited you to edit a document`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Document Invitation</Heading>
          <Text style={text}>Hello!</Text>
          <Text style={text}>
            <strong>{inviterName}</strong> has invited you to collaborate on a
            document as a <strong>{role.toLowerCase()}</strong>.
          </Text>

          <Section style={documentSection}>
            <Text style={documentTitleStyle}>📄 {documentTitle}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={documentLink}>
              Open Document
            </Button>
          </Section>

          <Text style={footer}>
            If you were not expecting this invitation, you can safely ignore
            this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// --- Styles ---
const main = {
  backgroundColor: "#f6f9fc",
  padding: "40px 0",
  fontFamily: "Arial, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  margin: "0 auto",
  padding: "40px",
  maxWidth: "480px",
};

const h1 = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
  padding: "0",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const documentSection = {
  backgroundColor: "#f3f4f6",
  borderRadius: "6px",
  padding: "16px",
  margin: "24px 0",
};

const documentTitleStyle = {
  margin: "0",
  color: "#111827",
  fontSize: "18px",
  fontWeight: "600",
};

const buttonContainer = { textAlign: "center" as const, margin: "32px 0" };

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = { color: "#6b7280", fontSize: "14px", margin: "32px 0 0" };

export default DocumentInviteEmail;
