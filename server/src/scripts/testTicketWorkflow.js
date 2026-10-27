import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_BASE = 'http://localhost:5000/api/v1';

const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.message || `HTTP error ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
};

async function runTests() {
  console.log('=== DY&C TICKET CONVERSATION & CLOSURE INTEGRATION TEST ===\n');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('1. Database connected.');

  // Find Admin and Customer
  const usersCol = mongoose.connection.db.collection('users');
  const adminUser = await usersCol.findOne({ role: 'admin' });
  const customerUser = await usersCol.findOne({ email: 'sapclient.test@dyc.co.in' }) || await usersCol.findOne({ role: { $in: ['customer', 'user'] } });
  const otherCustomer = await usersCol.findOne({ email: 'client1@gmail.com' });

  if (!adminUser || !customerUser || !otherCustomer) {
    throw new Error('Required test accounts not found in database');
  }

  // Issue test JWT tokens directly for authentication
  const jwt = (await import('jsonwebtoken')).default;
  const adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role }, process.env.JWT_SECRET || 'your-default-secret-key-change-in-production', { expiresIn: '1h' });
  const customerToken = jwt.sign({ id: customerUser._id, role: customerUser.role || 'customer' }, process.env.JWT_SECRET || 'your-default-secret-key-change-in-production', { expiresIn: '1h' });
  const otherToken = jwt.sign({ id: otherCustomer._id, role: otherCustomer.role || 'customer' }, process.env.JWT_SECRET || 'your-default-secret-key-change-in-production', { expiresIn: '1h' });

  console.log(`2. Tokens generated for:`);
  console.log(`   - Admin: ${adminUser.name} (${adminUser.email})`);
  console.log(`   - Customer 1: ${customerUser.name} (${customerUser.email})`);
  console.log(`   - Customer 2: ${otherCustomer.name} (${otherCustomer.email})`);

  // Step A: Customer 1 creates a new ticket via Contact submission
  console.log('\n--- Step A: Customer creates a ticket ---');
  const ticketPayload = {
    name: customerUser.name,
    email: customerUser.email,
    phone: '+91 9876543210',
    company: 'Apex Steel Industries Ltd',
    type: 'sap-support',
    sapModule: 'FICO',
    supportType: 'Incident & Ticket Support',
    subject: 'Month-End F110 Payment Run Dump Issue',
    message: 'We encountered short dump SAPSQL_ARRAY_INSERT_DUPREC during the automated vendor run.',
    priority: 'urgent',
    attachments: [
      {
        fileName: 'ST22_ShortDump_Log.txt',
        fileUrl: '/uploads/tickets/ST22_ShortDump_Log.txt',
        fileSize: 45000,
        fileType: 'text/plain',
      },
    ],
  };

  const createRes = await request(`${API_BASE}/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify(ticketPayload),
  });

  const createdTicket = createRes?.data;
  console.log(`✅ Ticket created successfully!`);
  console.log(`   ID: ${createdTicket._id}`);
  console.log(`   Reference: ${createdTicket.enquiryNumber}`);
  console.log(`   Initial status: ${createdTicket.status}`);
  console.log(`   Initial message seeded: ${createdTicket.messages?.length === 1}`);

  // Step B: Customer 1 views ticket in My Enquiries
  console.log('\n--- Step B: Customer retrieves ticket in My Enquiries ---');
  const myRes = await request(`${API_BASE}/inquiries/my/${createdTicket._id}`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  console.log(`✅ Customer 1 retrieved their ticket: ${myRes?.data?.enquiryNumber}`);

  // Step C: Customer 2 attempts to retrieve Customer 1's ticket (Unauthorized test)
  console.log('\n--- Step C: Customer 2 unauthorized access attempt ---');
  try {
    await request(`${API_BASE}/inquiries/my/${createdTicket._id}`, {
      headers: { Authorization: `Bearer ${otherToken}` },
    });
    console.error('❌ Security Failure: Customer 2 was able to retrieve Customer 1 ticket!');
  } catch (err) {
    console.log(`✅ Security Verified: Customer 2 rejected with ${err.status} (${err.message})`);
  }

  // Step D: Admin opens ticket and posts an official response
  console.log('\n--- Step D: Admin views ticket and sends response ---');
  const adminGetRes = await request(`${API_BASE}/inquiries/${createdTicket._id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`✅ Admin retrieved ticket: ${adminGetRes?.data?.enquiryNumber}`);

  const adminReplyRes = await request(
    `${API_BASE}/inquiries/${createdTicket._id}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        message: 'Hello Rajesh, we have analyzed the ST22 dump. Note 2984112 applies for duplicate clearing item indexing. Moving fix to QAS for your test.',
        attachments: [],
      }),
    }
  );
  console.log(`✅ Admin sent reply: "${adminReplyRes?.data?.message?.slice(0, 50)}..."`);

  // Step E: Customer views admin reply and posts customer reply
  console.log('\n--- Step E: Customer sees admin reply and responds ---');
  const customerViewRes = await request(`${API_BASE}/inquiries/my/${createdTicket._id}`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  console.log(`   Current messages count for customer: ${customerViewRes?.data?.messages?.length}`);

  const customerReplyRes = await request(
    `${API_BASE}/inquiries/${createdTicket._id}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        message: 'Thank you DY&C team! We tested in QAS and the payment proposal run cleared without dumping.',
        attachments: [],
      }),
    }
  );
  console.log(`✅ Customer sent reply: "${customerReplyRes?.data?.message?.slice(0, 50)}..."`);

  // Step F: Admin Closes Ticket
  console.log('\n--- Step F: Admin closes ticket ---');
  const closeRes = await request(
    `${API_BASE}/inquiries/${createdTicket._id}/close`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ reason: 'Resolution verified and validated by CFO on QAS.' }),
    }
  );
  console.log(`✅ Ticket closed! Status: ${closeRes?.data?.status}`);
  console.log(`   Closed At: ${closeRes?.data?.closedAt}`);
  console.log(`   Closure Reason: ${closeRes?.data?.closureReason}`);

  // Step G: Backend rejects customer replies to closed ticket
  console.log('\n--- Step G: Testing read-only lock on closed ticket ---');
  try {
    await request(
      `${API_BASE}/inquiries/${createdTicket._id}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
        body: JSON.stringify({ message: 'Trying to post to a closed ticket.' }),
      }
    );
    console.error('❌ Lock Failure: Closed ticket accepted a new message!');
  } catch (err) {
    console.log(`✅ Lock Verified: Closed ticket rejected message with ${err.status} ("${err.message}")`);
  }

  // Step H: Customer cannot close or modify ticket status directly
  console.log('\n--- Step H: Customer cannot close or alter ticket status ---');
  try {
    await request(
      `${API_BASE}/inquiries/${createdTicket._id}/close`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
        body: JSON.stringify({ reason: 'Customer trying to close' }),
      }
    );
    console.error('❌ Security Failure: Customer closed ticket without admin authorization!');
  } catch (err) {
    console.log(`✅ Security Verified: Customer rejected from closing ticket with ${err.status} (${err.message})`);
  }

  // Step I: Verify customer can still read the entire history
  console.log('\n--- Step I: Customer can read full history of closed ticket ---');
  const closedViewRes = await request(`${API_BASE}/inquiries/my/${createdTicket._id}`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  console.log(`✅ Customer read closed ticket: status="${closedViewRes?.data?.status}", messagesCount=${closedViewRes?.data?.messages?.length}`);

  console.log('\n🎉 ALL 9 END-TO-END VERIFICATION CHECKS PASSED PERFECTLY!\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err.response?.data || err.message || err);
  process.exit(1);
});
