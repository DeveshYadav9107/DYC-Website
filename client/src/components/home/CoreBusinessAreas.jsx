import { Link } from 'react-router-dom';
import Reveal from '../animations/Reveal';
import { StaggerContainer, StaggerItem } from '../animations/Stagger';

const CoreBusinessAreas = () => {
  const areas = [
    {
      title: 'Manpower Supply',
      desc: 'Skilled IT and non-IT professionals for contract and permanent roles.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      link: '/services/staffing',
    },
    {
      title: 'SAP Resources',
      desc: 'Expert functional and technical SAP consultants for your projects.',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      link: '/services/sap-resources',
    },
    {
      title: 'SAP Support',
      desc: 'Comprehensive AMS, migration, and optimization services.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      link: '/services/sap-support',
    },
    {
      title: 'ERP Solutions',
      desc: 'Custom-built software for payroll, sales, and business trackability.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      link: '/services/erp-solutions',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#F8F5EE] px-4 sm:px-6 lg:px-8 border-b border-[#E7E0D3]">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-20 gap-6">
            <div className="max-w-2xl">
              <div className="text-[#B88A3B] font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2.5">
                <span className="w-8 h-px bg-[#B88A3B]"></span>
                Core Capabilities
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#252720] mb-4 tracking-tight">
                What We Do
              </h2>
              <p className="text-lg md:text-xl text-[#66665D] leading-relaxed">
                Comprehensive enterprise solutions spanning people, processes, and technology.
              </p>
            </div>
            <a 
              href="#services" 
              className="text-[#174B39] font-bold hover:text-[#103728] transition-colors flex items-center gap-2 group text-base"
            >
              <span>View All Services</span> 
              <span aria-hidden="true" className="group-hover:translate-x-1.5 transition-transform text-[#B88A3B]">→</span>
            </a>
          </div>
        </Reveal>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {areas.map((area, idx) => (
            <StaggerItem key={idx}>
              <Link to={area.link} className="block group h-full">
                <div className="relative rounded-2xl overflow-hidden h-[420px] flex flex-col justify-end p-7 sm:p-8 border border-[#E7E0D3] hover:border-[#174B39]/50 transition-all duration-500 shadow-[0_4px_20px_rgba(37,39,32,0.04)] group-hover:-translate-y-2 group-hover:shadow-[0_12px_32px_rgba(23,75,57,0.1)] bg-white">
                  
                  {/* Background Image */}
                  <img 
                    src={area.image} 
                    alt={area.title} 
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-1000"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-transparent"></div>
                  <div className="absolute inset-0 bg-[#174B39]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply"></div>

                  {/* Content */}
                  <div className="relative z-10 mt-auto">
                    <span className="text-[11px] font-bold text-[#B88A3B] uppercase tracking-wider mb-2 block">
                      Enterprise Practice
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-[#252720] mb-2.5 tracking-tight group-hover:text-[#174B39] transition-colors">
                      {area.title}
                    </h3>
                    <p className="text-[#66665D] text-sm sm:text-base leading-relaxed mb-5">
                      {area.desc}
                    </p>
                    <div className="text-[#174B39] font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                      <span>Learn more</span> 
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

export default CoreBusinessAreas;
