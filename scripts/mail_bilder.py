"""Erzeugt die Kopfbilder der Crew-Mails (web/assets/mail/*.png).

Mailprogramme laden keine Webfonts und zeigen SVG oft nicht. Deshalb sind
Logo, Stempel und Überschrift (Bungee) als PNG gerendert, in doppelter Auflösung.
Aufruf: python3 scripts/mail_bilder.py   (braucht playwright + Chromium)
"""
import os, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
WEB = ROOT / "web"
OUT = WEB / "assets" / "mail"
KOEPFE = {
    "kopf-bestaetigung": ("Fast drin", "Noch ein Klick."),
    "kopf-willkommen": ("Willkommen", "Du bist drin."),
    "kopf-update": ("Update", "Neuigkeiten aus der Crew."),
}
HTML = """<!doctype html><meta charset=utf-8><style>
@font-face{font-family:Bungee;src:url(file://%(w)s/fonts/Bungee-Regular.woff2)}
*{box-sizing:border-box}body{margin:0;width:600px;background:#0E6E75;color:#FFF4EA;font-family:Bungee}
.k{padding:28px 32px 26px}.logo{display:flex;align-items:center;gap:12px;margin-bottom:22px}
.logo img{width:46px;height:46px}.logo span{font-size:24px}
.soon{display:inline-block;background:#FFD84D;color:#0B3C41;font-size:15px;padding:5px 12px;border-radius:4px;transform:rotate(-2deg);text-transform:uppercase;margin-bottom:14px}
h1{font-weight:400;font-size:36px;line-height:1.1;margin:0;text-transform:uppercase}
</style><div class=k><div class=logo><img src="file://%(w)s/assets/logo/rr-streifen-kreis-sonnengelb.svg"><span>RUNREBELS</span></div>
<div class=soon>%(stempel)s</div><h1>%(titel)s</h1></div>"""
STREIFEN = """<!doctype html><style>body{margin:0;width:600px;height:14px;display:flex;overflow:hidden;background:#fff}
i{flex:1;transform:skewX(-20deg);margin:0 -6px}i:nth-child(1){background:#FF4D94}i:nth-child(2){background:#FFD84D}i:nth-child(3){background:#0B3C41}</style><i></i><i></i><i></i>"""

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--allow-file-access-from-files"])
        for name, (stempel, titel) in KOEPFE.items():
            pg = b.new_page(viewport={"width": 600, "height": 200}, device_scale_factor=2)
            f = OUT / (name + ".html"); f.write_text(HTML % {"w": str(WEB), "stempel": stempel, "titel": titel}, encoding="utf-8")
            pg.goto("file://" + str(f)); pg.wait_for_timeout(500)
            pg.locator(".k").screenshot(path=str(OUT / (name + ".png")))
            f.unlink()
        pg = b.new_page(viewport={"width": 600, "height": 14}, device_scale_factor=2)
        f = OUT / "streifen.html"; f.write_text(STREIFEN, encoding="utf-8")
        pg.goto("file://" + str(f)); pg.wait_for_timeout(200)
        pg.screenshot(path=str(OUT / "streifen.png")); f.unlink()
        b.close()

if __name__ == "__main__":
    main()
