"""SmartPaw Food — transactional email service (Resend).

Sends two types of notifications:
  * Admin alert (lead/contact submission) → LEAD_NOTIFICATION_EMAIL
  * Customer auto-reply (branded confirmation) → submitter's email

Design notes:
  * Non-blocking: runs Resend SDK calls via `asyncio.to_thread` so FastAPI route
    handlers stay async-safe. Routes use `BackgroundTasks` so the API responds
    immediately even if Resend is slow or down.
  * Resilient: if `RESEND_API_KEY` is missing or the SDK errors out (e.g.
    testing-mode rejection for unverified recipients), we log and swallow so the
    user-facing form submission still returns 201.
  * Brand: inline-CSS HTML tables (best email-client compatibility).
"""
from __future__ import annotations

import os
import asyncio
import logging
from typing import Optional

import resend

logger = logging.getLogger(__name__)

BRAND_ORANGE = "#F25C05"
BRAND_NAVY = "#0A4D8C"
BRAND_DARK = "#05223D"
BRAND_CREAM = "#FDFBF7"


def _config() -> dict:
    """Pull env vars at call time so .env reloads are picked up."""
    return {
        "api_key": os.environ.get("RESEND_API_KEY", "").strip(),
        "from_email": os.environ.get("LEAD_SENDER_EMAIL", "SmartPaw <onboarding@resend.dev>"),
        "admin_email": os.environ.get("LEAD_NOTIFICATION_EMAIL", "").strip(),
        "admin_whatsapp": os.environ.get("ADMIN_WHATSAPP_NUMBER", "").strip(),
        "public_url": os.environ.get("PUBLIC_BASE_URL", "https://smartpaw.ge"),
    }


def _send(params: dict) -> Optional[str]:
    """Synchronous Resend call — returns email id on success, None on failure."""
    cfg = _config()
    if not cfg["api_key"]:
        logger.info("[email_service] RESEND_API_KEY not configured — skipping send.")
        return None
    resend.api_key = cfg["api_key"]
    try:
        result = resend.Emails.send(params)
        email_id = result.get("id") if isinstance(result, dict) else None
        logger.info("[email_service] Sent '%s' to %s (id=%s)",
                    params.get("subject"), params.get("to"), email_id)
        return email_id
    except Exception as exc:  # noqa: BLE001
        logger.warning("[email_service] Resend send failed for %s: %s",
                       params.get("to"), exc)
        return None


# ---------------------------------------------------------------------------
# HTML templates
# ---------------------------------------------------------------------------

def _wa_link_for_phone(phone: str, prefilled: str = "") -> str:
    """Build a wa.me deep link for any phone number."""
    digits = "".join(ch for ch in (phone or "") if ch.isdigit())
    if not digits:
        return ""
    text = ""
    if prefilled:
        from urllib.parse import quote
        text = f"?text={quote(prefilled)}"
    return f"https://wa.me/{digits}{text}"


def _wa_link(cfg: dict, prefilled: str = "") -> str:
    return _wa_link_for_phone(cfg["admin_whatsapp"], prefilled)


def _shell(title: str, body_html: str, cta_html: str = "") -> str:
    return f"""\
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:{BRAND_CREAM};font-family:Arial,Helvetica,sans-serif;color:{BRAND_DARK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{BRAND_CREAM};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #0A4D8C1A;">
        <tr><td style="background:{BRAND_NAVY};padding:22px 28px;">
          <table width="100%"><tr>
            <td style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:0.5px;">SmartPaw Food</td>
            <td align="right" style="color:#ffffff;opacity:0.7;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">Tbilisi · Pet Care</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:32px 36px 8px 36px;">
          <h1 style="margin:0 0 18px 0;font-size:22px;color:{BRAND_DARK};line-height:1.3;">{title}</h1>
          {body_html}
          {cta_html}
        </td></tr>
        <tr><td style="padding:24px 36px 28px 36px;border-top:1px solid #0A4D8C1A;color:#7A8A99;font-size:12px;">
          You are receiving this because you interacted with SmartPaw Food. Need help? Reply to this email.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
"""


