// No import needed for Node 18+

const testLogin = async () => {
  const url = 'https://hostel-management-system-rosy.vercel.app/api/auth/login';
  const body = {
    email: 'admin@uhostel.com',
    password: 'password123'
  };

  try {
    console.log(`Testing login at ${url}...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.headers.get('set-cookie')) {
        console.log('Cookie received:', response.headers.get('set-cookie'));
    } else {
        console.log('No cookie received.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testLogin();
