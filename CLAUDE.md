# RunRebels

Plattform für virtuelle Laufchallenges. Erste Challenge: **Laufrausch** —
die Neujahrschallenge. Eigenständiges Projekt, rechtlich verantwortet von
ASCENSUS (Patrick Spengler, Einzelunternehmen), markentechnisch bewusst
getrennt von ascensus.fit.

Dieses Dokument ist der Einstiegspunkt für jede Arbeit in diesem Repo.
Die ausführliche Spezifikation steht in `docs/architektur.md`
(Produktentscheidungen) und `docs/datenmodell.md` (PocketBase-Collections).
Beide sind das Ergebnis eines langen Abstimmungsprozesses mit dem
Projektinhaber — Abweichungen von dort nur nach expliziter Rücksprache,
nicht aus eigener Annahme.

## Status

Repo gerade angelegt, noch kein Code. Infrastruktur (Coolify, eigene
PocketBase- und n8n-Instanz) existiert noch nicht — siehe "Offene Punkte"
in `docs/architektur.md`.

## Grundprinzipien

- **Single-Tenant für den Piloten**, aber Datenmodell von Anfang an mit
  einem `organizer`-Feld, damit eine spätere Multi-Tenant-Erweiterung kein
  Rewrite erfordert.
- **Line-Item-Checkout** von Anfang an (nicht ein einzelner Festpreis),
  damit Merchandise später als zusätzliches Line-Item dazukommt, ohne den
  Checkout-Flow neu zu bauen.
- **Drei gleichwertige Einreichungswege** für Lauf-Ergebnisse:
  Strava-OAuth, .FIT/.GPX-Datei-Upload, manueller Foto-Upload. Keine eigene
  Tracking-App.
- **KI entscheidet nie selbst** über Anti-Cheat-Fälle — sie liest Fotos aus
  (mit aktiver Bestätigung durch den Teilnehmer) und liefert bei
  Auffälligkeiten eine Einschätzung, die finale Entscheidung bleibt beim
  Menschen.
- **Technisch für 10x der erwarteten Teilnehmerzahl auslegen** (Datenbank/
  Hosting), ohne die eigentlichen operativen Engpässe (manuelle Prüfung,
  Medaillen-Bestand, Zahlungsvolumen) zu verwechseln — die skalieren nicht
  automatisch mit.
- **Keine Merchandise-Artikel im Piloten**, aber Datenmodell/Checkout so
  bauen, dass das eine Erweiterung ist, kein Rewrite.
- **CI ist vorläufig.** Platzhalter-Palette (Magenta/Tiefpurpur, siehe
  `docs/architektur.md`), über CSS-Variablen austauschbar — noch nicht
  final entschieden, blockiert aber nicht den technischen Bau.

## Konventionen

- Deutsche Produktsprache: Du-Form, "rebellisch im Ton, seriös in der
  Auswertung" (siehe Markenphilosophie in `docs/architektur.md`).
- Keine öffentliche Rangliste mit Namen/Platzierungen von Minderjährigen
  (Kinderdistanz ist nicht-kompetitiv, nur Teilnahme-Urkunde).
- Divers-Kategorie: Zeit zählt immer, öffentliche Sichtbarkeit nur nach
  ausdrücklichem, widerrufbarem Opt-in.
