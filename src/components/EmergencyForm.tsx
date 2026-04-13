import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Emergency, EmergencyType } from '../types';
import { BLOOD_TYPES } from '../data/mockData';

interface Props {
  onSubmit: (emergency: Emergency) => void;
  disabled: boolean;
}

export default function EmergencyForm({ onSubmit, disabled }: Props) {
  const [mode, setMode] = useState<EmergencyType>('medical');
  const [petName, setPetName] = useState('Buddy');
  const [bloodType, setBloodType] = useState('DEA 1.1+');
  const [location, setLocation] = useState('Paris 6th Arr.');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'critical'>('critical');
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (disabled) return;
    if (mode === 'medical') {
      onSubmit({ type: 'medical', petName, bloodType, location, urgency });
    } else {
      onSubmit({ type: 'lost', petName, petType, lastSeenLocation: location, description });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.dot} />
        <span style={styles.headerTitle}>EMERGENCY CENTER</span>
      </div>

      <div style={styles.modeButtons}>
        <button
          onClick={() => setMode('medical')}
          style={{
            ...styles.modeBtn,
            ...(mode === 'medical' ? styles.modeBtnActiveMedical : {}),
          }}
        >
          <span style={styles.modeIcon}>🩸</span>
          <span>Blood Emergency</span>
        </button>
        <button
          onClick={() => setMode('lost')}
          style={{
            ...styles.modeBtn,
            ...(mode === 'lost' ? styles.modeBtnActiveLost : {}),
          }}
        >
          <span style={styles.modeIcon}>📡</span>
          <span>Lost Pet</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={styles.form}
        >
          <label style={styles.label}>
            <span style={styles.labelText}>Pet Name</span>
            <input
              style={styles.input}
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Enter pet name"
            />
          </label>

          {mode === 'medical' ? (
            <>
              <label style={styles.label}>
                <span style={styles.labelText}>Blood Type Required</span>
                <select
                  style={styles.input}
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                >
                  {BLOOD_TYPES.map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </label>

              <label style={styles.label}>
                <span style={styles.labelText}>Location</span>
                <input
                  style={styles.input}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Hospital or address"
                />
              </label>

              <label style={styles.label}>
                <span style={styles.labelText}>Urgency Level</span>
                <div style={styles.urgencyGroup}>
                  {(['low', 'medium', 'critical'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setUrgency(level)}
                      style={{
                        ...styles.urgencyBtn,
                        ...(urgency === level ? styles.urgencyColors[level] : {}),
                      }}
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>
              </label>
            </>
          ) : (
            <>
              <label style={styles.label}>
                <span style={styles.labelText}>Pet Type</span>
                <div style={styles.urgencyGroup}>
                  {(['dog', 'cat'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setPetType(t)}
                      style={{
                        ...styles.urgencyBtn,
                        ...(petType === t
                          ? { background: 'var(--accent-blue-dim)', borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }
                          : {}),
                      }}
                    >
                      {t === 'dog' ? '🐕 Dog' : '🐈 Cat'}
                    </button>
                  ))}
                </div>
              </label>

              <label style={styles.label}>
                <span style={styles.labelText}>Last Seen Location</span>
                <input
                  style={styles.input}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                />
              </label>

              <label style={styles.label}>
                <span style={styles.labelText}>Description</span>
                <input
                  style={styles.input}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Color, collar, distinguishing features..."
                />
              </label>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.button
        onClick={handleSubmit}
        disabled={disabled}
        style={{
          ...styles.submitBtn,
          ...(disabled ? styles.submitDisabled : {}),
          background: mode === 'medical'
            ? 'linear-gradient(135deg, #ff3366, #ff6b6b)'
            : 'linear-gradient(135deg, #00d4ff, #0099cc)',
        }}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
      >
        {disabled ? 'PROCESSING...' : mode === 'medical' ? '🚨 BROADCAST EMERGENCY' : '📡 BROADCAST ALERT'}
      </motion.button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--accent-red)',
    boxShadow: '0 0 8px var(--accent-red)',
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2,
    color: 'var(--text-secondary)',
    fontFamily: "'JetBrains Mono', monospace",
  },
  modeButtons: {
    display: 'flex',
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
    padding: '12px 8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  modeBtnActiveMedical: {
    background: 'var(--accent-red-dim)',
    borderColor: 'var(--accent-red)',
    color: 'var(--accent-red)',
  },
  modeBtnActiveLost: {
    background: 'var(--accent-blue-dim)',
    borderColor: 'var(--accent-blue)',
    color: 'var(--accent-blue)',
  },
  modeIcon: {
    fontSize: 20,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
    flex: 1,
  },
  label: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  labelText: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  input: {
    padding: '10px 12px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
  },
  urgencyGroup: {
    display: 'flex',
    gap: 6,
  },
  urgencyBtn: {
    flex: 1,
    padding: '8px 4px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: 0.5,
  },
  urgencyColors: {
    low: {
      background: 'var(--accent-green-dim)',
      borderColor: 'var(--accent-green)',
      color: 'var(--accent-green)',
    },
    medium: {
      background: 'var(--accent-yellow-dim)',
      borderColor: 'var(--accent-yellow)',
      color: 'var(--accent-yellow)',
    },
    critical: {
      background: 'var(--accent-red-dim)',
      borderColor: 'var(--accent-red)',
      color: 'var(--accent-red)',
    },
  },
  submitBtn: {
    padding: '14px 16px',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 1,
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    boxShadow: '0 4px 20px rgba(255, 51, 102, 0.3)',
  },
  submitDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};
