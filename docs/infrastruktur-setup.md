# Infrastruktur-Setup — Coolify, PocketBase, n8n

Checkliste zum Ausführen (z. B. durch Claude Cowork mit Zugriff auf das
Coolify-Dashboard und den Server). Jeder Schritt ist einzeln abhakbar.
Reihenfolge ist absichtlich so gewählt, dass jeder Schritt auf dem
vorherigen aufbaut — nicht vorziehen.

Kontext, falls der ausführende Agent das Repo sonst nicht kennt: RunRebels
läuft auf **demselben Hostinger-VPS wie ascensus.fit** (Coolify, Paris), aber mit
**eigener** PocketBase- und **eigener** n8n-Instanz — keine der beiden
wird mit ASCENSUS geteilt. Details zu Datenmodell/Architektur stehen in
`docs/architektur.md` und `docs/datenmodell.md`.

## 0. Vorbereitung — Entscheidungen, die VOR dem ersten Klick stehen müssen

- [x] **Domain festlegen und registrieren.** Entschieden: **runrebels.com**
      (Porkbun, Okt 2026, im selben Account wie ascensus.fit).
- [x] DNS-Zugriff auf diese Domain sicherstellen (A-Record/CNAME auf den
      Hostinger-VPS setzen können).
- [x] Zugriff auf das Coolify-Dashboard des bestehenden Hostinger-VPS
      bestätigen (dasselbe, auf dem ascensus.fit läuft).

Ab hier wird `<domain>` als Platzhalter für die in diesem Schritt
festgelegte Domain verwendet (= `runrebels.com`). Server-IP: siehe
ascensus.fit (Hostinger-VPS).

> **Stand 06.10.2026:** Abschnitte 0–4, 6 und 7 sind ausgeführt.
> Abschnitt 5 (externe API-Zugänge) ist noch offen.

## 1. DNS

- [x] A-Record `<domain>` → Server-IP (dieselbe IP wie ascensus.fit).
      Der Porkbun-Standardeintrag (ALIAS auf die Parkseite) musste dafür
      ersetzt werden; MX/SPF/Wildcard-CNAME bleiben unberührt.
- [x] A-Record `pb.<domain>` → Server-IP (eigene PocketBase-Subdomain,
      analog zu `pb.ascensus.fit`)
