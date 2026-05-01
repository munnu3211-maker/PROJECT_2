import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { authCompleteProfile } from '../services/api';
import toast from 'react-hot-toast';
import { FiArrowRight, FiMapPin, FiUser } from 'react-icons/fi';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh',
  'Chandigarh', 'Puducherry', 'Andaman & Nicobar', 'Dadra & Nagar Haveli', 'Lakshadweep',
];

export default function SetupPage() {
  const navigate = useNavigate();
  const { user, loginUser } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    age: '', state: '', voterStatus: 'unknown',
    hasVoterId: false, isFirstTimeVoter: false, pincode: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.age || !formData.state) {
      toast.error('Please fill in age and state.');
      return;
    }
    if (parseInt(formData.age) < 17) {
      toast.error('You must be at least 17 years old.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        isFirstTimeVoter: formData.isFirstTimeVoter || parseInt(formData.age) <= 21,
      };
      const { data } = await authCompleteProfile(payload);
      if (data.success) {
        loginUser(data.data.user, data.data.token, data.data.checklist);
        toast.success('Profile complete! Let\'s start your journey 🗳️');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/8 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg">

        <div className="glass-card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-7">
              <div className="w-14 h-14 rounded-2xl bg-bg-elevated flex items-center justify-center mx-auto mb-3 text-xl shadow-xl shadow-primary/20">
                👤
              </div>
              <h2 className="text-xl font-bold gradient-text">Complete Your Profile</h2>
              <p className="text-text-muted text-xs mt-1">
                Hi {user?.name}! Tell us about yourself so we can personalize your voting journey.
              </p>
            </div>

            {/* Signed-in badge */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-border mb-6">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-9 h-9 rounded-full" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-sm font-bold text-primary">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
                <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 flex-shrink-0">
                {user?.authProvider === 'google' ? '🔑 Google' : '✉️ Email'}
              </span>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5 font-medium">
                    Age <span className="text-accent">*</span>
                  </label>
                  <input type="number" className="input-field" placeholder="e.g. 19" min="17" max="120"
                    value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5 font-medium">
                    <FiMapPin className="inline mr-1" size={12} /> Pincode
                  </label>
                  <input type="text" className="input-field" placeholder="e.g. 400001"
                    value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1.5 font-medium">
                  State / UT <span className="text-accent">*</span>
                </label>
                <select className="input-field"
                  value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })}>
                  <option value="">Select your state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1.5 font-medium">
                  Voter Registration Status
                </label>
                <select className="input-field"
                  value={formData.voterStatus} onChange={e => setFormData({ ...formData, voterStatus: e.target.value })}>
                  <option value="unknown">I don't know</option>
                  <option value="not_registered">Not registered</option>
                  <option value="applied">Applied, waiting for approval</option>
                  <option value="registered">Already registered ✓</option>
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 accent-primary rounded"
                    checked={formData.hasVoterId}
                    onChange={e => setFormData({ ...formData, hasVoterId: e.target.checked })} />
                  <span className="text-text-secondary text-xs group-hover:text-text-primary transition-colors">
                    I have a Voter ID (EPIC) card
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 accent-primary rounded"
                    checked={formData.isFirstTimeVoter}
                    onChange={e => setFormData({ ...formData, isFirstTimeVoter: e.target.checked })} />
                  <span className="text-text-secondary text-xs group-hover:text-text-primary transition-colors">
                    This will be my first time voting
                  </span>
                </label>
              </div>

              <motion.button type="submit" disabled={submitting}
                className="btn-primary w-full py-3.5 mt-3 shadow-lg shadow-primary/20"
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting Up...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Start My VotePath Journey <FiArrowRight size={16} />
                  </span>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        <p className="text-center text-[10px] text-text-muted mt-4">
          Your data is stored securely and never shared. Non-political. Educational only.
        </p>
      </motion.div>
    </div>
  );
}
