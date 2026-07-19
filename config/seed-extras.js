import dotenv from 'dotenv';
import connectDB from './db.js';
import mongoose from 'mongoose';

import DrivenResult from '../models/DrivenResult.js';
import TechStack from '../models/TechStack.js';
import SocialLink from '../models/SocialLink.js';
import ContactInfo from '../models/ContactInfo.js';

// Load .env.local if present, otherwise fall back to .env (same order as
// server.js / config/seed.js / config/seedAdmin.js).
dotenv.config({ path: '.env.local' });
dotenv.config();

// -----------------------------------------------------------------------------
// Supplementary seed — the three collections not covered by seed.js.
//
// Values are copied verbatim from the Next.js frontend; src/app is NOT touched.
//   DrivenResult[] <- components/DrivenResultsSection.tsx (metrics[])
//   TechStack[]    <- components/ExpertiseSection.tsx      (expertiseItems[])
//   SocialLink[]   <- components/ContactFooter.tsx         (SOCIAL_LINKS[])
//
// This script wipes ONLY these three collections, so it can be run
// independently of seed.js without disturbing the core content.
// -----------------------------------------------------------------------------

// DrivenResultsSection.tsx metrics[] — num -> value, keeps suffix + label + desc.
const drivenResultData = [
  {
    value: 22,
    suffix: '+',
    label: 'PROJECTS',
    description:
      'Websites engineered and deployed for startups, applications, and brands globally.',
    order: 1,
  },
  {
    value: 98,
    suffix: '%',
    label: 'CLIENT SATISFACTION',
    description:
      'Built on long-term partnerships, architectural reliability, and clear delivery timelines.',
    order: 2,
  },
  {
    value: 4,
    suffix: '+',
    label: 'YEARS EXPERIENCE',
    description:
      'Refining full-stack production pipelines, system performance, and automated logic.',
    order: 3,
  },
  {
    value: 5,
    suffix: '+',
    label: 'AVG RATING',
    description:
      'Trusted by founders and tech teams to deliver exceptionally polished product architectures.',
    order: 4,
  },
];

// ExpertiseSection.tsx expertiseItems[] — capability cards. Each card's `title`
// maps to `category`, its prose `desc` to `description`. `technologies` stays
// empty (the frontend cards carry no discrete skill list). Icons in the
// frontend are React components (lucide), so we store the icon NAME as a hint
// the frontend can map back to a component.
const techStackData = [
  {
    category: 'Next.js Ecosystem',
    icon: 'Code2',
    description:
      'Leveraging server-side rendering, static site generation, and the App Router for optimal user experience and blazingly fast load times.',
    order: 1,
  },
  {
    category: 'MERN Stack',
    icon: 'Database',
    description:
      'Deep proficiency in MongoDB, Express, React, and Node.js for creating scalable, data-driven backends and dynamic frontends.',
    order: 2,
  },
  {
    category: 'Technical SEO',
    icon: 'Search',
    description:
      'Optimizing web architecture, metadata, semantic HTML, and Core Web Vitals to ensure maximum visibility and indexing by search engines.',
    order: 3,
  },
  {
    category: 'AI Integration',
    icon: 'Sparkles',
    description:
      'Architecting and deploying LLM-driven features and automated AI workflows to enhance digital product capabilities.',
    order: 4,
  },
  {
    category: 'API Integration',
    icon: 'Webhook',
    description:
      'Engineering secure, highly scalable RESTful and GraphQL data pipelines for seamless third-party system connectivity.',
    order: 5,
  },
  {
    category: 'Mobile Apps',
    icon: 'Smartphone',
    description:
      'Building fluid, high-performance cross-platform mobile applications with native-like user experiences.',
    order: 6,
  },
  {
    category: 'End-to-End Apps',
    icon: 'Layout',
    description:
      'Architecting robust production-ready ecosystems from database schema design to frontend deployment.',
    order: 7,
  },
];

// ContactFooter.tsx SOCIAL_LINKS[] — label -> platform, href -> url.
// hrefs are '#' placeholders in the frontend today; seeded as-is.
const socialLinkData = [
  { platform: 'TWITTER(X)', url: '#', icon: 'twitter' },
  { platform: 'INSTAGRAM', url: '#', icon: 'instagram' },
  { platform: 'LINKEDIN', url: '#', icon: 'linkedin' },
  { platform: 'GITHUB', url: '#', icon: 'github' },
];

// ContactFooter.tsx CONTACT_EMAIL / CONTACT_PHONE — the singleton contact block.
// `socialLinks` is populated below with the inserted SocialLink _ids so contact
// details and socials are managed as one document.
const contactInfoData = {
  email: 'skaiki.dev@gmail.com',
  phone: '+961 76 937 310',
  address: 'Tyre, Lebanon',
  availabilityNote: "I'm always open to collaborations and creative challenges.",
};

const seedExtras = async () => {
  await connectDB();

  try {
    console.log('🧹 Clearing extra collections (DrivenResult, TechStack, SocialLink, ContactInfo)...');
    await Promise.all([
      DrivenResult.deleteMany({}),
      TechStack.deleteMany({}),
      SocialLink.deleteMany({}),
      ContactInfo.deleteMany({}),
    ]);

    console.log('🌱 Inserting extra frontend content...');
    const [drivenResults, techStacks, socialLinks] = await Promise.all([
      DrivenResult.insertMany(drivenResultData),
      TechStack.insertMany(techStackData),
      SocialLink.insertMany(socialLinkData),
    ]);

    // ContactInfo references SocialLinks, so it must be created AFTER them —
    // link every inserted social id to the singleton contact document.
    const contactInfo = await ContactInfo.create({
      ...contactInfoData,
      socialLinks: socialLinks.map((s) => s._id),
    });

    console.log('✅ Extras seed complete:');
    console.log(`   DrivenResult: ${drivenResults.length}`);
    console.log(`   TechStack:    ${techStacks.length}`);
    console.log(`   SocialLink:   ${socialLinks.length}`);
    console.log(`   ContactInfo:  ${contactInfo ? 1 : 0}`);
  } catch (err) {
    console.error('❌ Extras seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    process.exit(process.exitCode ?? 0);
  }
};

seedExtras();
