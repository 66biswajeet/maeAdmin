import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save, Lock, User, Mail, Shield } from "lucide-react";
import { getMe, updateProfile, changePassword } from "../services/api";

export default function ProfileSettings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({ name: "", avatar: "" });
  const [profileChanged, setProfileChanged] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getMe();
      const admin = res.data.admin;
      setProfile(admin);
      setProfileForm({ name: admin.name, avatar: admin.avatar || "" });
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileChanged(true);
  };

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({
        name: profileForm.name,
        avatar: profileForm.avatar,
      });

      setProfile(res.data.admin);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      setProfileChanged(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetPassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Please fill all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      handleResetPassword();
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="spin-wrap">
        <div className="spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="ph-page">
        <h2>Could not load profile</h2>
        <p>Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="profile-settings">
      {/* Profile Information Card */}
      <div className="sc">
        <div className="sc-head">
          <h3>
            <User size={14} />
            Profile Information
          </h3>
        </div>

        <div className="sc-body">
          <div className="profile-header">
            <div className="profile-avatar-section">
              <div className="profile-avatar-display">
                {profileForm.avatar ? (
                  <img src={profileForm.avatar} alt={profileForm.name} />
                ) : (
                  <span>{profile.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="profile-avatar-info">
                <p className="profile-email">{profile.email}</p>
                <p className="profile-role">
                  <Shield size={13} />
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="gap12">
            <div className="fg">
              <label className="fl">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                className="fi"
                placeholder="Enter your full name"
              />
            </div>

            <div className="fg">
              <label className="fl">Avatar URL</label>
              <input
                type="url"
                name="avatar"
                value={profileForm.avatar}
                onChange={handleProfileChange}
                className="fi"
                placeholder="https://example.com/avatar.jpg"
              />
              <small style={{ color: "var(--text-muted)" }}>
                Provide a URL to your profile picture (optional)
              </small>
            </div>

            <div className="fg">
              <label className="fl">Email Address</label>
              <input
                type="email"
                value={profile.email}
                className="fi"
                disabled
                style={{
                  opacity: 0.6,
                  cursor: "not-allowed",
                  backgroundColor: "var(--off-white)",
                }}
              />
              <small style={{ color: "var(--text-muted)" }}>
                Email cannot be changed
              </small>
            </div>
          </div>

          <div
            className="bot-bar"
            style={{
              marginLeft: "-20px",
              marginRight: "-20px",
              marginBottom: "-20px",
              borderTop: "1px solid var(--border)",
              background: "var(--off-white)",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              className="btn btn-ghost"
              onClick={() => {
                setProfileForm({
                  name: profile.name,
                  avatar: profile.avatar || "",
                });
                setProfileChanged(false);
              }}
              disabled={!profileChanged || saving}
            >
              Cancel
            </button>
            <button
              className="btn btn-teal"
              onClick={handleSaveProfile}
              disabled={!profileChanged || saving || !profileForm.name.trim()}
            >
              <Save size={14} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="sc">
        <div className="sc-head">
          <h3>
            <Lock size={14} />
            Change Password
          </h3>
        </div>

        <div className="sc-body">
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginBottom: "16px",
            }}
          >
            Update your password to keep your account secure. Make sure to use a
            strong, unique password.
          </p>

          <div className="gap12">
            <div className="fg">
              <label className="fl">Current Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="fi"
                  placeholder="Enter your current password"
                  disabled={changingPassword}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      current: !prev.current,
                    }))
                  }
                  disabled={changingPassword}
                >
                  {showPasswords.current ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="fg">
              <label className="fl">New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="fi"
                  placeholder="Enter your new password"
                  disabled={changingPassword}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                  }
                  disabled={changingPassword}
                >
                  {showPasswords.new ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="fg">
              <label className="fl">Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="fi"
                  placeholder="Confirm your new password"
                  disabled={changingPassword}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      confirm: !prev.confirm,
                    }))
                  }
                  disabled={changingPassword}
                >
                  {showPasswords.confirm ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
          </div>

          <div
            className="bot-bar"
            style={{
              marginLeft: "-20px",
              marginRight: "-20px",
              marginBottom: "-20px",
              borderTop: "1px solid var(--border)",
              background: "var(--off-white)",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              className="btn btn-ghost"
              onClick={handleResetPassword}
              disabled={changingPassword || !passwordForm.currentPassword}
            >
              Clear
            </button>
            <button
              className="btn btn-teal"
              onClick={handleChangePassword}
              disabled={
                changingPassword ||
                !passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword
              }
            >
              <Lock size={14} />
              {changingPassword ? "Updating..." : "Change Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
