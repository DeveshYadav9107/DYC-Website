import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import router from './src/routes/index.js';
import Inquiry from './src/models/Inquiry.js';
import Proposal from './src/models/Proposal.js';
import User from './src/models/User.js';
import { generateProposalPdf } from './src/services/pdfService.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/v1', router);

const startTestServer = () => {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
};

const makeRequest = async (port, path, options = {}) => {
  const url = `http://127.0.0.1:${port}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else if (contentType.includes('application/pdf')) {
    const arrayBuffer = await res.arrayBuffer();
    data = Buffer.from(arrayBuffer);
  } else {
    data = await res.text();
  }

  return { status: res.status, data, headers: res.headers };
};

const runPhase2Tests = async () => {
  console.log('\n======================================================');
  console.log('🚀 RUNNING DYC PHASE 2 PROPOSALS & SMART ENQUIRY SUITE');
  console.log('======================================================\n');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');

  const { server, port } = await startTestServer();
  console.log(`✅ Test server running on port ${port}\n`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  };

  const cleanupIds = {
    inquiries: [],
    proposals: [],
    users: [],
  };

  try {
    // Setup Test Admin User
    const adminEmail = `admin_test_${Date.now()}@dyc.example.com`;
    const adminUser = await User.create({
      name: 'DYC Test Admin',
      email: adminEmail,
      password: 'AdminPassword123!',
      role: 'admin',
    });
    cleanupIds.users.push(adminUser._id);

    // Setup Test Regular Customer User
    const customerEmail = `customer_test_${Date.now()}@dyc.example.com`;
    const customerUser = await User.create({
      name: 'DYC Test Customer',
      email: customerEmail,
      password: 'CustomerPassword123!',
      role: 'customer',
    });
    cleanupIds.users.push(customerUser._id);

    // Login Admin
    const adminLoginRes = await makeRequest(port, '/api/v1/auth/login', {
      method: 'POST',
      body: { email: adminEmail, password: 'AdminPassword123!' },
    });
    const adminToken = adminLoginRes.data?.data?.token || adminLoginRes.data?.token;
    assert(adminToken, 'Admin logged in and received JWT token');

    // Login Customer
    const customerLoginRes = await makeRequest(port, '/api/v1/auth/login', {
      method: 'POST',
      body: { email: customerEmail, password: 'CustomerPassword123!' },
    });
    const customerToken = customerLoginRes.data?.data?.token || customerLoginRes.data?.token;

    // --- TEST SUITE 1: 5 CATEGORIES SMART ENQUIRY INTAKE ---
    console.log('\n--- 1. Testing 5 Smart Requirement Categories & Sanitization ---');

    // 1A: Manpower & Staffing
    const staffingRes = await makeRequest(port, '/api/v1/inquiries', {
      method: 'POST',
      body: {
        name: 'Staffing Client',
        email: 'staffing@client.com',
        phone: '+91 98765 00001',
        company: 'Auto Components Ltd',
        type: 'staffing-request',
        staffingPositions: [
          { roleTitle: 'CNC Operator', count: 4, skillLevel: 'Skilled', employmentType: 'Contract' },
          { roleTitle: 'Plant Supervisor', count: 1, skillLevel: 'Highly Skilled', employmentType: 'Permanent' },
        ],
        workLocation: 'Manesar, Haryana',
        deploymentPreference: 'Onsite',
        startDate: 'Immediate',
        duration: '12 Months',
        budgetRange: '₹30,000 - ₹45,000 / month',
        message: 'Require skilled operators and supervisor for line expansion.',
        // Malicious attempt to self-qualify or assign
        leadStage: 'won',
        assignedTo: adminUser._id,
      },
    });

    const staffingDoc = staffingRes.data?.data;
    assert(staffingRes.status === 201, 'Manpower & Staffing intake returns 201');
    assert(staffingDoc.enquiryNumber && staffingDoc.enquiryNumber.startsWith('DYC-ENQ-'), `Assigned valid enquiryNumber: ${staffingDoc?.enquiryNumber}`);
    assert(staffingDoc.staffingPositions?.length === 2, 'Stored multiple staffing positions cleanly');
    assert(staffingDoc.leadStage === 'new', 'Sanitized privileged field: leadStage forced to "new"');
    assert(!staffingDoc.assignedTo, 'Sanitized privileged field: assignedTo stripped');
    cleanupIds.inquiries.push(staffingDoc._id);

    // 1B: SAP Resources Request
    const sapRes = await makeRequest(port, '/api/v1/inquiries', {
      method: 'POST',
      body: {
        name: 'SAP Lead Client',
        email: 'sap@enterprise.com',
        company: 'Global Metals Corp',
        type: 'sap-resource-request',
        sapModule: 'FICO',
        sapRole: 'Senior Functional Consultant',
        sapResourceCategory: 'Functional Consultant',
        experienceLevel: '5-8 Years',
        numberOfConsultants: 2,
        sapEnvironment: 'S/4HANA On-Premise',
        deploymentPreference: 'Hybrid',
        message: 'Need 2 senior FICO consultants for global rollout.',
      },
    });
    assert(sapRes.status === 201, 'SAP Resources intake returns 201');
    const sapDoc = sapRes.data?.data;
    assert(sapDoc.sapModule === 'FICO' && sapDoc.numberOfConsultants === 2, 'Stored SAP module and consultant headcount');
    cleanupIds.inquiries.push(sapDoc._id);

    // 1C: SAP Support & Maintenance
    const supportRes = await makeRequest(port, '/api/v1/inquiries', {
      method: 'POST',
      body: {
        name: 'Support Client',
        email: 'support@operations.com',
        type: 'sap-support',
        supportType: 'Application Management Support (AMS)',
        supportCoverage: '24x7 Mission Critical',
        businessImpact: 'High - Critical business process affected',
        priority: 'high',
        sapEnvironment: 'ECC 6.0 EHP8',
        message: 'Require 24/7 AMS SLA support for manufacturing plant.',
      },
    });
    assert(supportRes.status === 201, 'SAP Support intake returns 201');
    const supportDoc = supportRes.data?.data;
    assert(supportDoc.supportCoverage === '24x7 Mission Critical', 'Stored SLA coverage window');
    cleanupIds.inquiries.push(supportDoc._id);

    // 1D: ERP Solutions
    const erpRes = await makeRequest(port, '/api/v1/inquiries', {
      method: 'POST',
      body: {
        name: 'ERP Client',
        email: 'ceo@midmarket.com',
        type: 'erp-inquiry',
        industry: 'Pharmaceuticals',
        currentSoftware: 'Tally Prime',
        departmentsInvolved: ['Finance & Accounting', 'Supply Chain / Inventory', 'Quality Management'],
        userSize: '50-150 Users',
        message: 'Evaluating migration from Tally to integrated ERP.',
      },
    });
    assert(erpRes.status === 201, 'ERP Solutions intake returns 201');
    const erpDoc = erpRes.data?.data;
    assert(erpDoc.departmentsInvolved?.length === 3, 'Stored departments in scope');
    cleanupIds.inquiries.push(erpDoc._id);

    // --- TEST SUITE 2: PROPOSAL GENERATION & ACCURATE COMMERCIALS ---
    console.log('\n--- 2. Testing Proposal Creation & Mathematical Precision ---');

    const validUntilDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const proposalPayload = {
      inquiryId: staffingDoc._id,
      title: 'Commercial Proposal: Industrial Staffing Deployment for Auto Components Ltd',
      serviceCategory: 'staffing-request',
      client: {
        name: 'Staffing Client',
        company: 'Auto Components Ltd',
        email: 'staffing@client.com',
        phone: '+91 98765 00001',
      },
      clientRequirementSummary: 'Deployment of 4 CNC Operators and 1 Plant Supervisor for 12 months.',
      solutionSummary: 'Dinesh Yadav & Company will deploy, manage, and supervise industrial staffing with full statutory compliance.',
      scopeOfWork: [
        'Candidate technical screening, onboarding, and background verification.',
        'Continuous attendance tracking and monthly payroll compliance.',
      ],
      deliverables: [
        'Deployment of qualified workforce within 14 business days.',
        'Monthly compliance certification and wage disbursement reports.',
      ],
      resourceRequirements: '4x CNC Operators (Skilled), 1x Plant Supervisor (Highly Skilled)',
      timeline: '12 Months',
      currency: 'INR',
      currencySymbol: '₹',
      lineItems: [
        { description: 'CNC Machine Operators (Skilled Deployment)', quantity: 4, unit: 'Month', unitRate: 35000 },
        { description: 'Plant Operations Supervisor (Highly Skilled)', quantity: 1, unit: 'Month', unitRate: 50000 },
      ],
      discountType: 'flat',
      discountValue: 10000,
      taxLabel: 'GST',
      taxRate: 18,
      paymentTerms: 'Monthly billing at end of operational cycle. 30 days credit.',
      validUntil: validUntilDate,
      internalNotes: 'SECRET COST BASIS: Margin target is 28% after statutory expenses.',
    };

    // Subtotal: 4*35000 (140000) + 1*50000 (50000) = 190000
    // Discount: 10000 flat => Taxable: 180000
    // Tax (18% of 180000): 32400
    // Grand Total: 180000 + 32400 = 212400

    const createPropRes = await makeRequest(port, '/api/v1/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: proposalPayload,
    });

    assert(createPropRes.status === 201, 'Admin can create proposal draft (Status: 201)');
    const createdProp = createPropRes.data?.data;
    assert(createdProp?.proposalNumber?.startsWith('DYC-PROP-'), `Generated proposal reference: ${createdProp?.proposalNumber}`);
    assert(createdProp.subtotal === 190000, `Subtotal calculated correctly: ₹${createdProp?.subtotal} (Expected: 190000)`);
    assert(createdProp.discountAmount === 10000, `Discount amount calculated correctly: ₹${createdProp?.discountAmount} (Expected: 10000)`);
    assert(createdProp.taxAmount === 32400, `Tax amount calculated correctly: ₹${createdProp?.taxAmount} (Expected: 32400)`);
    assert(createdProp.grandTotal === 212400, `Grand total calculated correctly: ₹${createdProp?.grandTotal} (Expected: 212400)`);
    assert(createdProp.status === 'draft', 'Initial proposal status is "draft"');
    cleanupIds.proposals.push(createdProp._id);

    // Verify source enquiry audit timeline recorded proposal creation
    const updatedStaffingInquiry = await Inquiry.findById(staffingDoc._id);
    const lastEvent = updatedStaffingInquiry.timeline[updatedStaffingInquiry.timeline.length - 1];
    assert(lastEvent?.type === 'proposal_created', `Source enquiry timeline recorded "${lastEvent?.type}" event`);

    // --- TEST SUITE 3: PROPOSAL RETRIEVAL & FILTERING ---
    console.log('\n--- 3. Testing Proposal Retrieval Endpoints ---');

    // 3A: Single Proposal
    const singlePropRes = await makeRequest(port, `/api/v1/proposals/${createdProp._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(singlePropRes.status === 200, 'Retrieved single proposal details by ID');

    // 3B: Inquiry Proposals endpoint
    const inqPropsRes = await makeRequest(port, `/api/v1/inquiries/${staffingDoc._id}/proposals`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(inqPropsRes.status === 200, 'Retrieved proposals list for source enquiry');
    const inqPropsList = inqPropsRes.data?.data?.proposals || inqPropsRes.data?.data;
    assert(Array.isArray(inqPropsList) && inqPropsList.length >= 1, 'Inquiry proposals list contains created proposal');

    // --- TEST SUITE 4: REVISION & VERSIONING ---
    console.log('\n--- 4. Testing Proposal Revisions (v2, v3) ---');

    const reviseRes = await makeRequest(port, `/api/v1/proposals/${createdProp._id}/revise`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Revised Staffing Proposal: Auto Components Ltd (v2)',
      },
    });

    assert(reviseRes.status === 201, 'Created revision v2 proposal (Status: 201)');
    const revisedProp = reviseRes.data?.data;
    assert(revisedProp.version === 2, `Revision version incremented: ${revisedProp.version}`);
    assert(revisedProp.proposalNumber.endsWith('-v2'), `Revision proposalNumber has -v2 suffix: ${revisedProp.proposalNumber}`);
    assert(revisedProp.parentProposal.toString() === createdProp._id.toString(), 'Linked parentProposal correctly');
    cleanupIds.proposals.push(revisedProp._id);

    // --- TEST SUITE 5: LIFECYCLE STATUS & ENQUIRY SYNC ---
    console.log('\n--- 5. Testing Proposal Status Lifecycle & Enquiry Synchronization ---');

    // 5A: draft -> ready_for_review
    const reviewStatusRes = await makeRequest(port, `/api/v1/proposals/${createdProp._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'ready_for_review', note: 'Commercials audited by finance lead' },
    });
    assert(reviewStatusRes.status === 200, 'Transitioned status to "ready_for_review"');

    // 5B: ready_for_review -> sent (Syncs enquiry to proposal-sent)
    const sentStatusRes = await makeRequest(port, `/api/v1/proposals/${createdProp._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'sent', note: 'Proposal emailed to client VP' },
    });
    assert(sentStatusRes.status === 200, 'Transitioned status to "sent"');

    const inqAfterSent = await Inquiry.findById(staffingDoc._id);
    assert(inqAfterSent.leadStage === 'proposal-sent', `Enquiry stage automatically synced to "proposal-sent": ${inqAfterSent.leadStage}`);

    // 5C: sent -> accepted (Won)
    const acceptStatusRes = await makeRequest(port, `/api/v1/proposals/${createdProp._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'accepted', note: 'Client approved SOW and signed agreement' },
    });
    assert(acceptStatusRes.status === 200, 'Transitioned status to "accepted"');

    const inqAfterWon = await Inquiry.findById(staffingDoc._id);
    assert(inqAfterWon.leadStage === 'won', `Enquiry stage automatically synced to "won": ${inqAfterWon.leadStage}`);

    // --- TEST SUITE 6: PDF GENERATION & DATA ISOLATION ---
    console.log('\n--- 6. Testing Branded PDF Generation & Private Field Isolation ---');

    const pdfRes = await makeRequest(port, `/api/v1/proposals/${createdProp._id}/pdf`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert(pdfRes.status === 200, 'PDF download endpoint returns 200 OK');
    assert(pdfRes.headers.get('content-type') === 'application/pdf', 'Content-Type header is application/pdf');
    assert(Buffer.isBuffer(pdfRes.data) && pdfRes.data.length > 5000, `Valid PDF binary buffer received (${pdfRes.data?.length} bytes)`);

    // Verify internal notes do not leak into PDF
    const pdfText = pdfRes.data.toString('binary');
    assert(!pdfText.includes('SECRET COST BASIS'), 'STRICT SECURITY: Internal admin notes are completely excluded from PDF');

    // --- TEST SUITE 7: SECURITY & PERMISSION ENFORCEMENT ---
    console.log('\n--- 7. Testing Authorization & Security Boundaries ---');

    // 7A: Public / Unauthenticated cannot access proposals
    const unauthRes = await makeRequest(port, '/api/v1/proposals');
    assert(unauthRes.status === 401, 'Unauthenticated access to /proposals rejected with 401');

    // 7B: Regular customer cannot access proposals
    const custRes = await makeRequest(port, '/api/v1/proposals', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(custRes.status === 403, 'Customer role forbidden from accessing /proposals (403)');

    // 7C: Regular customer cannot download proposal PDF
    const custPdfRes = await makeRequest(port, `/api/v1/proposals/${createdProp._id}/pdf`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(custPdfRes.status === 403, 'Customer role forbidden from downloading proposal PDF (403)');

  } catch (error) {
    console.error('Test execution error:', error);
    failed++;
  } finally {
    // Cleanup created test records
    console.log('\n--- Cleaning up test records ---');
    if (cleanupIds.proposals.length > 0) {
      await Proposal.deleteMany({ _id: { $in: cleanupIds.proposals } });
      console.log(`Cleaned up ${cleanupIds.proposals.length} test proposals`);
    }
    if (cleanupIds.inquiries.length > 0) {
      await Inquiry.deleteMany({ _id: { $in: cleanupIds.inquiries } });
      console.log(`Cleaned up ${cleanupIds.inquiries.length} test inquiries`);
    }
    if (cleanupIds.users.length > 0) {
      await User.deleteMany({ _id: { $in: cleanupIds.users } });
      console.log(`Cleaned up ${cleanupIds.users.length} test users`);
    }

    server.close();
    await mongoose.disconnect();
    console.log('✅ Server closed and MongoDB disconnected');
  }

  console.log('\n======================================================');
  console.log(`🏁 PHASE 2 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runPhase2Tests();
