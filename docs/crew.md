# Crew-Eintragung (Markenaufbau vor dem ersten Lauf)

Ziel der Seite in der Bekanntmachungsphase: Besucher tragen sich in die Crew ein
(Vorname, E-Mail, freiwillig „Wie läufst du?“). Social Media (Instagram, TikTok,
Facebook, Strava-Club) führt auf die Seite, die Seite führt in die Crew.

## Seiten

| Pfad | Inhalt |
|---|---|
| `/` | Marken-Startseite mit Crew-Formular |
| `/crew.html`, `/haltung.html`, `/spende.html`, `/einblicke.html` | Unterseiten, schlank gestartet |
| `/laufrausch/` | bisherige Anmeldung zum Laufrausch (unverändert, nur umgezogen) |
| `/crew-bestaetigt.html`, `/crew-abgemeldet.html` | Ziele der Links in den Mails (`noindex`) |

`danke.html` und `zahlung.html` bleiben im Hauptverzeichnis, damit die Rücksprung-
Adressen von Stripe weiter stimmen. Der `cancel_url` in `n8n/anmeldung.json` zeigt
jetzt auf `/laufrausch/#anmeldung`. **Den Workflow in n8n neu importieren.**

## Design

`web/css/runrebels.css` (Bausteine `run-…`, Paletten, Schriften) kommt aus dem
RunRebels-Designsystem. `web/css/site.css` enthält nur das Seitenlayout. Die
Laufrausch-Seite nutzt vorerst weiter `style.css` (Platzhalter-Palette).

Seiten werden von Hand gepflegt. Header und Footer stehen in jeder Datei.

## PocketBase: Collection `crew`

| Feld | Typ | Hinweis |
|---|---|---|
| `vorname` | text | Pflicht |
| `email` | email | Pflicht, eindeutig (Unique-Index) |
| `stil` | text | freiwillig, max. 120 Zeichen, nur für die Ansprache |
| `status` | select | `unbestaetigt` / `bestaetigt` / `abgemeldet` |
| `token` | text | **Autogenerate-Muster `[a-z0-9]{40}`**, für den Bestätigungslink |
| `abmelde_token` | text | **Autogenerate-Muster `[a-z0-9]{40}`**, für den Abmeldelink |
| `eingetragen_am` | text | Zeitpunkt der Eintragung |
| `bestaetigt_am` | text | Zeitpunkt der Bestätigung |
| `mail2_gesendet` | text | gesetzt vom Workflow `crew-mails.json` |
| `mail3_gesendet` | text | gesetzt vom Workflow `crew-mails.json` |
| `einwilligung_text` | text | Nachweis der Einwilligung |

Zugriffsregeln: alle leer (nur Superuser). Der Zugriff läuft ausschließlich über n8n.
Zeitfelder sind als `text` angelegt (Format `YYYY-MM-DD HH:MM:SS.000Z`), so wie in
den bestehenden Workflows geparst.

Unbestätigte Eintragungen werden nach 30 Tagen gelöscht (so steht es in der
Datenschutzerklärung), siehe `n8n/crew-aufraeumen.json`.

## n8n

- `n8n/crew.json`: drei Webhooks. `POST /webhook/crew` (Eintragung, schickt die
  Bestätigungsmail), `GET /webhook/crew-bestaetigen?t=…` (setzt `bestaetigt`, schickt
  Mail 1, leitet auf `/crew-bestaetigt.html`), `GET /webhook/crew-abmelden?t=…`.
- `n8n/crew-mails.json`: täglich 9 Uhr. Mail 2 ab Tag 4, Mail 3 ab Tag 10 nach der
  Bestätigung, nur zwischen 8 und 20 Uhr, mit Abmeldelink.

- `n8n/crew-aufraeumen.json`: täglich 3 Uhr. Löscht Einträge mit `status = unbestaetigt`
  und `eingetragen_am` älter als 30 Tage endgültig. Bestätigte und abgemeldete bleiben.
  Nach dem Import Credential `PocketBase Superuser` zuweisen und veröffentlichen.

Credentials wie bei den bestehenden Workflows (`PocketBase Superuser`, `SMTP RunRebels`).
Eine Adresse, die schon bestätigt ist, bekommt keine Fehlermeldung, damit niemand
herausfinden kann, wer in der Crew ist.

## Vor dem Livegang

1. Collection `crew` anlegen, beide Workflows importieren, Credentials zuweisen, aktivieren.
2. Social-Adressen in `web/js/config.js` unter `SOCIAL` eintragen. Leer = kein Link.
3. Datenschutzerklärung (Abschnitt „Crew-Eintragung“) und Einwilligungstext juristisch prüfen.
4. Zweck und Betrag der Spende vor dem Laufrausch festlegen (siehe `docs/rechtliche-pruefpunkte.md`).
5. Testlauf: Eintragen, Mail bestätigen, Abmelden, mit zwei Adressen.
