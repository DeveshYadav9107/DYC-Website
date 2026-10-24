import { Link } from 'react-router-dom';
import Reveal from '../animations/Reveal';
import { StaggerContainer, StaggerItem } from '../animations/Stagger';

const IndustriesGrid = () => {
  const industries = [
    { name: 'Manufacturing', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', desc: 'Optimize supply chains and production planning.' },
    { name: 'Retail & FMCG', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80', desc: 'Streamline inventory and enhance customer experiences.' },
    { name: 'Healthcare', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80', desc: 'Secure data management and compliance tracking.' },
    { name: 'Automotive', image: '/images/automotive.png', desc: 'Just-in-time manufacturing and dealer management.' },
    { name: 'Logistics', image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=800&q=80', desc: 'Real-time fleet tracking and warehouse management.' },
    { name: 'Finance', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', desc: 'Strict regulatory compliance and risk management.' },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#F8F5EE] px-4 sm:px-6 lg:px-8 relative border-b border-[#E7E0D3]">
      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="text-center mb-16 sm:mb-20">
            <div className="text-[#B88A3B] font-bold uppercase tracking-widest text-xs mb-3.5 inline-flex items-center gap-2.5">
              <span className="w-8 h-px bg-[#B88A3B]"></span>
              Sectors
              <span className="w-8 h-px bg-[#B88A3B]"></span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#252720] mb-4 tracking-tight">
              Industries We Serve
            </h2>
            <p className="text-lg md:text-xl text-[#66665D] max-w-2xl mx-auto leading-relaxed">
              Tailored enterprise solutions designed for the unique regulatory and operational challenges of your sector.
            </p>
          </div>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {industries.map((ind, idx) => (
            <StaggerItem key={idx}>
              <Link to="/industries" className="block group h-full">
                <div className="relative rounded-2xl overflow-hidden h-[420px] flex flex-col justify-end p-7 sm:p-8 border border-[#E7E0D3] hover:border-[#174B39]/50 transition-all duration-500 shadow-[0_4px_20px_rgba(37,39,32,0.04)] group-hover:-translate-y-2 group-hover:shadow-[0_12px_32px_rgba(23,75,57,0.1)] bg-white">

                  {/* Background Image */}
                  <img
                    src={ind.image}
                    alt={ind.name}
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-1000"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-transparent"></div>
                  <div className="absolute inset-0 bg-[#174B39]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply"></div>

                  {/* Content */}
                  <div className="relative z-10 mt-auto">
                    <span className="text-[11px] font-bold text-[#B88A3B] uppercase tracking-wider mb-2 block">
                      Enterprise Vertical
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-[#252720] mb-2.5 tracking-tight group-hover:text-[#174B39] transition-colors">
                      {ind.name}
                    </h3>
                    <p className="text-[#66665D] text-sm sm:text-base leading-relaxed mb-5">
                      {ind.desc}
                    </p>

                    <div className="text-[#174B39] font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                      <span>Explore</span> 
                      <span aria-hidden="true" className="text-[#B88A3B]">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default IndustriesGrid;
