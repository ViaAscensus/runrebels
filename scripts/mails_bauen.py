"""Baut die HTML-Mails in die n8n-Workflows ein.

Liest n8n/mail-vorlage.js und setzt sie vor den Code der Mail-Nodes in
n8n/crew.json; erzeugt außerdem n8n/crew-update.json (Updates von Hand).
Aufruf: python3 scripts/mails_bauen.py
"""
import json, pathlib

N8N = pathlib.Path(__file__).resolve().parent.parent / "n8n"
VORLAGE = (N8N / "mail-vorlage.js").read_text(encoding="utf-8")
SMTP = {"smtp": {"id": "", "name": "SMTP RunRebels"}}

DOI = """const rec = $input.first().json;
const link = 'https://n8n.runrebels.com/webhook/crew-bestaetigen?t=' + rec.token;
const m = rrMail({
  kopf: 'kopf-bestaetigung', kopfAlt: 'Noch ein Klick.', kopfH: 206,
  vorschau: 'Noch ein Klick, dann gehörst du zur Crew.',
  vorname: rec.vorname,
  absaetze: ['Schön, dass du dabei sein willst. Bestätige kurz deine E-Mail-Adresse, dann gehörst du zur Crew.'],
  button: { text: 'Adresse bestätigen', url: link },
  klein: ['Du hast dich nicht eingetragen? Dann ignoriere diese Mail, es passiert nichts.']
});
return [{ json: { an: rec.email, betreff: 'Noch ein Klick, dann gehörst du zur Crew', text: m.text, html: m.html } }];"""

WILLKOMMEN = """const rec = ($input.first().json.items || [])[0];
if (!rec) return [{ json: { aktion: 'fehler' } }];
if (rec.status === 'bestaetigt') return [{ json: { aktion: 'schon' } }];
const now = new Date().toISOString().replace('T', ' ');
const abm = 'https://n8n.runrebels.com/webhook/crew-abmelden?t=' + rec.abmelde_token;
const absaetze = ['Cool, dass du dabei bist. Willkommen in der Crew!',
  'RunRebels ist Laufen für alle, auf eigene Art. Wie du läufst, entscheidest du: egal welcher Schuh, welche Pace, welcher Look.'];
if (rec.stil) absaetze.push('Du hast uns geschrieben, wie du läufst: „' + rec.stil + '“. Genau so ist es richtig.');
absaetze.push('Sobald es Neuigkeiten zum Start von RunRebels gibt, erfährst du es als Erste:r. Zwischendurch gibt es auch mal ein paar Updates.');
absaetze.push('Und jeder Lauf läuft für etwas: Mit deiner Anmeldung unterstützt du einen guten Zweck.');
const m = rrMail({
  kopf: 'kopf-willkommen', kopfAlt: 'Du bist drin.', kopfH: 206,
  vorschau: 'Willkommen in der Crew. Wir melden uns, sobald es Neuigkeiten gibt.',
  vorname: rec.vorname, absaetze, abmeldeUrl: abm
});
return [{ json: { aktion: 'ok', id: rec.id, patch: { status: 'bestaetigt', bestaetigt_am: now }, an: rec.email, betreff: 'Willkommen in der Crew, ' + rec.vorname, text: m.text, html: m.html } }];"""

UPDATE_MAIL = """const cfg = $('Update-Inhalt').first().json;
const items = ($input.first().json.items) || [];
const testen = String(cfg.empfaenger || 'test').toLowerCase() !== 'alle';
if (!cfg.betreff || !cfg.text) throw new Error('Betreff und Text im Node Update-Inhalt ausfüllen.');
if (testen && !cfg.testAdresse) throw new Error('Test: bitte testAdresse im Node Update-Inhalt eintragen (oder empfaenger auf alle setzen).');
const absaetze = String(cfg.text).split(/\\n\\s*\\n/).map((s) => s.trim()).filter(Boolean);
const button = (cfg.buttonText && cfg.buttonUrl) ? { text: cfg.buttonText, url: cfg.buttonUrl } : null;
const an = testen ? [{ email: cfg.testAdresse, vorname: 'Test', abmelde_token: 'test' }] : items;
return an.map((r) => {
  const m = rrMail({
    kopf: 'kopf-update', kopfAlt: 'Neuigkeiten aus der Crew.', kopfH: 246,
    vorschau: absaetze[0].slice(0, 90), vorname: r.vorname, absaetze, button,
    abmeldeUrl: 'https://n8n.runrebels.com/webhook/crew-abmelden?t=' + r.abmelde_token
  });
  return { json: { an: r.email, betreff: (testen ? '[TEST] ' : '') + cfg.betreff, text: m.text, html: m.html } };
});"""

