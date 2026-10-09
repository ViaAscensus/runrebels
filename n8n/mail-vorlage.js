// Gemeinsame HTML-Vorlage der Crew-Mails. Wird von scripts/mails_bauen.py
// in die Code-Nodes der Workflows kopiert (n8n kann keine Dateien importieren).
// Aufruf: rrMail({ kopf, kopfAlt, kopfH, vorname, absaetze, button, klein, abmeldeUrl, vorschau })
const RR_BASE = 'https://runrebels.com/assets/mail/';
const rrEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rrLink = (s) => rrEsc(s).replace(/(https?:\/\/[^\s<]+)/g, (u) => '<a href="' + u + '" style="color:#0B3C41;text-decoration:underline">' + u + '</a>');
const rrP = (s, extra) => '<p style="margin:0 0 16px 0;font:16px/24px Arial,Helvetica,sans-serif;color:#0B3C41;' + (extra || '') + '">' + rrLink(s).replace(/\n/g, '<br>') + '</p>';
function rrMail(o) {
  const abs = (o.absaetze || []).map((a) => rrP(a)).join('');
  const klein = (o.klein || []).map((a) => rrP(a, 'font-size:13px;line-height:20px;color:#4B6B6E')).join('');
  const btn = o.button ? '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:8px 0 22px 0"><tr><td align="center" bgcolor="#D6246E" style="border-radius:8px"><a href="' + rrEsc(o.button.url) + '" style="display:block;padding:15px 20px;font:bold 15px Arial,Helvetica,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#FFFFFF;text-decoration:none">' + rrEsc(o.button.text) + '</a></td></tr></table>' : '';
  const abm = o.abmeldeUrl ? ' · <a href="' + rrEsc(o.abmeldeUrl) + '" style="color:#FFF4EA;text-decoration:underline">Abmelden</a>' : '';
  const html = '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RunRebels</title></head>'
    + '<body style="margin:0;padding:0;background:#E9EEEE">'
    + '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">' + rrEsc(o.vorschau || '') + '</div>'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#E9EEEE"><tr><td align="center" style="padding:24px 12px">'
    + '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#FFF4EA">'
    + '<tr><td bgcolor="#0E6E75" style="background:#0E6E75;font:bold 26px/32px Arial,Helvetica,sans-serif;color:#FFF4EA;text-transform:uppercase"><img src="' + RR_BASE + o.kopf + '.png" width="600" ' + (o.kopfH ? 'height="' + o.kopfH + '" ' : '') + 'alt="' + rrEsc(o.kopfAlt) + '" style="display:block;width:100%;max-width:600px;height:auto;border:0;color:#FFF4EA;font:bold 26px/32px Arial,Helvetica,sans-serif"></td></tr>'
    + '<tr><td style="padding:28px 32px 12px 32px">' + rrP('Hallo ' + o.vorname + ',') + abs + btn + klein + rrP('Dein RunRebels-Team\nAllein laufen. Nie allein sein.', 'margin-bottom:8px') + '</td></tr>'
    + '<tr><td><img src="' + RR_BASE + 'streifen.png" width="600" height="14" alt="" style="display:block;width:100%;height:auto;border:0"></td></tr>'
    + '<tr><td bgcolor="#0B3C41" style="background:#0B3C41;padding:16px 32px;font:12px/18px Arial,Helvetica,sans-serif;color:#FFF4EA">RunRebels · ein Angebot von ASCENSUS' + abm + '</td></tr>'
    + '</table></td></tr></table></body></html>';
  const tl = [];
  tl.push('Hallo ' + o.vorname + ',', '');
  (o.absaetze || []).forEach((a) => tl.push(a, ''));
  if (o.button) tl.push(o.button.text + ': ' + o.button.url, '');
  (o.klein || []).forEach((a) => tl.push(a, ''));
  tl.push('Dein RunRebels-Team', 'Allein laufen. Nie allein sein.', '', 'RunRebels, ein Angebot von ASCENSUS');
  if (o.abmeldeUrl) tl.push('Abmelden: ' + o.abmeldeUrl);
  return { html, text: tl.join('\n') };
}
