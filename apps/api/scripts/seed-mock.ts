import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with mock F1 data...');

  // Mock F1 Teams
  const teams = [
    { name: 'Red Bull Racing', nationality: 'Austria', budget: 450000000 },
    { name: 'Ferrari', nationality: 'Italy', budget: 445000000 },
    { name: 'Mercedes', nationality: 'Germany', budget: 440000000 },
    { name: 'McLaren', nationality: 'United Kingdom', budget: 380000000 },
    { name: 'Aston Martin', nationality: 'United Kingdom', budget: 350000000 },
  ];

  const createdTeams = [];
  for (const team of teams) {
    const created = await prisma.team.upsert({
      where: { name: team.name },
      update: {},
      create: {
        name: team.name,
        teamConstructor: team.name,
        nationality: team.nationality,
        budget: team.budget,
        sponsorValue: Math.random() * 50000000,
      },
    });
    createdTeams.push(created);
    console.log(`  ✅ Team: ${created.name}`);
  }

  // Mock F1 Drivers
  const drivers = [
    { name: 'Max Verstappen', nationality: 'Dutch', dob: '1997-09-30', team: 0, points: 575, wins: 19 },
    { name: 'Sergio Pérez', nationality: 'Mexican', dob: '1990-01-26', team: 0, points: 285, wins: 2 },
    { name: 'Charles Leclerc', nationality: 'Monégasque', dob: '1997-10-16', team: 1, points: 365, wins: 5 },
    { name: 'Carlos Sainz', nationality: 'Spanish', dob: '1994-09-01', team: 1, points: 285, wins: 3 },
    { name: 'Lewis Hamilton', nationality: 'British', dob: '1985-01-07', team: 2, points: 240, wins: 0 },
    { name: 'George Russell', nationality: 'British', dob: '1998-02-15', team: 2, points: 245, wins: 2 },
    { name: 'Lando Norris', nationality: 'British', dob: '1999-11-13', team: 3, points: 350, wins: 3 },
    { name: 'Oscar Piastri', nationality: 'Australian', dob: '2001-04-06', team: 3, points: 295, wins: 2 },
    { name: 'Fernando Alonso', nationality: 'Spanish', dob: '1981-07-29', team: 4, points: 180, wins: 0 },
    { name: 'Lance Stroll', nationality: 'Canadian', dob: '1998-10-29', team: 4, points: 60, wins: 0 },
  ];

  for (const driver of drivers) {
    const created = await prisma.driver.create({
      data: {
        name: driver.name,
        nationality: driver.nationality,
        dateOfBirth: new Date(driver.dob),
        teamId: createdTeams[driver.team].id,
        totalPoints: driver.points,
        totalWins: driver.wins,
        totalRaces: 23,
        totalPodiums: Math.floor(driver.points / 15),
        performanceScore: Math.min((driver.points / 575) * 100, 100),
        marketValue: driver.points * 50000,
      },
    });
    console.log(`  ✅ Driver: ${created.name} (${createdTeams[driver.team].name})`);
  }

  console.log('\\n🏁 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

