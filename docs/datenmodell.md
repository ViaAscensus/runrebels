# Datenmodell — PocketBase-Collections (Entwurf)

Entwurf für die **eigene** PocketBase-Instanz von RunRebels (nicht die von
ASCENSUS). Noch nicht angelegt — die Instanz selbst ist ein
Infrastruktur-Task (Coolify), kein Code-Task. Dieses Dokument ist die
Grundlage dafür, sobald die Instanz erreichbar ist.

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
| `grace_until` | date | 2027-02-03, letzter Zeitpunkt für Nachsynchronisation |
| `status` | select | `entwurf` / `anmeldung_offen` / `laeuft` / `kulanzfrist` / `final` |
| `km_goal` | number | Ziel für die Freie-Distanz/Kumulativ-Medaille |
| `bestzeit_distanz_km` | number | 10 |
| `pace_schwelle_maenner_sek` | number | Sekunden für 10 km, z. B. 1800 (30 Min) |
| `pace_schwelle_frauen_sek` | number | z. B. 1920–1980 (32–33 Min) |
| `kinderdistanz_km` | number | 1 |
| `kinderdistanz_max_alter` | number | 12 |
| `preis_cent` | number | Startgebühr, Line-Item 1 |
| `waehrung` | text | "EUR" |

## `teilnehmer`

Eine Registrierung für ein Event.

| Feld | Typ | Hinweis |
|---|---|---|
| `event` | relation → `events` | |
| `kategorie` | select | `erwachsen` / `kind` |
| `name` | text | |
| `email` | email | |
| `geschlecht` | select | `maennlich` / `weiblich` / `divers` — nur für `erwachsen` |
| `divers_oeffentlich_optin` | bool | default false, jederzeit widerrufbar |
| `podium_wahl` | select | `maennlich` / `weiblich` — nur relevant wenn `geschlecht = divers` und kein Opt-in |
| `eltern_name` | text | nur für `kategorie = kind`, Pflichtfeld bei Anlage |
| `eltern_email` | email | nur für `kategorie = kind` |
| `geburtsjahr` | number | zur Altersprüfung Kinderdistanz |
| `startnummer` | text | generiert bei Zahlungseingang |
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
| `status` | select | `offen` / `bezahlt` / `fehlgeschlagen` / `erstattet` |

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
| `adresse` | text | |
| `versand_status` | select | `offen` / `verpackt` / `versendet` |
| `versanddatum` | date | |
