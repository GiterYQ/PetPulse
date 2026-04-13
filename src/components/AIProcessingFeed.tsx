import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AIStep } from '../types';

interface Props {
  steps: AIStep[];
  active: boolean;
  onPhaseChange: (phase: number) => void;
  onComplete: () => void;
}

export default function AIProcessingFeed({ steps, active, onPhaseChange, onComplete }: Props) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) {
      setCompletedSteps([]);
      setCurrentStep(-1);
      setTypedText('');
      setIsTyping(false);
      return;
    }

    let cancelled = false;

    const runSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        if (cancelled) return;
        setCurrentStep(i);
        onPhaseChange(i + 1);
        setIsTyping(true);

        // Type out the detail text
        const text = steps[i].detail;
        for (let j = 0; j <= text.length; j++) {
          if (cancelled) return;
          setTypedText(text.slice(0, j));
          await delay(18);
        }
        setIsTyping(false);

        // Wait remaining duration
        await delay(steps[i].duration - text.length * 18);

        if (cancelled) return;
        setCompletedSteps((prev) => [...prev, i]);
      }
      if (!cancelled) {
        onComplete();
      }
    };

    runSteps();
    return () => { cancelled = true; };
  }, [active]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStep, typedText]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{
          ...styles.statusDot,
          background: active ? 'var(--accent-blue)' : 'var(--text-muted)',
          boxShadow: active ? '0 0 8px var(--accent-blue)' : 'none',
        }} />
        <span style={styles.headerTitle}>AI PROCESSING ENGINE</span>
        {active && (
          <motion.span
            style={styles.liveTag}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            LIVE
          </motion.span>
        )}
      </div>

      <div ref={scrollRef} style={styles.feed}>
        {!active && currentStep === -1 && (
          <div style={styles.idle}>
            <div style={styles.idleIcon}>⚡</div>
            <div style={styles.idleText}>AI Engine Standing By</div>
            <div style={styles.idleSubtext}>Submit an emergency to activate processing</div>
          </div>
        )}

        <AnimatePresence>
          {steps.map((step, i) => {
            if (i > currentStep) return null;
            const isActive = i === currentStep && !completedSteps.includes(i);
            const isComplete = completedSteps.includes(i);

            return (
              <motion.div
                key={step.phase}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  ...styles.stepItem,
                  borderLeftColor: isComplete
                    ? 'var(--accent-green)'
                    : isActive
                    ? 'var(--accent-blue)'
                    : 'var(--border)',
                }}
              >
                <div style={styles.stepHeader}>
                  <span style={{
                    ...styles.phaseTag,
                    background: isComplete ? 'var(--accent-green-dim)' : 'var(--accent-blue-dim)',
                    color: isComplete ? 'var(--accent-green)' : 'var(--accent-blue)',
                  }}>
                    {isComplete ? '✓' : `0${step.phase}`} {step.label}
                  </span>
                  {isActive && (
                    <motion.div
                      style={styles.spinner}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </div>

                <div style={styles.stepDetail} className="mono">
                  {isActive ? (
                    <span>
                      {typedText}
                      {isTyping && <span className="cursor-blink" />}
                    </span>
                  ) : isComplete ? (
                    step.detail
                  ) : null}
                </div>

                {isActive && (
                  <motion.div
                    style={styles.progressBar}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: step.duration / 1000, ease: 'linear' }}
                  >
                    <div style={styles.progressFill} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  statusDot: {
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
  liveTag: {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--accent-red)',
    background: 'var(--accent-red-dim)',
    padding: '2px 8px',
    borderRadius: 4,
    letterSpacing: 1.5,
    marginLeft: 'auto',
  },
  feed: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
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
  idleIcon: {
    fontSize: 32,
  },
  idleText: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-secondary)',
  },
  idleSubtext: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  stepItem: {
    padding: '12px 14px',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-sm)',
    borderLeft: '3px solid var(--border)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phaseTag: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.5,
    padding: '3px 8px',
    borderRadius: 4,
    fontFamily: "'JetBrains Mono', monospace",
  },
  spinner: {
    width: 14,
    height: 14,
    border: '2px solid var(--border)',
    borderTopColor: 'var(--accent-blue)',
    borderRadius: '50%',
  },
  stepDetail: {
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--text-secondary)',
  },
  progressBar: {
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))',
  },
};
