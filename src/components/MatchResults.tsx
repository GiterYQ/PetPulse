import { motion, AnimatePresence } from 'framer-motion';
import type { MatchedPet } from '../types';

interface Props {
  matches: MatchedPet[];
  visible: boolean;
  onSendAlert: (id: string) => void;
}

export default function MatchResults({ matches, visible, onSendAlert }: Props) {
  const sorted = [...matches].sort((a, b) => {
    if (a.bloodMatch !== b.bloodMatch) return a.bloodMatch ? -1 : 1;
    return a.distance - b.distance;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{
          ...styles.dot,
          background: visible ? 'var(--accent-green)' : 'var(--text-muted)',
          boxShadow: visible ? '0 0 8px var(--accent-green)' : 'none',
        }} />
        <span style={styles.headerTitle}>MATCH RESULTS</span>
        {visible && (
          <span style={styles.countBadge}>{sorted.filter(m => m.bloodMatch).length} compatible</span>
        )}
      </div>

      <div style={styles.list}>
        {!visible && (
          <div style={styles.idle}>
            <div style={styles.idleIcon}>🔍</div>
            <div style={styles.idleText}>Waiting for AI Processing</div>
            <div style={styles.idleSubtext}>Matches will appear here</div>
          </div>
        )}

        <AnimatePresence>
          {visible && sorted.map((pet, i) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              style={{
                ...styles.card,
                borderLeftColor: pet.bloodMatch ? 'var(--accent-green)' : 'var(--border)',
                opacity: pet.bloodMatch ? 1 : 0.5,
              }}
            >
              <div style={styles.cardTop}>
                <div style={styles.petInfo}>
                  <span style={styles.petName}>{pet.name}</span>
                  <span style={styles.petBreed}>{pet.breed}</span>
                </div>
                <div style={{
                  ...styles.matchBadge,
                  background: pet.bloodMatch ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                  color: pet.bloodMatch ? 'var(--accent-green)' : 'var(--accent-red)',
                }}>
                  {pet.bloodMatch ? '✓ MATCH' : '✗ NO MATCH'}
                </div>
              </div>

              <div style={styles.statsRow}>
                <Stat label="Distance" value={`${pet.distance} km`} />
                <Stat label="Blood" value={pet.bloodType} />
                <Stat label="Trust" value={`${pet.trustScore}%`} highlight={pet.trustScore >= 90} />
              </div>

              <div style={styles.cardBottom}>
                <span style={styles.ownerName}>Owner: {pet.ownerName}</span>
                {pet.bloodMatch && (
                  pet.status === 'available' ? (
                    <motion.button
                      onClick={() => onSendAlert(pet.id)}
                      style={styles.alertBtn}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ⚡ Send Alert
                    </motion.button>
                  ) : pet.status === 'alerted' ? (
                    <motion.span
                      style={styles.alertedTag}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      📡 Alert Sent
                    </motion.span>
                  ) : (
                    <motion.span
                      style={styles.respondingTag}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      ✓ Responding
                    </motion.span>
                  )
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statLabel}>{label}</span>
      <span style={{
        ...styles.statValue,
        color: highlight ? 'var(--accent-green)' : 'var(--text-primary)',
      }}>{value}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: 12,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    transition: 'all 0.3s',
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2,
    color: 'var(--text-secondary)',
    fontFamily: "'JetBrains Mono', monospace",
  },
  countBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--accent-green)',
    background: 'var(--accent-green-dim)',
    padding: '2px 8px',
    borderRadius: 4,
    marginLeft: 'auto',
  },
  list: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  },
  idle: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 8,
    opacity: 0.5,
  },
  idleIcon: { fontSize: 32 },
  idleText: { fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' },
  idleSubtext: { fontSize: 12, color: 'var(--text-muted)' },
  card: {
    padding: '14px',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-sm)',
    borderLeft: '3px solid',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  petInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  petName: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  petBreed: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  matchBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  statsRow: {
    display: 'flex',
    gap: 16,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
  },
  cardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerName: {
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  alertBtn: {
    padding: '6px 14px',
    background: 'linear-gradient(135deg, var(--accent-blue), #0099cc)',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 0.5,
  },
  alertedTag: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--accent-yellow)',
    background: 'var(--accent-yellow-dim)',
    padding: '4px 10px',
    borderRadius: 6,
  },
  respondingTag: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--accent-green)',
    background: 'var(--accent-green-dim)',
    padding: '4px 10px',
    borderRadius: 6,
  },
};
