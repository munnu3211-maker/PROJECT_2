import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { authUpdateProfile } from '../services/api';
import toast from 'react-hot-toast';
import { FiSave, FiLogOut, FiShield, FiMail, FiUser } from 'react-icons/fi';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh',
  'Chandigarh', 'Puducherry', 'Andaman & Nicobar', 'Dadra & Nagar Haveli', 'Lakshadweep',
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function ProfilePage() {
  const { user, updateUser, logoutUser } = useUser();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    voterStatus: user?.voterStatus || 'unknown',
    hasVoterId: user?.hasVoterId || false,
    isFirstTimeVoter: user?.isFirstTimeVoter || false,
  });

  const handleSave = async () => {
    if (!form.name || !form.age || !form.state) {
      toast.error('Name, age, and state are required.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await authUpdateProfile({
        ...form,
        age: parseInt(form.age),
      });
      if (data.success) {
        updateUser(data.data.user);
        toast.success('Profile updated successfully! ✅');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-bg-elevated flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-xl">👤</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">My Profile</h1>
          <p className="text-xs text-text-muted">Manage your voter profile and account settings</p>
        </div>
      </motion.div>

      {/* Account Info (Read-Only) */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <FiShield size={14} className="text-primary" /> Account Information
        </h2>
        <div className="flex items-center gap-4 mb-5">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-16 h-16 rounded-2xl border-2 border-border shadow-md" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center text-2xl font-bold text-primary shadow-md">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <p className="text-lg font-bold text-text-primary">{user?.name}</p>
            <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
              <FiMail size={10} /> {user?.email}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {user?.authProvider === 'google' ? '🔑 Google Account' : '✉️ Email Account'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-elevated border border-border text-text-muted">
                📅 Joined {memberSince}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Editable Profile Fields */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <FiUser size={14} className="text-primary" /> Voter Profile
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-medium">Full Name</label>
            <input type="text" className="input-field" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          {/* Age + Pincode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">Age</label>
              <input type="number" className="input-field" min="17" max="120" value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 font-medium">Pincode</label>
              <input type="text" className="input-field" placeholder="e.g. 400001" value={form.pincode}
                onChange={e => setForm({ ...form, pincode: e.target.value })} />
            </div>
          </div>

          {/* State */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-medium">State / UT</label>
            <select className="input-field" value={form.state}
              onChange={e => setForm({ ...form, state: e.target.value })}>
              <option value="">Select your state</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Voter Status */}
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 font-medium">Voter Registration Status</label>
            <select className="input-field" value={form.voterStatus}
              onChange={e => setForm({ ...form, voterStatus: e.target.value })}>
              <option value="unknown">I don't know</option>
              <option value="not_registered">Not registered</option>
              <option value="applied">Applied, waiting for approval</option>
              <option value="registered">Already registered ✓</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 accent-primary rounded"
                checked={form.hasVoterId}
                onChange={e => setForm({ ...form, hasVoterId: e.target.checked })} />
              <span className="text-text-secondary text-xs group-hover:text-text-primary transition-colors">
                I have a Voter ID (EPIC) card
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 accent-primary rounded"
                checked={form.isFirstTimeVoter}
                onChange={e => setForm({ ...form, isFirstTimeVoter: e.target.checked })} />
              <span className="text-text-secondary text-xs group-hover:text-text-primary transition-colors">
                This will be my first time voting
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <motion.button onClick={handleSave} disabled={saving}
          className="btn-primary w-full py-3 mt-6 shadow-lg shadow-primary/20"
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FiSave size={16} /> Save Changes
            </span>
          )}
        </motion.button>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="text-sm font-semibold text-text-secondary mb-4">🔗 Useful Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: 'Check Voter Registration', url: 'https://electoralsearch.eci.gov.in/', icon: '🔍' },
            { label: 'Download e-EPIC', url: 'https://voters.eci.gov.in/', icon: '📥' },
            { label: 'ECI Official Portal', url: 'https://eci.gov.in/', icon: '🏛️' },
            { label: 'Call ECI Helpline', url: 'tel:1950', icon: '📞' },
          ].map((link, i) => (
            <a key={i} href={link.url} target={link.url.startsWith('tel') ? '_self' : '_blank'} rel="noreferrer"
              className="flex items-center gap-2 p-3 rounded-xl bg-bg-elevated border border-border hover:border-primary/30 transition-all text-sm text-text-secondary hover:text-primary">
              <span>{link.icon}</span> {link.label}
            </a>
          ))}
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div variants={item} className="text-center pb-6">
        <button onClick={handleLogout}
          className="inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors py-2 px-4 rounded-xl hover:bg-red-500/5">
          <FiLogOut size={16} /> Sign Out
        </button>
      </motion.div>
    </motion.div>
  );
}
