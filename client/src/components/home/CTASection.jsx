import { Link } from 'react-router-dom';
import Reveal from '../animations/Reveal';

const CTASection = () => {
  return (
    <section className="relative py-32 bg-gradient-to-br from-bg-navy via-primary-dark to-accent-violet/50 overflow-hidden px-6">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-primary/20 rounded-full blur-[150px] opacity-40 pointer-events-none"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center text-white">
        <Reveal>
          <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-transparent via-primary-light to-transparent mb-8">
            <div className="px-4 py-1.5 rounded-full bg-bg-navy border border-primary/30 text-xs font-semibold uppercase tracking-widest text-primary-light">
              Start Your Project
            </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white">Ready to transform your <span className="text-gradient-subtle">business?</span></h2>
          <p className="text-xl text-primary-light/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Whether you need immediate SAP support, expert staffing, or a custom ERP build, our team is ready to deliver measurable results.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/contact" className="btn-primary px-8 py-4 text-lg border border-primary-light/10">
              Contact Us Today
            </Link>
            <a href="mailto:info@dycinfo.com" className="bg-transparent border border-white/50 text-white hover:bg-white hover:text-bg-navy rounded-lg font-semibold transition-all duration-300 px-8 py-4 text-lg">
              Email info@dycinfo.com
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CTASection;
