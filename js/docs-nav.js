/* ============================================================
   Documentation navigation config — SINGLE SOURCE OF TRUTH.

   Every docs page's sidebar, breadcrumb category, and previous/next
   links are generated from this file by js/docs.js. To add a new
   article: add one { title, href } line to the right category below.
   Nothing else needs to change on existing pages.

   Hrefs are relative to the docs/ folder (all docs pages live there
   as siblings) — no docs/ prefix and no docs- filename prefix.
   ============================================================ */

var DOCS_HOME = { title: "Documentatie", href: "./" };

var DOCS_NAV = [
  {
    category: "Aan de slag",
    items: [
      { title: "Overzicht: wat is het dashboard", href: "overzicht-dashboard.html" },
      { title: "Uw eerste agent instellen (checklist)", href: "eerste-agent-instellen.html" },
      { title: "Toegang en rollen", href: "toegang-en-rollen.html" },
      { title: "Systeemvereisten", href: "systeemvereisten.html" }
    ]
  },
  {
    category: "Agents",
    items: [
      { title: "CRM sync", href: "agent-crm-sync.html" },
      { title: "Email triage", href: "agent-email-triage.html" },
      { title: "Invoice processing", href: "agent-invoice-processing.html" },
      { title: "Lead enrichment", href: "agent-lead-enrichment.html" },
      { title: "Report generator", href: "agent-report-generator.html" }
    ]
  },
  {
    category: "Koppelingen",
    items: [
      { title: "Salesforce", href: "koppeling-salesforce.html" },
      { title: "Exact Online", href: "koppeling-exact-online.html" },
      { title: "AFAS", href: "koppeling-afas.html" }
    ]
  },
  {
    category: "Voor uw IT-partner",
    items: [
      { title: "Overzicht voor IT-partners", href: "it-overzicht.html" },
      { title: "Beveiliging & gegevensverwerking", href: "it-beveiliging.html" },
      { title: "Netwerkvereisten", href: "it-netwerkvereisten.html" }
    ]
  },
  {
    category: "Problemen oplossen & FAQ",
    items: [
      { title: "Veelgestelde vragen", href: "faq.html" },
      { title: "Een koppeling werkt niet meer", href: "faq-koppeling-werkt-niet.html" },
      { title: "Een agent voert geen taken uit", href: "faq-agent-voert-geen-taken-uit.html" },
      { title: "Contact opnemen met support", href: "faq-contact-support.html" }
    ]
  }
];
