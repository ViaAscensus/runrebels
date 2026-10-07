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
