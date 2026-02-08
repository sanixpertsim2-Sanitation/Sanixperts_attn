import nodemailer from "nodemailer";

export async function POST(request) {
  const payload = await request.json();

  const severityLabel = payload.severity ? String(payload.severity) : "High";
  const severityColor =
    severityLabel === "High" ? "#dc2626" : severityLabel === "Medium" ? "#f59e0b" : "#2563eb";
  const headingText =
    severityLabel === "High"
      ? "URGENT: HIGH SEVERITY DAMAGE"
      : severityLabel === "Medium"
      ? "ALERT: MEDIUM SEVERITY DAMAGE"
      : "DAMAGE REPORTED";

  const timestampFormatted = payload.timestamp 
    ? new Date(payload.timestamp).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'medium'
      })
    : new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'medium'
      });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:20px;background-color:#f3f4f6;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color:${severityColor};padding:24px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:bold;">
            ${headingText}
          </h1>
          <p style="color:#ffffff;margin:8px 0 0 0;opacity:0.9;font-size:14px;">
            Immediate attention required
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding:32px;">
          
          <!-- Report Details -->
          <div style="background-color:#f9fafb;border-left:4px solid ${severityColor};padding:16px;margin-bottom:24px;">
            <h2 style="color:#111827;font-size:18px;margin:0 0 16px 0;">Report Details</h2>
            
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-weight:600;">Reported By:</td>
                <td style="padding:8px 0;color:#111827;">${payload.reporter || "Unknown"}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-weight:600;">Production Line:</td>
                <td style="padding:8px 0;color:#111827;font-weight:bold;">${payload.lineName || "MACY Production"}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-weight:600;">Equipment/Area:</td>
                <td style="padding:8px 0;color:#111827;">${payload.equipmentArea || "-"}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-weight:600;">Severity Level:</td>
                <td style="padding:8px 0;color:${severityColor};font-weight:bold;font-size:16px;">${severityLabel}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-weight:600;">Timestamp:</td>
                <td style="padding:8px 0;color:#111827;">${timestampFormatted}</td>
              </tr>
            </table>
          </div>
          
          <!-- Description -->
          <div style="margin-bottom:24px;">
            <h3 style="color:#111827;font-size:16px;margin:0 0 12px 0;">Description</h3>
            <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
              <p style="color:#374151;margin:0;line-height:1.6;">
                ${payload.description || "No description provided"}
              </p>
            </div>
          </div>
          
          <!-- Photo Evidence -->
          ${payload.photoData ? `
            <div>
              <h3 style="color:#111827;font-size:16px;margin:0 0 12px 0;">📸 Photo Evidence</h3>
              <p style="color:#6b7280;font-size:14px;margin-bottom:12px;">
                Photo attached to this email. Please review the visual evidence for complete assessment.
              </p>
              <div style="background-color:#f3f4f6;border-radius:8px;padding:12px;text-align:center;">
                <p style="color:#9ca3af;font-size:12px;margin:0;">
                  ✓ Photo evidence attached as <strong>damage-report-${Date.now()}.png</strong>
                </p>
              </div>
            </div>
          ` : `
            <div style="background-color:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:16px;">
              <p style="color:#92400e;margin:0;font-size:14px;">
                ⚠️ No photo evidence provided with this report
              </p>
            </div>
          `}
        </div>
        
        <!-- Footer -->
        <div style="background-color:#f9fafb;padding:20px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="color:#6b7280;font-size:12px;margin:0;">
            <strong>Sanixpert Digital Operations</strong><br>
            Give & Go Facility • Automated Damage Alert System
          </p>
          <p style="color:#9ca3af;font-size:11px;margin:8px 0 0 0;">
            This is an automated message. Please respond to the production floor team directly.
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;

  if (!process.env.SMTP_HOST) {
    return Response.json({ ok: true, mocked: true, html });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Support photo attachments
  const mailOptions = {
    from: process.env.ALERT_FROM || "sanixpert@alerts.com",
    to: payload.to,
    subject: payload.subject || "HIGH SEVERITY DAMAGE",
    html,
    attachments: []
  };

  // Add photo attachment if provided
  if (payload.photoData) {
    // Extract base64 data from data URL
    const matches = payload.photoData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mailOptions.attachments.push({
        filename: `damage-report-${Date.now()}.png`,
        content: matches[2],
        encoding: 'base64',
        contentType: matches[1]
      });
    }
  }

  try {
    await transporter.sendMail(mailOptions);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Email send error:", error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
