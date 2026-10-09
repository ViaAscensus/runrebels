#!/usr/bin/env python3
"""Legt die PocketBase-Collection `crew` samt Feldern an (PocketBase ab v0.23).

Aufruf:
    python3 crew_collection.py

Fragt nach der Superuser-E-Mail und dem Passwort. Alternativ per Umgebung:
    PB_URL, PB_EMAIL, PB_PASSWORD
Läuft nur Standardbibliothek, nichts zu installieren.
"""
import getpass
import json
import os
import sys
import urllib.error
import urllib.request

PB_URL = os.environ.get("PB_URL", "https://pb.runrebels.com").rstrip("/")


def call(method, path, body=None, token=None):
    req = urllib.request.Request(
        PB_URL + path,
        data=json.dumps(body).encode() if body is not None else None,
        method=method,
        headers={"Content-Type": "application/json"},
    )
    if token:
        req.add_header("Authorization", token)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        print(f"Fehler {e.code} bei {method} {path}:\n{e.read().decode()}")
        sys.exit(1)


def text(name, required=False, max_len=0, autogenerate=None):
    f = {"type": "text", "name": name, "required": required, "max": max_len}
    if autogenerate:
        f["autogeneratePattern"] = autogenerate
    return f


email = os.environ.get("PB_EMAIL") or input("PocketBase-Superuser E-Mail: ").strip()
password = os.environ.get("PB_PASSWORD") or getpass.getpass("Passwort: ")

auth = call("POST", "/api/collections/_superusers/auth-with-password",
            {"identity": email, "password": password})
token = auth["token"]

collection = {
    "name": "crew",
    "type": "base",
    # Alle Regeln leer (null) = nur Superuser. Zugriff läuft ausschließlich über n8n.
    "listRule": None,
    "viewRule": None,
    "createRule": None,
    "updateRule": None,
    "deleteRule": None,
    "fields": [
        text("vorname", required=True, max_len=100),
        {"type": "email", "name": "email", "required": True},
        text("stil", max_len=120),
        {"type": "select", "name": "status", "required": True, "maxSelect": 1,
         "values": ["unbestaetigt", "bestaetigt", "abgemeldet"]},
        text("token", required=True, autogenerate="[a-z0-9]{40}"),
        text("abmelde_token", required=True, autogenerate="[a-z0-9]{40}"),
        text("eingetragen_am"),
        text("bestaetigt_am"),
        text("mail2_gesendet"),
        text("mail3_gesendet"),
        text("einwilligung_text", max_len=2000),
    ],
    "indexes": [
        "CREATE UNIQUE INDEX idx_crew_email ON crew (email)",
        "CREATE UNIQUE INDEX idx_crew_token ON crew (token)",
        "CREATE UNIQUE INDEX idx_crew_abmelde_token ON crew (abmelde_token)",
    ],
}

existing = call("GET", "/api/collections?filter=" + urllib.request.quote('name="crew"'), token=token)
if existing.get("items"):
    print("Collection `crew` gibt es schon. Nichts geändert.")
    sys.exit(0)

res = call("POST", "/api/collections", collection, token=token)
print(f"Collection `{res['name']}` angelegt mit {len(res['fields'])} Feldern (inkl. id).")
