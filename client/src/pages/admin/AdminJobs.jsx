import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBriefcase,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiMapPin,
  FiDollarSign,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiExternalLink,
} from 'react-icons/fi';
import { getAdminJobs, createJob, updateJob, deleteJob } from '../../services/api';

const departmentsList = [
  'SAP & ERP',
  'Manufacturing & Production',
  'Engineering & Technical',
  'Logistics & Supply Chain',
  'Information Technology',
  'Finance & Accounting',
  'Operations & Facility',
  'General Staffing',
];

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successBanner, setSuccessBanner] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    department: 'SAP & ERP',
    location: 'Gurugram, Haryana',
    workplaceType: 'On-site',
    type: 'full-time',
    experience: '2-5 years',
    openings: 1,
    salaryRange: 'Competitive / As per industry standard',
    skills: '',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    urgent: false,
    status: 'published',
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const res = await getAdminJobs(params);
      setJobs(res?.jobs || []);
    } catch (err) {
      console.error('Failed to load admin jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      department: 'SAP & ERP',
      location: 'Gurugram, Haryana',
      workplaceType: 'On-site',
      type: 'full-time',
      experience: '2-5 years',
      openings: 1,
      salaryRange: 'Competitive / As per industry standard',
      skills: '',
      description: '',
      responsibilities: '',
      requirements: '',
      benefits: '',
      urgent: false,
      status: 'published',
    });
    setErrorMsg('');
    setJobModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      department: job.department || 'General Staffing',
      location: job.location || '',
      workplaceType: job.workplaceType || 'On-site',
      type: job.type || 'full-time',
      experience: job.experience || '',
      openings: job.openings || 1,
      salaryRange: job.salaryRange || '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
      description: job.description || '',
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
      benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : '',
      urgent: Boolean(job.urgent),
      status: job.status || 'published',
    });
    setErrorMsg('');
    setJobModalOpen(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setErrorMsg('Please enter both job title and description');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');

      let result;
      if (editingJob) {
        result = await updateJob(editingJob._id, formData);
        setSuccessBanner({
          title: formData.title,
          slug: result?.data?.slug || editingJob.slug,
          message: 'Job posting updated successfully and refreshed on live website!',
        });
      } else {
        result = await createJob(formData);
        setSuccessBanner({
          title: formData.title,
          slug: result?.data?.slug || '',
          message: 'New job opening created and published! It is now live on the public Careers page.',
        });
      }

      setJobModalOpen(false);
      fetchJobs();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to save job requisition');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (window.confirm(`Are you sure you want to remove "${jobTitle}"? It will no longer appear on the live website.`)) {
      try {
        await deleteJob(jobId);
        fetchJobs();
      } catch (err) {
        alert(err?.response?.data?.message || 'Failed to delete job');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#252720]">
            Job Requisitions & Public Openings
          </h1>
          <p className="text-xs sm:text-sm text-[#66665D] mt-0.5">
            Create and publish jobs here. Any job marked as "Published" appears immediately on the public website for candidates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchJobs}
            className="p-2 rounded-xl border border-[#E7E0D3] bg-white text-[#252720] hover:bg-[#F8F5EE] transition cursor-pointer"
            title="Refresh"
          >
            <FiRefreshCw className="text-sm" />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-[#174B39] hover:bg-[#103728] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <FiPlus className="text-sm" />
            <span>+ Post New Job Opening</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="bg-[#EAF0E8] border border-[#174B39]/20 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#174B39] text-white flex items-center justify-center shrink-0">
              <FiCheckCircle className="text-base" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#174B39]">{successBanner.message}</p>
              <p className="text-[11px] text-[#252720]">Position: <strong>{successBanner.title}</strong></p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {successBanner.slug && (
              <Link
                to={`/careers/${successBanner.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 bg-white border border-[#174B39]/30 text-[#174B39] px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#174B39] hover:text-white transition"
              >
                <span>View on Live Website</span>
                <FiExternalLink className="text-xs" />
              </Link>
            )}
            <button
              onClick={() => setSuccessBanner(null)}
              className="p-1 rounded text-[#66665D] hover:text-[#252720]"
            >
              <FiX className="text-sm" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Strip */}
      <div className="bg-white rounded-2xl border border-[#E7E0D3] p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-3 text-[#8A897C] text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            placeholder="Search job title, skills, location..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'published', 'draft', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#174B39] text-white'
                  : 'bg-[#F8F5EE] text-[#66665D] hover:bg-[#EAF0E8]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table & Empty State */}
      <div className="bg-white rounded-3xl border border-[#E7E0D3] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#66665D]">Loading job requisitions...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 sm:p-16 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#EAF0E8] text-[#174B39] flex items-center justify-center mx-auto mb-4 border border-[#174B39]/20 shadow-xs">
              <FiBriefcase className="text-2xl" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#252720]">No Job Postings Yet</h3>
            <p className="text-xs sm:text-sm text-[#66665D] mt-2 mb-6 leading-relaxed">
              All dummy jobs have been removed. Click below to post a real job requisition. As soon as you save it, it will immediately be visible on the public website for candidates to apply!
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 bg-[#174B39] hover:bg-[#103728] text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
            >
              <FiPlus className="text-sm" />
              <span>+ Post Your First Job Opening</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F5EE] border-b border-[#E7E0D3] text-[#8A897C] uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-5">Position Title</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-3">Applicants</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E0D3]/60">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-[#FDFBF7] transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        {job.urgent && (
                          <span className="w-2 h-2 rounded-full bg-[#DC2626]" title="Urgent" />
                        )}
                        <div>
                          <span className="font-bold text-[#252720] text-sm block">
                            {job.title}
                          </span>
                          <span className="text-[11px] text-[#66665D]">
                            {job.salaryRange} · {job.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#252720] font-medium">{job.department}</td>
                    <td className="py-4 px-4 text-[#66665D]">{job.location}</td>
                    <td className="py-4 px-3">
                      <Link
                        to={`/admin/candidates?jobId=${job._id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF0E8] text-[#174B39] font-bold text-xs hover:bg-[#174B39] hover:text-white transition"
                      >
                        <FiUsers className="text-xs" />
                        <span>{job.applicationsCount || 0}</span>
                      </Link>
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          job.status === 'published'
                            ? 'bg-[#EAF0E8] text-[#174B39]'
                            : job.status === 'draft'
                            ? 'bg-[#FEF9E7] text-[#B7950B]'
                            : 'bg-[#FDEDEC] text-[#C0392B]'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/careers/${job.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-[#66665D] hover:text-[#174B39] hover:bg-[#F8F5EE] transition"
                          title="Preview on Public Website"
                        >
                          <FiEye className="text-sm" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(job)}
                          className="p-1.5 rounded-lg text-[#66665D] hover:text-[#B88A3B] hover:bg-[#F8F5EE] transition cursor-pointer"
                          title="Edit"
                        >
                          <FiEdit2 className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job._id, job.title)}
                          className="p-1.5 rounded-lg text-[#66665D] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition cursor-pointer"
                          title="Delete"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Job */}
      {jobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252720]/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E7E0D3] shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-8 relative">
            <button
              onClick={() => setJobModalOpen(false)}
              className="absolute top-5 right-5 text-[#8A897C] hover:text-[#252720]"
            >
              <FiX className="text-xl" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B88A3B] block">
                Job Requisition Editor
              </span>
              <h2 className="text-xl font-serif font-bold text-[#252720] mt-0.5">
                {editingJob ? 'Edit Job Opening' : 'Post New Job Opening'}
              </h2>
              <p className="text-xs text-[#66665D] mt-0.5">
                Jobs set to "Published" will immediately show on the live Careers page.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-xs text-[#DC2626]">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveJob} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior SAP FICO Consultant"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                  >
                    {departmentsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Gurugram, Haryana"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1">Workplace</label>
                  <select
                    value={formData.workplaceType}
                    onChange={(e) => setFormData({ ...formData, workplaceType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1">Job Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="contract">Contract</option>
                    <option value="part-time">Part Time</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1">
                    Experience Required
                  </label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g. 3-5 years"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1">Openings</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.openings}
                    onChange={(e) =>
                      setFormData({ ...formData, openings: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    placeholder="e.g. ₹8,00,000 - ₹14,00,000"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252720] mb-1">
                  Required Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. SAP FICO, S/4HANA, GL, AP, Asset Accounting"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252720] mb-1">
                  Job Description / Role Overview *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide an overview of the role, team, and day-to-day expectations..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1">
                    Responsibilities (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    placeholder="Lead SAP financial configurations&#10;Coordinate with client finance stakeholders&#10;Handle month-end close support"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1">
                    Requirements (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="B.Com / CA / MBA Finance&#10;3+ years S/4HANA implementation experience&#10;Strong communication skills"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#252720] mb-1">
                  Benefits & Perks (one per line)
                </label>
                <textarea
                  rows={2}
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="Medical insurance coverage&#10;Annual performance bonus&#10;Paid certifications"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#252720]">
                    <input
                      type="checkbox"
                      checked={formData.urgent}
                      onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                      className="rounded text-[#174B39]"
                    />
                    <span>Urgent Hiring</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#66665D]">Status:</span>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="px-3 py-1.5 rounded-xl bg-[#F8F5EE] border border-[#E7E0D3] text-xs font-bold text-[#174B39]"
                    >
                      <option value="published">Published (Visible Publicly)</option>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setJobModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#66665D] hover:bg-[#F8F5EE]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#174B39] hover:bg-[#103728] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {saving ? 'Publishing...' : 'Publish to Website'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
