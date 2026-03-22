export function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} — LLMs for Doctors</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Newsreader:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #f1f5f9;
      color: #1e293b;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 16px;
    }

    header {
      margin-bottom: 32px;
      text-align: center;
    }

    header a {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 24px;
      font-weight: 600;
      color: #1e3a5f;
      text-decoration: none;
      letter-spacing: -0.02em;
    }

    header a:hover { color: #2563eb; }

    .card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
      padding: 36px 40px;
      width: 100%;
      max-width: 420px;
    }

    .card h1 {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 22px;
      font-weight: 600;
      color: #1e3a5f;
      margin-bottom: 24px;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #475569;
      margin-bottom: 4px;
    }

    input[type="text"],
    input[type="email"],
    input[type="password"],
    input[type="number"] {
      display: block;
      width: 100%;
      padding: 9px 12px;
      font-size: 15px;
      font-family: inherit;
      color: #0f172a;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      margin-bottom: 16px;
    }

    input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
      background: #fff;
    }

    .btn {
      display: block;
      width: 100%;
      padding: 10px 16px;
      font-size: 15px;
      font-weight: 600;
      font-family: inherit;
      color: #fff;
      background: #2563eb;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s;
      margin-top: 8px;
    }

    .btn:hover { background: #1d4ed8; }
    .btn:active { background: #1e40af; }

    .error-msg {
      background: #fef2f2;
      border: 1px solid #fca5a5;
      color: #b91c1c;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .success-msg {
      background: #f0fdf4;
      border: 1px solid #86efac;
      color: #166534;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .links {
      margin-top: 20px;
      font-size: 13px;
      color: #64748b;
      text-align: center;
    }

    .links a {
      color: #2563eb;
      text-decoration: none;
    }

    .links a:hover { text-decoration: underline; }

    .links-row {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      font-size: 13px;
    }

    .links-row a {
      color: #2563eb;
      text-decoration: none;
    }

    .links-row a:hover { text-decoration: underline; }

    footer {
      margin-top: 40px;
      font-size: 13px;
      color: #94a3b8;
      text-align: center;
    }

    footer a {
      color: #64748b;
      text-decoration: none;
    }

    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <header>
    <a href="${process.env['MAIN_SITE_URL'] ?? '/'}">LLMs for Doctors</a>
  </header>
  <main>
    ${body}
  </main>
  <footer>
    <a href="${process.env['MAIN_SITE_URL'] ?? '/'}">Back to LLMs for Doctors</a>
  </footer>
</body>
</html>`;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
