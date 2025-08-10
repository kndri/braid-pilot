// Quick test to check if authentication pages are working
const baseUrl = 'http://localhost:3001';

async function testAuthPages() {
  console.log('Testing Authentication Pages Status\n');
  console.log('=====================================\n');

  // Test sign-up page
  console.log('1. Sign-Up Page:');
  try {
    const signUpRes = await fetch(`${baseUrl}/sign-up`);
    console.log(`   Status: ${signUpRes.status}`);
    if (signUpRes.status === 200) {
      const html = await signUpRes.text();
      // Check if the page loaded without errors
      if (html.includes('Start Your Free Trial')) {
        console.log('   ✅ Page loaded successfully');
      }
      if (html.includes('Error') || html.includes('error')) {
        const errorMatch = html.match(/Error[^<]*/);
        if (errorMatch) {
          console.log(`   ⚠️ Warning: ${errorMatch[0]}`);
        }
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test sign-in page
  console.log('\n2. Sign-In Page:');
  try {
    const signInRes = await fetch(`${baseUrl}/sign-in`);
    console.log(`   Status: ${signInRes.status}`);
    if (signInRes.status === 200) {
      const html = await signInRes.text();
      if (html.includes('Welcome Back')) {
        console.log('   ✅ Page loaded successfully');
      }
      if (html.includes('Error') || html.includes('error')) {
        const errorMatch = html.match(/Error[^<]*/);
        if (errorMatch) {
          console.log(`   ⚠️ Warning: ${errorMatch[0]}`);
        }
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test dashboard redirect
  console.log('\n3. Dashboard Protection:');
  try {
    const dashboardRes = await fetch(`${baseUrl}/dashboard`, {
      redirect: 'manual'
    });
    if (dashboardRes.status === 307) {
      console.log(`   ✅ Correctly redirects to: ${dashboardRes.headers.get('location')}`);
    } else {
      console.log(`   Status: ${dashboardRes.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n=====================================');
  console.log('\nTo test sign-up manually:');
  console.log(`1. Open: ${baseUrl}/sign-up`);
  console.log('2. Fill in the form with:');
  console.log(`   Email: test${Date.now()}@example.com`);
  console.log('   Password: TestPassword123!');
  console.log('   Name: Test User');
  console.log('3. Submit and check if you get redirected to /onboarding');
  console.log('\n=====================================\n');
}

testAuthPages().catch(console.error);