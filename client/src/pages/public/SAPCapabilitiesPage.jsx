import { Link } from 'react-router-dom';
import Reveal from '../../components/animations/Reveal';
import { StaggerContainer, StaggerItem } from '../../components/animations/Stagger';

const SAPCapabilitiesPage = () => {
  const categories = [
    {
      title: 'Functional Modules',
      desc: 'Optimize your core business processes with expert configuration.',
      modules: [
        { name: 'SAP FICO', full: 'Financial Accounting & Controlling', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80' },
        { name: 'SAP MM', full: 'Materials Management', image: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c663be?auto=format&fit=crop&w=800&q=80' },
        { name: 'SAP SD', full: 'Sales and Distribution', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' },
        { name: 'SAP HR/HCM', full: 'Human Capital Management', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80' },
        { name: 'SAP PP', full: 'Production Planning', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80' },
        { name: 'SAP PM', full: 'Plant Maintenance', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80' },
      ]
    },
    {
      title: 'Technical Modules',
      desc: 'Robust development, integration, and system administration.',
      modules: [
        { name: 'SAP ABAP', full: 'Advanced Business Application Programming', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80' },
        { name: 'SAP Basis', full: 'System Administration', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' },
        { name: 'SAP Fiori / UI5', full: 'User Experience & Interfaces', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80' },
        { name: 'SAP PI/PO', full: 'Process Integration / Orchestration', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80' },
      ]
    },
    {
      title: 'Cloud & Environments',
      desc: 'Modernize your landscape with the latest SAP innovations.',
      modules: [
        { name: 'SAP S/4HANA', full: 'Next-generation ERP', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' },
        { name: 'SAP SuccessFactors', full: 'Cloud HR', image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80' },
        { name: 'SAP Ariba', full: 'Procurement & Supply Chain', image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80' },
      ]
    }
  ];

  return (
    <div className="bg-bg-primary min-h-screen text-text-primary">
      {/* Header */}
      <div className="bg-bg-secondary text-white py-24 px-6 relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_70%)]"></div>
        <div className="max-w-7xl mx-auto relative z-10 pt-10">
          <Reveal>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">SAP <span className="text-primary-bright">Capabilities</span></h1>
            <p className="text-xl text-text-secondary max-w-3xl leading-relaxed">
              We provide comprehensive SAP expertise across the entire enterprise landscape. From legacy ECC systems to modern S/4HANA transformations, our certified consultants deliver end-to-end solutions.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        {categories.map((category, idx) => (
          <div key={idx}>
            <Reveal>
              <div className="mb-12">
                <div className="text-primary font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                  <span className="w-8 h-px bg-primary"></span>
                  Domain {idx + 1}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">{category.title}</h2>
                <p className="text-lg text-text-secondary">{category.desc}</p>
              </div>
            </Reveal>
            
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.modules.map((mod, i) => (
                <StaggerItem key={i} className="relative rounded-2xl overflow-hidden h-[250px] flex flex-col justify-end p-6 border border-border/50 hover:border-primary/50 transition-all duration-500 shadow-surface group hover:-translate-y-1 hover:shadow-glow cursor-default">
                  
                  {/* Background Image */}
                  <img 
                    src={mod.image} 
                    alt={mod.name} 
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/90 to-transparent"></div>
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="font-bold text-2xl text-white mb-1 tracking-tight group-hover:text-primary-bright transition-colors">{mod.name}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{mod.full}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-bg-secondary border-t border-border/50 py-32 px-6 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Need a specific SAP expert?</h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Whether you need a single ABAP developer or a full functional team for an S/4HANA rollout, we can deploy the right talent quickly.
          </p>
          <Link to="/contact" className="btn-primary inline-block px-8 py-4 text-lg">
            Request SAP Resources
          </Link>
        </Reveal>
      </div>
    </div>
  );
};

export default SAPCapabilitiesPage;
