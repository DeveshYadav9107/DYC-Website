import { useState, useId, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PublicLayout from '../../layouts/PublicLayout';
import {
  FiCheckCircle,
  FiEdit3,
  FiLogOut,
  FiFileText,
  FiCheck,
  FiAlertCircle,
  FiCamera,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiLock,
  FiEye,
  FiEyeOff,
  FiSave,
} from 'react-icons/fi';

/**
 * Compresses an image file on an HTML5 canvas and converts it to a base64 Data URL.
 * Stored directly in MongoDB Atlas so it works across Render, Vercel, and localhost.
 */
const compressImageToBase64 = (file, maxWidth = 360, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(elem.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [company, setCompany] = useState(user?.company || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const nameId = useId();
  const phoneId = useId();
  const companyId = useId();

  const userInitials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'DY';

  // Photo upload handler
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    try {
      setUploadingPhoto(true);
      setErrorMsg('');
      const base64Image = await compressImageToBase64(file, 360, 0.85);
      setAvatar(base64Image);
      await updateProfile({ avatar: base64Image });
      setSuccessMsg('Profile photo updated in database!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Failed to upload photo:', err);
      setErrorMsg('Failed to process image. Please try another.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploadingPhoto(true);
      setErrorMsg('');
      setAvatar('');
      await updateProfile({ avatar: '' });
      setSuccessMsg('Profile photo removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Failed to remove photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword) {
      if (!currentPassword) {
        setErrorMsg('Please enter your current password to set a new password.');
        setLoading(false);
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirmation do not match.');
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        company: company.trim(),
        designation: designation.trim(),
        avatar,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await updateProfile(payload);
      setSuccessMsg('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 4000);
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

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#F8F5EE] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Header Card with Navigation */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88A3B] block">
                Account Settings
              </span>
              <h1 className="text-2xl font-serif font-bold text-[#252720] mt-0.5">
                Client Profile & Preferences
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/my-enquiries"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#252720] bg-white border border-[#E7E0D3] hover:border-[#174B39] transition shadow-xs"
              >
                <FiFileText className="w-3.5 h-3.5 text-[#174B39]" />
                <span>My Enquiries</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] hover:bg-red-100 border border-[#FEE2E2] transition cursor-pointer"
              >
                <FiLogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Alerts */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] text-xs font-semibold flex items-center gap-2 shadow-xs">
              <FiCheck className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-xs font-semibold flex items-center gap-2 shadow-xs">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ================= 1. INSTAGRAM / WHATSAPP STYLE PROFILE PHOTO CARD ================= */}
          <div className="bg-white rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-r from-[#EAF0E8] via-[#FDFBF7] to-[#EAF0E8] border-b border-[#E7E0D3]/60 -z-0"></div>

            <div className="relative z-10 pt-2 flex flex-col items-center">
              {/* Circular Avatar */}
              <div className="relative inline-block mb-3">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl ring-2 ring-[#174B39]/20 overflow-hidden bg-[#EAF0E8] flex items-center justify-center text-3xl font-serif font-bold text-[#174B39]">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name || 'Client'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </div>

                {/* Camera Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-[#174B39] text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-[#103728] hover:scale-105 active:scale-95 transition cursor-pointer"
                  title="Upload profile photo"
                >
                  <FiCamera className="text-base" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>

              <h2 className="text-xl font-serif font-bold text-[#252720]">
                {name || 'Enterprise Client'}
              </h2>
              <p className="text-xs text-[#66665D] mt-0.5">
                {company || 'Client Organization'} · {user?.email}
              </p>

              {/* Photo Options */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#EAF0E8] text-[#174B39] text-xs font-semibold hover:bg-[#174B39] hover:text-white transition cursor-pointer"
                >
                  <FiCamera className="text-xs" />
                  <span>{uploadingPhoto ? 'Processing...' : 'Change Photo'}</span>
                </button>

                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploadingPhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E7E0D3] text-[#64748B] text-xs font-semibold hover:text-[#DC2626] hover:border-[#DC2626]/40 transition cursor-pointer"
                  >
                    <FiTrash2 className="text-xs" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ================= 2. PROFILE DATA FORM ================= */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="border-b border-[#E7E0D3] pb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EAF0E8] text-[#174B39] flex items-center justify-center">
                  <FiUser className="text-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#252720]">Personal & Company Information</h3>
                  <p className="text-[11px] text-[#64748B]">Update your registered details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={nameId} className="block text-xs font-semibold text-[#252720] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                      <FiUser className="text-sm" />
                    </div>
                    <input
                      id={nameId}
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                      <FiMail className="text-sm" />
                    </div>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E7E0D3] text-xs text-[#64748B] cursor-not-allowed"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-bold uppercase text-[#15803D]">
                      Verified
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor={phoneId} className="block text-xs font-semibold text-[#252720] mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                      <FiPhone className="text-sm" />
                    </div>
                    <input
                      id={phoneId}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={companyId} className="block text-xs font-semibold text-[#252720] mb-1">
                    Company / Organization
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                      <FiBriefcase className="text-sm" />
                    </div>
                    <input
                      id={companyId}
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Acme Enterprise Corp"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="bg-white rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="border-b border-[#E7E0D3] pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF0E8] text-[#174B39] flex items-center justify-center">
                    <FiLock className="text-sm" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#252720]">Security & Password</h3>
                    <p className="text-[11px] text-[#64748B]">Leave blank to keep your current password</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-xs text-[#174B39] font-semibold hover:underline flex items-center gap-1"
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                  <span>{showPass ? 'Hide' : 'Show'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1">
                    Current Password
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1">
                    New Password
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#252720] mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || uploadingPhoto}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#174B39] hover:bg-[#103728] text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-60"
              >
                <FiSave className="text-sm" />
                <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ProfilePage;
