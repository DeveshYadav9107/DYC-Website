import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Reveal from '../animations/Reveal';
import { StaggerContainer, StaggerItem } from '../animations/Stagger';

const Hero = () => {
  return (
    <section className="relative bg-bg-primary overflow-hidden text-text-primary pt-32 pb-32 px-6 min-h-[90vh] flex items-center border-b border-border/50">
      {/* Background ambient glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary-dark/20 blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
        {/* Subtle grid pattern for technical feel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Enterprise SAP Partner</span>
            </div>
          </Reveal>
          
          <Reveal delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              Empowering Businesses With the Right <span className="text-gradient">People</span> and <span className="text-primary-bright">Technology</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl leading-relaxed">
              Enterprise SAP expertise, skilled professionals, and business-focused ERP solutions designed to help you run smarter and scale faster.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="btn-primary px-8 py-4 text-center">
                Talk to an Expert
              </Link>
              <a href="#services" className="btn-secondary px-8 py-4 text-center">
                Explore Our Services
              </a>
            </div>
          </Reveal>
        </div>
        
        <div className="md:col-span-5 hidden md:block relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="glass-panel p-6 shadow-2xl relative"
          >
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50 rounded-xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4 relative z-10">
               <div className="text-lg font-semibold tracking-tight text-white">Business Value</div>
               <div className="flex gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-border-light"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-border-light"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-primary/80"></div>
               </div>
            </div>
            
            <StaggerContainer delayOffset={0.6} className="space-y-4 relative z-10">
              <StaggerItem className="flex items-center gap-4 bg-bg-secondary p-4 rounded-lg border border-border/50 group hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded bg-surface border border-border flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">👥</div>
                <div>
                  <div className="font-semibold text-white">Skilled Manpower</div>
                  <div className="text-xs text-text-muted">Contract & Full-time IT Staffing</div>
                </div>
              </StaggerItem>
              
              <StaggerItem className="flex items-center gap-4 bg-bg-secondary p-4 rounded-lg border border-border/50 group hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded bg-surface border border-border flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">⚙️</div>
                <div>
                  <div className="font-semibold text-white">SAP Resources</div>
                  <div className="text-xs text-text-muted">Functional & Technical Consultants</div>
                </div>
              </StaggerItem>
              
              <StaggerItem className="flex items-center gap-4 bg-bg-secondary p-4 rounded-lg border border-border/50 group hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded bg-surface border border-border flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">💻</div>
                <div>
                  <div className="font-semibold text-white">ERP Solutions</div>
                  <div className="text-xs text-text-muted">Custom Software & Automations</div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
