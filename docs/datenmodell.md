# Datenmodell — PocketBase-Collections (Entwurf)

Datenmodell der **eigenen** PocketBase-Instanz von RunRebels (nicht die von
ASCENSUS, `pb.runrebels.com`). Die Collections sind angelegt; dieses Dokument
ist die Quelle der Wahrheit für Felder und Status. Stand der Planung:
Entscheidungen 1–33 (siehe `docs/architektur.md`).

Jede Collection trägt bewusst ein `organizer`-Feld, auch im Single-Tenant-
Piloten — das macht eine spätere Multi-Tenant-Erweiterung zu einer
Erweiterung, nicht zu einem Rewrite der Collections.

## `events`

Eine Challenge-Instanz (z. B. "Laufrausch — Neujahrschallenge 2027").

| Feld | Typ | Hinweis |
|---|---|---|
| `organizer` | relation → `organizers` | Platzhalter-Relation für Multi-Tenant, im Piloten nur ein Eintrag |
| `name` | text | "Laufrausch" |
| `slug` | text | für URLs |
| `start_date` | date | 2027-01-01 |
| `end_date` | date | 2027-01-31 |
| `anmeldeschluss` | date | letzter Tag für Anmeldung **und** kostenlose Stornierung; danach werden unbezahlte Anmeldungen `verfallen` |
| `grace_until` | date | 2027-02-03 (3 Tage Kulanzfrist nach `end_date`), letzter Zeitpunkt für Nachsynchronisation und Einreichung |
| `status` | select | `entwurf` / `anmeldung_offen` / `laeuft` / `kulanzfrist` / `final` |
| `km_goal` | number | Ziel für die Freie-Distanz/Kumulativ-Medaille |
| `bestzeit_distanz_km` | number | 10 |
| `pace_schwelle_maenner_sek` | number | Sekunden für 10 km, z. B. 1800 (30 Min) |
| `pace_schwelle_frauen_sek` | number | z. B. 1920–1980 (32–33 Min) |
| `kinderdistanz_km` | number | 1 |
| `kinderdistanz_max_alter` | number | 12 |
| `preis_cent` | number | Startgebühr, Line-Item 1 |
| `waehrung` | text | "EUR" |
| `eventskuerzel` | text | Kürzel für die Startnummer, z. B. `LR27`; wird im PocketBase-Admin gepflegt |
| `aufschlag_ch_cent` | number | Versandaufschlag Schweiz, wird als eigenes Line-Item hinzugefügt (Höhe offen) |

## `teilnehmer`

Eine Registrierung für ein Event.

| Feld | Typ | Hinweis |
|---|---|---|
| `event` | relation → `events` | |
| `kategorie` | select | `erwachsen` / `kind` |
| `name` | text | |
| `anzeigename` | text | frei wählbar, einziger Name in der öffentlichen Rangliste (nie bei `kategorie = kind`) |
| `email` | email | |
| `geschlecht` | select | `maennlich` / `weiblich` / `divers` — nur für `erwachsen` |
| `divers_oeffentlich_optin` | bool | default false, jederzeit widerrufbar |
| `podium_wahl` | select | `maennlich` / `weiblich` — nur relevant wenn `geschlecht = divers` und kein Opt-in |
| `eltern_name` | text | nur für `kategorie = kind`, Pflichtfeld bei Anlage |
| `eltern_email` | email | nur für `kategorie = kind` |
| `geburtsjahr` | number | zur Altersprüfung Kinderdistanz |
| `startnummer` | text | `<eventskuerzel>-<laufende Nr., 4-stellig>`, z. B. `LR27-0001`; vom Stripe-Webhook-Workflow bei Zahlungseingang vergeben |
| `status` | select | `offen` (vor Zahlung) / `aktiv` / `storniert` / `verfallen` — Rangliste, Medaillen-Liste und Einreichungen filtern auf `aktiv` |
| `gesperrt` | bool | default false, manuell durch den Prüfer (z. B. bei Betrugsverdacht), blockiert neue Einreichungen |
| `agb_akzeptiert_am` | datetime | Nachweis der Zustimmung zu Teilnahmebedingungen/Datenschutz |
| `strava_athlete_id` | text | nullable, gesetzt nach OAuth-Verknüpfung |
| `strava_access_token` | text | verschlüsselt speichern |
| `strava_refresh_token` | text | verschlüsselt speichern |

## `bestellungen`

Zahlungs-/Checkout-Datensatz, als Line-Items statt Festpreis.

