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

  const html = `
    <div style="border:5px solid ${severityColor};padding:20px;font-family:Arial,sans-serif;">
      <h1 style="color:${severityColor};margin-top:0;">${headingText}</h1>
      <p><strong>Reported By:</strong> ${payload.reporter || "Unknown"}</p>
      <p><strong>Line:</strong> ${payload.lineName || "MACY Production"}</p>
      <p><strong>Equipment/Area:</strong> ${payload.equipmentArea || "-"}</p>
      <p><strong>Timestamp:</strong> ${payload.timestamp || ""}</p>
      <hr />
      <p><strong>Description:</strong> ${payload.description || ""}</p>
      ${
        payload.photoUrl
          ? `<img src="${payload.photoUrl}" alt="Damage Photo" style="max-width:100%;border-radius:8px;" />`
          : ""
      }
    </div>
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

  await transporter.sendMail({
    from: process.env.ALERT_FROM || "sanixpert@alerts.com",
    to: payload.to,
    subject: payload.subject || "HIGH SEVERITY DAMAGE",
    html,
  });

  return Response.json({ ok: true });
}
