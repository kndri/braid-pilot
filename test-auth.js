// Test authentication flow
const baseUrl = 'http://localhost:3001';

async function testAuth() {
  console.log('Testing Braid Pilot Authentication Flow\n');
  console.log('=====================================\n');

  // Test 1: Check homepage
  console.log('1. Testing Homepage Access...');
  try {
    const homeRes = await fetch(baseUrl);
    console.log(`   ✓ Homepage status: ${homeRes.status}`);
  } catch (error) {
    console.log(`   ✗ Homepage error: ${error.message}`);
  }

  // Test 2: Check sign-in page redirect
  console.log('\n2. Testing Sign-In Page...');
  try {
    const signInRes = await fetch(`${baseUrl}/sign-in`, {
      redirect: 'manual',
      headers: { 'Cookie': '' }
    });
    console.log(`   - Sign-in page status: ${signInRes.status}`);
    if (signInRes.status === 307) {
      console.log(`   - Redirects to: ${signInRes.headers.get('location')}`);
    }
  } catch (error) {
    console.log(`   ✗ Sign-in error: ${error.message}`);
  }

  // Test 3: Check sign-up page
  console.log('\n3. Testing Sign-Up Page...');
  try {
    const signUpRes = await fetch(`${baseUrl}/sign-up`, {
      redirect: 'manual',
      headers: { 'Cookie': '' }
    });
    console.log(`   - Sign-up page status: ${signUpRes.status}`);
    if (signUpRes.status === 307) {
      console.log(`   - Redirects to: ${signUpRes.headers.get('location')}`);
    }
  } catch (error) {
    console.log(`   ✗ Sign-up error: ${error.message}`);
  }

  // Test 4: Check dashboard (should redirect when not authenticated)
  console.log('\n4. Testing Dashboard Access (unauthenticated)...');
  try {
    const dashboardRes = await fetch(`${baseUrl}/dashboard`, {
      redirect: 'manual',
      headers: { 'Cookie': '' }
    });
    console.log(`   - Dashboard status: ${dashboardRes.status}`);
    if (dashboardRes.status === 307) {
      console.log(`   - Redirects to: ${dashboardRes.headers.get('location')}`);
    }
  } catch (error) {
    console.log(`   ✗ Dashboard error: ${error.message}`);
  }

  // Test 5: Check Convex backend connection
  console.log('\n5. Testing Convex Backend...');
  try {
    const convexUrl = 'https://chatty-skunk-130.convex.cloud';
    const convexRes = await fetch(convexUrl, { method: 'HEAD' });
    console.log(`   ✓ Convex backend reachable: ${convexRes.ok}`);
  } catch (error) {
    console.log(`   ✗ Convex error: ${error.message}`);
  }

  console.log('\n=====================================');
  console.log('Authentication Flow Test Complete\n');
}

testAuth().catch(console.error);