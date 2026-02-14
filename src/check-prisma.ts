
import { PrismaClient, Gender, SmokingPreference, DrinkingPreference, PetsPreference, SleepSchedule, Cleanliness } from '@prisma/client';

console.log('Prisma Client Exports Check:');
console.log('Gender:', Gender);
console.log('SmokingPreference:', SmokingPreference);
console.log('DrinkingPreference:', DrinkingPreference);
console.log('PetsPreference:', PetsPreference);
console.log('SleepSchedule:', SleepSchedule);
console.log('Cleanliness:', Cleanliness);

const prisma = new PrismaClient();
console.log('Prisma Client instantiated successfully.');
