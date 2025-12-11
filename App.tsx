import React, { useState, useRef, useEffect } from 'react';
import { Participant, Match, AppStep } from './types';
import { generateMatches } from './utils/matchingLogic';
import Snowfall from './components/Snowfall';
import { MatchRevealCard } from './components/MatchRevealCard';
import { Plus, Trash2, Gift, Users, Sparkles, ChevronRight, RotateCcw, CalendarClock, Lock, Star, UserPlus, Heart, Calendar, Clock, MapPin, Ticket, Gamepad2, Music, Trees, Candy, Shield, Copy, X, ListOrdered, RefreshCw, ExternalLink } from 'lucide-react';

const TARGET_DATE = new Date('2024-12-20T00:00:00');

// Decorative Background Component
const ChristmasDecorations = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Top Left - Santa Hat / Red Theme */}
    <div className="absolute top-10 -left-10 opacity-20 animate-float">
       <Gift className="w-48 h-48 text-berry" />
    </div>
    
    {/* Top Right - Tree */}
    <div className="absolute top-20 -right-10 opacity-20 animate-float" style={{ animationDelay: '2s' }}>
       <Trees className="w-56 h-56 text-holly" />
    </div>

    {/* Bottom Left - Candy */}
    <div className="absolute bottom-20 -left-10 opacity-20 animate-float" style={{ animationDelay: '1s' }}>
       <Candy className="w-40 h-40 text-gold rotate-45" />
    </div>

    {/* Bottom Right - Gifts */}
    <div className="absolute bottom-10 -right-5 opacity-20 animate-float" style={{ animationDelay: '3s' }}>
       <Gift className="w-48 h-48 text-berry" />
    </div>
    
    {/* Random sparkles */}
    <Star className="absolute top-1/4 left-1/4 w-8 h-8 text-gold opacity-30 animate-pulse" />
    <Star className="absolute top-1/3 right-1/4 w-6 h-6 text-white opacity-20 animate-pulse delay-700" />
    <Star className="absolute bottom-1/3 left-1/3 w-10 h-10 text-gold opacity-20 animate-pulse delay-1000" />
  </div>
);

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.SETUP);
  const [isEventReady, setIsEventReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  
  // Form state
  const [newName, setNewName] = useState('');
  const [newInterests, setNewInterests] = useState('');
  const [newSpecifiedReceiver, setNewSpecifiedReceiver] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedParticipants = localStorage.getItem('thaiAngelParticipants');
    const savedMatches = localStorage.getItem('thaiAngelMatches');
    const savedStep = localStorage.getItem('thaiAngelStep');

    if (savedParticipants) {
        try {
            setParticipants(JSON.parse(savedParticipants));
        } catch (e) {
            console.error("Failed to load participants");
        }
    }
    if (savedMatches) {
        try {
            setMatches(JSON.parse(savedMatches));
        } catch (e) {}
    }
    if (savedStep) {
        setCurrentStep(savedStep as AppStep);
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('thaiAngelParticipants', JSON.stringify(participants));
    localStorage.setItem('thaiAngelMatches', JSON.stringify(matches));
    localStorage.setItem('thaiAngelStep', currentStep);
  }, [participants, matches, currentStep]);

  // Timer Logic
  useEffect(() => {
    const checkTime = () => {
        const now = new Date();
        const diff = TARGET_DATE.getTime() - now.getTime();
        
        if (diff <= 0) {
            setIsEventReady(true);
            setTimeLeft("It's Time!");
        } else {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const addParticipant = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newName.trim() || !newInterests.trim()) return;

    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      interests: newInterests.trim(),
      specifiedReceiver: newSpecifiedReceiver.trim() || undefined
    };

    setParticipants([...participants, newParticipant]);
    setNewName('');
    setNewInterests('');
    setNewSpecifiedReceiver('');
    nameInputRef.current?.focus();
  };

  const removeParticipant = (id: string) => {
    if(window.confirm("Remove this person from the list?")) {
        setParticipants(participants.filter(p => p.id !== id));
    }
  };

  const handleGenerateMatches = () => {
    if (participants.length < 2) {
      alert("You need at least 2 participants to exchange gifts!");
      return;
    }
    if (!isEventReady) {
        if(!window.confirm("It is not Dec 20 yet! Are you sure you want to test the shuffle early?")) {
            return;
        }
    }

    const generated = generateMatches(participants);
    setMatches(generated);
    setCurrentStep(AppStep.MATCHING);
    
    setTimeout(() => {
        setCurrentStep(AppStep.REVEAL);
    }, 2000);
  };

  const resetApp = () => {
    if (window.confirm("Are you sure? This will return to the registration list.")) {
        setMatches([]);
        setCurrentStep(AppStep.SETUP);
    }
  };

  // Admin Functions
  const handleAdminAccess = () => {
    const pin = prompt("Enter Admin PIN (Default: 2512)");
    if (pin === "2512") {
        setShowAdmin(true);
    } else {
        alert("Incorrect PIN");
    }
  };

  const copyAdminResults = () => {
    const text = matches.map(m => `${m.santa.name} -> ${m.receiver.name} (Gift: ${m.receiver.interests})`).join('\n');
    navigator.clipboard.writeText(text);
    alert("Match list copied to clipboard!");
  };

  const adminReshuffle = () => {
    if(window.confirm("Warning: This will shuffle everyone again and lose current results. Proceed?")) {
        handleGenerateMatches();
        setShowAdmin(false);
    }
  };

  return (
    <div className="min-h-screen font-sans pb-12 relative overflow-x-hidden bg-black text-white">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop" 
          alt="Christmas Party Background" 
          className="w-full h-full object-cover opacity-60"
        />
        {/* Dark gradient overlay to ensure text readability against the busy photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60"></div>
      </div>

      <Snowfall />
      <ChristmasDecorations />

      {/* Header */}
      <header className="relative z-10 pt-16 pb-8 text-center px-4">
        
        <div className="mb-8 relative inline-block">
            {/* Main Title - Old London Font - HUGE */}
            <h1 className="text-6xl md:text-9xl font-old-london text-white drop-shadow-[0_5px_5px_rgba(212,36,38,0.8)] tracking-wide leading-none z-10 relative">
                Thai Angel’s
            </h1>
            
            {/* Sub Title - Christmas Font - Smaller but festive */}
            <div className="mt-2 relative">
                 <h2 className="text-4xl md:text-6xl font-holiday text-gold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] transform -rotate-2">
                    Secret Santa
                 </h2>
                 {/* Decorative Santa Hat on Title */}
                 <div className="absolute -top-6 -right-6 text-berry transform rotate-12 opacity-90 hidden md:block">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8 2 5 5 5 9C5 13 8 16 12 16C16 16 19 13 19 9C19 5 16 2 12 2ZM12 4C14.76 4 17 6.24 17 9C17 11.76 14.76 14 12 14C9.24 14 7 11.76 7 9C7 6.24 9.24 4 12 4Z" opacity="0.3"/>
                        <path d="M2 22H22V20C22 17 17 15 12 15C7 15 2 17 2 20V22Z" opacity="0.3" />
                         {/* Simple Santa Hat SVG shape */}
                        <path d="M14.5 3C15.8807 3 17 4.11929 17 5.5C17 6.88071 15.8807 8 14.5 8C13.1193 8 12 6.88071 12 5.5C12 4.11929 13.1193 3 14.5 3Z" fill="white"/>
                        <path d="M4 12C4 8 10 2 14 2L18 8C18 8 14 14 4 12Z" fill="#D42426"/>
                        <rect x="2" y="11" width="16" height="4" rx="2" fill="white"/>
                    </svg>
                 </div>
            </div>
        </div>

        {/* Header Countdown Timer */}
        {!isEventReady && (
            <div className="mt-4 flex justify-center animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="bg-black/80 backdrop-blur-md border border-gold rounded-2xl px-8 py-4 shadow-[0_0_20px_rgba(255,215,0,0.4)] flex items-center gap-4">
                    <Clock className="w-8 h-8 text-berry animate-bounce" />
                    <div className="flex flex-col">
                        <div className="text-gold font-mono text-3xl font-bold tracking-widest tabular-nums drop-shadow-sm">
                            {timeLeft || "Loading..."}
                        </div>
                        <div className="text-center text-[10px] uppercase tracking-[0.3em] text-white/70 font-sans">
                            Until Shuffle
                        </div>
                    </div>
                </div>
            </div>
        )}
      </header>

      <main className="container mx-auto px-4 max-w-4xl relative z-10">
        
        {currentStep === AppStep.SETUP && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Rules Banner - Red & Gold */}
            <div className="bg-gradient-to-r from-berry to-red-900 text-white p-1 rounded-2xl shadow-[0_0_20px_rgba(212,36,38,0.5)] transform hover:scale-[1.01] transition-transform">
                <div className="bg-black/20 p-6 rounded-xl flex flex-col items-center justify-center border border-white/10 relative overflow-hidden">
                     {/* Decorative Ribbons */}
                     <div className="absolute top-0 right-0 w-20 h-20 bg-gold/20 rotate-45 transform translate-x-10 -translate-y-10"></div>
                     <div className="absolute bottom-0 left-0 w-20 h-20 bg-holly/20 rotate-45 transform -translate-x-10 translate-y-10"></div>

                    <h2 className="text-3xl font-holiday font-bold mb-3 flex items-center justify-center gap-3 text-gold drop-shadow-md">
                        <Gift className="w-8 h-8 text-white" />
                        Important Gift Rule
                    </h2>
                    
                    <div className="flex flex-col items-center gap-2">
                        <span className="font-old-london text-4xl text-white tracking-wide border-b-2 border-gold pb-1">
                            Minimum 300 Baht
                        </span>
                        <span className="flex items-center gap-2 text-white/80 text-sm font-medium uppercase tracking-widest mt-2">
                            <Calendar className="w-4 h-4 text-gold" />
                            Shuffle Date: <span className="text-gold font-bold">Dec 20</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Registration Card - Black Glass with Gold Border */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl relative mt-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border-2 border-gold rounded-full p-3 shadow-lg z-10">
                  <UserPlus className="w-8 h-8 text-gold" />
              </div>

              <div className="mt-4 flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                {/* Changed font-holiday to font-bold (normal font) */}
                <h2 className="text-3xl font-bold text-holly flex items-center gap-2">
                    Registration
                </h2>
                <div className="text-sm font-bold text-gold bg-black/50 px-3 py-1 rounded-full border border-gold/30">
                    {participants.length} Angels Joined
                </div>
              </div>
              
              <form onSubmit={addParticipant} className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    {/* Inputs */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gold mb-2 ml-1">Your Name</label>
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter your name..."
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/30 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gold mb-2 ml-1">
                        Give Gift To <span className="text-white/40 font-normal lowercase">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={newSpecifiedReceiver}
                        onChange={(e) => setNewSpecifiedReceiver(e.target.value)}
                        placeholder="Specific person name..."
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/30 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gold mb-2 ml-1">
                         Gift Wishlist <span className="text-berry font-bold normal-case ml-2">( Min. 300 Baht )</span>
                      </label>
                      <input
                        type="text"
                        value={newInterests}
                        onChange={(e) => setNewInterests(e.target.value)}
                        placeholder="What do you want for Christmas?"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-white/30 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                      />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!newName.trim() || !newInterests.trim()}
                    className="w-full px-6 py-4 bg-gradient-to-r from-holly to-green-800 hover:from-green-600 hover:to-holly text-white font-bold rounded-xl shadow-[0_4px_15px_rgba(20,107,58,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg border border-green-400/30"
                  >
                    <Plus className="w-6 h-6" /> Add to List
                  </button>
              </form>

              {/* List */}
              {participants.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {participants.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group">
                      <div className="flex items-center gap-4">
                        {/* Removed font-holiday from index */}
                        <div className="w-10 h-10 rounded-full bg-berry text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-white/20 shrink-0">
                            {idx + 1}
                        </div>
                        <div className="min-w-0">
                            {/* Removed font-old-london from name, kept font-bold */}
                            <p className="font-bold text-lg text-white truncate tracking-wide">{p.name}</p>
                            <p className="text-sm text-gray-300 flex items-center gap-2 truncate">
                                <Gift className="w-3 h-3 text-gold shrink-0" /> <span className="text-white/60">Wants:</span> <span className="text-gold">{p.interests}</span>
                            </p>
                            {p.specifiedReceiver && (
                                <p className="text-xs text-berry flex items-center gap-1 mt-0.5 font-medium">
                                    <Heart className="w-3 h-3 fill-berry shrink-0" /> Target: {p.specifiedReceiver}
                                </p>
                            )}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeParticipant(p.id)}
                        className="p-2 text-white/30 hover:text-berry hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-white/30 bg-black/20 rounded-2xl border-2 border-dashed border-white/10">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    {/* Removed font-holiday */}
                    <p className="text-xl font-bold text-white/50 mb-2">The Nice List is Empty</p>
                    <p className="text-sm">Be the first Angel to join!</p>
                </div>
              )}
            </div>

            {/* Action Bar - MOVED HERE (Was below Event Invitation) */}
            <div className="flex flex-col items-center justify-center py-4 gap-4 mt-8">
                <button
                    onClick={handleGenerateMatches}
                    disabled={participants.length < 2}
                    className={`group relative px-10 py-5 text-white text-2xl font-bold font-holiday rounded-full shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-95 border-2 border-gold/50
                        ${isEventReady 
                            ? 'bg-gradient-to-r from-gold via-yellow-600 to-gold text-black hover:shadow-[0_0_50px_rgba(255,215,0,0.6)]' 
                            : 'bg-gray-900 cursor-not-allowed text-gray-500'}
                    `}
                >
                    <span className="flex items-center gap-3 relative z-10">
                        <Sparkles className={`w-6 h-6 ${isEventReady ? 'animate-pulse text-black' : 'text-gray-600'}`} />
                        {isEventReady ? "Shuffle All Names!" : "Locked until Dec 20"}
                        {isEventReady && <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                    </span>
                </button>
                
                {!isEventReady && participants.length >= 2 && (
                    <button 
                        onClick={() => setIsEventReady(true)}
                        className="text-white/10 text-[10px] hover:text-white/30 transition-colors mt-2 font-mono uppercase"
                    >
                        (Dev: Force Shuffle)
                    </button>
                )}
            </div>

            {/* Event Invitation Card */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-gold/40 mt-8 group transform hover:translate-y-1 transition-transform duration-500 mb-20">
                <div className="absolute inset-0 bg-black"></div>
                {/* Decorative background image overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-berry/20 blur-3xl rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-holly/20 blur-3xl rounded-full pointer-events-none"></div>
                
                <div className="relative p-8 text-center text-white z-10">
                    <div className="inline-block border-b-2 border-gold pb-2 mb-4">
                        {/* Removed font-old-london */}
                        <h3 className="text-3xl font-bold text-gold tracking-wide">
                            Thai Angel Presents
                        </h3>
                    </div>
                    {/* Removed font-holiday */}
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-8 drop-shadow-md">
                        Christmas Party & <br/><span className="text-berry">Secret Santa Gift Exchange</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Date */}
                        <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 border border-gold/20 flex flex-col items-center gap-3 group/item">
                             <div className="w-12 h-12 rounded-full bg-berry flex items-center justify-center text-white shadow-lg border-2 border-white/10 group-hover/item:scale-110 transition-transform">
                                <Calendar className="w-6 h-6" />
                             </div>
                             <div>
                                 <span className="block text-[10px] uppercase text-gold font-bold tracking-widest mb-1">Date</span>
                                 {/* Removed font-old-london */}
                                 <span className="text-2xl font-bold">December 25</span>
                             </div>
                        </div>

                        {/* Location */}
                         <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 border border-gold/20 flex flex-col items-center gap-3 md:col-span-1 group/item">
                             <div className="w-12 h-12 rounded-full bg-holly flex items-center justify-center text-white shadow-lg border-2 border-white/10 group-hover/item:scale-110 transition-transform">
                                <MapPin className="w-6 h-6" />
                             </div>
                             <div>
                                 <span className="block text-[10px] uppercase text-gold font-bold tracking-widest mb-1">Location</span>
                                 <span className="font-bold text-sm leading-tight block">Thai Angel Bar & Buds</span>
                                 <span className="text-xs text-gray-400 mt-1 block font-mono">Sukhumvit 48 Branch</span>
                                 {/* Added Location Link */}
                                 <a 
                                    href="https://maps.app.goo.gl/MZ8ztKtm2heToSiT9?g_st=ipc" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-gold text-xs font-bold uppercase mt-2 hover:underline hover:text-white transition-colors"
                                 >
                                    View Map <ExternalLink className="w-3 h-3" />
                                 </a>
                             </div>
                        </div>

                        {/* Time */}
                        <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 border border-gold/20 flex flex-col items-center gap-3 group/item">
                             <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-black shadow-lg border-2 border-white/10 group-hover/item:scale-110 transition-transform">
                                <Clock className="w-6 h-6" />
                             </div>
                             <div>
                                 <span className="block text-[10px] uppercase text-gold font-bold tracking-widest mb-1">Time</span>
                                 {/* Removed font-old-london */}
                                 <span className="text-2xl font-bold">9:00 PM</span>
                             </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="px-5 py-2 rounded-full bg-black/40 border border-gold/30 flex items-center gap-2 text-sm font-medium text-gold shadow-sm">
                            <Ticket className="w-4 h-4" /> Free Entry
                        </div>
                        <div className="px-5 py-2 rounded-full bg-black/40 border border-gold/30 flex items-center gap-2 text-sm font-medium text-gold shadow-sm">
                            <Gamepad2 className="w-4 h-4" /> Fun Game
                        </div>
                        <div className="px-5 py-2 rounded-full bg-black/40 border border-gold/30 flex items-center gap-2 text-sm font-medium text-gold shadow-sm">
                            <Music className="w-4 h-4" /> Live Music by DJ
                        </div>
                    </div>
                </div>
            </div>

          </div>
        )}

        {/* Loading Step */}
        {currentStep === AppStep.MATCHING && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="w-32 h-32 border-8 border-holly border-t-berry rounded-full animate-spin"></div>
                    <Gift className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold w-12 h-12" />
                </div>
                <h2 className="mt-8 text-4xl font-holiday font-bold text-gold text-center drop-shadow-md">Mixing the Names...</h2>
                <p className="text-white/60 mt-2 font-old-london text-xl">The Angels are choosing their assignments!</p>
            </div>
        )}

        {/* Reveal Step */}
        {currentStep === AppStep.REVEAL && (
            <div className="animate-in slide-in-from-right-8 duration-500 pb-20">
                 <div className="flex flex-col md:flex-row justify-between items-center mb-8 px-4 gap-4 bg-black/40 p-4 rounded-2xl backdrop-blur-sm border border-gold/30">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-holiday font-bold text-white drop-shadow-sm">Assignments Complete!</h2>
                        <p className="text-gold text-sm font-medium mt-1 flex items-center gap-1 justify-center md:justify-start">
                            <Star className="w-4 h-4 fill-gold" /> Remember: Minimum 300 Baht Gift
                        </p>
                    </div>
                    <button 
                        onClick={resetApp}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm text-sm font-bold flex items-center gap-2 transition-colors border border-white/20"
                    >
                        <RotateCcw className="w-4 h-4" /> Reset List
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {matches.map((match, idx) => (
                        <MatchRevealCard key={idx} match={match} />
                    ))}
                 </div>
                 
                 <div className="text-center mt-12 text-white/40 text-sm p-6 bg-black/40 rounded-xl max-w-md mx-auto border border-white/5">
                    <p>Tip: Click the card to flip it and reveal your Secret Santa assignment. Make sure nobody is looking over your shoulder!</p>
                 </div>
            </div>
        )}

      </main>

      {/* Footer / Admin Access */}
      <footer className="fixed bottom-0 w-full p-4 flex justify-center pointer-events-none z-40">
        <button 
            onClick={handleAdminAccess} 
            className="pointer-events-auto text-white/20 hover:text-gold flex items-center gap-2 text-xs font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm transition-colors border border-white/5 hover:border-gold/50"
        >
            <Shield className="w-3 h-3" /> Admin
        </button>
      </footer>

      {/* Admin Modal */}
      {showAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
             <div className="bg-black border-2 border-gold rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(255,215,0,0.2)]">
                <div className="flex justify-between items-center p-6 border-b border-gold/30 bg-white/5">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-gold" />
                        <div>
                            <h2 className="text-2xl font-old-london text-white">Master Match List</h2>
                            <p className="text-xs text-white/50 uppercase tracking-widest">Admin Eyes Only</p>
                        </div>
                    </div>
                    <button onClick={() => setShowAdmin(false)} className="text-white/50 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {matches.length > 0 ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 text-xs font-bold text-gold uppercase tracking-wider pb-2 border-b border-white/10 px-2">
                                <div className="col-span-4">Santa (Giver)</div>
                                <div className="col-span-1 text-center">➔</div>
                                <div className="col-span-4">Receiver</div>
                                <div className="col-span-3 text-right">Wishlist</div>
                            </div>
                            {matches.map((m, i) => (
                                <div key={i} className="grid grid-cols-12 items-center text-sm py-3 border-b border-white/5 hover:bg-white/5 px-2 rounded-lg transition-colors">
                                    <div className="col-span-4 font-bold text-berry">{m.santa.name}</div>
                                    <div className="col-span-1 text-center text-white/20">➔</div>
                                    <div className="col-span-4 font-bold text-holly">{m.receiver.name}</div>
                                    <div className="col-span-3 text-right text-gray-400 text-xs italic truncate">{m.receiver.interests}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-white/30">
                            <ListOrdered className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No matches generated yet.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gold/30 bg-white/5 flex justify-between items-center">
                    <button 
                        onClick={copyAdminResults}
                        disabled={matches.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium border border-white/10"
                    >
                        <Copy className="w-4 h-4" /> Copy List
                    </button>

                    <button 
                        onClick={adminReshuffle}
                        disabled={matches.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 rounded-lg transition-colors text-sm font-medium border border-red-900/50"
                    >
                        <RefreshCw className="w-4 h-4" /> Force Reshuffle
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default App;