def mit_vorlage(code):
    return VORLAGE + "\n" + code

def crew():
    p = N8N / "crew.json"
    d = json.loads(p.read_text(encoding="utf-8"))
    for n in d["nodes"]:
        if n["name"] == "DOI-Mail bauen":
            n["parameters"]["jsCode"] = mit_vorlage(DOI)
        elif n["name"] == "Bestätigung planen":
            n["parameters"]["jsCode"] = mit_vorlage(WILLKOMMEN)
        elif n["name"] == "DOI-Mail senden":
            n["parameters"].update({"emailFormat": "both", "html": "={{ $json.html }}"})
        elif n["name"] == "Willkommensmail senden":
            n["parameters"].update({"emailFormat": "both", "html": "={{ $('Bestätigung planen').first().json.html }}"})
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def update():
    d = {
      "name": "RunRebels – Crew Update", "active": False,
      "settings": {"executionOrder": "v1", "timezone": "Europe/Berlin"},
      "nodes": [
        {"id": "u1", "name": "Start (von Hand)", "type": "n8n-nodes-base.manualTrigger", "typeVersion": 1, "position": [0, 300], "parameters": {}},
        {"id": "u2", "name": "Update-Inhalt", "type": "n8n-nodes-base.set", "typeVersion": 3.4, "position": [220, 300], "parameters": {"assignments": {"assignments": [
            {"id": "a1", "name": "empfaenger", "value": "test", "type": "string"},
            {"id": "a2", "name": "testAdresse", "value": "", "type": "string"},
            {"id": "a3", "name": "betreff", "value": "", "type": "string"},
            {"id": "a4", "name": "text", "value": "", "type": "string"},
            {"id": "a5", "name": "buttonText", "value": "", "type": "string"},
            {"id": "a6", "name": "buttonUrl", "value": "", "type": "string"}]}, "options": {}}},
        {"id": "u3", "name": "PB Login Update", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2, "position": [440, 300],
         "parameters": {"method": "POST", "url": "https://pb.runrebels.com/api/collections/_superusers/auth-with-password", "authentication": "genericCredentialType", "genericAuthType": "httpCustomAuth", "sendBody": True, "specifyBody": "json", "jsonBody": "{}"},
         "credentials": {"httpCustomAuth": {"id": "", "name": "PocketBase Superuser"}}},
        {"id": "u4", "name": "Crew laden", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2, "position": [660, 300],
         "parameters": {"method": "GET", "url": "=https://pb.runrebels.com/api/collections/crew/records?perPage=500&filter=status%3D%22bestaetigt%22", "sendHeaders": True,
                        "headerParameters": {"parameters": [{"name": "Authorization", "value": "={{ $('PB Login Update').first().json.token }}"}]}}},
        {"id": "u5", "name": "Mails bauen", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [880, 300], "parameters": {"jsCode": mit_vorlage(UPDATE_MAIL)}},
        {"id": "u6", "name": "Mail senden", "type": "n8n-nodes-base.emailSend", "typeVersion": 2.1, "position": [1100, 300],
         "parameters": {"fromEmail": "RunRebels <runner@runrebels.com>", "toEmail": "={{ $json.an }}", "subject": "={{ $json.betreff }}", "emailFormat": "both", "text": "={{ $json.text }}", "html": "={{ $json.html }}", "options": {"appendAttribution": False}},
         "credentials": SMTP}
      ],
      "connections": {
        "Start (von Hand)": {"main": [[{"node": "Update-Inhalt", "type": "main", "index": 0}]]},
        "Update-Inhalt": {"main": [[{"node": "PB Login Update", "type": "main", "index": 0}]]},
        "PB Login Update": {"main": [[{"node": "Crew laden", "type": "main", "index": 0}]]},
        "Crew laden": {"main": [[{"node": "Mails bauen", "type": "main", "index": 0}]]},
        "Mails bauen": {"main": [[{"node": "Mail senden", "type": "main", "index": 0}]]}
      }
    }
    (N8N / "crew-update.json").write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

if __name__ == "__main__":
    crew(); update()
