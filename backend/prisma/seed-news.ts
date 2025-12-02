import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding latest news...');

  const newsItems = [
    {
      title: 'New Issue Published: Volume 12, Issue 3',
      content: 'We are pleased to announce the publication of Volume 12, Issue 3, featuring groundbreaking research across multiple disciplines. This issue includes 15 peer-reviewed articles covering topics from medical sciences to engineering innovations.',
      link: '/journals/current-issue',
      isPinned: true,
      publishedAt: new Date(),
    },
    {
      title: 'Call for Papers: Special Issue on AI in Healthcare',
      content: 'We invite researchers to submit their manuscripts for our upcoming special issue on "Artificial Intelligence in Healthcare". Submission deadline: March 31, 2025. This special issue will explore the latest advances in AI applications for medical diagnosis, treatment, and patient care.',
      link: '/submit-manuscript',
      isPinned: true,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      title: 'Editorial Board Expansion',
      content: 'We are excited to welcome five new distinguished members to our editorial board. These experts bring decades of experience in their respective fields and will help maintain our high standards of peer review.',
      isPinned: false,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      title: 'Journal Indexed in Major Databases',
      content: 'Great news! Our journal has been successfully indexed in PubMed, Scopus, and Web of Science. This achievement reflects our commitment to publishing high-quality research and increases the visibility of published articles.',
      isPinned: false,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      title: 'Open Access Week 2025',
      content: 'Join us in celebrating Open Access Week from October 20-26, 2025. We are offering reduced article processing charges and highlighting the importance of open access publishing in advancing scientific knowledge.',
      link: '/about',
      isPinned: false,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  ];

  for (const news of newsItems) {
    await prisma.news.upsert({
      where: { id: newsItems.indexOf(news) + 1 },
      update: news,
      create: news,
    });
  }

  console.log(`✅ Seeded ${newsItems.length} news items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

