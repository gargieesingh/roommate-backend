const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    age: true,
    budgetMin: true,
    budgetMax: true,
    isActive: true,
    isLooking: true,
    emailVerified: true,
  }
}).then(users => {
  console.log('Total users:', users.length);
  users.forEach(u => {
    console.log(`  ${u.email} | age=${u.age} | budgetMin=${u.budgetMin} | budgetMax=${u.budgetMax} | isActive=${u.isActive} | isLooking=${u.isLooking}`);
  });
  
  // Now simulate the filter with minBudget=0, maxBudget=5000, minAge=18, maxAge=65
  console.log('\n--- Simulating filter: minBudget=0, maxBudget=5000, minAge=18, maxAge=65 ---');
  const filtered = users.filter(u => {
    // budget filter: budgetMax >= minBudget AND budgetMin <= maxBudget
    const budgetOk = (u.budgetMax === null || u.budgetMax >= 0) && (u.budgetMin === null || u.budgetMin <= 5000);
    // age filter
    const ageOk = (u.age === null || (u.age >= 18 && u.age <= 65));
    return budgetOk && ageOk;
  });
  console.log('Filtered users:', filtered.length);
  
  p.$disconnect();
}).catch(e => {
  console.error(e);
  p.$disconnect();
});
