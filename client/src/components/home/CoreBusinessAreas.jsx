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
    <section className="py-32 bg-bg-secondary px-6 border-b border-border/50">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <div className="max-w-2xl">
              <div className="text-primary font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                <span className="w-8 h-px bg-primary"></span>
                Core Capabilities
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">What We Do</h2>
              <p className="text-xl text-text-secondary leading-relaxed">
                Comprehensive enterprise solutions spanning people, processes, and technology.
              </p>
            </div>
            <a href="#services" className="text-primary-bright font-semibold hover:text-white transition-colors flex items-center gap-2 group">
              View All Services <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </Reveal>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {areas.map((area, idx) => (
            <StaggerItem key={idx}>
              <Link to={area.link} className="block group h-full">
                <div className="relative rounded-2xl overflow-hidden h-[400px] flex flex-col justify-end p-8 border border-border/50 hover:border-primary/50 transition-all duration-500 shadow-surface group-hover:-translate-y-2 group-hover:shadow-glow-strong">
                  
                  {/* Background Image */}
                  <img 
                    src={area.image} 
                    alt={area.title} 
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/90 to-transparent"></div>
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>

                  {/* Content */}
                  <div className="relative z-10 mt-auto">
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-primary-bright transition-colors">
                      {area.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed mb-6">
                      {area.desc}
                    </p>
                    <div className="text-primary font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                      Learn more <span aria-hidden="true">→</span>
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
