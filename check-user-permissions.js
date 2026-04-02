const mysql = require('mysql2/promise');

async function checkUserPermissions() {
  const connection = await mysql.createConnection({
    host: '3.6.145.79',
    user: '91w_staging',
    password: '91w@8iut',
    database: '91wheels'
  });

  console.log('=== Checking Module Names in Database ===\n');
  
  const [modules] = await connection.execute(
    'SELECT module_id, module_name, module_slug FROM 91wheels_modules WHERE status = 1 ORDER BY module_name'
  );
  
  console.log('Active modules in database:');
  modules.forEach(m => {
    console.log(`  ID: ${m.module_id}, Name: "${m.module_name}", Slug: "${m.module_slug}"`);
  });

  console.log('\n=== Code Expects These Module Names ===');
  console.log('  - "vehicle-makes" for Vehicle Makes module');
  console.log('  - "vehicle-types" for Vehicle Types module');
  console.log('  - "users" for Users module');

  console.log('\n=== Checking Sample User Permissions ===');
  const [userPerms] = await connection.execute(`
    SELECT 
      u.user_id,
      u.email,
      u.username,
      r.role_name,
      m.module_name,
      urmp.permissions
    FROM 91wheels_users u
    JOIN 91wheels_user_roles r ON r.role_id = u.role_id
    JOIN 91wheels_user_role_module_permissions urmp ON urmp.role_id = r.role_id
    JOIN 91wheels_modules m ON m.module_id = urmp.module_id
    WHERE u.status = 1 AND m.status = 1
    ORDER BY u.user_id, m.module_name
    LIMIT 20
  `);

  console.log('\nSample user permissions:');
  let currentUser = null;
  userPerms.forEach(p => {
    if (currentUser !== p.email) {
      console.log(`\n${p.email} (${p.role_name}):`);
      currentUser = p.email;
    }
    console.log(`  - ${p.module_name}: ${p.permissions}`);
  });

  await connection.end();
}

checkUserPermissions().catch(console.error);
