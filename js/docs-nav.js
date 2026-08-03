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
      { title: "Uw eerste agent instellen (checklist)", href: "eerste-agent-instellen" },
      { title: "Toegang en rollen", href: "toegang-en-rollen" },
      { title: "Systeemvereisten", href: "systeemvereisten" }
    ]
  },
  {
    category: "Agents",
    items: [
      { title: "CRM sync", href: "agent-crm-sync" },
      { title: "Email triage", href: "agent-email-triage" },
      { title: "Invoice processing", href: "agent-invoice-processing" },
      { title: "Lead enrichment", href: "agent-lead-enrichment" },
      { title: "Report generator", href: "agent-report-generator" }
    ]
  },
  {
    category: "Koppelingen",
    items: [
      { title: "Salesforce", href: "koppeling-salesforce" },
      { title: "Exact Online", href: "koppeling-exact-online" },
      { title: "AFAS", href: "koppeling-afas" }
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
      { title: "Een koppeling werkt niet meer", href: "faq-koppeling-werkt-niet" },
      { title: "Een agent voert geen taken uit", href: "faq-agent-voert-geen-taken-uit" },
      { title: "Contact opnemen met support", href: "faq-contact-support" }
    ]
  }
];
