# Discourse Setup Guide

Reference guide for deploying and configuring the LLMs for Doctors community forum at `community.llmsfordoctors.com`. This is a manual setup guide — not automated.

---

## 1. VPS Provisioning

**Provider:** DigitalOcean (recommended)

**Droplet spec:**
- Plan: Basic, $10/mo (2 GB RAM / 1 vCPU / 50 GB SSD)
- Image: Ubuntu 22.04 LTS x64
- Region: New York or nearest to your users
- Minimum: 1 GB RAM (2 GB strongly recommended; Discourse will OOM on 1 GB without swap)

**After provisioning, set up swap (required if using 1 GB RAM):**

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

**Initial server hardening:**

```bash
apt update && apt upgrade -y
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

---

## 2. Discourse Installation

Discourse requires Docker. Install Docker first:

```bash
curl -fsSL https://get.docker.com | sh
```

Clone the official Discourse Docker repo:

```bash
git clone https://github.com/discourse/discourse_docker.git /var/discourse
cd /var/discourse
```

Run the guided setup wizard:

```bash
./discourse-setup
```

The wizard will prompt for:
- **Hostname:** `community.llmsfordoctors.com`
- **Email:** admin contact address
- **SMTP settings:** (see Section 7 below)
- **Let's Encrypt:** yes (enter your email for cert notifications)

The wizard writes `containers/app.yml`. After setup completes, it will bootstrap and launch Discourse automatically. This takes 5–10 minutes.

**To rebuild after config changes:**

```bash
cd /var/discourse
./launcher rebuild app
```

---

## 3. SSO Configuration (DiscourseConnect)

After Discourse is running, go to **Admin > Settings > Login** and configure these five settings:

| Setting | Value |
|---|---|
| `enable_discourse_connect` | `true` |
| `discourse_connect_url` | `https://auth.llmsfordoctors.com/sso` |
| `discourse_connect_secret` | (match `DISCOURSE_SECRET` in auth service .env) |
| `discourse_connect_overrides_email` | `true` |
| `discourse_connect_overrides_name` | `true` |

Also set:
- `login_required` → `true` (forum is members-only)
- `must_approve_users` → `false` (auth service handles approval via email verification)
- Disable all local login methods (email/password, Google, GitHub) — SSO is the only entry point

The auth service at `https://auth.llmsfordoctors.com/sso` handles the DiscourseConnect handshake, verifies the physician's session, and returns a signed payload.

---

## 4. Categories

Create the following 7 categories via **Admin > Categories > New Category**:

| Name | Slug | Description |
|---|---|---|
| Note Writing | `note-writing` | Prompts and workflows for clinical documentation, SOAP notes, discharge summaries, and H&P. |
| Clinical Reasoning | `clinical-reasoning` | Using AI for differential diagnosis, pre-test probability, and diagnostic frameworks. |
| Patient Education | `patient-education` | Generating plain-language explanations, after-visit summaries, and patient handouts. |
| Literature Review | `literature-review` | Summarizing studies, appraising evidence, and keeping up with journals using AI tools. |
| Admin & Billing | `admin-billing` | Prior authorizations, coding assistance, and reducing administrative burden. |
| Board Prep | `board-prep` | AI-assisted studying, question generation, and high-yield review for certifications. |
| General | `general` | Off-topic discussion, introductions, and community announcements. |

Recommended: set General as the default category for new topics.

---

## 5. Theme Installation

The custom theme lives in `forum-auth/discourse-theme/`.

**Upload via Admin UI:**

1. Go to **Admin > Customize > Themes**
2. Click **Import** > **From your device**
3. Zip the `discourse-theme/` directory: `zip -r discourse-theme.zip discourse-theme/`
4. Upload the zip file
5. Set the theme as default: click the theme > **Set as default**

**What the theme provides:**
- Inter (sans-serif) for body text
- Newsreader (serif) for headings and topic titles
- Dark clinical header (`#0f172a`) matching the main site
- Custom top navigation bar linking back to the main site sections
- Clinical color variables for Discourse's color scheme system

---

## 6. Trust Levels

Discourse's default trust levels work without modification:

| Level | Name | How Achieved |
|---|---|---|
| 0 | New User | On account creation (all SSO users start here) |
| 1 | Basic User | Read 30 posts, spend 10 minutes reading |
| 2 | Member | Visit 15 days, like 1 post, reply to 3 topics |
| 3 | Regular | Visit 50% of days over 100-day window, active engagement |
| 4 | Leader / Community Moderator | Manually promoted by admin only |

**Manual promotion to Level 4 (Community Moderator):**

```
Admin > Users > [username] > Trust Level > Promote to Leader
```

Trust Level 3 ("Community Moderator" in our context) is reached organically by active members. Level 4 is reserved for explicitly designated moderators and requires manual admin action.

---

## 7. SMTP Configuration

Configure email in `containers/app.yml` before bootstrapping (or rebuild after changes):

```yaml
env:
  DISCOURSE_SMTP_ADDRESS: smtp.your-provider.com
  DISCOURSE_SMTP_PORT: 587
  DISCOURSE_SMTP_USER_NAME: noreply@llmsfordoctors.com
  DISCOURSE_SMTP_PASSWORD: your-smtp-password
  DISCOURSE_SMTP_ENABLE_START_TLS: true
  DISCOURSE_NOTIFICATION_EMAIL: noreply@llmsfordoctors.com
```

Recommended SMTP providers: Postmark, Mailgun, or AWS SES. Avoid Gmail for transactional volume.

After configuring, send a test email from **Admin > Email > Test**.

---

## 8. DNS Setup

Three DNS records are required, all managed at your domain registrar (or Cloudflare):

| Record | Type | Value | Notes |
|---|---|---|---|
| `llmsfordoctors.com` (`@`) | CNAME / A | Netlify IP or CNAME | Main Astro site on Netlify |
| `auth.llmsfordoctors.com` | CNAME | `llmsfordoctors-auth.fly.dev` | Auth service on Fly.io |
| `community.llmsfordoctors.com` | A | VPS IP address | Discourse on DigitalOcean VPS |

**Propagation:** Allow up to 48 hours for DNS propagation, though typically under 1 hour.

**Note on Cloudflare:** If using Cloudflare proxy (orange cloud), disable it (grey cloud / DNS-only) for the `community` subdomain to allow Discourse's built-in Let's Encrypt to obtain certificates. Cloudflare proxy can be re-enabled after cert issuance if desired.

---

## 9. SSL

Let's Encrypt SSL is handled automatically by Discourse's built-in setup.

**Requirements for automatic issuance:**
- DNS must resolve correctly to the VPS IP before bootstrapping
- Ports 80 and 443 must be open on the VPS firewall
- The hostname in `app.yml` must match the DNS record exactly

**If cert issuance fails:**

```bash
# Rebuild to retry
cd /var/discourse
./launcher rebuild app

# Check logs
./launcher logs app | grep -i letsencrypt
```

**Renewal:** Certificates auto-renew via Discourse's internal cron. No manual intervention needed.

---

## Quick Reference: Key URLs

| Service | URL |
|---|---|
| Main site | `https://llmsfordoctors.com` |
| Auth service | `https://auth.llmsfordoctors.com` |
| Community forum | `https://community.llmsfordoctors.com` |
| Auth admin | `https://auth.llmsfordoctors.com/admin` |
| Discourse admin | `https://community.llmsfordoctors.com/admin` |
