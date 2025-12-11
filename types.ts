export interface Participant {
  id: string;
  name: string;
  interests: string;
  specifiedReceiver?: string;
}

export interface Match {
  santa: Participant;
  receiver: Participant;
  isRevealed: boolean;
}

export interface GiftIdea {
  title: string;
  description: string;
  priceRange: string;
}

export enum AppStep {
  SETUP = 'SETUP',
  MATCHING = 'MATCHING',
  REVEAL = 'REVEAL'
}