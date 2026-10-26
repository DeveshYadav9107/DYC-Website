import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import router from './src/routes/index.js';
import Job from './src/models/Job.js';
import JobApplication from './src/models/JobApplication.js';
import StaffingRequest from './src/models/StaffingRequest.js';
import User from './src/models/User.js';
import jwt from 'jsonwebtoken';
import env from './src/config/env.js';

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
  } else {
    data = await res.text();
  }

  return { status: res.status, data };
};

const runPhase3Tests = async () => {
  console.log('\n======================================================');
  console.log('🚀 RUNNING DYC PHASE 3 MANPOWER & RECRUITMENT TESTS');
  console.log('======================================================\n');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');

  const { server, port } = await startTestServer();
  console.log(`✅ Test server running on port ${port}\n`);

  // Find or create an admin user for auth testing
  let adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'DYC Test Admin',
      email: 'recruiter.test@dyc.co.in',
      password: 'password123',
      role: 'admin',
    });
  }

  const adminToken = jwt.sign({ id: adminUser._id }, env.JWT_SECRET, { expiresIn: '1d' });
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  try {
    // 1. Test GET /jobs
    console.log('1. Testing GET /api/v1/jobs (Public listing)...');
    const jobsRes = await makeRequest(port, '/api/v1/jobs');
    console.log(`Status: ${jobsRes.status}`);
    if (jobsRes.status !== 200 || !jobsRes.data?.data?.jobs?.length) {
      throw new Error(`Failed to get public jobs: ${JSON.stringify(jobsRes.data)}`);
    }
    console.log(`✅ Fetched ${jobsRes.data.data.jobs.length} jobs. Sample title: "${jobsRes.data.data.jobs[0].title}"\n`);

    const testJob = jobsRes.data.data.jobs[0];

    // 2. Test GET /jobs/:slug
    console.log(`2. Testing GET /api/v1/jobs/${testJob.slug}...`);
    const singleJobRes = await makeRequest(port, `/api/v1/jobs/${testJob.slug}`);
    if (singleJobRes.status !== 200 || singleJobRes.data?.data?.title !== testJob.title) {
      throw new Error(`Failed to get job by slug: ${JSON.stringify(singleJobRes.data)}`);
    }
    console.log(`✅ Successfully fetched single job: "${singleJobRes.data.data.title}" (Views: ${singleJobRes.data.data.viewsCount})\n`);

    // 3. Test POST /applications (Candidate application submission)
    console.log('3. Testing POST /api/v1/applications (Candidate applies for job)...');
    const appData = {
      jobId: testJob._id,
      candidateName: 'Rahul Sharma',
      candidateEmail: 'rahul.test.candidate@gmail.com',
      candidatePhone: '+91 98765 43210',
      currentCompany: 'Tata Consultancy Services',
      currentDesignation: 'Senior SAP Consultant',
      totalExperience: '6 years',
      currentSalary: '₹12,00,000',
      expectedSalary: '₹16,00,000',
      noticePeriod: '15 Days',
      skills: ['SAP FICO', 'HANA', 'S/4HANA', 'General Ledger'],
      resumeUrl: '/uploads/resumes/rahul_sharma_cv.pdf',
      resumeFileName: 'rahul_sharma_cv.pdf',
      coverLetter: 'I am excited to apply for this position at DY&C.',
    };
    const submitAppRes = await makeRequest(port, '/api/v1/applications', {
      method: 'POST',
      body: appData,
    });
    if (submitAppRes.status !== 201 || !submitAppRes.data?.data?._id) {
      throw new Error(`Failed to submit job application: ${JSON.stringify(submitAppRes.data)}`);
    }
    const createdApp = submitAppRes.data.data;
    console.log(`✅ Application submitted successfully! ID: ${createdApp._id}, Status: ${createdApp.status}\n`);

    // 4. Test GET /applications/stats
    console.log('4. Testing GET /api/v1/applications/stats (Recruiter metrics)...');
    const statsRes = await makeRequest(port, '/api/v1/applications/stats', { headers: adminHeaders });
    if (statsRes.status !== 200 || statsRes.data?.data?.totalApplications === undefined) {
      throw new Error(`Failed to get application stats: ${JSON.stringify(statsRes.data)}`);
    }
    console.log(`✅ Recruiter stats: Total: ${statsRes.data.data.totalApplications}, Applied: ${statsRes.data.data.applied}\n`);

    // 5. Test PATCH /applications/:id/status (Transition to Screening)
    console.log('5. Testing PATCH /api/v1/applications/:id/status (Transition to Screening)...');
    const statusUpdateRes = await makeRequest(port, `/api/v1/applications/${createdApp._id}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: { status: 'Screening', note: 'Profile fits SAP enterprise requirements.' },
    });
    if (statusUpdateRes.status !== 200 || statusUpdateRes.data?.data?.status !== 'Screening') {
      throw new Error(`Failed to update application status: ${JSON.stringify(statusUpdateRes.data)}`);
    }
    console.log(`✅ Status transitioned to: ${statusUpdateRes.data.data.status}\n`);

    // 6. Test POST /applications/:id/interviews (Schedule Interview Round)
    console.log('6. Testing POST /api/v1/applications/:id/interviews (Schedule Interview Round)...');
    const interviewData = {
      roundName: 'Round 1 - Technical Assessment',
      scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      time: '03:00 PM IST',
      meetingType: 'Online (Google Meet / Zoom)',
      meetingLink: 'https://meet.google.com/dyc-tech-round',
      interviewerName: 'Sanjay Verma (Lead Architect)',
      note: 'Focus on S/4HANA migration experience and CO-PA configuration.',
    };
    const scheduleRes = await makeRequest(port, `/api/v1/applications/${createdApp._id}/interviews`, {
      method: 'POST',
      headers: adminHeaders,
      body: interviewData,
    });
    if (scheduleRes.status !== 200 || !scheduleRes.data?.data?.interviews?.length) {
      throw new Error(`Failed to schedule interview: ${JSON.stringify(scheduleRes.data)}`);
    }
    console.log(`✅ Interview scheduled! Total rounds: ${scheduleRes.data.data.interviews.length}, Current status: ${scheduleRes.data.data.status}\n`);

    // 7. Test POST /applications/:id/notes (Add Recruiter Note)
    console.log('7. Testing POST /api/v1/applications/:id/notes (Recruiter evaluation note)...');
    const noteRes = await makeRequest(port, `/api/v1/applications/${createdApp._id}/notes`, {
      method: 'POST',
      headers: adminHeaders,
      body: { note: 'Candidate communicated well. Highly recommended for final client discussion.' },
    });
    if (noteRes.status !== 200 || !noteRes.data?.data?.recruiterNotes?.length) {
      throw new Error(`Failed to add note: ${JSON.stringify(noteRes.data)}`);
    }
    console.log(`✅ Recruiter note added! Total notes: ${noteRes.data.data.recruiterNotes.length}\n`);

    // 8. Test POST /staffing-requests (Client submits manpower requisition)
    console.log('8. Testing POST /api/v1/staffing-requests (Corporate manpower requisition)...');
    const staffingData = {
      companyName: 'Maruti Suzuki Suppliers Pvt Ltd',
      contactPerson: 'Vikram Malhotra',
      contactEmail: 'vikram.m@marutisuppliers.com',
      contactPhone: '+91 98111 22334',
      industry: 'Automotive & Engineering',
      roleTitle: 'Quality Control Engineers & Assembly Technicians',
      employmentType: 'Contract Manpower',
      headcount: 12,
      experienceRequired: '2-4 years',
      requiredSkills: ['CMM Inspection', 'APQP', 'PPAP', 'Blueprint Reading'],
      workLocation: 'IMT Manesar, Gurugram',
      timeline: 'Immediate (Within 7 Days)',
      budgetPerResource: '₹28,000 / month',
      jobDescription: 'Need 12 certified quality inspectors for immediate 1-year contract project.',
    };
    const staffingRes = await makeRequest(port, '/api/v1/staffing-requests', {
      method: 'POST',
      body: staffingData,
    });
    if (staffingRes.status !== 201 || !staffingRes.data?.data?.requestNumber) {
      throw new Error(`Failed to submit staffing request: ${JSON.stringify(staffingRes.data)}`);
    }
    const createdReq = staffingRes.data.data;
    console.log(`✅ Client manpower request created! Requisition No: ${createdReq.requestNumber}, Headcount: ${createdReq.headcount}\n`);

    // 9. Test PATCH /staffing-requests/:id/progress (Update sourcing progress)
    console.log('9. Testing PATCH /api/v1/staffing-requests/:id/progress (Update fulfillment progress)...');
    const progressRes = await makeRequest(port, `/api/v1/staffing-requests/${createdReq._id}/progress`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: { sourcedCount: 8, interviewedCount: 6, joinedCount: 4 },
    });
    if (progressRes.status !== 200 || progressRes.data?.data?.fulfillmentProgress?.sourcedCount !== 8) {
      throw new Error(`Failed to update progress: ${JSON.stringify(progressRes.data)}`);
    }
    console.log(`✅ Fulfillment progress updated: Sourced ${progressRes.data.data.fulfillmentProgress.sourcedCount} of ${createdReq.headcount}\n`);

    // Clean up test records
    await JobApplication.findByIdAndDelete(createdApp._id);
    await StaffingRequest.findByIdAndDelete(createdReq._id);
    console.log('🧹 Cleaned up temporary test records.');

    console.log('\n======================================================');
    console.log('🎉 ALL PHASE 3 BACKEND API TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
};

runPhase3Tests().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
