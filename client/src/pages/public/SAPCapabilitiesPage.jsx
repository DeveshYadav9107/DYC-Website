import { Link } from 'react-router-dom';
import Reveal from '../../components/animations/Reveal';
import { StaggerContainer, StaggerItem } from '../../components/animations/Stagger';

const SAPCapabilitiesPage = () => {
  const categories = [
    {
      title: 'Functional Modules',
      desc: 'Optimize your core business processes with expert configuration.',
      modules: [
        { name: 'SAP FICO', full: 'Financial Accounting & Controlling', icon: '💰' },
        { name: 'SAP MM', full: 'Materials Management', icon: '📦' },
        { name: 'SAP SD', full: 'Sales and Distribution', icon: '📈' },
        { name: 'SAP HR/HCM', full: 'Human Capital Management', icon: '👥' },
        { name: 'SAP PP', full: 'Production Planning', icon: '🏭' },
        { name: 'SAP PM', full: 'Plant Maintenance', icon: '🔧' },
      ]
    },
    {
      title: 'Technical Modules',
      desc: 'Robust development, integration, and system administration.',
      modules: [
        { name: 'SAP ABAP', full: 'Advanced Business Application Programming', icon: '💻' },
        { name: 'SAP Basis', full: 'System Administration', icon: '⚙️' },
        { name: 'SAP Fiori / UI5', full: 'User Experience & Interfaces', icon: '📱' },
        { name: 'SAP PI/PO', full: 'Process Integration / Orchestration', icon: '🔄' },
      ]
    },
    {
      title: 'Cloud & Environments',
      desc: 'Modernize your landscape with the latest SAP innovations.',
      modules: [
        { name: 'SAP S/4HANA', full: 'Next-generation ERP', icon: '☁️' },
        { name: 'SAP SuccessFactors', full: 'Cloud HR', icon: '🌟' },
        { name: 'SAP Ariba', full: 'Procurement & Supply Chain', icon: '🛒' },
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
            
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.modules.map((mod, i) => (
                <StaggerItem key={i} className="glass-panel p-6 group cursor-default flex items-start gap-5 hover:border-primary/50 transition-colors">
                  <div className="w-14 h-14 bg-surface border border-border text-white rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 shadow-sm grayscale group-hover:grayscale-0">
                    {mod.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white mb-1 tracking-tight group-hover:text-primary-bright transition-colors">{mod.name}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{mod.full}</p>
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
