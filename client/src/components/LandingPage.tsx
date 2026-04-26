import React from 'react';
import { motion } from 'framer-motion';
import { Move, MessageSquare, User, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-32 pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase mb-2">
            YOUR VIRTUAL OFFICE,
          </h1>
          <h2 className="text-6xl md:text-7xl font-black tracking-tighter uppercase text-emerald-500 mb-8">
            REIMAGINED
          </h2>
          <p className="max-w-2xl mx-auto text-slate-400 text-sm md:text-base font-mono leading-relaxed mb-12">
            Experience proximity-based real-time collaboration in a 
            seamless 2D shared space. Connect naturally, just like in the 
            real world.
          </p>
          
          <button
            onClick={onGetStarted}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-12 py-4 text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 mx-auto shadow-2xl shadow-emerald-500/20"
          >
            GET STARTED <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-32">
        <FeatureCard 
          icon={<Move className="w-6 h-6 text-emerald-500" />}
          title="Dynamic Movement"
          description="Navigate the office freely using WASD or arrows."
        />
        <FeatureCard 
          icon={<MessageSquare className="w-6 h-6 text-emerald-500" />}
          title="Proximity Chat"
          description="Automatic chat established when you walk near peers."
        />
        <FeatureCard 
          icon={<User className="w-6 h-6 text-emerald-500" />}
          title="Persistent Profiles"
          description="Create your identity and pick your custom avatar."
        />
      </div>

      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10 opacity-20">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-[#0A0A0A] border border-white/5 p-8 rounded-sm group hover:border-emerald-500/30 transition-all"
  >
    <div className="w-12 h-12 bg-white/5 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
      {icon}
    </div>
    <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-2">{title}</h3>
    <p className="text-xs text-slate-500 leading-relaxed font-mono">{description}</p>
  </motion.div>
);
