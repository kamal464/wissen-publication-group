"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const journals = [
        {
            title: 'Global Journal of Environmental Sciences',
            description: 'Publishes groundbreaking research on environmental science, climate change mitigation, and sustainability solutions.',
            issn: '2765-9820',
            publisher: 'Universal Publishers',
            accessType: 'Open Access',
            subjectArea: 'Environmental Science',
            impactFactor: '4.2',
            coverImage: null,
            category: 'Life Sciences',
            discipline: 'Environmental Studies',
        },
        {
            title: 'International Journal of Cultural Studies',
            description: 'Explores cross-cultural communication, global narratives, and sociological perspectives on cultural evolution.',
            issn: '3012-4478',
            publisher: 'Universal Publishers',
            accessType: 'Hybrid',
            subjectArea: 'Cultural Studies',
            impactFactor: '3.5',
            coverImage: null,
            category: 'Humanities',
            discipline: 'Cultural Anthropology',
        },
        {
            title: 'Advances in Biomedical Engineering',
            description: 'Focuses on translational research and innovations in biomedical devices, imaging, and healthcare technologies.',
            issn: '2134-9987',
            publisher: 'Universal Publishers',
            accessType: 'Open Access',
            subjectArea: 'Biomedical Engineering',
            impactFactor: '5.1',
            coverImage: null,
            category: 'Engineering',
            discipline: 'Biomedical Technology',
        },
        {
            title: 'Journal of Global Economics and Finance',
            description: 'Presents applied research on financial systems, emerging markets, and sustainable economic policy.',
            issn: '1988-6423',
            publisher: 'Universal Publishers',
            accessType: 'Subscription',
            subjectArea: 'Economics',
            impactFactor: '2.9',
            coverImage: null,
            category: 'Social Sciences',
            discipline: 'Economics',
        },
        {
            title: 'International Review of Information Systems',
            description: 'Delivers peer-reviewed insights on information systems design, cybersecurity, and data governance.',
            issn: '2546-3301',
            publisher: 'Universal Publishers',
            accessType: 'Hybrid',
            subjectArea: 'Information Systems',
            impactFactor: '4.7',
            coverImage: null,
            category: 'Technology',
            discipline: 'Information Systems',
        },
        {
            title: 'Frontiers in Clinical Medicine',
            description: 'Highlights advancements in diagnostics, clinical trials, and evidence-based patient care.',
            issn: '1620-7735',
            publisher: 'Universal Publishers',
            accessType: 'Open Access',
            subjectArea: 'Medicine',
            impactFactor: '6.3',
            coverImage: null,
            category: 'Health Sciences',
            discipline: 'Clinical Medicine',
        },
        {
            title: 'Journal of Sustainable Agriculture',
            description: 'Investigates sustainable farming practices, agri-tech innovations, and food security strategies.',
            issn: '2874-1159',
            publisher: 'Universal Publishers',
            accessType: 'Open Access',
            subjectArea: 'Agriculture',
            impactFactor: '3.1',
            coverImage: null,
            category: 'Agricultural Sciences',
            discipline: 'Sustainable Agriculture',
        },
        {
            title: 'Contemporary Studies in Psychology',
            description: 'Offers current research on cognitive science, behavioral psychology, and mental health interventions.',
            issn: '1901-4472',
            publisher: 'Universal Publishers',
            accessType: 'Hybrid',
            subjectArea: 'Psychology',
            impactFactor: '3.8',
            coverImage: null,
            category: 'Social Sciences',
            discipline: 'Psychology',
        },
        {
            title: 'Journal of Advanced Materials Science',
            description: 'Publishes experimental and theoretical work on novel materials, nanotechnology, and applied physics.',
            issn: '2285-9031',
            publisher: 'Universal Publishers',
            accessType: 'Subscription',
            subjectArea: 'Materials Science',
            impactFactor: '5.6',
            coverImage: null,
            category: 'Engineering',
            discipline: 'Materials Science',
        },
        {
            title: 'Global Journal of Education and Learning',
            description: 'Examines pedagogical innovation, digital learning frameworks, and global education policy.',
            issn: '2659-4410',
            publisher: 'Universal Publishers',
            accessType: 'Open Access',
            subjectArea: 'Education',
            impactFactor: '2.7',
            coverImage: null,
            category: 'Education',
            discipline: 'Educational Research',
        },
    ];
    for (const journal of journals) {
        await prisma.journal.upsert({
            where: {
                issn: journal.issn,
            },
            update: {
                title: journal.title,
                description: journal.description,
                publisher: journal.publisher,
                accessType: journal.accessType,
                subjectArea: journal.subjectArea,
                impactFactor: journal.impactFactor,
                coverImage: journal.coverImage,
                category: journal.category,
                discipline: journal.discipline,
            },
            create: {
                title: journal.title,
                description: journal.description,
                issn: journal.issn,
                publisher: journal.publisher,
                accessType: journal.accessType,
                subjectArea: journal.subjectArea,
                impactFactor: journal.impactFactor,
                coverImage: journal.coverImage,
                category: journal.category,
                discipline: journal.discipline,
            },
        });
    }
    console.log('Seeding articles...');
    const journalRecords = await prisma.journal.findMany();
    if (journalRecords.length > 0) {
        const articles = [
            {
                title: 'Climate Change Mitigation Through Renewable Energy Integration',
                abstract: 'This study examines the effectiveness of renewable energy integration in reducing carbon emissions across various geographical regions. We analyze data from solar, wind, and hydroelectric installations over a ten-year period, demonstrating a 35% reduction in greenhouse gas emissions. The research provides actionable insights for policymakers and energy sector stakeholders on implementing sustainable energy solutions at scale.',
                journalId: journalRecords[0].id,
                status: 'PUBLISHED',
                pdfUrl: 'https://example.com/sample-paper-1.pdf',
                publishedAt: new Date('2024-09-15'),
                authors: [
                    { name: 'Dr. Sarah Martinez', email: 'sarah.martinez@example.com', affiliation: 'MIT Climate Lab' },
                    { name: 'Prof. James Wong', email: 'james.wong@example.com', affiliation: 'Stanford Energy Institute' },
                ],
            },
            {
                title: 'Biodiversity Conservation in Urban Ecosystems',
                abstract: 'Urban expansion poses significant challenges to biodiversity conservation. This research explores innovative strategies for maintaining ecological balance in metropolitan areas, including green corridors, vertical gardens, and wildlife-friendly infrastructure. Through case studies in five major cities, we demonstrate how urban planning can harmonize development with environmental preservation.',
                journalId: journalRecords[0].id,
                status: 'PUBLISHED',
                pdfUrl: 'https://example.com/sample-paper-2.pdf',
                publishedAt: new Date('2024-08-22'),
                authors: [
                    { name: 'Dr. Emily Chen', email: 'emily.chen@example.com', affiliation: 'Harvard School of Public Health' },
                ],
            },
            {
                title: 'Cross-Cultural Digital Communication Patterns',
                abstract: 'This comprehensive study analyzes digital communication behaviors across 15 countries, revealing how cultural context influences online interaction, emoji usage, and information sharing. We identify five distinct communication archetypes and discuss implications for global digital marketing, international relations, and cross-cultural understanding in the digital age.',
                journalId: journalRecords[1].id,
                status: 'PUBLISHED',
                pdfUrl: 'https://example.com/sample-paper-3.pdf',
                publishedAt: new Date('2024-10-01'),
                authors: [
                    { name: 'Dr. Maria Rodriguez', email: 'maria.rodriguez@example.com', affiliation: 'Oxford Cultural Studies Department' },
                    { name: 'Dr. Hiroshi Tanaka', email: 'hiroshi.tanaka@example.com', affiliation: 'University of Tokyo' },
                ],
            },
            {
                title: 'Wearable Biosensors for Real-Time Health Monitoring',
                abstract: 'Recent advances in nanotechnology and flexible electronics have enabled development of next-generation wearable biosensors. This paper presents a novel biosensor platform capable of continuous monitoring of glucose levels, heart rate variability, and stress biomarkers. Clinical trials with 500 participants demonstrate 94% accuracy compared to traditional laboratory methods.',
                journalId: journalRecords[2].id,
                status: 'PUBLISHED',
                pdfUrl: 'https://example.com/sample-paper-4.pdf',
                publishedAt: new Date('2024-07-10'),
                authors: [
                    { name: 'Dr. Robert Kim', email: 'robert.kim@example.com', affiliation: 'Johns Hopkins Bioengineering' },
                    { name: 'Dr. Lisa Thompson', email: 'lisa.thompson@example.com', affiliation: 'MIT Media Lab' },
                    { name: 'Dr. Ahmed Hassan', email: 'ahmed.hassan@example.com', affiliation: 'UC Berkeley' },
                ],
            },
            {
                title: 'Machine Learning Applications in Precision Agriculture',
                abstract: 'This research explores the integration of machine learning algorithms with IoT sensors to optimize crop yields while minimizing resource consumption. Our system analyzes soil conditions, weather patterns, and crop health indicators to provide real-time recommendations to farmers. Field tests across 50 farms showed a 28% increase in productivity and 40% reduction in water usage.',
                journalId: journalRecords[6].id,
                status: 'PUBLISHED',
                pdfUrl: 'https://example.com/sample-paper-5.pdf',
                publishedAt: new Date('2024-09-30'),
                authors: [
                    { name: 'Prof. David Anderson', email: 'david.anderson@example.com', affiliation: 'Iowa State University' },
                    { name: 'Dr. Priya Sharma', email: 'priya.sharma@example.com', affiliation: 'IIT Delhi' },
                ],
            },
        ];
        for (const articleData of articles) {
            const { authors, ...article } = articleData;
            await prisma.article.create({
                data: {
                    ...article,
                    authors: {
                        create: authors,
                    },
                },
            });
        }
        console.log('Articles seeded successfully!');
    }
    console.log('Seeding default admin user...');
    await prisma.user.upsert({
        where: { userName: 'admin' },
        update: {
            password: 'Bharath@321',
            isActive: true,
            journalName: 'Administrator',
            category: 'System'
        },
        create: {
            userName: 'admin',
            password: 'Bharath@321',
            isActive: true,
            journalName: 'Administrator',
            category: 'System'
        }
    });
    console.log('✅ Default admin user created: username="admin", password="Bharath@321"');
}
main()
    .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map