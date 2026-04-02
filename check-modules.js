const mysql = require('mysql2/promise');

async function checkModules() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '91wheels',
    database: '91wheels'
  });

  console.log('=== Checking Modules ===\n');
  
  const [modules] = await connection.execute(
    'SELECT module_id, module_name, module_slug FROM 91wheels_modules WHERE status = 1 ORDER BY module_name'
  );
  
  console.log('Active modules in database:');
  modules.forEach(m => {
    console.log(`  - ${m.module_name} (slug: ${m.module_slug})`);
  });

  console.log('\n=== Expected Module Names in Code ===');
  console.log('  - vehicle-types (for Vehicle Types)');
  console.log('  - vehicle-makes (for Vehicle Makes)');
  console.log('  - users (for Users)');

  console.log('\n=== Checking for Mismatches ===');
  const codeModules = ['vehicle-types', 'vehicle-makes', 'users'];
  const dbModuleNames = modules.map(m => m.module_name);
  
  codeModules.forEach(codeMod => {
    const exists = dbModuleNames.includes(codeMod);
    console.log(`  ${codeMod}: ${exists ? '✅ Found' : '❌ NOT FOUND in database'}`);
  });

  await connection.end();
}

checkModules().catch(console.error);