def _admin_lead_html(name: str, email: str, source: str, lead_id: str,
                     phone: str = "") -> str:
    cfg = _config()
    # Prefer deep-linking to the LEAD's WhatsApp so the admin can reply in one tap.
    wa = _wa_link_for_phone(phone, f"Hi {name}, thanks for joining the SmartPaw waitlist!") \
         or _wa_link(cfg, f"Hi {name}, thanks for joining the SmartPaw waitlist!")
    wa_btn = (
        f'<a href="{wa}" style="display:inline-block;background:#25D366;color:#ffffff;'
        f'text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;'
        f'font-size:14px;margin-right:10px;">Reply on WhatsApp</a>' if wa else ""
    )
    reply_btn = (
        f'<a href="mailto:{email}" style="display:inline-block;background:{BRAND_ORANGE};'
        f'color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;'
        f'font-weight:700;font-size:14px;">Reply by email</a>'
    )
    phone_row = (
        f'<tr><td style="padding:6px 0;font-size:13px;color:#7A8A99;">Phone</td>'
        f'<td style="padding:6px 0;font-size:14px;color:{BRAND_NAVY};font-weight:600;">'
        f'<a href="tel:{phone}" style="color:{BRAND_NAVY};">{phone}</a></td></tr>'
        if phone else ""
    )
    body = f"""\
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;">
      A new lead just signed up via <strong>{source}</strong>. Reach out within
      30 minutes to maximise conversion.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:{BRAND_CREAM};border-radius:12px;padding:18px;margin:14px 0 22px 0;">
      <tr><td style="padding:6px 0;font-size:13px;color:#7A8A99;width:90px;">Name</td>
          <td style="padding:6px 0;font-size:14px;color:{BRAND_DARK};font-weight:600;">{name}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#7A8A99;">Email</td>
          <td style="padding:6px 0;font-size:14px;color:{BRAND_NAVY};font-weight:600;"><a href="mailto:{email}" style="color:{BRAND_NAVY};">{email}</a></td></tr>
      {phone_row}
      <tr><td style="padding:6px 0;font-size:13px;color:#7A8A99;">Lead ID</td>
          <td style="padding:6px 0;font-size:12px;color:#7A8A99;font-family:monospace;">{lead_id}</td></tr>
    </table>
    """
    cta = f'<p style="margin:14px 0 4px 0;">{wa_btn}{reply_btn}</p>'
    return _shell("New SmartPaw lead", body, cta)


def _admin_contact_html(name: str, email: str, subject: str, dept: str,
                        message: str, inquiry_id: str) -> str:
    cfg = _config()
    wa = _wa_link(cfg, f"Hi {name}, thanks for your message to SmartPaw — ")
    safe_msg = (message or "").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br>")
    wa_btn = (
        f'<a href="{wa}" style="display:inline-block;background:#25D366;color:#ffffff;'
        f'text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;'
        f'font-size:14px;margin-right:10px;">Reply on WhatsApp</a>' if wa else ""
    )
    reply_btn = (
        f'<a href="mailto:{email}?subject=Re:%20{subject}" style="display:inline-block;'
        f'background:{BRAND_ORANGE};color:#ffffff;text-decoration:none;padding:12px 22px;'
        f'border-radius:999px;font-weight:700;font-size:14px;">Reply by email</a>'
    )
    body = f"""\
    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;">
      A new <strong>{dept}</strong> inquiry just landed in your inbox.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:{BRAND_CREAM};border-radius:12px;padding:18px;margin:14px 0 18px 0;">
      <tr><td style="padding:6px 0;font-size:13px;color:#7A8A99;width:90px;">From</td>
          <td style="padding:6px 0;font-size:14px;color:{BRAND_DARK};font-weight:600;">{name} &lt;<a href="mailto:{email}" style="color:{BRAND_NAVY};">{email}</a>&gt;</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#7A8A99;">Subject</td>
          <td style="padding:6px 0;font-size:14px;color:{BRAND_DARK};font-weight:600;">{subject}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#7A8A99;">Department</td>
          <td style="padding:6px 0;font-size:14px;color:{BRAND_DARK};">{dept}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#7A8A99;">Inquiry ID</td>
          <td style="padding:6px 0;font-size:12px;color:#7A8A99;font-family:monospace;">{inquiry_id}</td></tr>
    </table>
    <div style="background:#ffffff;border:1px solid #0A4D8C1A;border-radius:12px;padding:18px;font-size:14px;line-height:1.6;color:{BRAND_DARK};">
      {safe_msg}
    </div>
    """
    cta = f'<p style="margin:18px 0 4px 0;">{wa_btn}{reply_btn}</p>'
    return _shell(f"New {dept} inquiry: {subject}", body, cta)


