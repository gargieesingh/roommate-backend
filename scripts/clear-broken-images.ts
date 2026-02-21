
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_TITLES = [
  'third room',
  'Mast room hai re baba', // Partial match or exact match from user request "Mast room"
  'second room',
  'cozyyyyyyyyyyyy room' // From previous debug output
];

async function main() {
  console.log('Clearing photos for specific listings...');

  for (const title of TARGET_TITLES) {
    // Find listings with similar titles
    const listings = await prisma.listing.findMany({
      where: {
        title: {
          contains: title,
          mode: 'insensitive',
        },
      },
    });

    for (const listing of listings) {
      console.log(`Clearing photos for: ${listing.title} (${listing.id})`);
      await prisma.listing.update({
        where: { id: listing.id },
        data: { photos: [] },
      });
    }
  }
  
  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
