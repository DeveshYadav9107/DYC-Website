import { Link } from 'react-router-dom';
import Reveal from '../animations/Reveal';

const CTASection = () => {
  return (
    <section className="relative py-24 sm:py-32 bg-[#103728] overflow-hidden px-4 sm:px-6 lg:px-8 border-t border-[#174B39]">
      {/* Background warm ambient glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-[#174B39] rounded-full blur-[140px] opacity-40"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B88A3B]/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center text-white">
        <Reveal>
          <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-transparent via-[#B88A3B]/50 to-transparent mb-8">
            <div className="px-4 py-1.5 rounded-full bg-[#174B39] border border-[#B88A3B]/40 text-xs font-semibold uppercase tracking-widest text-[#D7B875]">
              Start Your Enterprise Project
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6 tracking-tight !text-white leading-[1.15]">
            Ready to Transform Your <span className="text-[#D7B875] italic">Business?</span>
          </h2>
          <p className="text-lg sm:text-xl text-[#EAF0E8]/90 mb-12 max-w-2xl mx-auto leading-relaxed font-sans">
            Whether you need immediate SAP support, expert staffing, or a custom ERP build, our team is ready to deliver measurable results.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/contact"
              className="bg-[#B88A3B] hover:bg-[#9E742D] text-white px-8 py-4 rounded-full text-base sm:text-lg font-semibold shadow-[0_4px_20px_rgba(184,138,59,0.3)] transition-all duration-300"
            >
              Discuss Your Requirements
            </Link>
            <a
              href="mailto:info@dycinfo.com"
              className="bg-transparent border border-[#E7E0D3]/40 text-white hover:bg-white hover:text-[#103728] rounded-full font-semibold transition-all duration-300 px-8 py-4 text-base sm:text-lg"
            >
              Email info@dycinfo.com
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CTASection;
