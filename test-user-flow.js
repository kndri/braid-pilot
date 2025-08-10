// Test actual user sign-up and sign-in flow
const baseUrl = 'http://localhost:3001';

// Test user credentials
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`, // Unique email each time
  password: 'TestPassword123!'
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testUserFlow() {
  console.log('Testing User Sign-Up and Sign-In Flow\n');
  console.log('=====================================\n');
  console.log('Test User:', testUser.email, '\n');

  // Test 1: Create a new user account via sign-up page form submission
  console.log('1. Testing User Sign-Up...');
  try {
    // First, get the sign-up page to establish session
    const signUpPageRes = await fetch(`${baseUrl}/sign-up`);
    const cookies = signUpPageRes.headers.get('set-cookie') || '';
    
    // Simulate form submission to create account
    const formData = new URLSearchParams();
    formData.append('name', testUser.name);
    formData.append('email', testUser.email);
    formData.append('password', testUser.password);
    formData.append('confirmPassword', testUser.password);
    
    // Try to sign up via the API endpoint
    const signUpRes = await fetch(`${baseUrl}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        type: 'signUp',
        provider: 'password',
        params: {
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
          flow: 'signUp'
        }
      }),
      redirect: 'manual'
    });
    
    console.log(`   - Sign-up response status: ${signUpRes.status}`);
    
    if (signUpRes.status === 200 || signUpRes.status === 201) {
      console.log('   ✓ User account created successfully');
      const authCookies = signUpRes.headers.get('set-cookie');
      console.log(`   - Auth cookies set: ${authCookies ? 'Yes' : 'No'}`);
    } else {
      const errorText = await signUpRes.text();
      console.log(`   ✗ Sign-up failed: ${signUpRes.status}`);
      console.log(`   - Error: ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ✗ Sign-up error: ${error.message}`);
  }

  // Wait a bit for the user to be created
  await delay(2000);

  // Test 2: Sign out first to test sign-in
  console.log('\n2. Signing Out to Test Sign-In...');
  try {
    const signOutRes = await fetch(`${baseUrl}/api/auth/signout`, {
      method: 'POST'
    });
    console.log(`   - Sign-out status: ${signOutRes.status}`);
  } catch (error) {
    console.log(`   ✗ Sign-out error: ${error.message}`);
  }

  await delay(1000);

  // Test 3: Sign in with the created user
  console.log('\n3. Testing User Sign-In...');
  try {
    const signInRes = await fetch(`${baseUrl}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'signIn',
        provider: 'password',
        params: {
          email: testUser.email,
          password: testUser.password
        }
      }),
      redirect: 'manual'
    });
    
    console.log(`   - Sign-in response status: ${signInRes.status}`);
    
    if (signInRes.status === 200) {
      console.log('   ✓ Sign-in successful');
      const authCookies = signInRes.headers.get('set-cookie');
      console.log(`   - Auth cookies set: ${authCookies ? 'Yes' : 'No'}`);
      
      // Test 4: Access dashboard with authentication
      console.log('\n4. Testing Dashboard Access (authenticated)...');
      const dashboardRes = await fetch(`${baseUrl}/dashboard`, {
        headers: {
          'Cookie': authCookies || ''
        },
        redirect: 'manual'
      });
      
      console.log(`   - Dashboard status: ${dashboardRes.status}`);
      if (dashboardRes.status === 200) {
        console.log('   ✓ Dashboard accessible with authentication');
      } else if (dashboardRes.status === 307) {
        console.log(`   - Redirects to: ${dashboardRes.headers.get('location')}`);
      }
    } else {
      const errorText = await signInRes.text();
      console.log(`   ✗ Sign-in failed: ${signInRes.status}`);
      console.log(`   - Error: ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ✗ Sign-in error: ${error.message}`);
  }

  // Test 5: Check if user session persists
  console.log('\n5. Testing Session Persistence...');
  try {
    await delay(1000);
    const sessionRes = await fetch(`${baseUrl}/dashboard`, {
      redirect: 'manual'
    });
    
    console.log(`   - Dashboard access without explicit cookies: ${sessionRes.status}`);
    if (sessionRes.status === 200) {
      console.log('   ✓ Session persists across requests');
    } else if (sessionRes.status === 307) {
      console.log('   ✗ Session not persisted, redirects to:', sessionRes.headers.get('location'));
    }
  } catch (error) {
    console.log(`   ✗ Session test error: ${error.message}`);
  }

  console.log('\n=====================================');
  console.log('User Flow Test Complete\n');
  console.log('Test user email:', testUser.email);
  console.log('Test user password:', testUser.password);
  console.log('\nYou can use these credentials to manually test the login at:');
  console.log(`${baseUrl}/sign-in\n`);
}

testUserFlow().catch(console.error);