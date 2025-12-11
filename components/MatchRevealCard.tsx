import React, { useState } from 'react';
import { Match, GiftIdea } from '../types';
import { getGiftSuggestions, generateFestiveGreeting } from '../services/geminiService';
import { GiftCard } from './GiftCard';
import { Gift, Loader2, Wand2, Eye, EyeOff } from 'lucide-react';

interface MatchRevealCardProps {
  match: Match;
}

export const MatchRevealCard: React.FC<MatchRevealCardProps> = ({ match }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [ideas, setIdeas] = useState<GiftIdea[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState<string>("");

  const handleReveal = async () => {
    setIsRevealed(!isRevealed);
    if (!isRevealed && !greeting) {
        // Fetch greeting on first reveal only
        generateFestiveGreeting(match.santa.name).then(setGreeting);
    }
  };

  const fetchIdeas = async () => {
    setLoading(true);
    const suggestions = await getGiftSuggestions(match.receiver.name, match.receiver.interests);
    setIdeas(suggestions);
    setLoading(false);
  };

  return (
    <div className="perspective-1000 w-full max-w-md mx-auto mb-6 h-[500px]">
      <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isRevealed ? 'rotate-y-180' : ''}`}>
        
        {/* FRONT CARD (Unrevealed) */}
        <div className="absolute inset-0 glass-panel rounded-2xl p-6 backface-hidden flex flex-col items-center justify-between z-10">
            <div className="w-full text-center">
                <h3 className="font-holiday text-2xl text-holly font-bold mb-2">
                    Gift For: <span className="text-berry">{match.santa.name}</span>
                </h3>
                <p className="text-gray-500 text-sm">Your secret assignment awaits...</p>
            </div>

            <button 
                onClick={handleReveal}
                className="group flex flex-col items-center justify-center p-8 bg-berry/5 rounded-full hover:bg-berry/10 transition-colors cursor-pointer"
            >
                <div className="relative">
                    <Gift className="w-20 h-20 text-berry mb-4 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold rounded-full animate-bounce" />
                </div>
                <span className="text-berry font-bold text-lg">Tap to Reveal</span>
            </button>

             <div className="text-center text-xs text-gray-400">
                <p>Ensure no one is peeking!</p>
            </div>
        </div>

        {/* BACK CARD (Revealed) */}
        <div className="absolute inset-0 glass-panel rounded-2xl p-6 backface-hidden rotate-y-180 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <h3 className="font-holiday text-xl text-gray-600">Your Match</h3>
                <button 
                    onClick={(e) => { e.stopPropagation(); handleReveal(); }}
                    className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-xs uppercase font-bold tracking-wider"
                >
                    <EyeOff className="w-4 h-4" /> Hide
                </button>
            </div>

            <div className="animate-in fade-in zoom-in duration-500 delay-150">
                <div className="text-center mb-6">
                    <p className="text-sm italic text-gray-500 mb-2 min-h-[1.5em]">{greeting}</p>
                    <p className="text-gray-600 text-sm font-medium uppercase tracking-wide mb-1">You are buying a gift for:</p>
                    <div className="text-4xl font-holiday font-bold text-berry mb-2 drop-shadow-sm">{match.receiver.name}</div>
                    
                    <div className="bg-yellow-50 inline-block px-4 py-2 rounded-xl border border-yellow-200 shadow-sm mt-2 max-w-full">
                        <p className="text-xs text-yellow-800 font-bold uppercase tracking-wide mb-1">Their Wishlist</p>
                        <p className="text-sm text-gray-800 font-medium">
                           {match.receiver.interests}
                        </p>
                    </div>
                </div>

                {/* AI Action Section */}
                {!ideas ? (
                    <button
                        onClick={fetchIdeas}
                        disabled={loading}
                        className="w-full py-3 bg-holly hover:bg-green-800 text-white rounded-xl font-medium shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                        {loading ? "Thinking..." : "Get Gift Ideas"}
                    </button>
                ) : (
                    <div className="space-y-3 mt-4">
                         <h4 className="font-holiday text-lg text-gray-700 flex items-center gap-2">
                            <Wand2 className="w-4 h-4 text-gold" /> AI Suggestions:
                         </h4>
                        {ideas.map((idea, idx) => (
                            <GiftCard key={idx} idea={idea} />
                        ))}
                        <button 
                            onClick={() => setIdeas(null)}
                            className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
                        >
                            Reset suggestions
                        </button>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};