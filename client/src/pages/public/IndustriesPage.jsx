import { Link } from 'react-router-dom';
import IndustriesGrid from '../../components/home/IndustriesGrid';
import Reveal from '../../components/animations/Reveal';
import { FiCheck } from 'react-icons/fi';

const IndustriesPage = () => {
  return (
    <div className="bg-[#F8F5EE] min-h-screen text-[#252720]">
      {/* Header */}
      <div className="bg-[#F8F5EE] text-[#252720] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-[#E7E0D3]">
        <div className="max-w-7xl mx-auto text-center relative z-10 pt-4 sm:pt-6">
          <Reveal>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#B88A3B]"></span>
              <span>Vertical Solutions</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6 tracking-tight text-[#252720]">
              Industries We <span className="text-[#174B39] italic">Serve</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#66665D] max-w-2xl mx-auto leading-relaxed font-sans">
              Our ERP solutions, SAP expertise, and specialized staffing services are tailored to meet the strict demands of diverse sectors.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Industries Grid */}
      <div>
        <IndustriesGrid />
      </div>

      {/* Deep Dive Section */}
      <div className="bg-[#FDFBF7] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-y border-[#E7E0D3]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 sm:gap-16 items-center">
            <Reveal>
              <div>
                <div className="text-[#B88A3B] font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2.5">
                  <span className="w-8 h-px bg-[#B88A3B]"></span>
                  Domain Expertise
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#252720] mb-8 tracking-tight">
                  Why Industry Experience Matters
                </h2>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-[#EAF0E8] border border-[#174B39]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <FiCheck className="text-xs text-[#174B39]" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#252720] group-hover:text-[#174B39] transition-colors">Regulatory Compliance</h3>
                      <p className="text-[#66665D] mt-1 text-sm sm:text-base leading-relaxed">We understand the specific compliance, security, and audit requirements of sectors like Healthcare and Finance.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-[#EAF0E8] border border-[#174B39]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <FiCheck className="text-xs text-[#174B39]" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#252720] group-hover:text-[#174B39] transition-colors">Custom Workflows</h3>
                      <p className="text-[#66665D] mt-1 text-sm sm:text-base leading-relaxed">Manufacturing supply chains operate differently than retail logistics. Our SAP consultants configure systems to match your reality.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-[#EAF0E8] border border-[#174B39]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <FiCheck className="text-xs text-[#174B39]" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#252720] group-hover:text-[#174B39] transition-colors">Niche Talent Sourcing</h3>
                      <p className="text-[#66665D] mt-1 text-sm sm:text-base leading-relaxed">Our staffing division knows exactly where to find professionals with specific industry-certified experience.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </Reveal>
            
            <Reveal delay={0.2}>
              <div className="bg-white border border-[#E7E0D3] shadow-[0_8px_30px_rgba(37,39,32,0.04)] rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden group hover:shadow-[0_16px_40px_rgba(23,75,57,0.1)] transition-all">
                 <div className="text-5xl mb-6 relative z-10">🏛️</div>
                 <span className="text-xs font-bold uppercase tracking-widest text-[#B88A3B] block mb-2">Custom Engagement</span>
                 <h3 className="text-2xl font-serif font-bold text-[#252720] mb-4 relative z-10">Don't See Your Industry?</h3>
                 <p className="text-[#66665D] mb-8 relative z-10 leading-relaxed text-sm sm:text-base">
                   Our core technology solutions are highly adaptable. We have proven experience solving operational challenges across specialized domains.
                 </p>
                 <Link to="/contact" className="btn-primary inline-block px-8 py-3.5 relative z-10 text-sm sm:text-base font-semibold">
                   Discuss Your Requirements
                 </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustriesPage;
