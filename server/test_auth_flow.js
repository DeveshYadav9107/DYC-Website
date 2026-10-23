import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './src/config/db.js';
import env from './src/config/env.js';
import routes from './src/routes/index.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';
import User from './src/models/User.js';
import OtpChallenge from './src/models/OtpChallenge.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

const runTests = async () => {
  await connectDB();
  const testPort = 5009;
  const server = app.listen(testPort);
  const baseUrl = `http://localhost:${testPort}/api/v1`;

  console.log(`\n=================================================`);
  console.log(`🧪 RUNNING DYC AUTHENTICATION VERIFICATION SUITE`);
  console.log(`=================================================\n`);

  const testEmail = `test_user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let customerToken = '';
  let adminToken = '';

  const results = [];

  const assert = (name, condition, extra = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${name} ${extra ? `(${extra})` : ''}`);
      results.push({ name, passed: true });
    } else {
      console.error(`❌ [FAIL] ${name} ${extra ? `(${extra})` : ''}`);
      results.push({ name, passed: false, error: extra });
    }
  };

  try {
    // Clean up any pre-existing user with test email
    await User.deleteMany({ email: testEmail });
    await OtpChallenge.deleteMany({ email: testEmail });

    // TEST 1: Signup with invalid email
    console.log(`\n--- Test 1: Signup with invalid email ---`);
    {
      const res = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          phone: '+91 98765 43210',
          email: 'invalid-email-format',
          password: testPassword,
          confirmPassword: testPassword,
        }),
      });
      const data = await res.json();
      assert('Signup rejects invalid email', res.status === 400 && data.message.includes('valid email'), `Status: ${res.status}`);
    }

    // TEST 2: Signup with mismatching passwords
    console.log(`\n--- Test 2: Signup with mismatching passwords ---`);
    {
      const res = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          phone: '+91 98765 43210',
          email: testEmail,
          password: testPassword,
          confirmPassword: 'DifferentPassword999',
        }),
      });
      const data = await res.json();
      assert('Signup rejects mismatching passwords', res.status === 400 && data.message.includes('match'), `Status: ${res.status}`);
    }

    // TEST 3: Signup with valid details (Direct account creation without OTP)
    console.log(`\n--- Test 3: Signup with valid details (Direct login) ---`);
    {
      const res = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          phone: '+91 98765 43210',
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
        }),
      });
      const data = await res.json();
      customerToken = data.data?.token;

      assert('Signup creates account and returns 201', res.status === 201, `Status: ${res.status}`);
      assert('Signup returns JWT token directly', Boolean(customerToken), `Token exists: ${Boolean(customerToken)}`);
      assert('Signup returns user object with customer role', data.data?.user?.role === 'customer', `Role: ${data.data?.user?.role}`);
      assert('Signup retains isEmailVerified: false', data.data?.user?.isEmailVerified === false, `isEmailVerified: ${data.data?.user?.isEmailVerified}`);
      assert('Signup response does NOT request OTP', data.data?.requiresOtp === undefined, 'No requiresOtp in response');

      // Check DB to ensure no OtpChallenge was created
      const otpCount = await OtpChallenge.countDocuments({ email: testEmail });
      assert('No OtpChallenge stored in MongoDB', otpCount === 0, `OtpChallenges: ${otpCount}`);
    }

    // TEST 4: Signup when email already exists
    console.log(`\n--- Test 4: Signup when email already exists ---`);
    {
      const res = await fetch(`${baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Duplicate',
          phone: '+91 98765 43210',
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
        }),
      });
      const data = await res.json();
      assert('Signup rejects duplicate email', res.status === 400 && data.message.includes('already exists'), `Status: ${res.status}`);
    }

    // TEST 5: Login with incorrect password
    console.log(`\n--- Test 5: Login with incorrect password ---`);
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'WrongPassword999',
        }),
      });
      const data = await res.json();
      assert('Login rejects incorrect password with 401', res.status === 401, `Status: ${res.status}`);
    }

    // TEST 6: Login with correct credentials (Direct authentication without OTP)
    console.log(`\n--- Test 6: Login with correct credentials (Direct) ---`);
    {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });
      const data = await res.json();
      assert('Login returns 200', res.status === 200, `Status: ${res.status}`);
      assert('Login returns JWT token directly', Boolean(data.data?.token), `Token: ${Boolean(data.data?.token)}`);
      assert('Login returns user data directly', data.data?.user?.email === testEmail.toLowerCase(), `User email: ${data.data?.user?.email}`);
      assert('Login response does NOT request OTP', data.data?.requiresOtp === undefined, 'No requiresOtp in response');

      // Verify no OTP in database
      const otpCount = await OtpChallenge.countDocuments({ email: testEmail });
      assert('No OtpChallenge stored in MongoDB after login', otpCount === 0, `OtpChallenges: ${otpCount}`);
    }

    // TEST 7: Session verification / Browser refresh simulation (GET /auth/me)
    console.log(`\n--- Test 7: Session verification (GET /auth/me) ---`);
    {
      const res = await fetch(`${baseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${customerToken}`,
        },
      });
      const data = await res.json();
      assert('Authenticated GET /auth/me succeeds (200)', res.status === 200, `Status: ${res.status}`);
      assert('Returns correct user profile', data.data?.email === testEmail.toLowerCase(), `Email: ${data.data?.email}`);
    }

    // TEST 8: Protected route access when logged out / missing token
    console.log(`\n--- Test 8: Protected route rejected without token ---`);
    {
      const res = await fetch(`${baseUrl}/auth/me`, {
        method: 'GET',
      });
      assert('Access to /auth/me without token returns 401', res.status === 401, `Status: ${res.status}`);
    }

    // TEST 9: Logout endpoint
    console.log(`\n--- Test 9: Logout endpoint ---`);
    {
      const res = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
      });
      assert('Logout returns 200', res.status === 200, `Status: ${res.status}`);
    }

    // TEST 10: Admin login and role authorization
    console.log(`\n--- Test 10: Admin login and role authorization ---`);
    {
      // 10a: Login with admin credentials
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@dycinfo.com',
          password: 'password123',
        }),
      });
      const data = await res.json();
      adminToken = data.data?.token;

      assert('Admin login returns 200 without OTP', res.status === 200, `Status: ${res.status}`);
      assert('Admin token received', Boolean(adminToken), `Token: ${Boolean(adminToken)}`);
      assert('Admin user role is admin', data.data?.user?.role === 'admin', `Role: ${data.data?.user?.role}`);

      // 10b: Admin can access protected admin route
      const adminRouteRes = await fetch(`${baseUrl}/inquiries/stats`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      assert('Admin can access protected inquiry stats (200)', adminRouteRes.status === 200, `Status: ${adminRouteRes.status}`);

      // 10c: Customer cannot access protected admin route (403 Forbidden)
      const customerForbiddenRes = await fetch(`${baseUrl}/inquiries/stats`, {
        headers: { 'Authorization': `Bearer ${customerToken}` },
      });
      assert('Customer is forbidden from admin route (403)', customerForbiddenRes.status === 403, `Status: ${customerForbiddenRes.status}`);
    }

    // TEST 11: Public enquiry submission
    console.log(`\n--- Test 11: Public enquiry submission ---`);
    {
      const res = await fetch(`${baseUrl}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Jane Enterprise',
          email: 'jane@enterprise-partner.com',
          phone: '+91 98765 12345',
          company: 'Enterprise Global Corp',
          serviceType: 'sap-consulting',
          message: 'Interested in enterprise SAP S/4HANA migration services.',
        }),
      });
      const data = await res.json();
      assert('Public enquiry submission returns 201', res.status === 201, `Status: ${res.status}`);
      assert('Enquiry response indicates success', data.success === true, `Success: ${data.success}`);
    }

    // TEST 12: Deprecated OTP endpoints return safe, non-breaking messages
    console.log(`\n--- Test 12: Deprecated OTP endpoints verification ---`);
    {
      const res = await fetch(`${baseUrl}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, purpose: 'login' }),
      });
      const data = await res.json();
      assert('Resend OTP returns 400 safely without calling email provider', res.status === 400, `Status: ${res.status}`);
    }

    // Clean up test user from MongoDB
    await User.deleteMany({ email: testEmail });
    await OtpChallenge.deleteMany({ email: testEmail });
    console.log(`\n🧹 Cleaned up test user: ${testEmail}`);

  } catch (err) {
    console.error('Unhandled test suite error:', err);
  } finally {
    server.close();
    console.log(`\n=================================================`);
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = total - passed;
    console.log(`🏁 TEST RUN SUMMARY: ${passed}/${total} PASSED (${failed} FAILED)`);
    console.log(`=================================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
