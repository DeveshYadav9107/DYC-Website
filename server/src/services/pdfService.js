import PDFDocument from 'pdfkit';

/**
 * Generates a professional, branded PDF buffer for a Proposal
 * Strictly excludes internalNotes
 * Uses DYC visual identity: Navy (#11183F), Green (#10B981), Slate (#1E293B, #64748B)
 */
export const generateProposalPdf = async (proposal) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
        info: {
          Title: `DYC Proposal - ${proposal.proposalNumber}`,
          Author: 'DY&C',
          Subject: proposal.title,
          Keywords: 'DYC, Proposal, SAP, Staffing, ERP',
          CreationDate: new Date(),
        },
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', (err) => reject(err));

      const primaryColor = '#11183F'; // Deep Navy
      const accentGreen = '#10B981';  // DYC Green
      const secondaryColor = '#4F46E5'; // Indigo
      const textColor = '#1E293B';     // Dark Slate
      const mutedColor = '#64748B';    // Light Slate
      const lightBg = '#F8FAFC';       // Card background
      const borderColor = '#E2E8F0';   // Border Gray

      const currSymbol = proposal.currencySymbol || '₹';
      const formatCurr = (val) => {
        const num = Number(val) || 0;
        return `${currSymbol} ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      };

      // Helper for drawing section headings
      const drawSectionHeader = (title) => {
        if (doc.y > 690) {
          doc.addPage();
        } else {
          doc.moveDown(0.8);
        }
        const startY = doc.y;
        doc
          .rect(40, startY, 4, 16)
          .fill(accentGreen);
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor(primaryColor)
          .text(title, 52, startY + 2);
        doc.moveDown(0.6);
      };

      // Helper for check if page break needed
      const ensureSpace = (neededHeight) => {
        if (doc.y + neededHeight > 730) {
          doc.addPage();
        }
      };

      // ================= HEADER =================
      // Top colored accent bar
      doc.rect(0, 0, 595.28, 6).fill(primaryColor);
      doc.rect(0, 6, 200, 3).fill(accentGreen);

      // Company Branding
      doc.y = 30;
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor(primaryColor)
        .text('DY', 40, 30, { continued: true })
        .fillColor(accentGreen)
        .text('&C', { continued: true })
        .font('Helvetica')
        .fontSize(14)
        .fillColor(textColor)
        .text('  |  DY&C');

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(mutedColor)
        .text('SAP Implementation & AMS • Enterprise ERP Solutions • Manpower Staffing', 40, 54);

      // Company Contact Info (Right aligned)
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(mutedColor)
        .text('Email: info@dycinfo.com', 380, 30, { align: 'right' })
        .text('Phone: +91 98765 43210', 380, 42, { align: 'right' })
        .text('Website: www.dycinfo.com', 380, 54, { align: 'right' });

      // Divider Line
      doc.strokeColor(borderColor).lineWidth(1).moveTo(40, 72).lineTo(555, 72).stroke();

      // ================= PROPOSAL TITLE & META BANNER =================
      doc.y = 82;
      const bannerY = doc.y;
      doc.roundedRect(40, bannerY, 515, 62, 8).fillAndStroke('#EEF2FF', '#C7D2FE');

      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(primaryColor)
        .text(proposal.title || 'Commercial & Technical Proposal', 55, bannerY + 12, { width: 330 });

      const categoryLabels = {
        'staffing-request': 'Manpower & Staffing Proposal',
        'sap-resource-request': 'SAP Resource Engagement',
        'sap-support': 'SAP Support & Maintenance Agreement',
        'erp-inquiry': 'Enterprise ERP Software Proposal',
        'general': 'Business Services Proposal',
      };
      const catLabel = categoryLabels[proposal.serviceCategory] || 'Enterprise Services Proposal';
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(secondaryColor)
        .text(catLabel.toUpperCase(), 55, bannerY + 34);

      // Meta Block (Right aligned inside banner)
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(primaryColor)
        .text(`Ref: ${proposal.proposalNumber}`, 360, bannerY + 12, { align: 'right', width: 180 })
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(mutedColor)
        .text(`Date: ${new Date(proposal.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 360, bannerY + 26, { align: 'right', width: 180 })
        .text(`Valid Until: ${new Date(proposal.validUntil).toLocaleDateString('en-IN')}`, 360, bannerY + 38, { align: 'right', width: 180 })
        .text(`Version: v${proposal.version || 1}.0`, 360, bannerY + 50, { align: 'right', width: 180 });

      doc.y = bannerY + 74;

      // ================= CLIENT & RECIPIENT INFORMATION =================
      ensureSpace(80);
      drawSectionHeader('Prepared For (Client Information)');

      const clientCardY = doc.y;
      doc.roundedRect(40, clientCardY, 515, 64, 6).fillAndStroke(lightBg, borderColor);

      const client = proposal.client || {};
      doc
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor(textColor)
        .text(`Client Contact: `, 55, clientCardY + 10, { continued: true })
        .font('Helvetica')
        .text(client.name || 'Valued Client')
        .font('Helvetica-Bold')
        .text(`Organization: `, 55, clientCardY + 24, { continued: true })
        .font('Helvetica')
        .text(client.company || 'Private Organization')
        .font('Helvetica-Bold')
        .text(`Designation: `, 55, clientCardY + 38, { continued: true })
        .font('Helvetica')
        .text(client.designation || 'Not specified');

      doc
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor(textColor)
        .text(`Email: `, 320, clientCardY + 10, { continued: true })
        .font('Helvetica')
        .text(client.email || '—')
        .font('Helvetica-Bold')
        .text(`Phone: `, 320, clientCardY + 24, { continued: true })
        .font('Helvetica')
        .text(client.phone || '—')
        .font('Helvetica-Bold')
        .text(`Billing Location: `, 320, clientCardY + 38, { continued: true })
        .font('Helvetica')
        .text(client.address || 'Standard Location');

      doc.y = clientCardY + 74;

      // ================= EXECUTIVE SUMMARY =================
      if (proposal.executiveSummary || proposal.clientRequirementSummary) {
        ensureSpace(90);
        drawSectionHeader('1. Executive Summary & Objective');

        const summaryText = proposal.executiveSummary || proposal.clientRequirementSummary;
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(textColor)
          .text(summaryText, 45, doc.y, { width: 505, lineGap: 3, align: 'justify' });
        doc.moveDown(0.6);
      }

      // ================= SCOPE OF WORK =================
      if (proposal.scopeOfWork && proposal.scopeOfWork.length > 0) {
        ensureSpace(90);
        drawSectionHeader('2. Scope of Work');

        proposal.scopeOfWork.forEach((item, index) => {
          ensureSpace(20);
          doc
            .font('Helvetica-Bold')
            .fontSize(8.5)
            .fillColor(accentGreen)
            .text('•', 48, doc.y, { continued: true })
            .fillColor(textColor)
            .font('Helvetica')
            .text(`  ${item}`, { width: 495, lineGap: 2 });
          doc.moveDown(0.2);
        });
        doc.moveDown(0.5);
      }

      // ================= KEY DELIVERABLES =================
      if (proposal.deliverables && proposal.deliverables.length > 0) {
        ensureSpace(90);
        drawSectionHeader('3. Proposed Deliverables');

        proposal.deliverables.forEach((item, index) => {
          ensureSpace(20);
          doc
            .font('Helvetica-Bold')
            .fontSize(8.5)
            .fillColor(secondaryColor)
            .text(`3.${index + 1}`, 48, doc.y, { continued: true })
            .font('Helvetica')
            .fillColor(textColor)
            .text(`  ${item}`, { width: 495, lineGap: 2 });
          doc.moveDown(0.2);
        });
        doc.moveDown(0.5);
      }

      // ================= TIMELINE & RESOURCE REQUIREMENTS =================
      if (proposal.timeline || proposal.resourceRequirements) {
        ensureSpace(80);
        drawSectionHeader('4. Timeline & Resource Deployment');

        if (proposal.timeline) {
          doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor(textColor)
            .text('Proposed Timeline / Duration: ', 45, doc.y, { continued: true })
            .font('Helvetica')
            .text(proposal.timeline);
          doc.moveDown(0.4);
        }

        if (proposal.resourceRequirements) {
          doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor(textColor)
            .text('Resource Allocation: ', 45, doc.y, { continued: true })
            .font('Helvetica')
            .text(proposal.resourceRequirements);
          doc.moveDown(0.4);
        }
      }

      // ================= COMMERCIAL PRICING TABLE =================
      ensureSpace(160);
      drawSectionHeader('5. Commercial Investment & Pricing');

      const tableTop = doc.y;
      const colX = {
        desc: 45,
        qty: 310,
        unit: 360,
        rate: 420,
        total: 490,
      };

      // Table Header Row
      doc.rect(40, tableTop, 515, 20).fill('#11183F');

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#FFFFFF')
        .text('Item Description / Scope', colX.desc, tableTop + 5, { width: 260 })
        .text('Qty', colX.qty, tableTop + 5, { width: 45, align: 'center' })
        .text('Unit', colX.unit, tableTop + 5, { width: 55, align: 'center' })
        .text('Rate', colX.rate, tableTop + 5, { width: 65, align: 'right' })
        .text('Total', colX.total, tableTop + 5, { width: 60, align: 'right' });

      let currentY = tableTop + 20;

      const items = Array.isArray(proposal.lineItems) && proposal.lineItems.length > 0
        ? proposal.lineItems
        : [{ description: 'Enterprise Professional Services as outlined in Scope of Work', quantity: 1, unit: 'Project', unitRate: proposal.subtotal || 0, total: proposal.subtotal || 0 }];

      items.forEach((item, idx) => {
        const rowHeight = 22;
        ensureSpace(rowHeight);
        if (doc.y > currentY) {
          currentY = doc.y;
        }

        const isZebra = idx % 2 === 1;
        if (isZebra) {
          doc.rect(40, currentY, 515, rowHeight).fill('#F8FAFC');
        }

        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor(textColor)
          .text(item.description || `Item #${idx + 1}`, colX.desc, currentY + 5, { width: 260, lineBreak: false })
          .text(String(item.quantity || 1), colX.qty, currentY + 5, { width: 45, align: 'center' })
          .text(item.unit || 'Unit', colX.unit, currentY + 5, { width: 55, align: 'center' })
          .text(formatCurr(item.unitRate || 0), colX.rate, currentY + 5, { width: 65, align: 'right' })
          .font('Helvetica-Bold')
          .text(formatCurr(item.total || 0), colX.total, currentY + 5, { width: 60, align: 'right' });

        doc.strokeColor(borderColor).lineWidth(0.5).moveTo(40, currentY + rowHeight).lineTo(555, currentY + rowHeight).stroke();
        currentY += rowHeight;
      });

      // Commercial Summary Block (Subtotal, Discount, Tax, Grand Total)
      ensureSpace(85);
      const summaryBoxY = currentY + 6;
      const rightColX = 360;
      const valueColX = 470;

      // Subtotal
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(mutedColor)
        .text('Subtotal:', rightColX, summaryBoxY, { width: 100, align: 'right' })
        .font('Helvetica-Bold')
        .fillColor(textColor)
        .text(formatCurr(proposal.subtotal || 0), valueColX, summaryBoxY, { width: 80, align: 'right' });

      let nextRowY = summaryBoxY + 16;

      // Discount (if any)
      if (proposal.discountAmount > 0) {
        const discountLabel = proposal.discountType === 'percentage'
          ? `Discount (${proposal.discountValue}%):`
          : 'Discount:';
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(mutedColor)
          .text(discountLabel, rightColX, nextRowY, { width: 100, align: 'right' })
          .font('Helvetica-Bold')
          .fillColor('#DC2626')
          .text(`- ${formatCurr(proposal.discountAmount)}`, valueColX, nextRowY, { width: 80, align: 'right' });
        nextRowY += 16;
      }

      // Tax / GST (if any)
      if (proposal.taxAmount > 0 || proposal.taxRate > 0) {
        const taxLabel = `${proposal.taxLabel || 'Tax'} (${proposal.taxRate || 0}%):`;
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(mutedColor)
          .text(taxLabel, rightColX, nextRowY, { width: 100, align: 'right' })
          .font('Helvetica-Bold')
          .fillColor(textColor)
          .text(formatCurr(proposal.taxAmount || 0), valueColX, nextRowY, { width: 80, align: 'right' });
        nextRowY += 16;
      }

      // Grand Total Highlight Banner
      doc.roundedRect(rightColX - 10, nextRowY, 205, 26, 4).fillAndStroke('#EEF2FF', '#C7D2FE');

      doc
        .font('Helvetica-Bold')
        .fontSize(10.5)
        .fillColor(primaryColor)
        .text('Grand Total:', rightColX, nextRowY + 7, { width: 100, align: 'right' })
        .fillColor(secondaryColor)
        .text(formatCurr(proposal.grandTotal || 0), valueColX, nextRowY + 7, { width: 80, align: 'right' });

      doc.y = nextRowY + 36;

      // ================= TERMS & CONDITIONS =================
      if (proposal.paymentTerms || (proposal.assumptions && proposal.assumptions.length > 0) || (proposal.exclusions && proposal.exclusions.length > 0)) {
        ensureSpace(100);
        drawSectionHeader('6. Commercial Terms & Engagement Guidelines');

        if (proposal.paymentTerms) {
          doc
            .font('Helvetica-Bold')
            .fontSize(8.5)
            .fillColor(textColor)
            .text('Payment Milestones & Invoicing Terms: ', 45, doc.y, { continued: true })
            .font('Helvetica')
            .text(proposal.paymentTerms);
          doc.moveDown(0.4);
        }

        if (proposal.assumptions && proposal.assumptions.length > 0) {
          doc.font('Helvetica-Bold').fontSize(8.5).fillColor(textColor).text('Assumptions & Prerequisites:');
          proposal.assumptions.forEach((assump) => {
            doc.font('Helvetica').fontSize(8).fillColor(mutedColor).text(`• ${assump}`, 55, doc.y);
          });
          doc.moveDown(0.4);
        }

        if (proposal.exclusions && proposal.exclusions.length > 0) {
          doc.font('Helvetica-Bold').fontSize(8.5).fillColor(textColor).text('Exclusions & Boundaries:');
          proposal.exclusions.forEach((excl) => {
            doc.font('Helvetica').fontSize(8).fillColor(mutedColor).text(`• ${excl}`, 55, doc.y);
          });
          doc.moveDown(0.4);
        }
      }

      // ================= SIGNATURE & ACCEPTANCE BLOCK =================
      ensureSpace(120);
      drawSectionHeader('7. Authorization & Sign-off');

      const signY = doc.y + 10;

      // Client Signature
      doc.rect(45, signY, 220, 75).stroke(borderColor);
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(textColor)
        .text('Accepted & Authorized by (Client):', 55, signY + 10)
        .font('Helvetica')
        .fontSize(8)
        .fillColor(mutedColor)
        .text(`Name: _______________________________`, 55, signY + 30)
        .text(`Signature: __________________________`, 55, signY + 46)
        .text(`Date: _______________________________`, 55, signY + 62);

      // DYC Signature
      doc.rect(295, signY, 260, 75).stroke(borderColor);
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(textColor)
        .text('For Dinesh Yadav & Company (DY&C):', 305, signY + 10)
        .font('Helvetica')
        .fontSize(8)
        .fillColor(mutedColor)
        .text(`Representative: ${proposal.createdByName || 'Authorized Signatory'}`, 305, signY + 30)
        .text(`Designation: Enterprise Consulting Partner`, 305, signY + 46)
        .text(`Digital Verification: [SECURE PROPOSAL RECORD]`, 305, signY + 62);

      doc.y = signY + 85;

      // Closing Statement
      if (proposal.closingNotes) {
        doc
          .font('Helvetica-Oblique')
          .fontSize(8)
          .fillColor(mutedColor)
          .text(proposal.closingNotes, 45, doc.y, { width: 505, align: 'center' });
      }

      // ================= FOOTERS ON ALL PAGES =================
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);

        // Running Footer Bar
        doc.strokeColor(borderColor).lineWidth(0.5).moveTo(40, 790).lineTo(555, 790).stroke();

        doc
          .font('Helvetica')
          .fontSize(7.5)
          .fillColor(mutedColor)
          .text(
            'DY&C • Commercial In Confidence • Validated Enterprise Solution',
            40,
            796,
            { width: 380, align: 'left' }
          )
          .text(
            `Page ${i + 1} of ${totalPages}`,
            420,
            796,
            { width: 135, align: 'right' }
          );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
