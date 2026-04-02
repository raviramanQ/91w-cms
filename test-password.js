/**
 * Test script to verify password encryption matches PHP
 * Run with: node test-password.js
 */

const { secureEncode, secureDecode, verifyPassword } = require('./src/lib/phpPasswordCompat');

console.log('=== PHP Password Compatibility Test ===\n');

// Test 1: Encrypt a known password
const testPassword = 'test123';
console.log('Test Password:', testPassword);

try {
  const encrypted = secureEncode(testPassword);
  console.log('Encrypted:', encrypted);
  
  // Test 2: Decrypt it back
  const decrypted = secureDecode(encrypted);
  console.log('Decrypted:', decrypted);
  console.log('Match:', testPassword === decrypted ? '✅ YES' : '❌ NO');
  
  // Test 3: Verify password
  const isValid = verifyPassword(testPassword, encrypted);
  console.log('Verification:', isValid ? '✅ PASS' : '❌ FAIL');
  
  console.log('\n=== Test with wrong password ===');
  const wrongPassword = 'wrongpass';
  const isInvalid = verifyPassword(wrongPassword, encrypted);
  console.log('Wrong password verification:', isInvalid ? '❌ FAIL (should be false)' : '✅ PASS (correctly rejected)');
  
  console.log('\n=== Instructions ===');
  console.log('1. Get an encrypted password from your database:');
  console.log('   SELECT password FROM 91wheels_users WHERE email = "your-email" LIMIT 1;');
  console.log('\n2. Test if you can decrypt it:');
  console.log('   const dbPassword = "paste_encrypted_password_here";');
  console.log('   const plain = secureDecode(dbPassword);');
  console.log('   console.log("Your password is:", plain);');
  console.log('\n3. Or test verification:');
  console.log('   const isValid = verifyPassword("your_plain_password", dbPassword);');
  console.log('   console.log("Valid:", isValid);');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error);
}