def _customer_lead_html(name: str) -> str:
    cfg = _config()
    body = f"""\
    <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;">
      Hey {name or 'friend'} 👋
    </p>
    <p style="margin:0 0 14px 0;font-size:15px;line-height:1.65;">
      Thanks for joining the SmartPaw waitlist! We are obsessing over fresh,
      tail-wagging food deliveries across Tbilisi — and you are now on the
      inside list.
    </p>
    <p style="margin:0 0 14px 0;font-size:15px;line-height:1.65;">
      What happens next:
    </p>
    <ul style="margin:0 0 18px 22px;padding:0;font-size:15px;line-height:1.7;color:{BRAND_DARK};">
      <li>We'll DM you the day your first SmartPaw box is ready to ship.</li>
      <li>Early-access pricing locked for the first 100 households.</li>
      <li>Plans start at <strong>0 ₾</strong>, and the 150 ₾ plan ships a free SmartPaw Feeder.</li>
    </ul>
    """
    cta = (
        f'<p style="margin:18px 0 4px 0;">'
        f'<a href="{cfg["public_url"]}/plans" style="display:inline-block;'
        f'background:{BRAND_ORANGE};color:#ffffff;text-decoration:none;'
        f'padding:13px 26px;border-radius:999px;font-weight:700;font-size:14px;">'
        f'See the plans</a></p>'
    )
    return _shell("You're on the list — welcome to SmartPaw", body, cta)


def _customer_contact_html(name: str, subject: str) -> str:
    cfg = _config()
    body = f"""\
    <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;">
      Hi {name or 'there'} 👋
    </p>
    <p style="margin:0 0 14px 0;font-size:15px;line-height:1.65;">
      Thanks for reaching out to SmartPaw about
      "<strong>{subject}</strong>". A human from our Tbilisi team will reply
      within one business day — usually sooner.
    </p>
    <p style="margin:0 0 14px 0;font-size:15px;line-height:1.65;">
      If it is urgent, you can also tap below to chat with us on WhatsApp.
    </p>
    """
    wa = _wa_link(cfg, f"Hi SmartPaw, I just submitted an inquiry about: {subject}")
    wa_btn = (
        f'<a href="{wa}" style="display:inline-block;background:#25D366;color:#ffffff;'
        f'text-decoration:none;padding:13px 26px;border-radius:999px;font-weight:700;'
        f'font-size:14px;">Chat on WhatsApp</a>' if wa else ""
    )
    cta = f'<p style="margin:18px 0 4px 0;">{wa_btn}</p>'
    return _shell("We got your message", body, cta)


# ---------------------------------------------------------------------------
# Public async API (callable from FastAPI BackgroundTasks)
# ---------------------------------------------------------------------------

async def notify_new_lead(*, lead_id: str, name: str, email: str,
                          source: str = "Website footer",
                          phone: str = "") -> None:
    """Send admin alert + customer confirmation for a new newsletter lead."""
    cfg = _config()
    if not cfg["api_key"]:
        return
    safe_name = name or "Pet parent"

    if cfg["admin_email"]:
        await asyncio.to_thread(_send, {
            "from": cfg["from_email"],
            "to": [cfg["admin_email"]],
            "subject": f"[SmartPaw] New lead: {safe_name}",
            "html": _admin_lead_html(safe_name, email, source, lead_id, phone),
            "reply_to": email,
        })

    if email:
        await asyncio.to_thread(_send, {
            "from": cfg["from_email"],
            "to": [email],
            "subject": "You're on the list — welcome to SmartPaw 🐾",
            "html": _customer_lead_html(safe_name),
        })


async def notify_new_contact(*, inquiry_id: str, name: str, email: str,
                             subject: str, message: str,
                             department: str = "general") -> None:
    """Send admin alert + customer confirmation for a new contact-form inquiry."""
    cfg = _config()
    if not cfg["api_key"]:
        return
    safe_name = name or "Pet parent"
    dept = (department or "general").lower()

    if cfg["admin_email"]:
        await asyncio.to_thread(_send, {
            "from": cfg["from_email"],
            "to": [cfg["admin_email"]],
            "subject": f"[SmartPaw][{dept}] {subject}",
            "html": _admin_contact_html(safe_name, email, subject, dept, message, inquiry_id),
            "reply_to": email,
        })

    if email:
        await asyncio.to_thread(_send, {
            "from": cfg["from_email"],
            "to": [email],
            "subject": "We got your message — SmartPaw 🐾",
            "html": _customer_contact_html(safe_name, subject),
        })
