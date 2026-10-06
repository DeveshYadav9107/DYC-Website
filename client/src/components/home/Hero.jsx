import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative bg-primary-900 overflow-hidden text-white pt-24 pb-32 px-6">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-primary-800 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] rounded-full bg-accent-600 opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Empowering Businesses With the Right <span className="text-accent-300">People</span> and <span className="text-accent-300">Technology</span>
          </h1>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl leading-relaxed">
            Enterprise SAP expertise, skilled professionals, and business-focused ERP solutions designed to help you run smarter and scale faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/contact" className="bg-accent-500 hover:bg-accent-400 text-white px-8 py-4 rounded shadow-lg font-bold text-center transition">
              Talk to an Expert
            </Link>
            <a href="#services" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded font-bold text-center transition backdrop-blur-sm">
              Explore Our Services
            </a>
          </div>
        </div>
        
        <div className="md:col-span-5 hidden md:block relative">
          <div className="glass-dark p-6 rounded-xl shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
               <div className="text-xl font-bold">Business Value</div>
               <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded border border-white/5">
                <div className="w-10 h-10 rounded bg-accent-500/20 text-accent-300 flex items-center justify-center text-xl">👥</div>
                <div>
                  <div className="font-bold text-lg">Skilled Manpower</div>
                  <div className="text-sm text-primary-200">Contract & Full-time IT Staffing</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded border border-white/5">
                <div className="w-10 h-10 rounded bg-blue-500/20 text-blue-300 flex items-center justify-center text-xl">⚙️</div>
                <div>
                  <div className="font-bold text-lg">SAP Resources</div>
                  <div className="text-sm text-primary-200">Functional & Technical Consultants</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded border border-white/5">
                <div className="w-10 h-10 rounded bg-green-500/20 text-green-300 flex items-center justify-center text-xl">💻</div>
                <div>
                  <div className="font-bold text-lg">ERP Solutions</div>
                  <div className="text-sm text-primary-200">Custom Software & Automations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
