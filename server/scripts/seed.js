const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/database');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    await transaction(async (client) => {
      // Create super admin user
      const adminPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'admin123', 12);
      
      const adminResult = await client.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, is_active, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [
          process.env.SUPER_ADMIN_EMAIL || 'admin@campus.com',
          adminPassword,
          'super_admin',
          'Super',
          'Admin',
          true,
          true
        ]
      );

      if (adminResult.rows.length > 0) {
        console.log('✅ Super admin user created');
      } else {
        console.log('ℹ️ Super admin user already exists');
      }

      // Create demo school
      const demoSchoolResult = await client.query(
        `INSERT INTO schools (name, code, email, phone, address, city, state, type, motto, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [
          'Campus Demo School',
          'DEMO001',
          'demo@campusschool.com',
          '+234-800-CAMPUS',
          '123 Education Street',
          'Lagos',
          'Lagos State',
          'mixed',
          'Excellence in Education',
          true
        ]
      );

      let schoolId;
      if (demoSchoolResult.rows.length > 0) {
        schoolId = demoSchoolResult.rows[0].id;
        console.log('✅ Demo school created');
      } else {
        // Get existing school ID
        const existingSchool = await client.query('SELECT id FROM schools WHERE email = $1', ['demo@campusschool.com']);
        schoolId = existingSchool.rows[0].id;
        console.log('ℹ️ Demo school already exists');
      }

      // Create demo academic term
      const termResult = await client.query(
        `INSERT INTO academic_terms (school_id, name, start_date, end_date, is_current)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          schoolId,
          '2024/2025 First Term',
          '2024-09-01',
          '2024-12-15',
          true
        ]
      );

      let termId;
      if (termResult.rows.length > 0) {
        termId = termResult.rows[0].id;
        console.log('✅ Demo academic term created');
      } else {
        const existingTerm = await client.query('SELECT id FROM academic_terms WHERE school_id = $1 LIMIT 1', [schoolId]);
        if (existingTerm.rows.length > 0) {
          termId = existingTerm.rows[0].id;
        }
      }

      // Create demo school admin
      const schoolAdminPassword = await bcrypt.hash('schooladmin123', 12);
      const schoolAdminResult = await client.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, is_active, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [
          'admin@campusschool.com',
          schoolAdminPassword,
          'school_admin',
          'School',
          'Administrator',
          true,
          true
        ]
      );

      if (schoolAdminResult.rows.length > 0) {
        // Link school admin to school
        await client.query(
          'INSERT INTO school_users (school_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [schoolId, schoolAdminResult.rows[0].id, 'school_admin']
        );
        console.log('✅ Demo school admin created and linked');
      }

      // Create demo subjects
      const subjects = [
        { name: 'Mathematics', code: 'MATH', is_core: true },
        { name: 'English Language', code: 'ENG', is_core: true },
        { name: 'Science', code: 'SCI', is_core: true },
        { name: 'Social Studies', code: 'SST', is_core: false },
        { name: 'Physical Education', code: 'PE', is_core: false }
      ];

      for (const subject of subjects) {
        await client.query(
          `INSERT INTO subjects (school_id, name, code, is_core)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [schoolId, subject.name, subject.code, subject.is_core]
        );
      }
      console.log('✅ Demo subjects created');

      // Create demo classes
      if (termId) {
        const classes = [
          { name: 'Primary 1A', level: 'Primary 1', section: 'A', capacity: 25 },
          { name: 'Primary 2A', level: 'Primary 2', section: 'A', capacity: 30 },
          { name: 'JSS 1A', level: 'JSS 1', section: 'A', capacity: 35 }
        ];

        for (const classData of classes) {
          await client.query(
            `INSERT INTO classes (school_id, name, level, section, capacity, academic_term_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT DO NOTHING`,
            [schoolId, classData.name, classData.level, classData.section, classData.capacity, termId]
          );
        }
        console.log('✅ Demo classes created');
      }

      // Create demo announcement
      if (adminResult.rows.length > 0) {
        await client.query(
          `INSERT INTO announcements (school_id, title, content, target_audience, priority, is_published, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [
            schoolId,
            'Welcome to Campus School Management System',
            'This is a demo announcement to showcase the Campus app functionality. You can create, edit, and manage announcements for different audiences.',
            'all',
            'normal',
            true,
            adminResult.rows[0].id
          ]
        );
        console.log('✅ Demo announcement created');
      }
    });

    console.log('🎉 Database seeding completed successfully!');
    console.log('📝 Demo data created:');
    console.log('   - Super Admin: admin@campus.com (password: admin123)');
    console.log('   - School Admin: admin@campusschool.com (password: schooladmin123)');
    console.log('   - Demo School: Campus Demo School');
    console.log('   - Academic Term: 2024/2025 First Term');
    console.log('   - Subjects: Math, English, Science, Social Studies, PE');
    console.log('   - Classes: Primary 1A, Primary 2A, JSS 1A');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