- [x] A-Record `n8n.<domain>` → Server-IP (eigene n8n-Subdomain)
- [x] Propagation abwarten/prüfen (`dig <domain>` / `dig pb.<domain>`),
      bevor in Coolify ein Domain-Binding versucht wird — sonst schlägt
      die automatische SSL-Zertifikatsausstellung (Let's Encrypt) fehl.

## 2. Coolify — neues Projekt anlegen

- [x] In Coolify ein **neues Projekt** `RunRebels` anlegen (getrennt vom
      bestehenden ASCENSUS-Projekt, auch wenn beide auf demselben Server
      laufen — das hält Umgebungsvariablen, Logs und Zugriffsrechte
      auseinander).
- [x] Innerhalb dieses Projekts drei Resources anlegen (die folgenden
      Abschnitte).

## 3. Coolify — PocketBase-Instanz

- [x] Neue Resource → **Docker Image** (kein "Database"-Preset
      verwenden — PocketBase läuft als eigenständiger Dienst mit
      eingebauter SQLite-Datei, nicht als separate DB-Resource).
- [x] Image: `ghcr.io/muchobien/pocketbase:latest` (gängiges,
      gepflegtes PocketBase-Docker-Image — alternativ offizielles
      PocketBase-Binary in einem minimalen eigenen Dockerfile, falls eine
      bestimmte PocketBase-Version erzwungen werden soll).
- [x] **Persistent Volume** einrichten für `/pb_data` — ohne dieses Volume
      sind alle Daten nach einem Redeploy weg. Das ist der Schritt, der am
      leichtesten übersehen wird.
- [x] Port `8090` exponieren.
- [x] Domain binden: `pb.<domain>`, SSL/Let's Encrypt automatisch über
      Coolify aktivieren.
- [x] Container starten, dann den Admin-Account der neuen Instanz anlegen
      (eigener Account, nicht der von pb.ascensus.fit). Bei aktuellen
      PocketBase-Versionen zeigt `/_/` nur ein Login: den Install-Link
      (`/_/#/pbinstall/<token>`, ca. 30 Min gültig) aus den
      Coolify-Runtime-Logs der Resource nehmen, Host auf `pb.<domain>`
      setzen und dort den Superuser anlegen.
- [x] **Noch nicht** die Collections aus `docs/datenmodell.md` anlegen —
      das ist Abschnitt 6, nachdem die Instanz läuft und erreichbar ist.

## 4. Coolify — n8n-Instanz

- [x] Neue Resource → in Coolify gibt es meist ein fertiges **n8n-Template**
      (One-Click-Service) — das bevorzugen, statt ein eigenes Docker-Image
      zu konfigurieren, spart Umgebungsvariablen-Fehler.
- [x] **Persistent Volume** für `/home/node/.n8n` sicherstellen (enthält
      Workflows, Credentials, Datenbank) — gleiches Risiko wie bei
      PocketBase: ohne Volume ist nach einem Redeploy alles weg.
- [x] Domain binden: `n8n.<domain>`, SSL aktivieren.
- [x] **Owner-Account sofort nach dem Deploy anlegen** (`https://n8n.<domain>`).
      `N8N_BASIC_AUTH_*` gibt es in n8n 2.x nicht mehr; bis der Owner
      existiert, kann der erste Besucher die Instanz übernehmen.
- [x] `N8N_ENCRYPTION_KEY` setzen (ein zufälliger String; in Coolify unter
      Environment Variables des n8n-Service — prüfen, ob der Container ihn
      wirklich erhält) — verschlüsselt
      gespeicherte Credentials innerhalb von n8n. Einmal gesetzt, nie mehr
      ändern (sonst werden bestehende verschlüsselte Credentials
      unlesbar).

## 5. Externe API-Zugänge vorbereiten (unabhängig von Coolify, aber vor Schritt 6 nötig)

- [ ] **Strava-API-Anwendung registrieren** unter
      `https://www.strava.com/settings/api` — liefert `Client ID` und
      `Client Secret` für den OAuth-Flow. Callback-Domain muss dort auf
      `<domain>` gesetzt werden.
- [ ] **Stripe:** keine neue Einrichtung nötig — läuft laut
      `docs/architektur.md` bewusst über das bestehende
      ASCENSUS-Stripe-Konto. Nur sicherstellen, dass die
      API-Keys (Secret Key) dem ausführenden System hier zugänglich
      gemacht werden (als Umgebungsvariable an der Resource, die den
      Checkout later verarbeitet — noch nicht gebaut).
- [ ] **Vision-KI für den Foto-Upload-Pfad:** API-Key für den gewählten
      Anbieter (z. B. Claude-API) bereitstellen, sobald der
      Foto-Auslese-Baustein gebaut wird — noch kein Coolify-Schritt, nur
      als Hinweis, dass der Key an dieser Stelle gebraucht wird.

## 6. PocketBase-Collections anlegen

- [x] Sobald `pb.<domain>` erreichbar ist: die sieben Collections aus
      `docs/datenmodell.md` anlegen (`events`, `teilnehmer`,
      `bestellungen`, `einreichungen`, `standings`, `fulfillment`, plus
      eine `organizers`-Collection für das `organizer`-Feld).
      Umsetzung: über *Settings → Import collections* mit aktivem **„Merge
      with the existing collections"** (sonst werden System-Collections
      gelöscht). Bei PocketBase 0.40 braucht **jedes Feld eine eigene
      `id`**, sonst werden Felder beim Import verworfen.
      Reihenfolge wegen der Relations: `organizers` → `events` →
      `teilnehmer` → `bestellungen`/`einreichungen` → `standings` →
      `fulfillment`.
- [x] Für den Piloten in `organizers` genau einen Datensatz anlegen
      (ASCENSUS), damit `events.organizer` etwas zum Verweisen
      hat.

## 7. Verifikation

- [x] `curl -I https://pb.<domain>/api/health` → erwartete Antwort `200`.
- [x] `curl -I https://n8n.<domain>` → n8n lädt (`/healthz` → ok),
      Owner-Account existiert.
- [x] In PocketBase-Admin prüfen: alle sieben Collections sichtbar, Relations
      korrekt verlinkt (keine „broken relation"-Warnung).
- [x] Diese Checkliste im Repo abhaken/committen, damit der nächste
      Schritt (Anwendungscode: Registrierung, Strava-OAuth-Handler,
      Checkout) auf einer bestätigt laufenden Infrastruktur aufsetzt statt
      auf einer Annahme.
