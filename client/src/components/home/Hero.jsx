import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative bg-bg-primary overflow-hidden text-text-primary pt-24 pb-20 md:pt-28 md:pb-24 px-6 border-b border-border-light">
      
      {/* Background ambient gradient blobs (Right side) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 30, 0], 
            y: [0, -40, 0] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(79,111,255,0.15),transparent_60%)] blur-[80px]"
        ></motion.div>
        
        <motion.div 
          animate={{ 
            x: [0, -40, 0], 
            y: [0, 50, 0] 
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] right-[25%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(145,70,232,0.12),transparent_60%)] blur-[70px]"
        ></motion.div>
        
        <motion.div 
          animate={{ 
            x: [0, 50, 0], 
            y: [0, -20, 0] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,75,207,0.12),transparent_60%)] blur-[100px]"
        ></motion.div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Side: Content */}
        <div className="md:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-3 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-sm font-bold text-gradient tracking-[0.2em] uppercase">SAP • ERP • STAFFING</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="text-[40px] md:text-5xl lg:text-[64px] font-bold leading-[1.1] mb-6 tracking-tight text-bg-navy"
          >
            Empowering Businesses With the Right People and <span className="text-gradient">Technology</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.22 }}
            className="text-lg md:text-xl text-text-secondary mb-10 max-w-xl leading-relaxed"
          >
            Enterprise SAP expertise, skilled professionals, and business-focused ERP solutions designed to help you run smarter and scale faster.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.34 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/contact" className="btn-primary px-8 py-4 text-center text-lg">
              Talk to an Expert
            </Link>
            <a href="#services" className="btn-secondary px-8 py-4 text-center text-lg group flex items-center justify-center gap-2">
              Explore Our Services
              <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </motion.div>
        </div>
        
        {/* Right Side: Visual Ecosystem */}
        <div className="md:col-span-6 hidden md:block relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.18 }}
            className="relative w-full aspect-square flex items-center justify-center"
          >
            {/* Very subtle grid and geometric curves in background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNFMUU0RUEiLz48L3N2Zz4=')] opacity-50 [mask-image:radial-gradient(circle_at_center,black_30%,transparent_70%)]"></div>
            <div className="absolute inset-0 rounded-full border border-border-light/50 scale-[0.8] opacity-60"></div>
            <div className="absolute inset-0 rounded-full border border-border-light/30 scale-[1.1] opacity-40"></div>

            {/* Floating Visual Elements */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-full"
            >
              {/* Main Enterprise Image */}
              <div className="relative overflow-hidden rounded-[2rem] shadow-surface-hover">
                <img 
                  src="/images/hero-connected-sap.png" 
                  alt="Enterprise Technology Hub" 
                  className="w-full h-auto object-cover transform scale-[1.02]" 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-bg-navy/10 to-transparent mix-blend-multiply"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
