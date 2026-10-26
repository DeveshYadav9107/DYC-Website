import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './src/models/User.js';
import SupportTicket from './src/models/SupportTicket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const runTest = async () => {
  try {
    console.log('Connecting to MongoDB for Phase 4 SAP Support Test...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Get or create test client and admin users
    let clientUser = await User.findOne({ email: 'sapclient.test@dyc.co.in' });
    if (!clientUser) {
      clientUser = await User.create({
        name: 'Rajesh Sharma (CFO)',
        email: 'sapclient.test@dyc.co.in',
        password: 'Password123!',
        company: 'Apex Steel Industries Ltd',
        phone: '+91 98765 43210',
        role: 'user',
        sapModules: ['FICO', 'MM', 'SD'],
        sapSystem: 'SAP S/4HANA 2022',
        supportAgreement: '24x7 Enterprise Platinum',
        authorizedSupportUser: true,
      });
      console.log('Created test SAP client user:', clientUser.name);
    } else {
      clientUser.supportAgreement = '24x7 Enterprise Platinum';
      clientUser.authorizedSupportUser = true;
      clientUser.company = 'Apex Steel Industries Ltd';
      await clientUser.save();
      console.log('Existing test SAP client found:', clientUser.name);
    }

    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Dinesh Yadav (Admin)',
        email: 'admin.support@dyc.co.in',
        password: 'Password123!',
        role: 'admin',
      });
    }

    // 2. Create a high-priority P1 SAP Support Ticket
    console.log('\n--- Test 1: Ticket Creation & Automatic SLA Calculation ---');
    const newTicket = await SupportTicket.create({
      clientUser: clientUser._id,
      clientName: clientUser.name,
      clientEmail: clientUser.email,
      clientPhone: clientUser.phone,
      companyName: clientUser.company,
      module: 'FICO',
      environment: 'Production (PRD)',
      tCode: 'F110 / F-53',
      sapVersion: 'SAP S/4HANA 2022 On-Premise',
      category: 'Performance / Dump (ST22)',
      subject: 'Critical Runtime Error SAPSQL_ARRAY_INSERT_DUPREC during Vendor Automatic Payment Run',
      description: 'Vendor payment run F110 abended with short dump SAPSQL_ARRAY_INSERT_DUPREC in table REGUP. Fiscal month-end disbursement is blocked for 450+ vendor accounts.',
      priority: 'P1 - Critical',
      status: 'Open',
      attachments: [
        {
          fileName: 'ST22_Dump_REGUP_F110.pdf',
          fileUrl: '/uploads/tickets/ST22_Dump_REGUP_F110.pdf',
          fileSize: 245000,
          fileType: 'application/pdf',
        },
      ],
      messages: [
        {
          sender: clientUser._id,
          senderName: clientUser.name,
          senderRole: 'client',
          message: 'Vendor payment run F110 abended with short dump SAPSQL_ARRAY_INSERT_DUPREC in table REGUP. Urgent resolution required.',
          attachments: [
            {
              fileName: 'ST22_Dump_REGUP_F110.pdf',
              fileUrl: '/uploads/tickets/ST22_Dump_REGUP_F110.pdf',
              fileSize: 245000,
              fileType: 'application/pdf',
            },
          ],
        },
      ],
      activityLogs: [
        {
          action: `Ticket logged by ${clientUser.name} with P1 Critical SLA`,
          performedBy: clientUser.name,
        },
      ],
    });

    console.log('✅ Created Ticket:', newTicket.ticketNumber);
    console.log('   Module:', newTicket.module);
    console.log('   Priority:', newTicket.priority);
    console.log('   Target Resolution SLA (Hours):', newTicket.slaTargetHours);
    console.log('   Resolution Deadline:', newTicket.slaResolutionDeadline);
    console.log('   Initial SLA Status:', newTicket.slaStatus);

    if (newTicket.slaTargetHours !== 4) {
      throw new Error(`Expected P1 SLA target to be 4h, got ${newTicket.slaTargetHours}`);
    }

    // 3. Assignment to SAP Lead Consultant
    console.log('\n--- Test 2: Assign Ticket & In Progress Transition ---');
    newTicket.assignedTo = adminUser._id;
    newTicket.assignedToName = adminUser.name;
    newTicket.assignedTeam = 'SAP FICO & ABAP Core Team';
    newTicket.status = 'In Progress';
    newTicket.firstRespondedAt = new Date();
    newTicket.activityLogs.push({
      action: `Assigned to ${adminUser.name} (${newTicket.assignedTeam})`,
      performedBy: adminUser.name,
    });
    await newTicket.save();
    console.log('✅ Ticket assigned to:', newTicket.assignedToName, `(${newTicket.assignedTeam})`);

    // 4. Consultant Posts Internal Note & Public Reply
    console.log('\n--- Test 3: Messages & Communication Thread ---');
    newTicket.messages.push({
      sender: adminUser._id,
      senderName: adminUser.name,
      senderRole: 'consultant',
      message: 'Internal investigation: Verified OSS Note 2984112 applies for duplicate clearing item indexing on S/4HANA 2022.',
      isInternalNote: true,
      createdAt: new Date(),
    });

    newTicket.messages.push({
      sender: adminUser._id,
      senderName: adminUser.name,
      senderRole: 'consultant',
      message: 'Hello Rajesh, we have analyzed the dump in ST22. A locked document lock table entry created duplicate index entries during concurrent execution. We are applying SAP Note 2984112 correction in DEV and moving to QAS for your validation.',
      isInternalNote: false,
      createdAt: new Date(),
    });
    await newTicket.save();
    console.log('✅ Added 2 messages (1 internal consultant note, 1 client-facing response).');

    // 5. Status Transition to Resolved with TR and Root Cause
    console.log('\n--- Test 4: Resolution & TR Recording ---');
    newTicket.status = 'Resolved';
    newTicket.resolvedAt = new Date();
    newTicket.resolutionSummary = 'Applied OSS Note 2984112 correction and cleared orphaned table locks via SM12. Test run in QAS successful.';
    newTicket.transportRequest = 'DEVK904521';
    newTicket.rootCause = 'Concurrent background execution caused duplicate entry in REGUP clearing staging buffer.';
    newTicket.activityLogs.push({
      action: 'Ticket marked as Resolved with TR DEVK904521',
      performedBy: adminUser.name,
    });
    newTicket.evaluateSlaStatus();
    await newTicket.save();
    console.log('✅ Ticket Resolved!');
    console.log('   Transport Request (TR):', newTicket.transportRequest);
    console.log('   Root Cause:', newTicket.rootCause);
    console.log('   Final SLA Status:', newTicket.slaStatus);

    // 6. Client Submits CSAT Rating
    console.log('\n--- Test 5: Client CSAT Feedback ---');
    newTicket.rating = 5;
    newTicket.feedback = 'Outstanding response! The payment run was unblocked in under 2 hours without data loss.';
    newTicket.activityLogs.push({
      action: 'Client rated 5/5 stars',
      performedBy: clientUser.name,
    });
    await newTicket.save();
    console.log('✅ CSAT 5-Star Rating recorded:', newTicket.rating, 'stars -', newTicket.feedback);

    // 7. Verify Aggregation Statistics
    console.log('\n--- Test 6: SLA & Dashboard Metrics ---');
    const totalCount = await SupportTicket.countDocuments();
    const resolvedCount = await SupportTicket.countDocuments({ status: 'Resolved' });
    const p1Count = await SupportTicket.countDocuments({ priority: 'P1 - Critical' });
    console.log(`✅ Total Tickets: ${totalCount}, Resolved: ${resolvedCount}, P1 Criticals: ${p1Count}`);

    console.log('\n=============================================');
    console.log('🎉 PHASE 4 SAP SUPPORT BACKEND TESTS PASSED!');
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Phase 4 Test Error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTest();
