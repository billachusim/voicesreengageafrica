// Lightweight editor notification. Uses Resend if RESEND_API_KEY + EDITOR_EMAIL
// are configured as secrets; otherwise logs and returns. The submission is
// always persisted regardless of email outcome.

interface PitchPayload {
  name: string;
  email: string;
  region: string;
  format: string | null;
  pitch: string;
  media_link: string;
}

export async function sendEditorPitchNotification(p: PitchPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.EDITOR_EMAIL;
  const from = process.env.EDITOR_FROM_EMAIL || "ReEngage Voices <notify@reengageafrica.com>";

  if (!apiKey || !to) {
    console.log("[email-notify] missing RESEND_API_KEY or EDITOR_EMAIL; logging pitch only", {
      from: p.name,
    });
    return { sent: false, reason: "not_configured" as const };
  }

  const html = `
    <h2 style="font-family:Georgia,serif">New pitch — ReEngage Voices</h2>
    <p><strong>From:</strong> ${escape(p.name)} &lt;${escape(p.email)}&gt;</p>
    <p><strong>Region:</strong> ${escape(p.region || "—")}<br/>
       <strong>Format:</strong> ${escape(p.format ?? "—")}<br/>
       <strong>Media link:</strong> ${p.media_link ? `<a href="${escape(p.media_link)}">${escape(p.media_link)}</a>` : "—"}</p>
    <hr/>
    <p style="white-space:pre-wrap;font-family:Georgia,serif">${escape(p.pitch)}</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `New pitch from ${p.name}`,
      reply_to: p.email,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${body}`);
  }
  return { sent: true };
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