| Feld | Typ | Hinweis |
|---|---|---|
| `teilnehmer` | relation → `teilnehmer` | |
| `stripe_payment_intent_id` | text | |
| `line_items` | json | `[{"typ": "startgebuehr", "betrag_cent": ...}]` — spätere Merch-Line-Items kommen hier als weitere Array-Einträge dazu |
| `betrag_gesamt_cent` | number | |
| `status` | select | `offen` / `bezahlt` / `fehlgeschlagen` / `erstattet` / `storniert` / `verfallen` |
| `zahlungs_token` | text, unique | zufällig (PocketBase-Autogenerate `[a-z0-9]{32}`), nur für den Zahlungslink `…/webhook/zahlen?t=<token>`, gültig solange `status = offen`; keine API-Regeln (nur Superuser) |
| `erinnerung1_gesendet` | datetime | 24 h nach Anmeldung, nur bei `offen` — verhindert Doppelversand |
| `erinnerung2_gesendet` | datetime | 3 Tage vor Ende des Anmeldeschluss-Tages, nur bei `offen`, frühestens 24 h nach Erinnerung 1 |

Aufbewahrung: Bestelldaten bleiben für die Buchhaltung erhalten.
`verfallen` (am Anmeldeschluss unbezahlt) wird 30 Tage später samt
Teilnehmer und Adresse gelöscht.

## `einreichungen`

Eine einzelne Lauf-Aktivität, egal über welchen der drei Wege eingereicht.

| Feld | Typ | Hinweis |
|---|---|---|
| `teilnehmer` | relation → `teilnehmer` | |
| `event` | relation → `events` | |
| `quelle` | select | `strava` / `datei` / `foto` |
| `distanz_km` | number | |
| `dauer_sekunden` | number | |
| `pace_sek_pro_km` | number | berechnet |
| `aktivitaet_zeitstempel` | datetime | wann gelaufen, nicht wann eingereicht |
| `strava_activity_id` | text | nullable, nur bei `quelle = strava` |
| `datei` | file | .fit/.gpx, nur bei `quelle = datei` |
| `foto` | file | nur bei `quelle = foto` |
| `ki_ausgelesene_werte` | json | Rohausgabe der Vision-KI, nur bei `quelle = foto` |
| `teilnehmer_bestaetigt` | bool | Pflicht `true` bei `quelle = foto`, bevor die Einreichung zählt |
| `zaehlt_fuer_bestzeit` | bool | nur `true` wenn `distanz_km` ≈ `bestzeit_distanz_km` des Events |
| `status` | select | `eingereicht` / `ok` / `verdacht` / `abgelehnt` |
| `ablehnungsgrund` | text | Pflicht bei `abgelehnt`, wird dem Teilnehmer per Mail genannt. Limit: max. 3 abgelehnte Einreichungen pro Teilnehmer und Tag (aus `geprueft_am` berechnet, kein Zähler-Feld) |
| `verdacht_grund` | text | welcher Schwellenwert ausgelöst hat |
| `ki_einschaetzung` | text | kurze KI-Zusammenfassung des Falls, nur bei `status = verdacht` |
| `geprueft_von` | text | Name des menschlichen Prüfers |
| `geprueft_am` | datetime | |

## `standings` (berechnete Rangliste, gecacht)

Nicht die Quelle der Wahrheit (das sind die `einreichungen`), sondern ein
Cache für performante Ranglisten-Anzeige — neu berechnet bei jeder neuen
`ok`-Einreichung oder per Cronjob.

| Feld | Typ | Hinweis |
|---|---|---|
| `teilnehmer` | relation → `teilnehmer` | |
| `event` | relation → `events` | |
| `kumulativ_km` | number | Summe aller `ok`-Einreichungen |
| `kumulativ_ziel_erreicht` | bool | `kumulativ_km >= event.km_goal` |
| `bestzeit_sek` | number | schnellste `ok`-Einreichung mit `zaehlt_fuer_bestzeit = true` |
| `bestzeit_platz` | number | Rang innerhalb `podium_wahl`-Kategorie |
| `punkte_kumulativ` | number | 1 Punkt/km |
| `punkte_platzierung` | number | max. 50, aus `bestzeit_platz` |
| `punkte_gesamt` | number | Summe, Basis der Januar-Gesamtwertung |
| `aktualisiert_am` | datetime | |

## `fulfillment`

| Feld | Typ | Hinweis |
|---|---|---|
| `teilnehmer` | relation → `teilnehmer` | |
| `medaillen_typ` | select | `teilnahme` / `bestzeit_top3` / `kind` |
| `adresse` | text | Straße, Nr., PLZ, Ort — wird bei der Anmeldung angelegt, nach Medaillenversand gelöscht |
| `land` | select | `DE` / `AT` / `CH` (bei `CH` kommt `events.aufschlag_ch_cent` als Line-Item dazu) |
| `versand_status` | select | `offen` / `verpackt` / `versendet` |
| `versanddatum` | date | |
