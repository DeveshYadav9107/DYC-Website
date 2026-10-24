import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import siteConfig from '../../config/siteConfig';
import { submitInquiry } from '../../services/api';
import Reveal from '../../components/animations/Reveal';

const ENQUIRY_CATEGORIES = [
  {
    id: 'staffing-request',
    title: 'Manpower & Staffing',
    subtitle: 'Industrial, Technical & Enterprise Talent',
    icon: '👥',
    badge: 'Workforce Solutions',
    description: 'Permanent, contract, and project-based industrial, engineering, and enterprise staffing.',
  },
  {
    id: 'sap-resource-request',
    title: 'SAP Resources',
    subtitle: 'Functional & Technical Consultants',
    icon: '⚡',
    badge: 'Consultant Deployment',
    description: 'Certified SAP consultants across S/4HANA, ECC, FICO, MM, SD, ABAP, and Basis.',
  },
  {
    id: 'sap-support',
    title: 'SAP Support & Maintenance',
    subtitle: 'AMS, SLA & Incident Resolution',
    icon: '🛠️',
    badge: 'Enterprise AMS',
    description: 'Application management support, troubleshooting, system enhancements, and 24/7 coverage.',
  },
  {
    id: 'erp-inquiry',
    title: 'ERP Solutions',
    subtitle: 'Advisory, Implementation & Transformation',
    icon: '📊',
    badge: 'Digital Enterprise',
    description: 'End-to-end ERP implementation, business process engineering, and modern cloud migration.',
  },
  {
    id: 'general',
    title: 'General Business Enquiry',
    subtitle: 'Corporate Advisory & General Inquiries',
    icon: '💬',
    badge: 'Corporate',
    description: 'General questions, partnership inquiries, or custom consulting requirements.',
  },
];

const ContactPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('type') || searchParams.get('category') || 'staffing-request';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Sync state if URL search query changes
  useEffect(() => {
    const queryType = searchParams.get('type') || searchParams.get('category');
    if (queryType && ENQUIRY_CATEGORIES.some((c) => c.id === queryType)) {
      setSelectedCategory(queryType);
    }
  }, [searchParams]);

  // Form State
  const [formData, setFormData] = useState({
    // Shared Client Information
    name: '',
    email: '',
    phone: '',
    company: '',
    designation: '',
    subject: '',
    message: '',

    // Manpower & Staffing
    staffingPositions: [
      { roleTitle: '', count: 1, skillLevel: 'Skilled', employmentType: 'Contract' },
    ],
    workLocation: '',
    deploymentPreference: 'Onsite',
    startDate: '',
    duration: '',
    budgetRange: '',

    // SAP Resources
    sapRole: '',
    sapModule: 'FICO',
    sapResourceCategory: 'Functional Consultant',
    experienceLevel: '5-8 Years',
    numberOfConsultants: 1,
    sapEnvironment: 'S/4HANA On-Premise',

    // SAP Support & Maintenance
    supportType: 'Application Management Support (AMS)',
    supportCoverage: 'Standard Business Hours (8x5)',
    businessImpact: 'Medium - Operational impact',
    priority: 'normal',
    issueScope: '',

    // ERP Solutions
    industry: 'Manufacturing',
    currentSoftware: 'Tally / Legacy Accounting',
    departmentsInvolved: ['Finance & Accounting', 'Supply Chain / Inventory'],
    userSize: '25-100 Users',
    desiredFunctionality: '',
    integrationNeeds: '',
    businessObjectives: '',
  });

  const [submissionResult, setSubmissionResult] = useState({
    loading: false,
    success: false,
    enquiryNumber: '',
    error: '',
  });

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchParams({ type: categoryId });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Multi-role helpers for staffing
  const handlePositionChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.staffingPositions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, staffingPositions: updated };
    });
  };

  const addPositionRow = () => {
    setFormData((prev) => ({
      ...prev,
      staffingPositions: [
        ...prev.staffingPositions,
        { roleTitle: '', count: 1, skillLevel: 'Skilled', employmentType: 'Contract' },
      ],
    }));
  };

  const removePositionRow = (index) => {
    if (formData.staffingPositions.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      staffingPositions: prev.staffingPositions.filter((_, i) => i !== index),
    }));
  };

  // Multi-department toggle for ERP
  const handleDepartmentToggle = (dept) => {
    setFormData((prev) => {
      const exists = prev.departmentsInvolved.includes(dept);
      const nextDepts = exists
        ? prev.departmentsInvolved.filter((d) => d !== dept)
        : [...prev.departmentsInvolved, dept];
      return { ...prev, departmentsInvolved: nextDepts };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionResult({ loading: true, success: false, enquiryNumber: '', error: '' });

    try {
      // Build structured payload according to active category
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        designation: formData.designation.trim(),
        type: selectedCategory,
        subject: formData.subject.trim() || `${ENQUIRY_CATEGORIES.find((c) => c.id === selectedCategory)?.title} Request`,
        message: formData.message.trim(),
      };

      if (selectedCategory === 'staffing-request') {
        payload.staffingPositions = formData.staffingPositions.filter((p) => p.roleTitle.trim());
        payload.workLocation = formData.workLocation;
        payload.deploymentPreference = formData.deploymentPreference;
        payload.startDate = formData.startDate;
        payload.duration = formData.duration;
        payload.budgetRange = formData.budgetRange;
        payload.structuredRequirements = {
          roles: payload.staffingPositions,
          workLocation: formData.workLocation,
          deploymentPreference: formData.deploymentPreference,
          startDate: formData.startDate,
          duration: formData.duration,
          budgetRange: formData.budgetRange,
        };
      } else if (selectedCategory === 'sap-resource-request') {
        payload.sapRole = formData.sapRole;
        payload.sapModule = formData.sapModule;
        payload.sapResourceCategory = formData.sapResourceCategory;
        payload.experienceLevel = formData.experienceLevel;
        payload.numberOfConsultants = Number(formData.numberOfConsultants) || 1;
        payload.sapEnvironment = formData.sapEnvironment;
        payload.deploymentPreference = formData.deploymentPreference;
        payload.startDate = formData.startDate;
        payload.duration = formData.duration;
        payload.structuredRequirements = {
          sapRole: formData.sapRole,
          sapModule: formData.sapModule,
          sapResourceCategory: formData.sapResourceCategory,
          experienceLevel: formData.experienceLevel,
          numberOfConsultants: payload.numberOfConsultants,
          sapEnvironment: formData.sapEnvironment,
          deploymentPreference: formData.deploymentPreference,
          startDate: formData.startDate,
          duration: formData.duration,
        };
      } else if (selectedCategory === 'sap-support') {
        payload.sapEnvironment = formData.sapEnvironment;
        payload.sapModule = formData.sapModule;
        payload.supportType = formData.supportType;
        payload.supportCoverage = formData.supportCoverage;
        payload.businessImpact = formData.businessImpact;
        payload.priority = formData.priority;
        payload.issueScope = formData.issueScope;
        payload.startDate = formData.startDate;
        payload.structuredRequirements = {
          sapEnvironment: formData.sapEnvironment,
          sapModule: formData.sapModule,
          supportType: formData.supportType,
          supportCoverage: formData.supportCoverage,
          businessImpact: formData.businessImpact,
          priority: formData.priority,
          issueScope: formData.issueScope,
          startDate: formData.startDate,
        };
      } else if (selectedCategory === 'erp-inquiry') {
        payload.industry = formData.industry;
        payload.currentSoftware = formData.currentSoftware;
        payload.departmentsInvolved = formData.departmentsInvolved;
        payload.userSize = formData.userSize;
        payload.desiredFunctionality = formData.desiredFunctionality;
        payload.integrationNeeds = formData.integrationNeeds;
        payload.businessObjectives = formData.businessObjectives;
        payload.startDate = formData.startDate;
        payload.structuredRequirements = {
          industry: formData.industry,
          currentSoftware: formData.currentSoftware,
          departmentsInvolved: formData.departmentsInvolved,
          userSize: formData.userSize,
          desiredFunctionality: formData.desiredFunctionality,
          integrationNeeds: formData.integrationNeeds,
          businessObjectives: formData.businessObjectives,
          startDate: formData.startDate,
        };
      }

      const res = await submitInquiry(payload);
      const enqNumber = res?.data?.enquiryNumber || 'DYC-ENQ';

      setSubmissionResult({
        loading: false,
        success: true,
        enquiryNumber: enqNumber,
        error: '',
      });

      // Scroll to confirmation view smoothly
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err) {
      console.error('Enquiry submission error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to submit enquiry. Please verify details and try again.';
      setSubmissionResult({
        loading: false,
        success: false,
        enquiryNumber: '',
        error: msg,
      });
    }
  };

  const handleReset = () => {
    setSubmissionResult({ loading: false, success: false, enquiryNumber: '', error: '' });
    setFormData((prev) => ({
      ...prev,
      subject: '',
      message: '',
      workLocation: '',
      startDate: '',
      duration: '',
      budgetRange: '',
    }));
  };

  const currentCategoryObj = ENQUIRY_CATEGORIES.find((c) => c.id === selectedCategory) || ENQUIRY_CATEGORIES[0];

  return (
    <div className="bg-[#F8F5EE] min-h-screen text-[#252720]">
      {/* Header Banner */}
      <div className="bg-[#F8F5EE] text-[#252720] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-[#E7E0D3]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <img
            src="/images/contact-banner.png"
            alt="Contact Us Banner"
            className="w-full h-full object-cover object-right md:object-center"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 pt-4">
          <Reveal>
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-[#EAF0E8] text-[#174B39] border border-[#174B39]/20 mb-4 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#B88A3B]"></span>
                Enterprise Intake & Proposal Desk
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#252720] tracking-tight mb-4">
                Discuss Your <span className="text-[#174B39] italic">Requirements</span>
              </h1>
              <p className="text-base sm:text-lg text-[#66665D] leading-relaxed font-sans">
                Submit your business requirements to DY&C. Our functional leads and technical specialists will review your intake and formulate a tailored service proposal.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Category Selector Grid */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#B88A3B]">Step 1</span>
              <h2 className="text-2xl font-serif font-bold text-[#252720] tracking-tight">Select Requirement Category</h2>
            </div>
            <p className="text-sm text-[#66665D]">Choose the service area to tailor your submission form</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ENQUIRY_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative group cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#174B39] shadow-md ring-2 ring-[#174B39]/20'
                      : 'bg-[#FDFBF7] border-[#E7E0D3] hover:border-[#174B39]/40 hover:bg-white shadow-2xs'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#174B39] ring-4 ring-[#EAF0E8]"></span>
                  )}
                  <div>
                    <div className="text-2xl mb-2">{cat.icon}</div>
                    <span className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded inline-block mb-1 ${
                      isSelected ? 'bg-[#EAF0E8] text-[#174B39]' : 'bg-white border border-[#E7E0D3] text-[#66665D]'
                    }`}>
                      {cat.badge}
                    </span>
                    <h3 className={`font-serif font-bold text-sm ${isSelected ? 'text-[#174B39]' : 'text-[#252720]'}`}>
                      {cat.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#66665D] mt-2 line-clamp-2 leading-relaxed">
                    {cat.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid: Form + Side Office Info */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Area */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-[#E7E0D3] shadow-sm rounded-2xl p-6 md:p-10">
              {submissionResult.success ? (
                <div className="text-center py-10 px-4 animate-fadeIn">
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                    ✓
                  </div>
                  <span className="inline-block px-3 py-1 rounded-md bg-emerald-100/60 text-emerald-800 text-xs font-mono font-bold tracking-wider mb-3">
                    REF: {submissionResult.enquiryNumber}
                  </span>
                  <h3 className="text-2xl font-bold text-[#252720] mb-2">Requirement Submitted Successfully!</h3>
                  <p className="text-[#66665D] max-w-lg mx-auto text-sm leading-relaxed mb-8">
                    Thank you for reaching out to DY&C. Your intake has been registered under reference{' '}
                    <strong className="text-[#252720]">{submissionResult.enquiryNumber}</strong>. Our enterprise team will evaluate your scope and formulate a commercial proposal.
                  </p>

                  <div className="bg-slate-50 border border-[#E7E0D3] rounded-xl p-5 max-w-md mx-auto text-left text-xs text-[#66665D] space-y-2 mb-8">
                    <p className="font-semibold text-[#252720]">What happens next?</p>
                    <p>• Our senior solution consultant reviews your technical specifications.</p>
                    <p>• If additional details are required, our desk will contact you via email or phone.</p>
                    <p>• A customized proposal with milestones and pricing will be prepared.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-slate-900 text-white hover:bg-slate-800 transition"
                  >
                    Submit Another Requirement
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Category Banner Title */}
                  <div className="border-b border-[#E7E0D3]/60 pb-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Step 2</span>
                      <h2 className="text-xl font-bold text-[#252720]">
                        {currentCategoryObj.title} Request
                      </h2>
                      <p className="text-xs text-[#66665D] mt-0.5">{currentCategoryObj.description}</p>
                    </div>
                    <span className="text-3xl hidden sm:block">{currentCategoryObj.icon}</span>
                  </div>

                  {/* Section A: Shared Contact Information */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                      Client Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Rajesh Sharma"
                          className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none transition text-[#252720]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                          Business Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="rajesh@enterprise.com"
                          className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none transition text-[#252720]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none transition text-[#252720]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="e.g. Precision Manufacturing Pvt Ltd"
                          className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none transition text-[#252720]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                          Designation / Job Title (Optional)
                        </label>
                        <input
                          type="text"
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          placeholder="e.g. VP Operations / IT Director / HR Head"
                          className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none transition text-[#252720]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section B: Category-Specific Requirements */}

                  {/* 1. Manpower & Staffing */}
                  {selectedCategory === 'staffing-request' && (
                    <div className="pt-4 border-t border-[#E7E0D3]/60 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Staffing Positions & Skill Requirements
                          </h3>
                          <p className="text-xs text-[#66665D]">Specify one or multiple job roles required</p>
                        </div>
                        <button
                          type="button"
                          onClick={addPositionRow}
                          className="text-xs font-semibold text-[#174B39] hover:text-[#103728] flex items-center gap-1 bg-[#EAF0E8] hover:bg-[#EAF0E8]/80 px-3 py-1.5 rounded-lg transition font-semibold"
                        >
                          + Add Another Role
                        </button>
                      </div>

                      <div className="space-y-3">
                        {formData.staffingPositions.map((pos, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 bg-slate-50 border border-[#E7E0D3] rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                          >
                            <div className="sm:col-span-5">
                              <label className="block text-[11px] font-semibold text-[#66665D] mb-1">
                                Role / Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={pos.roleTitle}
                                onChange={(e) => handlePositionChange(idx, 'roleTitle', e.target.value)}
                                placeholder="e.g. CNC Operator / Site Supervisor"
                                className="w-full px-3 py-1.5 text-xs bg-white border border-[#E7E0D3] rounded-lg focus:border-[#174B39] outline-none text-[#252720]"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-semibold text-[#66665D] mb-1">
                                Headcount
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={pos.count}
                                onChange={(e) => handlePositionChange(idx, 'count', Number(e.target.value) || 1)}
                                className="w-full px-3 py-1.5 text-xs bg-white border border-[#E7E0D3] rounded-lg focus:border-[#174B39] outline-none text-[#252720]"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-semibold text-[#66665D] mb-1">
                                Skill Level
                              </label>
                              <select
                                value={pos.skillLevel}
                                onChange={(e) => handlePositionChange(idx, 'skillLevel', e.target.value)}
                                className="w-full px-2 py-1.5 text-xs bg-white border border-[#E7E0D3] rounded-lg focus:border-[#174B39] outline-none text-[#252720]"
                              >
                                <option value="Skilled">Skilled</option>
                                <option value="Semi-Skilled">Semi-Skilled</option>
                                <option value="Highly Skilled">Highly Skilled</option>
                                <option value="Unskilled">Unskilled</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-semibold text-[#66665D] mb-1">
                                Type
                              </label>
                              <select
                                value={pos.employmentType}
                                onChange={(e) => handlePositionChange(idx, 'employmentType', e.target.value)}
                                className="w-full px-2 py-1.5 text-xs bg-white border border-[#E7E0D3] rounded-lg focus:border-[#174B39] outline-none text-[#252720]"
                              >
                                <option value="Contract">Contract</option>
                                <option value="Permanent">Permanent</option>
                                <option value="Project-Based">Project-Based</option>
                              </select>
                            </div>
                            <div className="sm:col-span-1 text-right">
                              {formData.staffingPositions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePositionRow(idx)}
                                  className="text-slate-400 hover:text-red-500 text-sm p-1"
                                  title="Remove role"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Work Location
                          </label>
                          <input
                            type="text"
                            name="workLocation"
                            value={formData.workLocation}
                            onChange={handleChange}
                            placeholder="e.g. Manesar / Bhiwadi / Pune"
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Deployment Preference
                          </label>
                          <select
                            name="deploymentPreference"
                            value={formData.deploymentPreference}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          >
                            <option value="Onsite">Onsite (Plant / Facility)</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Remote">Remote</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Expected Start Date
                          </label>
                          <input
                            type="text"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            placeholder="e.g. Immediate / Within 15 Days"
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Contract / Project Duration
                          </label>
                          <input
                            type="text"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="e.g. 6 Months / 1 Year / Ongoing"
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Target Budget / Rate Range (Optional)
                          </label>
                          <input
                            type="text"
                            name="budgetRange"
                            value={formData.budgetRange}
                            onChange={handleChange}
                            placeholder="e.g. ₹25,000 - ₹35,000 / month per resource"
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. SAP Resources Request */}
                  {selectedCategory === 'sap-resource-request' && (
                    <div className="pt-4 border-t border-[#E7E0D3]/60 space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        SAP Consultant Profile & Module Details
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Primary SAP Module *
                          </label>
                          <select
                            name="sapModule"
                            value={formData.sapModule}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          >
                            <option value="FICO">SAP FICO (Financial & Controlling)</option>
                            <option value="MM">SAP MM (Materials Management)</option>
                            <option value="SD">SAP SD (Sales & Distribution)</option>
                            <option value="PP">SAP PP (Production Planning)</option>
                            <option value="ABAP">SAP ABAP / ABAP on HANA</option>
                            <option value="Basis">SAP Basis & Security</option>
                            <option value="QM">SAP QM (Quality Management)</option>
                            <option value="PM">SAP PM (Plant Maintenance)</option>
                            <option value="SuccessFactors">SAP SuccessFactors (HCM)</option>
                            <option value="S/4HANA Finance">S/4HANA Finance</option>
                            <option value="Other">Other Module / Specialized</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Resource Role & Specialty
                          </label>
                          <input
                            type="text"
                            name="sapRole"
                            value={formData.sapRole}
                            onChange={handleChange}
                            placeholder="e.g. Lead FICO Consultant, Senior ABAPer"
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Consultant Category
                          </label>
                          <select
                            name="sapResourceCategory"
                            value={formData.sapResourceCategory}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          >
                            <option value="Functional Consultant">Functional Consultant</option>
                            <option value="Technical Consultant">Technical Consultant (ABAP / Basis)</option>
                            <option value="Techno-Functional">Techno-Functional Consultant</option>
                            <option value="Solution Architect">Enterprise Solution Architect</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Required Experience
                          </label>
                          <select
                            name="experienceLevel"
                            value={formData.experienceLevel}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          >
                            <option value="3-5 Years">3 - 5 Years (Mid-level)</option>
                            <option value="5-8 Years">5 - 8 Years (Senior)</option>
                            <option value="8-12 Years">8 - 12 Years (Lead Consultant)</option>
                            <option value="12+ Years">12+ Years (Principal / SME)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            SAP System Environment
                          </label>
                          <select
                            name="sapEnvironment"
                            value={formData.sapEnvironment}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          >
                            <option value="S/4HANA On-Premise">S/4HANA On-Premise</option>
                            <option value="S/4HANA Cloud (Public/Private)">S/4HANA Cloud (Public/Private)</option>
                            <option value="SAP ECC 6.0 (EHP 7/8)">SAP ECC 6.0 (EHP 7/8)</option>
                            <option value="Hybrid / Mixed">Hybrid / Multi-System</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Number of Consultants Required
                          </label>
                          <input
                            type="number"
                            min="1"
                            name="numberOfConsultants"
                            value={formData.numberOfConsultants}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Deployment Mode
                          </label>
                          <select
                            name="deploymentPreference"
                            value={formData.deploymentPreference}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          >
                            <option value="Onsite">Client Onsite</option>
                            <option value="Hybrid">Hybrid Delivery</option>
                            <option value="Remote">100% Remote</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Expected Start Date
                          </label>
                          <input
                            type="text"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            placeholder="e.g. Immediate / Next Month"
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Engagement Duration
                          </label>
                          <input
                            type="text"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="e.g. 3 Months / 6 Months"
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. SAP Support & Maintenance */}
                  {selectedCategory === 'sap-support' && (
                    <div className="pt-4 border-t border-[#E7E0D3]/60 space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        SAP Support Scope & SLA Expectations
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Type of Requirement *
                          </label>
                          <select
                            name="supportType"
                            value={formData.supportType}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          >
                            <option value="Application Management Support (AMS)">Application Management Support (AMS)</option>
                            <option value="Incident & Ticket Support">Incident & Ticket Support</option>
                            <option value="System Enhancements & CRs">System Enhancements & Custom Developments</option>
                            <option value="Version Upgrade & Migration">Version Upgrade & Migration</option>
                            <option value="3rd Party Integration">3rd Party & API Integrations</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            SAP Environment & Release
                          </label>
                          <input
                            type="text"
                            name="sapEnvironment"
                            value={formData.sapEnvironment}
                            onChange={handleChange}
                            placeholder="e.g. S/4HANA 2022 / ECC 6.0 EHP8"
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Business Impact / Priority
                          </label>
                          <select
                            name="businessImpact"
                            value={formData.businessImpact}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          >
                            <option value="Low - Informational">Low — Non-urgent inquiry / optimization</option>
                            <option value="Medium - Operational impact">Medium — Normal operational impact</option>
                            <option value="High - Critical business process affected">High — Critical business workflow impaired</option>
                            <option value="Critical - Production outage">Critical — Severe production bottleneck</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Support Window / SLA Coverage
                          </label>
                          <select
                            name="supportCoverage"
                            value={formData.supportCoverage}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          >
                            <option value="Standard Business Hours (8x5)">Standard Business Hours (8x5)</option>
                            <option value="Extended Coverage (16x5)">Extended Coverage (16x5)</option>
                            <option value="24x7 Mission Critical">24/7 Mission Critical Coverage</option>
                            <option value="On-demand Bucket of Hours">On-demand Hours Bucket</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                          Active SAP Modules Needing Support
                        </label>
                        <input
                          type="text"
                          name="sapModule"
                          value={formData.sapModule}
                          onChange={handleChange}
                          placeholder="e.g. FICO, SD, MM, PP, Basis"
                          className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. ERP Solutions */}
                  {selectedCategory === 'erp-inquiry' && (
                    <div className="pt-4 border-t border-[#E7E0D3]/60 space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Enterprise Landscape & Business Scope
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Industry Vertical
                          </label>
                          <select
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          >
                            <option value="Manufacturing">Manufacturing & Engineering</option>
                            <option value="Automotive">Automotive & Components</option>
                            <option value="Pharmaceuticals">Pharmaceuticals & Healthcare</option>
                            <option value="FMCG">FMCG & Consumer Goods</option>
                            <option value="Chemicals">Chemicals & Process</option>
                            <option value="Construction">EPC, Construction & Real Estate</option>
                            <option value="Logistics">Logistics & Supply Chain</option>
                            <option value="Retail">Retail & Wholesale Distribution</option>
                            <option value="Other">Other Sector</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Current Software / Accounting System
                          </label>
                          <input
                            type="text"
                            name="currentSoftware"
                            value={formData.currentSoftware}
                            onChange={handleChange}
                            placeholder="e.g. Tally Prime / Busy / Excel / Legacy ERP"
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-[#252720] mb-2">
                            Departments / Business Functions in Scope
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              'Finance & Accounting',
                              'Supply Chain / Inventory',
                              'Sales & CRM',
                              'Production & Shop Floor',
                              'Procurement / Purchasing',
                              'HR & Payroll',
                            ].map((dept) => {
                              const checked = formData.departmentsInvolved.includes(dept);
                              return (
                                <button
                                  key={dept}
                                  type="button"
                                  onClick={() => handleDepartmentToggle(dept)}
                                  className={`px-3 py-2 text-xs rounded-lg border text-left flex items-center gap-2 transition ${
                                    checked
                                      ? 'bg-[#EAF0E8] border-[#174B39]/40 text-[#174B39] font-medium'
                                      : 'bg-white border-[#E7E0D3] text-[#66665D] hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{checked ? '☑' : '☐'}</span>
                                  <span>{dept}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Estimated System Users
                          </label>
                          <select
                            name="userSize"
                            value={formData.userSize}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          >
                            <option value="< 15 Users">Under 15 Named Users</option>
                            <option value="15-50 Users">15 - 50 Users</option>
                            <option value="50-150 Users">50 - 150 Users</option>
                            <option value="150+ Enterprise Users">150+ Enterprise Users</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                            Target Implementation Horizon
                          </label>
                          <input
                            type="text"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            placeholder="e.g. Q3 2026 / Next 6 Months"
                            className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section C: Detailed Requirements & Message */}
                  <div className="pt-4 border-t border-[#E7E0D3]/60">
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                        Subject / Brief Title (Optional)
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder={`e.g. ${currentCategoryObj.title} for ${formData.company || 'Our Company'}`}
                        className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none text-[#252720]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#252720] mb-1.5">
                        Detailed Business Requirements / Scope Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows="4"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Please describe your project scope, technical expectations, or current bottlenecks so our team can prepare an accurate response."
                        className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E7E0D3] rounded-xl text-sm focus:border-[#174B39] focus:ring-2 focus:ring-[#174B39]/20 outline-none resize-y text-[#252720] placeholder-[#8A897C]"
                      ></textarea>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {submissionResult.error && (
                    <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                      ⚠️ {submissionResult.error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submissionResult.loading}
                      className="w-full py-4 px-6 rounded-full font-bold text-sm sm:text-base text-white bg-[#174B39] hover:bg-[#103728] transition-all duration-200 shadow-[0_4px_16px_rgba(23,75,57,0.25)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {submissionResult.loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Submitting Requirement Intake...
                        </>
                      ) : (
                        <>Submit Requirement for Proposal Review →</>
                      )}
                    </button>
                    <p className="text-[11px] text-slate-400 text-center mt-2">
                      🔒 Your commercial requirements are treated strictly confidential under DY&C enterprise policies.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Side: Enterprise Contact Cards */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E7E0D3] rounded-2xl p-6 shadow-[0_4px_16px_rgba(37,39,32,0.03)]">
              <h3 className="font-bold text-base text-[#252720] mb-4 flex items-center gap-2">
                <span>🏢</span> Corporate Office
              </h3>
              <div className="space-y-4 text-xs text-[#66665D]">
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 mt-0.5">📍</span>
                  <div>
                    <strong className="text-[#252720] block mb-0.5">DY&C</strong>
                    <p className="leading-relaxed">{siteConfig.contact.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 mt-0.5">📞</span>
                  <div>
                    <strong className="text-[#252720] block mb-0.5">Direct Line</strong>
                    <p>{siteConfig.contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-slate-400 mt-0.5">✉️</span>
                  <div>
                    <strong className="text-[#252720] block mb-0.5">Official Communications</strong>
                    <p>{siteConfig.contact.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#EAF0E8] text-[#252720] rounded-2xl p-6 shadow-2xs border border-[#174B39]/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#174B39] block mb-1">
                Enterprise Standards
              </span>
              <h3 className="text-base font-bold text-[#102A43] mb-2">Service Commitments</h3>
              <div className="space-y-3 text-xs text-[#66665D]">
                <div className="flex items-center gap-2">
                  <span className="text-[#174B39] font-bold">✓</span>
                  <span>Structured Proposals with transparent line items</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#174B39] font-bold">✓</span>
                  <span>Verified technical vetting for all SAP consultants</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#174B39] font-bold">✓</span>
                  <span>Statutory compliance for industrial staffing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#174B39] font-bold">✓</span>
                  <span>SLA-backed Application Management Support</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#B88A3B]/40 text-xs text-[#252720]">
              <span className="font-semibold block mb-1">Need an urgent meeting?</span>
              Reach our corporate advisory team directly at{' '}
              <a href={`mailto:${siteConfig.contact.email}`} className="font-bold underline">
                {siteConfig.contact.email}
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
