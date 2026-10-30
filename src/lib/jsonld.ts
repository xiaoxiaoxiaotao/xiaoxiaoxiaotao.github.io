const site = 'https://www.lisongtao.eu.org';

const description =
  'Personal website of Li Songtao, a PhD student in the Department of Computing at The Hong Kong Polytechnic University (PolyU). The name is also searched as Songtao Li. Research interests include large language models, practical interpretability, and data-centric AI.';

export const siteDescription = description;

export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${site}/#website`,
      name: 'Songtao Li',
      alternateName: 'Li Songtao',
      url: `${site}/`,
      inLanguage: 'en',
      description,
      publisher: { '@id': `${site}/#person` },
      about: { '@id': `${site}/#person` },
      hasPart: [
        { '@id': `${site}/#home` },
        { '@id': `${site}/publications/#webpage` },
        { '@id': `${site}/about/#webpage` },
      ],
    },
    {
      '@type': 'ProfilePage',
      '@id': `${site}/#home`,
      url: `${site}/`,
      name: 'Songtao Li | PhD Student, PolyU Department of Computing',
      description:
        'Li Songtao is a PhD student in the Department of Computing at The Hong Kong Polytechnic University (PolyU). The name is also searched as Songtao Li.',
      isPartOf: { '@id': `${site}/#website` },
      about: { '@id': `${site}/#person` },
      mainEntity: { '@id': `${site}/#person` },
      inLanguage: 'en',
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${site}/images/photo.jpg`,
        caption: 'Portrait of Songtao Li',
      },
    },
    {
      '@type': 'Person',
      '@id': `${site}/#person`,
      name: 'Songtao Li',
      givenName: 'Songtao',
      familyName: 'Li',
      alternateName: 'Li Songtao',
      url: `${site}/`,
      jobTitle: 'PhD Student',
      description:
        'PhD student in the Department of Computing at The Hong Kong Polytechnic University (PolyU).',
      image: `${site}/images/photo.jpg`,
      affiliation: {
        '@type': 'Organization',
        name: 'Department of Computing, The Hong Kong Polytechnic University',
        alternateName: 'PolyU Department of Computing',
        url: 'https://www.polyu.edu.hk/comp/',
        parentOrganization: {
          '@type': 'CollegeOrUniversity',
          name: 'The Hong Kong Polytechnic University',
          alternateName: 'PolyU',
          url: 'https://www.polyu.edu.hk/',
        },
      },
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'Northeastern University',
        location: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'China',
          },
        },
      },
      sameAs: [
        'https://github.com/xiaoxiaoxiaotao',
        'https://www.linkedin.com/in/songtao-li-a0a757274/',
      ],
      knowsAbout: [
        'Large Language Models',
        'Useful and Practical Interpretability',
        'Data-Centric AI',
      ],
      award: ['National Scholarship (December 2023)'],
      subjectOf: { '@id': `${site}/publications/#webpage` },
    },
    {
      '@type': 'WebPage',
      '@id': `${site}/publications/#webpage`,
      name: 'Publications',
      description:
        'Publications by Li Songtao, a PhD student in the Department of Computing at The Hong Kong Polytechnic University (PolyU).',
      url: `${site}/publications/`,
      isPartOf: { '@id': `${site}/#website` },
      about: { '@id': `${site}/#person` },
      inLanguage: 'en',
    },
    {
      '@type': 'WebPage',
      '@id': `${site}/about/#webpage`,
      name: 'About',
      description:
        'About Li Songtao, a PhD student in the Department of Computing at The Hong Kong Polytechnic University (PolyU). The name is also searched as Songtao Li.',
      url: `${site}/about/`,
      isPartOf: { '@id': `${site}/#website` },
      about: { '@id': `${site}/#person` },
      inLanguage: 'en',
    },
  ],
};
