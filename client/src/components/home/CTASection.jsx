import { Link } from 'react-router-dom';
import Reveal from '../animations/Reveal';

const CTASection = () => {
  return (
    <section className="relative py-32 bg-bg-primary overflow-hidden px-6 border-t border-border/50">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-primary/20 rounded-full blur-[150px] opacity-30 pointer-events-none"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center text-text-primary">
        <Reveal>
          <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-transparent via-primary to-transparent mb-8">
            <div className="px-4 py-1.5 rounded-full bg-surface border border-border text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Start Your Project
            </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Ready to transform your <span className="text-primary-bright">business?</span></h2>
          <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
            Whether you need immediate SAP support, expert staffing, or a custom ERP build, our team is ready to deliver measurable results.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/contact" className="btn-primary px-8 py-4 text-lg">
              Contact Us Today
            </Link>
            <a href="mailto:info@dycinfo.com" className="btn-secondary px-8 py-4 text-lg">
              Email info@dycinfo.com
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CTASection;
