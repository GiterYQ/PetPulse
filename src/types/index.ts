export type EmergencyType = 'medical' | 'lost';
export type UrgencyLevel = 'low' | 'medium' | 'critical';
export type MatchStatus = 'available' | 'alerted' | 'responding';

export interface MedicalEmergency {
  type: 'medical';
  petName: string;
  bloodType: string;
  location: string;
  urgency: UrgencyLevel;
}

export interface LostPetEmergency {
  type: 'lost';
  petName: string;
  petType: 'dog' | 'cat';
  lastSeenLocation: string;
  description: string;
}

export type Emergency = MedicalEmergency | LostPetEmergency;

export interface MatchedPet {
  id: string;
  name: string;
  breed: string;
  distance: number;
  bloodType: string;
  bloodMatch: boolean;
  available: boolean;
  trustScore: number;
  status: MatchStatus;
  x: number;
  y: number;
  ownerName: string;
}

export interface AIStep {
  phase: number;
  label: string;
  detail: string;
  duration: number;
}
