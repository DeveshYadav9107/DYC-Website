// Central source of truth for all company data
// All values marked [VERIFY] require client confirmation

const siteConfig = {
  company: {
    name: 'Dinesh Yadav & Company', // CONFIRMED
    shortName: 'DYC',
    tagline: 'We help businesses run smarter with the right people and the right systems.',
    description: 'SAP expertise, skilled professionals and business-focused ERP solutions designed around enterprise needs.',
  },

  contact: {
    phone: '+91-9729037456',        // CONFIRMED
    email: 'info@dycinfo.com',      // CONFIRMED
    address: 'E-52A, Suncity, Gurgaon', // CONFIRMED
    gst: '06AOZPY8747D1ZX',        // [VERIFY]
  },

  metrics: {
    yearsExperience:       { value: '15', suffix: '+' },      // CONFIRMED
    certifiedConsultants:  { value: '50', suffix: '+' },      // CONFIRMED
    implementations:       { value: '[VERIFY]', suffix: '+' },
    clientsServed:         { value: '[VERIFY]', suffix: '+' },
    professionalsPlaced:   { value: '[VERIFY]', suffix: '+' },
    sapProjects:           { value: '50', suffix: '+' },      // CONFIRMED
  },

  features: {
    showCareers:     false,
    showCaseStudies: false,
    showEcommerce:   false,
    showBlog:        true,
  },

  seo: {
    titleSuffix: ' | DYC Business Solution',
    defaultDescription: 'Enterprise SAP consulting, staffing solutions and custom ERP software.',
  },
};

export default siteConfig;
