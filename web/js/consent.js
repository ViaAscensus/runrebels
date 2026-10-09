// Einwilligungsverwaltung (Klaro, selbst gehostet) und Tracking. Nichts wird vor der Einwilligung geladen.
(function () {
  var C = window.RUNREBELS || {};
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  // Consent Mode v2: alles verweigert, bis der Teilnehmer zustimmt
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied'
  });

  function loadScript(src) {
    var s = document.createElement('script');
    s.async = true; s.src = src;
    document.head.appendChild(s);
  }

  var services = [];

  if (C.GA_ID) {
    services.push({
      name: 'google-analytics',
      title: 'Google Analytics',
      purposes: ['statistics'],
      default: false,
      cookies: [/^_ga/, /^_gid/],
      callback: function (consent) {
        if (consent) {
          if (!window.__gaLoaded) {
            window.__gaLoaded = true;
            loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.GA_ID));
            gtag('js', new Date());
            gtag('config', C.GA_ID);
          }
          gtag('consent', 'update', { analytics_storage: 'granted' });
          if (/danke(\.html)?$/.test(location.pathname)) {
            var done = false;
            try { done = sessionStorage.getItem('rr_conv') === '1'; } catch (e) {}
            if (!done) {
              gtag('event', 'anmeldung_abgeschlossen');
              try { sessionStorage.setItem('rr_conv', '1'); } catch (e) {}
            }
          }
        } else {
          gtag('consent', 'update', { analytics_storage: 'denied' });
        }
      }
    });
  }

  if (C.CLARITY_ID) {
    services.push({
      name: 'microsoft-clarity',
      title: 'Microsoft Clarity',
      purposes: ['statistics'],
      default: false,
      cookies: [/^_clck/, /^_clsk/, /^CLID/, /^ANONCHK/, /^MR$/, /^MUID/, /^SM$/],
      callback: function (consent) {
        if (consent) {
          if (!window.__clarityLoaded) {
            window.__clarityLoaded = true;
            window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
            loadScript('https://www.clarity.ms/tag/' + encodeURIComponent(C.CLARITY_ID));
          }
        } else if (window.clarity) {
          try { window.clarity('consent', false); } catch (e) {}
        }
      }
    });
  }

  window.klaroConfig = {
    version: 1,
    elementID: 'klaro',
    storageMethod: 'cookie',
    cookieName: 'runrebels_consent',
    cookieExpiresAfterDays: 365,
    default: false,
    mustConsent: false,
    acceptAll: true,
    hideDeclineAll: false,
    hideLearnMore: false,
    noticeAsModal: false,
    lang: 'de',
    privacyPolicy: '/datenschutz.html',
    purposes: ['statistics'],
    services: services,
    translations: {
      de: {
        consentNotice: {
          description: 'Wir würden gern Statistik-Dienste einsetzen, um RunRebels zu verbessern. Das passiert nur mit deiner Einwilligung. Die Seite funktioniert auch ohne.',
          learnMore: 'Einstellungen'
        },
        consentModal: {
          title: 'Datenschutzeinstellungen',
          description: 'Hier entscheidest du, welche Dienste wir einsetzen dürfen. Du kannst deine Auswahl jederzeit ändern.'
        },
        purposes: { statistics: { title: 'Statistik und Reichweitenmessung', description: 'Hilft uns zu verstehen, wie die Seite genutzt wird.' } },
        'google-analytics': { description: 'Misst pseudonym, wie die Seite genutzt wird und wie viele Anmeldungen abgeschlossen werden.' },
        'microsoft-clarity': { description: 'Zeichnet Klicks, Scrollen und Mausbewegungen als Heatmap auf. Eingaben in Formularfelder werden maskiert.' },
        acceptAll: 'Alle akzeptieren',
        acceptSelected: 'Auswahl speichern',
        decline: 'Ablehnen',
        ok: 'Akzeptieren'
      }
    }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-consent-settings]');
    if (el && window.klaro) { e.preventDefault(); window.klaro.show(window.klaroConfig); }
  });
})();
