import { Link } from 'react-router-dom';
import siteConfig from '../../config/siteConfig';
import Reveal from '../../components/animations/Reveal';
import { StaggerContainer, StaggerItem } from '../../components/animations/Stagger';

const AboutPage = () => {
  return (
    <div className="bg-[#F8F5EE] min-h-screen text-[#252720]">
      {/* Header */}
      <div className="bg-[#F8F5EE] text-[#252720] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-[#E7E0D3]">
        
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0 opacity-15">
          <img src="/images/about-banner.png" alt="About DY&C" className="w-full h-full object-cover object-center" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8F5EE] via-[#F8F5EE]/90 to-transparent z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10 pt-4 sm:pt-6">
          <Reveal>
            <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#EAF0E8] border border-[#174B39]/20 text-[#174B39] text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#B88A3B]"></span>
                  <span>About DY&C</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold mb-6 tracking-tight text-[#252720]">
                  Enterprise Consulting With a <span className="text-[#174B39] italic">Disciplined</span> Edge
                </h1>
                <p className="text-lg sm:text-xl text-[#66665D] leading-relaxed max-w-xl font-sans">
                  {siteConfig.company.description}
                </p>
              </div>
              
              <div className="bg-[#FDFBF7] p-8 rounded-2xl border border-[#E7E0D3] shadow-[0_8px_30px_rgba(37,39,32,0.04)] hidden md:block">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B88A3B] block mb-2">Our Executive Commitment</span>
                <h3 className="text-xl font-serif font-bold text-[#252720] mb-4">Bridging Strategy and System Execution</h3>
                <p className="text-[#66665D] leading-relaxed text-sm sm:text-base">
                  We bridge the gap between exceptional talent and transformative technology. Our goal is to empower enterprises to scale efficiently through world-class SAP integration, innovative ERP solutions, and strategic staffing tailored to your operational realities.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Story & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="grid md:grid-cols-2 gap-14 sm:gap-16 items-center">
          <Reveal>
            <div>
              <div className="text-[#B88A3B] font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2.5">
                <span className="w-8 h-px bg-[#B88A3B]"></span>
                Our Origin
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#252720] mb-6 tracking-tight">
                Our Story
              </h2>
              <p className="text-[#66665D] mb-6 leading-relaxed text-base sm:text-lg">
                Founded on the principle that technology should drive measurable business value, DY&C has grown into a trusted partner for enterprises navigating complex digital transformations.
              </p>
              <p className="text-[#66665D] mb-8 leading-relaxed text-base sm:text-lg">
                With over {siteConfig.metrics.yearsExperience.value} years of excellence, we bridge the gap between business strategy and IT execution. Whether it's sourcing the right SAP consultant, managing an S/4HANA migration, or building custom ERP software from the ground up, we bring deep industry expertise to every engagement.
              </p>
              <Link to="/contact" className="btn-secondary px-6 py-3 text-sm sm:text-base font-semibold">
                Work With Us
              </Link>
            </div>
          </Reveal>
          
          <Reveal delay={0.2}>
            <div className="relative group">
              <div className="absolute inset-0 bg-[#174B39]/10 rounded-2xl transform translate-x-3 translate-y-3 blur-xs transition-all duration-500"></div>
              <div className="relative rounded-2xl overflow-hidden border border-[#E7E0D3] shadow-[0_12px_36px_rgba(23,75,57,0.08)] bg-white p-2">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="DYC Team Collaboration" 
                  className="rounded-xl w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Values */}
      <div className="bg-[#FDFBF7] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-y border-[#E7E0D3]">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16 sm:mb-20">
              <div className="text-[#B88A3B] font-bold uppercase tracking-widest text-xs mb-3 flex items-center justify-center gap-2.5">
                <span className="w-8 h-px bg-[#B88A3B]"></span>
                Guiding Principles
                <span className="w-8 h-px bg-[#B88A3B]"></span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#252720] mb-4 tracking-tight">
                Our Core Values
              </h2>
              <p className="text-lg md:text-xl text-[#66665D] max-w-2xl mx-auto leading-relaxed">
                The principles that guide our consultants, developers, and leadership team every day.
              </p>
            </div>
          </Reveal>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Client Partnership',
                desc: "We don't just act as vendors; we integrate with your team to deeply understand and solve your business challenges.",
                image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80'
              },
              {
                title: 'Excellence in Execution',
                desc: 'From a single staffing placement to a massive SAP rollout, we commit to the highest standards of quality.',
                image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80'
              },
              {
                title: 'Continuous Innovation',
                desc: 'Technology evolves rapidly. We constantly upskill our teams to bring you the latest in cloud, ERP, and automation.',
                image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80'
              }
            ].map((val, idx) => (
              <StaggerItem key={idx}>
                <div className="block group h-full">
                  <div className="relative rounded-2xl overflow-hidden h-[390px] flex flex-col justify-end p-7 sm:p-8 border border-[#E7E0D3] shadow-[0_4px_20px_rgba(37,39,32,0.04)] transition-all duration-500 hover:shadow-[0_12px_32px_rgba(23,75,57,0.12)] cursor-default group-hover:-translate-y-2 group-hover:border-[#174B39]/40 bg-white">
                    
                    {/* Background Image */}
                    <img
                      src={val.image}
                      alt={val.title}
                      className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-1000"
                    />
                    
                    {/* Gradient Overlay Base */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-transparent group-hover:opacity-0 transition-opacity duration-300 z-0"></div>

                    {/* Content Base State */}
                    <div className="relative z-10 mt-auto group-hover:opacity-0 transition-opacity duration-300">
                      <h3 className="text-2xl font-serif font-bold text-[#252720] mb-2.5 tracking-tight">
                        {val.title}
                      </h3>
                      <p className="text-[#66665D] text-sm sm:text-base leading-relaxed line-clamp-3">
                        {val.desc}
                      </p>
                    </div>

                    {/* Hover Overlay State: Deep Forest Green with Gold Header */}
                    <div className="absolute inset-0 bg-[#103728]/95 text-white p-7 sm:p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end z-20 backdrop-blur-xs">
                      <h4 className="text-2xl font-serif font-bold mb-3 tracking-tight text-[#D7B875]">{val.title}</h4>
                      <p className="text-[#EAF0E8] leading-relaxed text-base">{val.desc}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>

      {/* CTA */}
      <div className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center bg-[#F8F5EE]">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#252720] mb-5 tracking-tight">
            Ready to Work With Us?
          </h2>
          <p className="text-lg md:text-xl text-[#66665D] max-w-2xl mx-auto mb-10 leading-relaxed">
            Join the growing list of enterprises that trust DYC for their SAP, staffing, and software needs.
          </p>
          <Link to="/contact" className="btn-primary inline-block px-8 py-4 text-base sm:text-lg font-semibold">
            Contact Our Team
          </Link>
        </Reveal>
      </div>
    </div>
  );
};

export default AboutPage;
