/* ============================================================
   Documentation navigation config — SINGLE SOURCE OF TRUTH.

   Every docs page's sidebar, breadcrumb category, and previous/next
   links are generated from this file by js/docs.js. To add a new
   article: add one { title, href } line to the right category below.
   Nothing else needs to change on existing pages.

   Hrefs are relative to the docs/ folder (all docs pages live there
   as siblings) — no docs/ prefix and no docs- filename prefix.

   Hrefs have NO .html extension. Production has a Cloudways "Internal
   rewrite" Web Rule (^/docs/([a-z0-9-]+)$ -> /docs/$1.html) that
   serves the real file while keeping the clean URL in the browser —
   without that rule, these links would 404. If docs/ is ever moved to
   different hosting, recreate an equivalent rewrite rule first, or
   revert these hrefs to include .html.
   ============================================================ */

var DOCS_HOME = { title: "Documentatie", href: "./" };

var DOCS_NAV = [
  {
    category: "Aan de slag",
    items: [
      { title: "Overzicht: wat is het dashboard", href: "overzicht-dashboard" },
      { title: "Account aanmaken en gratis starten", href: "account-aanmaken" },
      { title: "Uw agent instellen (checklist)", href: "eerste-agent-instellen" },
      { title: "Toegang en rollen", href: "toegang-en-rollen" },
      { title: "Systeemvereisten", href: "systeemvereisten" }
    ]
  },
  {
    category: "Uw agent",
    items: [
      { title: "Telefoon instellen", href: "telefoon-instellen" },
      { title: "Uw nummer aanzetten en doorschakelen", href: "telefoon-doorschakelen" },
      { title: "Gesprekken en terugbelverzoeken", href: "telefoon-gesprekken" },
      { title: "E-mail instellen", href: "agent-email-triage" },
      { title: "Wat uw agent weet", href: "kennis-bedrijfsprofiel" }
    ]
  },
  {
    category: "Koppelingen",
    items: [
      { title: "Overzicht", href: "koppelingen-overzicht" },
      { title: "WooCommerce", href: "koppeling-woocommerce" },
      { title: "Shopify", href: "koppeling-shopify" },
      { title: "Lightspeed eCom", href: "koppeling-lightspeed" },
      { title: "Shopware", href: "koppeling-shopware" },
      { title: "Magento Open Source", href: "koppeling-magento" },
      { title: "bol.com", href: "koppeling-bol" },
      { title: "PrestaShop", href: "koppeling-prestashop" },
      { title: "Google Agenda", href: "koppeling-google-agenda" },
      { title: "Calendly", href: "koppeling-calendly" },
      { title: "Guestplan", href: "koppeling-guestplan" }
    ]
  },
  {
    category: "Abonnement en tegoed",
    items: [
      { title: "Pakketten en abonnement", href: "pakketten-en-abonnement" },
      { title: "Tegoed en credits", href: "tegoed-en-credits" }
    ]
  },
  {
    category: "Voor uw IT-partner",
    items: [
      { title: "Overzicht voor IT-partners", href: "it-overzicht" },
      { title: "Beveiliging & gegevensverwerking", href: "it-beveiliging" },
      { title: "Netwerkvereisten", href: "it-netwerkvereisten" }
    ]
  },
  {
    category: "Problemen oplossen & FAQ",
    items: [
      { title: "Veelgestelde vragen", href: "faq" },
      { title: "Uw agent neemt niet op of doet niets", href: "faq-agent-voert-geen-taken-uit" },
      { title: "Een koppeling werkt niet meer", href: "faq-koppeling-werkt-niet" },
      { title: "Contact opnemen met support", href: "faq-contact-support" }
    ]
  }
];

/* koppeling-pipedrive is deliberately NOT listed (2026-10-21): the dashboard
   hides the CRM tiles from new accounts since 2026-10-17
   (config/koppelingen.php there). The page stays reachable for clients who
   already connected Pipedrive and for the dashboard's own doc_url link. */
