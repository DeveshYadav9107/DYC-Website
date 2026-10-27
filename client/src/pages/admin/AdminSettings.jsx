import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FiCamera,
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiLock,
  FiEye,
  FiEyeOff,
  FiSave,
  FiCheckCircle,
  FiAlertCircle,
  FiTrash2,
  FiShield,
} from 'react-icons/fi';

/**
 * Compresses an image file on an HTML5 canvas and converts it to a base64 Data URL.
 * Stored directly in MongoDB Atlas so it works across Render, Vercel, and localhost
 * without relying on ephemeral local container storage.
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

const AdminSettings = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    designation: user?.designation || '',
    company: user?.company || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  // Password Update State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // UI Status
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync user data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        designation: user.designation || (user.role === 'admin' ? 'Super Administrator' : 'Operations Lead'),
        company: user.company || 'DY&C - Dinesh Yadav & Company',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  // Handle Profile Photo Upload (Instagram / WhatsApp style)
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

      // Compress and convert to Base64 data URI
      const base64Image = await compressImageToBase64(file, 360, 0.85);

      // Update local state and immediately persist to MongoDB Atlas via updateProfile
      setFormData((prev) => ({ ...prev, avatar: base64Image }));
      await updateProfile({ avatar: base64Image });

      setSuccessMsg('Profile photo updated and saved to database successfully!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Failed to upload profile photo:', err);
      setErrorMsg('Failed to process image. Please try a different photo.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Remove Photo
  const handleRemovePhoto = async () => {
    try {
      setUploadingPhoto(true);
      setErrorMsg('');
      setFormData((prev) => ({ ...prev, avatar: '' }));
      await updateProfile({ avatar: '' });
      setSuccessMsg('Profile photo removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Failed to remove photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle Save All Profile Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Validation for password change
    if (passwordData.newPassword) {
      if (!passwordData.currentPassword) {
        setErrorMsg('Please enter your current password to set a new password.');
        setSaving(false);
        return;
      }
      if (passwordData.newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        setSaving(false);
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setErrorMsg('New password and confirm password do not match.');
        setSaving(false);
        return;
      }
    }

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        designation: formData.designation.trim(),
        company: formData.company.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar,
      };

      if (passwordData.newPassword) {
        payload.currentPassword = passwordData.currentPassword;
        payload.newPassword = passwordData.newPassword;
      }

      await updateProfile(payload);

      setSuccessMsg('Profile settings updated successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update profile settings:', err);
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save settings. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const initials = formData.name
    ? formData.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88A3B] block">
            System Administration
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#252720] mt-0.5">
            Admin Profile & Settings
          </h2>
          <p className="text-xs text-[#66665D] mt-0.5">
            Manage your executive account details, profile avatar, and login security credentials.
          </p>
        </div>
      </div>

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] text-xs font-semibold flex items-center gap-2.5 shadow-xs">
          <FiCheckCircle className="text-base shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-xs font-semibold flex items-center gap-2.5 shadow-xs">
          <FiAlertCircle className="text-base shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* ================= 1. INSTAGRAM / WHATSAPP STYLE PROFILE PHOTO CARD ================= */}
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-r from-[#EAF0E8] via-[#FDFBF7] to-[#EAF0E8] border-b border-[#E7E0D3]/60 -z-0"></div>

          <div className="relative z-10 pt-4 flex flex-col items-center">
            {/* Avatar Circle Container */}
            <div className="relative inline-block mb-3">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl ring-2 ring-[#174B39]/20 overflow-hidden bg-[#EAF0E8] flex items-center justify-center text-3xl font-serif font-bold text-[#174B39]">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={formData.name || 'Admin'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Instagram / WhatsApp Camera Upload Button Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-[#174B39] text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-[#103728] hover:scale-105 active:scale-95 transition cursor-pointer"
                title="Change Profile Photo"
                aria-label="Upload profile photo"
              >
                <FiCamera className="text-base" />
              </button>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {/* Name & Role Text */}
            <h3 className="font-serif font-bold text-lg text-[#252720] mt-1">
              {formData.name || 'Administrator'}
            </h3>
            <p className="text-xs text-[#66665D] mt-0.5">
              {formData.designation || 'Super Administrator'} · {formData.company || 'DY&C'}
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#EAF0E8] text-[#174B39] text-xs font-semibold hover:bg-[#174B39] hover:text-white transition cursor-pointer"
              >
                <FiCamera className="text-xs" />
                <span>{uploadingPhoto ? 'Processing...' : 'Upload New Photo'}</span>
              </button>

              {formData.avatar && (
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

            <p className="text-[11px] text-[#8A897C] mt-3">
              Stored directly in MongoDB Atlas database. Renders seamlessly on Vercel and Render cloud servers.
            </p>
          </div>
        </div>

        {/* ================= 2. ACCOUNT & IDENTITY DATA (LIKE SIGN UP PAGE) ================= */}
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-[#E7E0D3] pb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EAF0E8] text-[#174B39] flex items-center justify-center">
              <FiUser className="text-sm" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#252720]">Account & Personal Details</h3>
              <p className="text-[11px] text-[#64748B]">Personal identity and primary contact records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#252720] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <FiUser className="text-sm" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dinesh Yadav"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-[#252720] mb-1">
                Email Address (Account ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <FiMail className="text-sm" />
                </div>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E7E0D3] text-xs text-[#64748B] cursor-not-allowed"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-bold uppercase text-[#15803D]">
                  Verified
                </span>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-[#252720] mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <FiPhone className="text-sm" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Designation / Role Title */}
            <div>
              <label className="block text-xs font-semibold text-[#252720] mb-1">
                Designation / Position
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <FiBriefcase className="text-sm" />
                </div>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Managing Director & CEO"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Organization / Company */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#252720] mb-1">
                Company / Organization Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <FiBriefcase className="text-sm" />
                </div>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="DY&C - Dinesh Yadav & Company"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Executive Bio */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#252720] mb-1">
                Executive Bio / Description
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief summary of professional background, focus areas, and leadership responsibilities..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* ================= 3. SECURITY & PASSWORD CHANGE CARD ================= */}
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7E0D3] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-[#E7E0D3] pb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EAF0E8] text-[#174B39] flex items-center justify-center">
              <FiShield className="text-sm" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#252720]">Account Security</h3>
              <p className="text-[11px] text-[#64748B]">
                Leave blank if you do not wish to change your password
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-[#252720] mb-1">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <FiLock className="text-sm" />
                </div>
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#252720]"
                >
                  {showCurrentPass ? <FiEyeOff className="text-xs" /> : <FiEye className="text-xs" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#252720] mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <FiLock className="text-sm" />
                </div>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#252720]"
                >
                  {showNewPass ? <FiEyeOff className="text-xs" /> : <FiEye className="text-xs" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#252720] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <FiLock className="text-sm" />
                </div>
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#F8F5EE]/60 border border-[#E7E0D3] text-xs text-[#252720] focus:outline-none focus:border-[#174B39] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#252720]"
                >
                  {showConfirmPass ? <FiEyeOff className="text-xs" /> : <FiEye className="text-xs" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || uploadingPhoto}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#174B39] hover:bg-[#103728] text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-60"
          >
            <FiSave className="text-sm" />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
