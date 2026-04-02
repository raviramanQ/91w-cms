/**
 * Test with actual database password
 * 
 * Instructions:
 * 1. Get a password from your database
 * 2. Replace DB_ENCRYPTED_PASSWORD below
 * 3. Run: node test-db-password.js
 */

const { secureDecode, verifyPassword } = require('./src/lib/phpPasswordCompat');

// STEP 1: Get this from your database
// Run: SELECT email, password FROM 91wheels_users WHERE status = 1 LIMIT 1;
const DB_ENCRYPTED_PASSWORD = 'PASTE_YOUR_DB_PASSWORD_HERE';

// STEP 2: Try to decrypt it
console.log('=== Testing Database Password ===\n');
console.log('Encrypted password from DB:', DB_ENCRYPTED_PASSWORD);

try {
  const decrypted = secureDecode(DB_ENCRYPTED_PASSWORD);
  console.log('✅ Decrypted password:', decrypted);
  console.log('\nYou can now login with this password!');
  
  // Test verification
  console.log('\n=== Testing Verification ===');
  const isValid = verifyPassword(decrypted, DB_ENCRYPTED_PASSWORD);
  console.log('Verification result:', isValid ? '✅ PASS' : '❌ FAIL');
  
} catch (error) {
  console.error('❌ Error decrypting:', error.message);
  console.log('\nThis could mean:');
  console.log('1. The password format is different');
  console.log('2. The encryption keys don\'t match');
  console.log('3. The password is not encrypted with the same method');
}
