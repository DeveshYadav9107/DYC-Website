import { Link } from 'react-router-dom';
import Reveal from '../animations/Reveal';
import { StaggerContainer, StaggerItem } from '../animations/Stagger';

const CoreBusinessAreas = () => {
  const areas = [
    {
      title: 'Manpower Supply',
      desc: 'Skilled IT and non-IT professionals for contract and permanent roles.',
      icon: '👥',
      link: '/services/staffing',
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'SAP Resources',
      desc: 'Expert functional and technical SAP consultants for your projects.',
      icon: '⚙️',
      link: '/services/sap-resources',
      color: 'bg-primary-bright/10 text-primary-bright',
    },
    {
      title: 'SAP Support',
      desc: 'Comprehensive AMS, migration, and optimization services.',
      icon: '🛠️',
      link: '/services/sap-support',
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'ERP Solutions',
      desc: 'Custom-built software for payroll, sales, and business trackability.',
      icon: '💻',
      link: '/services/erp-solutions',
      color: 'bg-primary-dark/10 text-primary-bright',
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
                <div className="glass-panel p-8 h-full flex flex-col relative overflow-hidden group-hover:border-primary/50 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-glow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                  
                  <div className={`w-14 h-14 rounded-xl ${area.color} border border-border flex items-center justify-center text-2xl mb-8 relative z-10 grayscale group-hover:grayscale-0 transition-all duration-500`}>
                    {area.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 relative z-10 group-hover:text-primary-bright transition-colors tracking-tight">
                    {area.title}
                  </h3>
                  
                  <p className="text-text-secondary mb-8 relative z-10 flex-grow">
                    {area.desc}
                  </p>
                  
                  <div className="text-primary font-medium flex items-center gap-2 relative z-10 group-hover:gap-3 transition-all">
                    Learn more <span>→</span>
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
