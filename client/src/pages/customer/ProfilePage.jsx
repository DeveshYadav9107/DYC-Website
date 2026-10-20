import { useState, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PublicLayout from '../../layouts/PublicLayout';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCalendar,
  FiCheckCircle,
  FiEdit3,
  FiLogOut,
  FiFileText,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(
    user?.lastName || (user?.name?.split(' ').length > 1 ? user?.name?.split(' ').slice(1).join(' ') : '')
  );
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const firstNameId = useId();
  const lastNameId = useId();
  const phoneId = useId();

  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : (user?.name?.slice(0, 2) || 'DY').toUpperCase();

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#172554] to-[#4F46E5] text-white flex items-center justify-center text-xl font-black shadow-md shrink-0">
                  {userInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#11183F] tracking-tight">
                      {user?.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#15803D] border border-[#D1FAE5]">
                      <FiCheckCircle className="text-xs" />
                      Email Verified
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/my-enquiries"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#172554] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition"
                >
                  <FiFileText className="w-4 h-4 text-[#4F46E5]" />
                  <span>My Enquiries</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#DC2626] bg-[#FEF2F2] hover:bg-red-100 border border-[#FEE2E2] transition cursor-pointer"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#D1FAE5] text-[#15803D] text-xs font-semibold flex items-center gap-2">
              <FiCheck className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-xs font-semibold flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Profile Details & Edit Section */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-6 border-b border-[#F1F5F9] mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#11183F]">Personal Information</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Update your contact details and account preferences
                </p>
              </div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#172554] hover:bg-[#F8FAFC] transition cursor-pointer"
                >
                  <FiEdit3 className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>Edit Details</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-semibold text-[#64748B] hover:text-[#11183F] transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor={firstNameId}
                      className="block text-xs font-bold text-[#1E293B] mb-1 uppercase tracking-wider"
                    >
                      First Name
                    </label>
                    <input
                      id={firstNameId}
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm text-[#11183F] bg-white border border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 outline-none transition"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={lastNameId}
                      className="block text-xs font-bold text-[#1E293B] mb-1 uppercase tracking-wider"
                    >
                      Last Name
                    </label>
                    <input
                      id={lastNameId}
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm text-[#11183F] bg-white border border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={phoneId}
                    className="block text-xs font-bold text-[#1E293B] mb-1 uppercase tracking-wider"
                  >
                    Phone Number
                  </label>
                  <input
                    id={phoneId}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 text-sm text-[#11183F] bg-white border border-[#E2E8F0] rounded-xl focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 outline-none transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-[#172554] hover:bg-[#1E293B] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                    Full Name
                  </span>
                  <p className="text-sm font-semibold text-[#11183F]">{user?.name}</p>
                </div>

                <div>
                  <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                    Email Address
                  </span>
                  <p className="text-sm font-semibold text-[#11183F]">{user?.email}</p>
                </div>

                <div>
                  <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                    Phone Number
                  </span>
                  <p className="text-sm font-semibold text-[#11183F]">
                    {user?.phone || 'Not provided'}
                  </p>
                </div>

                <div>
                  <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                    Account Role
                  </span>
                  <p className="text-sm font-semibold capitalize text-[#11183F]">
                    {user?.role === 'admin' ? 'System Administrator' : 'Client Account'}
                  </p>
                </div>

                <div>
                  <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                    Member Since
                  </span>
                  <p className="text-sm font-semibold text-[#11183F]">{memberSince}</p>
                </div>
              </div>
            )}
          </div>

          {/* Admin Shortcuts if applicable */}
          {(user?.role === 'admin' || user?.role === 'editor') && (
            <div className="bg-[#EEF2FF]/60 rounded-3xl border border-[#C7D2FE] p-6 sm:p-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FiShield className="text-[#4F46E5] text-base" />
                  <h3 className="text-sm font-bold text-[#11183F]">Administrator Access</h3>
                </div>
                <p className="text-xs text-[#475569] mt-0.5">
                  You have privileged access to the Dinesh Yadav & Company Admin Dashboard and enquiry management console.
                </p>
              </div>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] shadow-sm transition"
              >
                <span>Admin Console</span>
              </Link>
            </div>
          )}

        </div>
      </div>
    </PublicLayout>
  );
};

export default ProfilePage;
