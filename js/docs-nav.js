/* ============================================================
   Documentation navigation config — SINGLE SOURCE OF TRUTH.

   Every docs page's sidebar, breadcrumb category, and previous/next
   links are generated from this file by js/docs.js. To add a new
   article: add one { title, href } line to the right category below.
   Nothing else needs to change on existing pages.
   ============================================================ */

var DOCS_HOME = { title: "Documentatie", href: "docs.html" };

var DOCS_NAV = [
  {
    category: "Aan de slag",
    items: [
      { title: "Overzicht: wat is het dashboard", href: "docs-overzicht-dashboard.html" },
      { title: "Uw eerste agent instellen (checklist)", href: "docs-eerste-agent-instellen.html" },
      { title: "Toegang en rollen", href: "docs-toegang-en-rollen.html" },
      { title: "Systeemvereisten", href: "docs-systeemvereisten.html" }
    ]
  },
  {
    category: "Agents",
    items: [
      { title: "CRM sync", href: "docs-agent-crm-sync.html" },
      { title: "Email triage", href: "docs-agent-email-triage.html" },
      { title: "Invoice processing", href: "docs-agent-invoice-processing.html" },
      { title: "Lead enrichment", href: "docs-agent-lead-enrichment.html" },
      { title: "Report generator", href: "docs-agent-report-generator.html" }
    ]
  },
  {
    category: "Koppelingen",
    items: [
      { title: "Salesforce", href: "docs-koppeling-salesforce.html" },
      { title: "Exact Online", href: "docs-koppeling-exact-online.html" },
      { title: "AFAS", href: "docs-koppeling-afas.html" }
    ]
  },
  {
    category: "Voor uw IT-partner",
    items: [
      { title: "Overzicht voor IT-partners", href: "docs-it-overzicht.html" },
      { title: "Beveiliging & gegevensverwerking", href: "docs-it-beveiliging.html" },
      { title: "Netwerkvereisten", href: "docs-it-netwerkvereisten.html" }
    ]
  },
  {
    category: "Problemen oplossen & FAQ",
    items: [
      { title: "Veelgestelde vragen", href: "docs-faq.html" },
      { title: "Een koppeling werkt niet meer", href: "docs-faq-koppeling-werkt-niet.html" },
      { title: "Een agent voert geen taken uit", href: "docs-faq-agent-voert-geen-taken-uit.html" },
      { title: "Contact opnemen met support", href: "docs-faq-contact-support.html" }
    ]
  }
];
