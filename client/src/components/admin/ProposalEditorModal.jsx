import { useState, useEffect, useMemo } from 'react';
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiAlertTriangle,
  FiFileText,
  FiDollarSign,
  FiLayers,
  FiShield,
  FiCalendar,
} from 'react-icons/fi';
import { createProposal, updateProposal } from '../../services/api';

const CURRENCY_OPTIONS = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
  { code: 'AED', symbol: 'AED', label: 'AED (AED) - UAE Dirham' },
];

const UNIT_OPTIONS = [
  'Month',
  'Hours',
  'Days',
  'Consultant / Month',
  'Resource / Month',
  'Fixed Milestone',
  'Lump Sum',
  'Quarter',
  'Annual',
];

const ProposalEditorModal = ({ isOpen, onClose, inquiry, initialProposal, onSaved }) => {
  const isEditing = Boolean(initialProposal && initialProposal._id);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    serviceCategory: 'general',
    client: {
      name: '',
      company: '',
      email: '',
      phone: '',
      designation: '',
      address: '',
    },
    clientRequirementSummary: '',
    solutionSummary: '',
    scopeOfWork: [''],
    deliverables: [''],
    resourceRequirements: '',
    timeline: '',
    currency: 'INR',
    currencySymbol: '₹',
    lineItems: [
      { description: 'Enterprise Consulting & Technical Implementation Services', quantity: 1, unit: 'Month', unitRate: 0 },
    ],
    discountType: 'flat',
    discountValue: 0,
    taxLabel: 'GST',
    taxRate: 18,
    paymentTerms: '50% advance upon contract signing, 50% upon milestone deliverables completion.',
    assumptions: [
      'Client provides timely access to required systems, documentation, and key stakeholders.',
      'Any changes or additions beyond the agreed scope will follow a mutual change-request process.',
    ],
    exclusions: [
      '3rd-party software license fees and hosting cloud infrastructure costs unless explicitly contracted.',
      'End-user hardware procurement and on-premise network cabling.',
    ],
    clientResponsibilities: [
      'Designate a single authorized point of contact (SPOC) for operational reviews and approvals.',
      'Provide required test environments and timely sign-off on deliverables within 5 business days.',
    ],
    validUntil: '',
    closingNotes: 'Thank you for choosing Dinesh Yadav & Company. We look forward to delivering enterprise excellence for your organization.',
    internalNotes: '',
  });

  const [activeTab, setActiveTab] = useState('scope'); // 'scope' | 'pricing' | 'terms' | 'client'
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form from inquiry or initialProposal
  useEffect(() => {
    if (!isOpen) return;

    if (initialProposal) {
      setFormData({
        title: initialProposal.title || '',
        serviceCategory: initialProposal.serviceCategory || inquiry?.type || 'general',
        client: {
          name: initialProposal.client?.name || inquiry?.name || '',
          company: initialProposal.client?.company || inquiry?.company || '',
          email: initialProposal.client?.email || inquiry?.email || '',
          phone: initialProposal.client?.phone || inquiry?.phone || '',
          designation: initialProposal.client?.designation || inquiry?.designation || '',
          address: initialProposal.client?.address || '',
        },
        clientRequirementSummary: initialProposal.clientRequirementSummary || inquiry?.message || '',
        solutionSummary: initialProposal.solutionSummary || '',
        scopeOfWork: Array.isArray(initialProposal.scopeOfWork) && initialProposal.scopeOfWork.length > 0
          ? initialProposal.scopeOfWork
          : [''],
        deliverables: Array.isArray(initialProposal.deliverables) && initialProposal.deliverables.length > 0
          ? initialProposal.deliverables
          : [''],
        resourceRequirements: initialProposal.resourceRequirements || '',
        timeline: initialProposal.timeline || '',
        currency: initialProposal.currency || 'INR',
        currencySymbol: initialProposal.currencySymbol || '₹',
        lineItems: Array.isArray(initialProposal.lineItems) && initialProposal.lineItems.length > 0
          ? initialProposal.lineItems.map((li) => ({
              description: li.description || '',
              quantity: Number(li.quantity) || 1,
              unit: li.unit || 'Month',
              unitRate: Number(li.unitRate) || 0,
            }))
          : [{ description: '', quantity: 1, unit: 'Month', unitRate: 0 }],
        discountType: initialProposal.discountType || 'flat',
        discountValue: Number(initialProposal.discountValue) || 0,
        taxLabel: initialProposal.taxLabel || 'GST',
        taxRate: Number(initialProposal.taxRate) || 0,
        paymentTerms: initialProposal.paymentTerms || '50% advance, 50% upon milestone deliverables completion.',
        assumptions: Array.isArray(initialProposal.assumptions) && initialProposal.assumptions.length > 0
          ? initialProposal.assumptions
          : [''],
        exclusions: Array.isArray(initialProposal.exclusions) && initialProposal.exclusions.length > 0
          ? initialProposal.exclusions
          : [''],
        clientResponsibilities: Array.isArray(initialProposal.clientResponsibilities) && initialProposal.clientResponsibilities.length > 0
          ? initialProposal.clientResponsibilities
          : [''],
        validUntil: initialProposal.validUntil
          ? new Date(initialProposal.validUntil).toISOString().split('T')[0]
          : '',
        closingNotes: initialProposal.closingNotes || '',
        internalNotes: initialProposal.internalNotes || '',
      });
    } else if (inquiry) {
      // Pre-fill from enquiry
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Build sensible default scope items based on category
      let defaultScope = ['Comprehensive technical requirement assessment & architecture formulation.'];
      let defaultDeliverables = ['Project implementation & milestone delivery report.'];
      let defaultResourceReq = '';

      if (inquiry.type === 'staffing-request') {
        defaultScope = [
          'Sourcing, screening, and deploying qualified technical and operational personnel.',
          'Statutory compliance management and industrial workforce supervision.',
        ];
        defaultDeliverables = [
          'Vetted candidates roster and deployment schedule.',
          'Monthly attendance, payroll, and compliance audit reports.',
        ];
        if (inquiry.staffingPositions?.length) {
          defaultResourceReq = inquiry.staffingPositions
            .map((p) => `${p.count}x ${p.roleTitle} (${p.skillLevel}, ${p.employmentType})`)
            .join('; ');
        }
      } else if (inquiry.type === 'sap-resource-request') {
        defaultScope = [
          `Dedicated SAP ${inquiry.sapModule || 'Specialist'} consultant onboarding and functional/technical alignment.`,
          'Execution of module enhancements, configuration, testing, and production deployment.',
        ];
        defaultDeliverables = [
          'Detailed Functional / Technical Specification documents (FS/TS).',
          'User acceptance testing (UAT) signoff and cutover execution.',
        ];
        defaultResourceReq = `${inquiry.numberOfConsultants || 1}x SAP ${inquiry.sapModule || ''} Consultant (${inquiry.experienceLevel || 'Senior'})`;
      } else if (inquiry.type === 'sap-support') {
        defaultScope = [
          `Application Management Support (AMS) for SAP ${inquiry.sapEnvironment || 'system'}.`,
          `Incident resolution, ticket tracking, and preventive system maintenance under ${inquiry.supportCoverage || 'business hours'} coverage.`,
        ];
        defaultDeliverables = [
          'Monthly SLA adherence and incident resolution dashboard.',
          'Root cause analysis (RCA) documentation for critical business incidents.',
        ];
      } else if (inquiry.type === 'erp-inquiry') {
        defaultScope = [
          'Business Process Re-engineering (BPR) and enterprise workflows analysis.',
          'ERP system configuration, data migration, and third-party portal integrations.',
        ];
        defaultDeliverables = [
          'Standard Operating Procedures (SOP) and workflow blue-print.',
          'End-user training material and go-live stabilization.',
        ];
      }

      setFormData({
        title: `Commercial Proposal: ${formatCategoryTitle(inquiry.type)} for ${inquiry.company || inquiry.name}`,
        serviceCategory: inquiry.type || 'general',
        client: {
          name: inquiry.name || '',
          company: inquiry.company || '',
          email: inquiry.email || '',
          phone: inquiry.phone || '',
          designation: inquiry.designation || '',
          address: '',
        },
        clientRequirementSummary: inquiry.message || inquiry.requirement || '',
        solutionSummary: `Tailored enterprise engagement formulated by Dinesh Yadav & Company to fulfill client requirements in ${formatCategoryTitle(inquiry.type)}.`,
        scopeOfWork: defaultScope,
        deliverables: defaultDeliverables,
        resourceRequirements: defaultResourceReq || inquiry.duration || '',
        timeline: inquiry.duration || inquiry.startDate || '3 - 6 Months',
        currency: 'INR',
        currencySymbol: '₹',
        lineItems: [
          {
            description: `Professional Services: ${formatCategoryTitle(inquiry.type)}`,
            quantity: 1,
            unit: 'Month',
            unitRate: 0,
          },
        ],
        discountType: 'flat',
        discountValue: 0,
        taxLabel: 'GST',
        taxRate: 18,
        paymentTerms: '50% advance upon contract signing, 50% upon milestone deliverables completion.',
        assumptions: [
          'Client provides timely access to required systems, documentation, and key stakeholders.',
          'Any changes or additions beyond the agreed scope will follow a mutual change-request process.',
        ],
        exclusions: [
          '3rd-party software license fees and hosting cloud infrastructure costs unless explicitly contracted.',
          'End-user hardware procurement and on-premise network cabling.',
        ],
        clientResponsibilities: [
          'Designate a single authorized point of contact (SPOC) for operational reviews and approvals.',
          'Provide required test environments and timely sign-off on deliverables within 5 business days.',
        ],
        validUntil: thirtyDaysFromNow,
        closingNotes: 'Thank you for choosing Dinesh Yadav & Company. We look forward to delivering enterprise excellence for your organization.',
        internalNotes: '',
      });
    }
  }, [isOpen, initialProposal, inquiry]);

  // Live Pricing Calculations
  const calculations = useMemo(() => {
    const items = formData.lineItems || [];
    const subtotal = items.reduce((sum, item) => {
      const q = Math.max(0, Number(item.quantity) || 0);
      const r = Math.max(0, Number(item.unitRate) || 0);
      return sum + q * r;
    }, 0);

    let discountAmount = 0;
    if (formData.discountType === 'percentage') {
      const pct = Math.min(100, Math.max(0, Number(formData.discountValue) || 0));
      discountAmount = Math.round(((subtotal * pct) / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(subtotal, Math.max(0, Number(formData.discountValue) || 0));
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxRate = Math.max(0, Number(formData.taxRate) || 0);
    const taxAmount = Math.round(((taxableAmount * taxRate) / 100) * 100) / 100;
    const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

    const hasZeroRate = items.some((item) => Number(item.unitRate) <= 0);

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      grandTotal,
      hasZeroRate,
    };
  }, [formData.lineItems, formData.discountType, formData.discountValue, formData.taxRate]);

  if (!isOpen) return null;

  // Handlers for dynamic list fields
  const handleStringArrayChange = (field, index, value) => {
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const addStringArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeStringArrayItem = (field, index) => {
    if (formData[field].length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Line item handlers
  const handleLineItemChange = (index, key, value) => {
    setFormData((prev) => {
      const updated = [...prev.lineItems];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, lineItems: updated };
    });
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { description: '', quantity: 1, unit: 'Month', unitRate: 0 },
      ],
    }));
  };

  const removeLineItem = (index) => {
    if (formData.lineItems.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const handleCurrencyChange = (e) => {
    const selected = CURRENCY_OPTIONS.find((c) => c.code === e.target.value);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        currency: selected.code,
        currencySymbol: selected.symbol,
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic Validations
    if (!formData.title.trim()) {
      setError('Proposal title is required.');
      return;
    }

    if (!formData.validUntil) {
      setError('Proposal validity date is required.');
      return;
    }

    const cleanedLineItems = formData.lineItems
      .filter((li) => li.description.trim())
      .map((li) => ({
        description: li.description.trim(),
        quantity: Math.max(0.01, Number(li.quantity) || 1),
        unit: li.unit || 'Unit',
        unitRate: Math.max(0, Number(li.unitRate) || 0),
        total: Math.round((Number(li.quantity) || 1) * (Number(li.unitRate) || 0) * 100) / 100,
      }));

    if (cleanedLineItems.length === 0) {
      setError('At least one commercial line item with a description is required.');
      return;
    }

    const payload = {
      ...formData,
      inquiryId: inquiry._id,
      lineItems: cleanedLineItems,
      scopeOfWork: formData.scopeOfWork.filter((s) => s.trim()),
      deliverables: formData.deliverables.filter((d) => d.trim()),
      assumptions: formData.assumptions.filter((a) => a.trim()),
      exclusions: formData.exclusions.filter((e) => e.trim()),
      clientResponsibilities: formData.clientResponsibilities.filter((r) => r.trim()),
    };

    setSaving(true);
    try {
      let savedResult;
      if (isEditing) {
        savedResult = await updateProposal(initialProposal._id, payload);
      } else {
        savedResult = await createProposal(payload);
      }

      if (onSaved) {
        onSaved(savedResult);
      }
      onClose();
    } catch (err) {
      console.error('Save proposal failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save proposal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#172033]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                <FiFileText className="w-3 h-3" />
                {isEditing ? `Edit Proposal Draft (${initialProposal.proposalNumber})` : 'New Proposal Generator'}
              </span>
              <span className="text-xs text-slate-500">
                Source Enquiry: <strong className="text-slate-800">{inquiry.enquiryNumber || `#${inquiry._id.slice(-6)}`}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {isEditing ? initialProposal.title : `Create Proposal for ${inquiry.company || inquiry.name}`}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-4 bg-white shrink-0 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'scope', label: '1. Scope & Solution', icon: FiLayers },
            { id: 'pricing', label: `2. Commercial Pricing (${formData.currencySymbol}${calculations.grandTotal.toLocaleString()})`, icon: FiDollarSign },
            { id: 'terms', label: '3. Schedule & Governance Terms', icon: FiShield },
            { id: 'client', label: '4. Recipient Details & Notes', icon: FiFileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-2 border-b-2 font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Global Notice / Warnings */}
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
              ⚠️ {error}
            </div>
          )}

          {calculations.hasZeroRate && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2">
              <FiAlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                One or more commercial line items have a zero rate (₹0). Please verify final commercials before publishing.
              </span>
            </div>
          )}

          {/* TAB 1: SCOPE & SOLUTION */}
          {activeTab === 'scope' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Proposal Document Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                    placeholder="e.g. Commercial Proposal: SAP S/4HANA Implementation"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Service Category
                  </label>
                  <select
                    value={formData.serviceCategory}
                    onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none"
                  >
                    <option value="staffing-request">Manpower & Staffing</option>
                    <option value="sap-resource-request">SAP Resources</option>
                    <option value="sap-support">SAP Support & Maintenance</option>
                    <option value="erp-inquiry">ERP Solutions</option>
                    <option value="general">General Business Advisory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Executive / Solution Summary
                </label>
                <textarea
                  rows="3"
                  value={formData.solutionSummary}
                  onChange={(e) => setFormData({ ...formData, solutionSummary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                  placeholder="Outline DYC's proposed delivery approach, value proposition, and alignment with client needs..."
                ></textarea>
              </div>

              {/* Scope of Work Bullets */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Detailed Scope of Work (Bullets)
                  </span>
                  <button
                    type="button"
                    onClick={() => addStringArrayItem('scopeOfWork')}
                    className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-1"
                  >
                    <FiPlus className="w-3.5 h-3.5" /> Add Scope Item
                  </button>
                </div>

                {formData.scopeOfWork.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-xs w-5">{idx + 1}.</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleStringArrayChange('scopeOfWork', idx, e.target.value)}
                      placeholder="e.g. Conduct end-to-end blueprint workshops..."
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-md outline-none focus:border-emerald-500"
                    />
                    {formData.scopeOfWork.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStringArrayItem('scopeOfWork', idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Proposed Deliverables */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Key Deliverables & Milestones
                  </span>
                  <button
                    type="button"
                    onClick={() => addStringArrayItem('deliverables')}
                    className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-1"
                  >
                    <FiPlus className="w-3.5 h-3.5" /> Add Deliverable
                  </button>
                </div>

                {formData.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-xs w-5">{idx + 1}.</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleStringArrayChange('deliverables', idx, e.target.value)}
                      placeholder="e.g. Completed Business Blueprint Document (BPD)..."
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-md outline-none focus:border-emerald-500"
                    />
                    {formData.deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStringArrayItem('deliverables', idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: COMMERCIAL PRICING & LINE ITEMS */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              {/* Currency & Tax Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={handleCurrencyChange}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md font-semibold text-slate-900"
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tax Label</label>
                  <input
                    type="text"
                    value={formData.taxLabel}
                    onChange={(e) => setFormData({ ...formData, taxLabel: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md"
                    placeholder="e.g. GST / VAT"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md"
                    placeholder="18"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Proposal Validity Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md font-medium"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-100 flex items-center justify-between border-b border-slate-200">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Commercial Line Items
                  </span>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md flex items-center gap-1 transition"
                  >
                    <FiPlus className="w-3.5 h-3.5" /> Add Line Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                        <th className="py-2.5 px-3 w-8">#</th>
                        <th className="py-2.5 px-3 min-w-[240px]">Description & Scope Deliverable</th>
                        <th className="py-2.5 px-3 w-20">Qty</th>
                        <th className="py-2.5 px-3 w-32">Unit Type</th>
                        <th className="py-2.5 px-3 w-36">Unit Rate ({formData.currencySymbol})</th>
                        <th className="py-2.5 px-3 w-32 text-right">Total</th>
                        <th className="py-2.5 px-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.lineItems.map((item, idx) => {
                        const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitRate) || 0);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                required
                                value={item.description}
                                onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                                placeholder="Service description..."
                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded outline-none focus:border-emerald-500 text-xs"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min="0.01"
                                step="any"
                                value={item.quantity}
                                onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded outline-none text-xs"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <select
                                value={item.unit}
                                onChange={(e) => handleLineItemChange(idx, 'unit', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded outline-none text-xs"
                              >
                                {UNIT_OPTIONS.map((u) => (
                                  <option key={u} value={u}>
                                    {u}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={item.unitRate}
                                onChange={(e) => handleLineItemChange(idx, 'unitRate', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded outline-none text-xs font-semibold text-slate-900"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                              {formData.currencySymbol}
                              {lineTotal.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {formData.lineItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeLineItem(idx)}
                                  className="text-slate-400 hover:text-red-500 p-1"
                                >
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Commercial Summary Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Discount Setup */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                    Commercial Concessions / Discount
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 text-[11px] mb-1">Discount Mode</label>
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      >
                        <option value="flat">Flat Amount ({formData.currencySymbol})</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 text-[11px] mb-1">Discount Value</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation Totals */}
                <div className="p-5 rounded-xl bg-[#0B1528] text-white space-y-2.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal:</span>
                    <span className="font-mono">
                      {formData.currencySymbol}
                      {calculations.subtotal.toLocaleString()}
                    </span>
                  </div>

                  {calculations.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount:</span>
                      <span className="font-mono">
                        - {formData.currencySymbol}
                        {calculations.discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-300">
                    <span>
                      {formData.taxLabel} ({formData.taxRate}%):
                    </span>
                    <span className="font-mono">
                      + {formData.currencySymbol}
                      {calculations.taxAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-sm text-white">Grand Total:</span>
                    <span className="font-extrabold text-xl text-emerald-400 font-mono">
                      {formData.currencySymbol}
                      {calculations.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEDULE & GOVERNANCE TERMS */}
          {activeTab === 'terms' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Proposed Timeline / Duration
                  </label>
                  <input
                    type="text"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    placeholder="e.g. 6 Months (Commencing 1st of next month)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Resource Requirements & Allocation
                  </label>
                  <input
                    type="text"
                    value={formData.resourceRequirements}
                    onChange={(e) => setFormData({ ...formData, resourceRequirements: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    placeholder="e.g. 1 Lead Consultant, 2 Technical Consultants"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Milestones & Commercial Terms
                </label>
                <textarea
                  rows="2"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                ></textarea>
              </div>

              {/* Assumptions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Key Project Assumptions
                    </span>
                    <button
                      type="button"
                      onClick={() => addStringArrayItem('assumptions')}
                      className="text-emerald-700 hover:text-emerald-800 font-bold text-xs"
                    >
                      + Add
                    </button>
                  </div>
                  {formData.assumptions.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleStringArrayChange('assumptions', idx, e.target.value)}
                        className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                      {formData.assumptions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStringArrayItem('assumptions', idx)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Scope Exclusions
                    </span>
                    <button
                      type="button"
                      onClick={() => addStringArrayItem('exclusions')}
                      className="text-emerald-700 hover:text-emerald-800 font-bold text-xs"
                    >
                      + Add
                    </button>
                  </div>
                  {formData.exclusions.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleStringArrayChange('exclusions', idx, e.target.value)}
                        className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                      {formData.exclusions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStringArrayItem('exclusions', idx)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLIENT DETAILS & INTERNAL NOTES */}
          {activeTab === 'client' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-3">
                  Recipient Information Snapshot (Shown on Proposal Cover & Header)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={formData.client.name}
                      onChange={(e) =>
                        setFormData({ ...formData, client: { ...formData.client, name: e.target.value } })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={formData.client.company}
                      onChange={(e) =>
                        setFormData({ ...formData, client: { ...formData.client, company: e.target.value } })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.client.email}
                      onChange={(e) =>
                        setFormData({ ...formData, client: { ...formData.client, email: e.target.value } })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.client.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, client: { ...formData.client, phone: e.target.value } })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Closing Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Client-Facing Closing Statement
                </label>
                <textarea
                  rows="2"
                  value={formData.closingNotes}
                  onChange={(e) => setFormData({ ...formData, closingNotes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                ></textarea>
              </div>

              {/* Internal Admin Notes */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
                <div className="flex items-center gap-2 mb-1.5">
                  <FiShield className="w-4 h-4 text-amber-700" />
                  <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
                    Internal Administrative Notes (Private)
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 mb-2">
                  🔒 Strictly confidential. These notes are visible only to DYC staff in this dashboard and are NEVER printed on the client-facing proposal PDF.
                </p>
                <textarea
                  rows="3"
                  value={formData.internalNotes}
                  onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                  placeholder="Record internal margin targets, partner sub-contracting details, or negotiating room..."
                  className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-lg text-slate-900 outline-none"
                ></textarea>
              </div>
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50 -mx-6 -mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-500">
              Grand Total: <strong className="text-slate-900 text-sm font-mono">{formData.currencySymbol}{calculations.grandTotal.toLocaleString()}</strong>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-semibold text-slate-700 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-initial px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Saving Proposal...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    {isEditing ? 'Save Changes' : 'Save Proposal Draft'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const formatCategoryTitle = (cat) => {
  switch (cat) {
    case 'staffing-request':
      return 'Manpower & Staffing';
    case 'sap-resource-request':
      return 'SAP Resources';
    case 'sap-support':
      return 'SAP Support & Maintenance';
    case 'erp-inquiry':
      return 'ERP Solutions';
    default:
      return 'Corporate Advisory';
  }
};

export default ProposalEditorModal;
