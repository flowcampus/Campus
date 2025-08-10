import prisma from '../lib/prisma';
import { hashPassword } from '../utils/password';

async function seedDemoData() {
  console.log('🌱 Seeding demo data...');

  try {
    // Create demo schools - Cameroon focused
    const campusDemo = await prisma.school.upsert({
      where: { code: 'CAMPUS_DEMO' },
      update: {},
      create: {
        name: 'École Campus Démonstration',
        code: 'CAMPUS_DEMO',
      },
    });

    const excellenceAcademy = await prisma.school.upsert({
      where: { code: 'EXCELLENCE_ACADEMY' },
      update: {},
      create: {
        name: 'Collège Excellence Yaoundé',
        code: 'EXCELLENCE_ACADEMY',
      },
    });

    const bilingueLycee = await prisma.school.upsert({
      where: { code: 'BILINGUE_LYCEE' },
      update: {},
      create: {
        name: 'Lycée Bilingue de Douala',
        code: 'BILINGUE_LYCEE',
      },
    });

    // Create demo users for testing
    const hashedPassword = await hashPassword('password123');

    // Demo student - Cameroon names
    await prisma.user.upsert({
      where: { email: 'etudiant@campus-demo.cm' },
      update: {},
      create: {
        email: 'etudiant@campus-demo.cm',
        password: hashedPassword,
        firstName: 'Jean',
        lastName: 'Mballa',
        role: 'student',
        schoolId: campusDemo.id,
      },
    });

    // Demo parent - Cameroon names
    await prisma.user.upsert({
      where: { email: 'parent@campus-demo.cm' },
      update: {},
      create: {
        email: 'parent@campus-demo.cm',
        password: hashedPassword,
        firstName: 'Marie',
        lastName: 'Ngono',
        role: 'parent',
        schoolId: campusDemo.id,
      },
    });

    // Demo school staff - Cameroon names
    await prisma.user.upsert({
      where: { email: 'directeur@campus-demo.cm' },
      update: {},
      create: {
        email: 'directeur@campus-demo.cm',
        password: hashedPassword,
        firstName: 'Paul',
        lastName: 'Fouda',
        role: 'school_admin',
        schoolId: campusDemo.id,
      },
    });

    // Demo admin
    await prisma.user.upsert({
      where: { email: 'admin@campus.com' },
      update: {},
      create: {
        email: 'admin@campus.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        schoolId: campusDemo.id,
      },
    });

    console.log('✅ Données de démonstration créées avec succès!');
    console.log('📚 Écoles créées:');
    console.log(`   - ${campusDemo.name} (${campusDemo.code})`);
    console.log(`   - ${excellenceAcademy.name} (${excellenceAcademy.code})`);
    console.log(`   - ${bilingueLycee.name} (${bilingueLycee.code})`);
    console.log('👥 Utilisateurs de démonstration créés:');
    console.log('   - etudiant@campus-demo.cm (mot de passe: password123)');
    console.log('   - parent@campus-demo.cm (mot de passe: password123)');
    console.log('   - directeur@campus-demo.cm (mot de passe: password123)');
    console.log('   - admin@campus.com (mot de passe: password123)');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoData()
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seedDemoData;
