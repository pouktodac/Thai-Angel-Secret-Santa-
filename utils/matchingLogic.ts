import { Participant, Match } from '../types';

export const generateMatches = (participants: Participant[]): Match[] => {
  if (participants.length < 2) return [];

  // Fisher-Yates shuffle
  const shuffled = [...participants];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Create a circular chain: A -> B -> C -> A
  // This ensures everyone gives one gift and receives one gift, and no one matches themselves.
  const matches: Match[] = shuffled.map((santa, index) => {
    const receiver = shuffled[(index + 1) % shuffled.length];
    return {
      santa,
      receiver,
      isRevealed: false
    };
  });

  return matches;
};