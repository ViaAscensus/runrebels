# n8n-Workflows

Importieren: n8n → Workflows → ⋮ → *Import from file*.

## `anmeldung.json` — Webhook `POST /webhook/anmeldung`

Prüft die Anmeldung, legt `teilnehmer` (Status `offen`), `fulfillment` und
`bestellungen` (Status `offen`) in PocketBase an, erzeugt eine Stripe-Checkout-
Session und gibt `{ "checkout_url": ... }` zurück. Das Frontend leitet dorthin
weiter. Fehler kommen als `{ "fehler": "…" }` mit Status 400.

Credentials (in n8n anlegen, danach in den Nodes auswählen):

| Name | Typ | Inhalt |
|---|---|---|
| `PocketBase Superuser` | Custom Auth | `{"body":{"identity":"<superuser-mail>","password":"<passwort>"}}` |
| `Stripe Secret` | Header Auth | Name `Authorization`, Wert `Bearer sk_live_…` (zum Testen `sk_test_…`) |

Danach den Workflow **aktivieren** (nur dann gilt die Produktions-URL
`/webhook/anmeldung`).

Hinweis: Mehrfach begonnene, unbezahlte Anmeldungen derselben Person legen
mehrere `offen`-Datensätze an. Sie verfallen am Anmeldeschluss und werden
nach 30 Tagen gelöscht. Nur bezahlte werden `aktiv`.

## Workflow „RunRebels – Stripe Webhook" (`stripe-webhook.json`)

Empfängt `checkout.session.completed` von Stripe (`POST https://n8n.runrebels.com/webhook/stripe`).
Statt die Signatur zu prüfen, holt der Workflow die Session über die Stripe-API
(`GET /v1/checkout/sessions/{id}`) und verlässt sich nur auf deren Antwort. Ein gefälschter
Webhook-Aufruf kann so keine Zahlung vortäuschen.

Ablauf: Session prüfen (`payment_status = paid`) → PB Login → Bestellung/Teilnehmer/Event laden →
nächste Startnummer ermitteln → Teilnehmer `aktiv` + Startnummer, Bestellung `bezahlt`.
Idempotent: Eine bereits `bezahlte` Bestellung wird übersprungen (Stripe wiederholt Webhooks).

Nach dem Import müssen die Credentials zugewiesen werden: `Stripe test` (Header Auth) im Node
„Get Session" und `PocketBase Superuser` im Node „PB Login". Danach speichern und veröffentlichen.
Nach Zahlungseingang geht eine Bestätigungsmail von `runner@runrebels.com` raus (Nodes `Mail bauen` und `Bestätigung senden`). Dafür in n8n ein SMTP-Credential anlegen (Name `SMTP RunRebels`, `smtp.gmail.com`, Port 465, SSL, App-Passwort) und im Node zuweisen. Schlägt der Versand fehl, läuft der Workflow trotzdem durch (Startnummer ist dann vergeben, die Mail fehlt).

## Workflow „RunRebels – Zahlen" (`zahlen.json`)

`GET /webhook/zahlen?t=<zahlungs_token>` — Link aus den Erinnerungsmails. Sucht die `offene` Bestellung zum Token, erzeugt eine **frische** Stripe-Checkout-Session aus den `line_items` und leitet per 302 dorthin. Ungültig, bezahlt oder verfallen → Weiterleitung auf `zahlung.html?status=…`. Credentials: `PocketBase Superuser`, `Stripe test`.

Voraussetzung: Feld `bestellungen.zahlungs_token` (Text, unique, Autogenerate-Pattern `[a-z0-9]{32}`, keine API-Regeln).

## Workflow „RunRebels – Erinnerungen" (`erinnerungen.json`)

Stündlich. Versand nur 8–20 Uhr (Berlin).
- Erinnerung 1: 24 h nach Anmeldung, nur `offen`.
- Erinnerung 2: ab 4 Tage vor Ende des Anmeldeschluss-Tages, frühestens 24 h nach Erinnerung 1.
- Verfall: nach Ende des Anmeldeschluss-Tages `offen` → `verfallen` (Bestellung + Teilnehmer) plus Info-Mail.
- Löschung: 30 Tage nach Verfall werden Fulfillment, Bestellung und Teilnehmer gelöscht.

Schlägt der Mailversand fehl, wird nichts markiert und die nächste Stunde versucht es erneut. Credentials: `PocketBase Superuser`, `SMTP RunRebels`.

## Crew-Mails (HTML) und Updates

Alle Crew-Mails nutzen die gemeinsame Vorlage `n8n/mail-vorlage.js` und die Kopfbilder in
`web/assets/mail/` (Logo, Stempel und Überschrift in Bungee als PNG, weil Mailprogramme keine
Webfonts laden). Bilder neu erzeugen: `python3 scripts/mail_bilder.py`. Die Vorlage in die Workflows
übertragen: `python3 scripts/mails_bauen.py`, danach `crew.json` und `crew-update.json` in n8n
importieren bzw. die Code-Nodes übernehmen.

- **Bestätigungsmail** (`DOI-Mail bauen`) und **Willkommensmail** (`Bestätigung planen`) in `crew.json`.
- **Crew Mailfolge** (`crew-mails.json`, Mail nach 4 und 10 Tagen) ist stillgelegt: in n8n deaktivieren.
- **`crew-update.json`**: Updates von Hand. Im Node „Update-Inhalt" Betreff, Text (Absätze durch Leerzeile
  trennen) und optional Button eintragen. `empfaenger = test` schickt nur an `testAdresse`;
  erst mit `alle` geht die Mail an alle bestätigten Mitglieder (mit eigenem Abmeldelink).
  Start mit „Execute workflow".
