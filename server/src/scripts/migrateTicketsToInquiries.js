import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mapPriority = (p) => {
  if (!p) return 'normal';
  const lower = String(p).toLowerCase();
  if (lower.includes('critical') || lower.includes('p1')) return 'urgent';
  if (lower.includes('high') || lower.includes('p2')) return 'high';
  if (lower.includes('low') || lower.includes('p4')) return 'low';
  return 'normal';
};

const mapStatus = (s) => {
  if (!s) return 'new';
  const lower = String(s).toLowerCase();
  if (lower.includes('closed') || lower.includes('resolved')) return 'closed';
  if (lower.includes('progress') || lower.includes('testing') || lower.includes('pending')) return 'contacted';
  return 'new';
};

async function migrate() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas for ticket consolidation.');

    const supportTicketsCol = mongoose.connection.db.collection('supporttickets');
    const inquiriesCol = mongoose.connection.db.collection('inquiries');

    // Find Phase 4 support tickets with ticketNumber
    const tickets = await supportTicketsCol.find({ ticketNumber: { $exists: true, $ne: null } }).toArray();
    console.log(`Found ${tickets.length} Phase 4 support tickets to inspect.`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const ticket of tickets) {
      const existing = await inquiriesCol.findOne({
        $or: [
          { enquiryNumber: ticket.ticketNumber },
          { 'metadata.sourceTicketId': ticket._id.toString() },
        ],
      });

      if (existing) {
        console.log(`Skipping ${ticket.ticketNumber} - already consolidated in inquiries as ${existing.enquiryNumber}`);
        skippedCount++;
        continue;
      }

      const status = mapStatus(ticket.status);
      const isClosed = status === 'closed';

      const messages = (ticket.messages || []).map((m) => ({
        _id: m._id || new mongoose.Types.ObjectId(),
        sender: m.sender || ticket.clientUser,
        senderName: m.senderName || ticket.clientName || 'Customer',
        senderRole: m.senderRole === 'client' ? 'customer' : m.senderRole === 'consultant' ? 'admin' : (m.senderRole || 'customer'),
        message: m.message || 'Support message',
        attachments: (m.attachments || []).map((att) => ({
          fileName: att.fileName || 'Attachment',
          fileUrl: att.fileUrl,
          fileSize: att.fileSize,
          fileType: att.fileType,
          uploadedAt: att.uploadedAt || new Date(),
          uploadedByName: att.uploadedByName || 'User',
        })),
        createdAt: m.createdAt || ticket.createdAt || new Date(),
      }));

      // If initial description wasn't in messages, prepend it
      if (ticket.description && (!messages.length || messages[0].message !== ticket.description)) {
        messages.unshift({
          _id: new mongoose.Types.ObjectId(),
          sender: ticket.clientUser,
          senderName: ticket.clientName || 'Customer',
          senderRole: 'customer',
          message: ticket.description,
          attachments: (ticket.attachments || []).map((att) => ({
            fileName: att.fileName || 'Attachment',
            fileUrl: att.fileUrl,
            fileSize: att.fileSize,
            fileType: att.fileType,
            uploadedAt: att.uploadedAt || ticket.createdAt || new Date(),
            uploadedByName: att.uploadedByName || 'User',
          })),
          createdAt: ticket.createdAt || new Date(),
        });
      }

      const timeline = (ticket.activityLogs || []).map((log) => ({
        type: log.action.toLowerCase().includes('resolved') || log.action.toLowerCase().includes('closed')
          ? 'ticket_closed'
          : log.action.toLowerCase().includes('assigned')
          ? 'assigned'
          : 'created',
        description: log.action,
        performedByName: log.performedBy || 'System',
        createdAt: log.timestamp || new Date(),
      }));

      const inquiryDoc = {
        enquiryNumber: ticket.ticketNumber,
        user: ticket.clientUser,
        name: ticket.clientName || 'Valued Client',
        email: (ticket.clientEmail || 'client@dyc.co.in').toLowerCase(),
        phone: ticket.clientPhone || '',
        company: ticket.companyName || '',
        type: 'sap-support',
        sapModule: ticket.module || 'FICO',
        sapEnvironment: ticket.environment || 'Production (PRD)',
        service: ticket.subject || 'SAP Support Ticket',
        requirement: ticket.description || ticket.subject || '',
        message: ticket.description || ticket.subject || '',
        priority: mapPriority(ticket.priority),
        status,
        leadStage: isClosed ? 'lost' : 'contacted',
        assignedTo: ticket.assignedTo || null,
        attachments: (ticket.attachments || []).map((att) => ({
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileSize: att.fileSize,
          fileType: att.fileType,
          uploadedAt: att.uploadedAt || ticket.createdAt || new Date(),
          uploadedByName: att.uploadedByName || 'User',
        })),
        messages,
        timeline,
        closedAt: isClosed ? (ticket.closedAt || ticket.resolvedAt || ticket.updatedAt || new Date()) : null,
        closedByName: isClosed ? (ticket.assignedToName || 'Admin') : null,
        closureReason: isClosed ? (ticket.resolutionSummary || 'Issue resolved by support team') : null,
        structuredRequirements: {
          tCode: ticket.tCode,
          category: ticket.category,
          sapVersion: ticket.sapVersion,
          transportRequest: ticket.transportRequest,
          rootCause: ticket.rootCause,
          resolutionSummary: ticket.resolutionSummary,
        },
        source: 'support_ticket_migration',
        createdAt: ticket.createdAt || new Date(),
        updatedAt: ticket.updatedAt || new Date(),
      };

      await inquiriesCol.insertOne(inquiryDoc);
      console.log(`Migrated ${ticket.ticketNumber} ("${ticket.subject}") into inquiries successfully.`);
      migratedCount++;
    }

    console.log(`Consolidation summary: Migrated ${migratedCount}, Skipped ${skippedCount}. Total Phase 4 tickets preserved: ${tickets.length}.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
