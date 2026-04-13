import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import EmergencyForm from './components/EmergencyForm';
import AIProcessingFeed from './components/AIProcessingFeed';
import MatchResults from './components/MatchResults';
import EmergencyMap from './components/EmergencyMap';
import { AI_STEPS_MEDICAL, AI_STEPS_LOST, MOCK_DONORS } from './data/mockData';
import type { Emergency, MatchedPet } from './types';

function App() {
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [processing, setProcessing] = useState(false);
  const [phase, setPhase] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [matches, setMatches] = useState<MatchedPet[]>(MOCK_DONORS);
  const [flashActive, setFlashActive] = useState(false);

  const handleSubmit = useCallback((e: Emergency) => {
    setEmergency(e);
    setProcessing(true);
    setShowResults(false);
    setPhase(0);
    setMatches(MOCK_DONORS.map((m) => ({ ...m, status: 'available' as const })));
    // Flash effect on submit
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 600);
  }, []);

  const handlePhaseChange = useCallback((p: number) => {
    setPhase(p);
  }, []);

  const handleProcessingComplete = useCallback(() => {
    setProcessing(false);
    setShowResults(true);
  }, []);

  const handleSendAlert = useCallback((id: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'alerted' as const } : m))
    );
    setTimeout(() => {
      setMatches((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'responding' as const } : m))
      );
    }, 2500);
  }, []);

  const handleReset = useCallback(() => {
    setEmergency(null);
    setProcessing(false);
    setPhase(0);
    setShowResults(false);
    setMatches(MOCK_DONORS.map((m) => ({ ...m, status: 'available' as const })));
  }, []);

  const aiSteps = emergency?.type === 'lost' ? AI_STEPS_LOST : AI_STEPS_MEDICAL;

  return (
    <div className="app">
      {/* Emergency flash overlay */}
      <AnimatePresence>
        {flashActive && (
          <motion.div
            className="flash-overlay"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-logo">PetPulse</span>
          <span className="topbar-subtitle">Emergency Coordination</span>
        </div>
        <div className="topbar-right">
          <span className="topbar-tag">GOSIM PARIS 2026</span>
          {emergency && (
            <button className="reset-btn" onClick={handleReset}>
              ↺ RESET
            </button>
          )}
          <div className="topbar-status">
            <div className={`status-dot ${processing ? 'status-dot-active' : ''}`} />
            {processing ? 'PROCESSING' : 'NETWORK ACTIVE'}
          </div>
        </div>
      </div>

      {/* Emergency banner */}
      <AnimatePresence>
        {emergency && (
          <motion.div
            className="emergency-banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="banner-icon">🚨</span>
            <span className="banner-text">
              EMERGENCY BROADCAST — {emergency.type === 'medical'
                ? `Blood type ${emergency.bloodType} needed for ${emergency.petName} at ${emergency.location}`
                : `Lost ${emergency.petType}: ${emergency.petName} near ${emergency.lastSeenLocation}`
              }
            </span>
            {emergency.type === 'medical' && (
              <span className={`banner-urgency banner-urgency-${emergency.urgency}`}>
                {emergency.urgency.toUpperCase()}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3-panel layout + map */}
      <div className="main-content">
        <div className="panel panel-left">
          <EmergencyForm onSubmit={handleSubmit} disabled={processing} />
        </div>

        <div className="panel panel-center">
          <div className="map-section">
            <EmergencyMap
              phase={phase}
              matches={matches}
              showResults={showResults}
            />
          </div>
          <div className="ai-section">
            <AIProcessingFeed
              steps={aiSteps}
              active={processing}
              onPhaseChange={handlePhaseChange}
              onComplete={handleProcessingComplete}
            />
          </div>
        </div>

        <div className="panel panel-right">
          <MatchResults
            matches={matches}
            visible={showResults}
            onSendAlert={handleSendAlert}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
