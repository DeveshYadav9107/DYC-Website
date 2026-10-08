import { Link } from 'react-router-dom';
import IndustriesGrid from '../../components/home/IndustriesGrid';
import Reveal from '../../components/animations/Reveal';

const IndustriesPage = () => {
  return (
    <div className="bg-bg-primary min-h-screen text-text-primary">
      {/* Header */}
      <div className="bg-bg-tertiary text-text-primary py-24 px-6 relative overflow-hidden border-b border-border-light">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_bottom_left,var(--color-primary-light),transparent_70%)]"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10 pt-10">
          <Reveal>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Industries We <span className="text-primary">Serve</span></h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Our ERP solutions, SAP expertise, and specialized staffing services are tailored to meet the strict demands of diverse sectors.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Reusing the IndustriesGrid component from the homepage */}
      <div>
        <IndustriesGrid />
      </div>

      {/* Deep Dive Section */}
      <div className="bg-bg-secondary py-32 px-6 border-y border-border-light">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div>
                <div className="text-primary font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                  <span className="w-8 h-px bg-primary"></span>
                  Domain Expertise
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-10 tracking-tight">Why Industry Experience Matters</h2>
                <ul className="space-y-8">
                  <li className="flex items-start gap-4 group">
                    <span className="text-primary mt-1 group-hover:scale-125 transition-transform">✓</span>
                    <div>
                      <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">Regulatory Compliance</h3>
                      <p className="text-text-secondary mt-2 leading-relaxed">We understand the specific compliance, security, and audit requirements of sectors like Healthcare and Finance.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <span className="text-primary mt-1 group-hover:scale-125 transition-transform">✓</span>
                    <div>
                      <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">Custom Workflows</h3>
                      <p className="text-text-secondary mt-2 leading-relaxed">Manufacturing supply chains operate differently than retail logistics. Our SAP consultants configure systems to match your reality.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <span className="text-primary mt-1 group-hover:scale-125 transition-transform">✓</span>
                    <div>
                      <h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">Niche Talent Sourcing</h3>
                      <p className="text-text-secondary mt-2 leading-relaxed">Our staffing division knows exactly where to find professionals with specific industry-certified experience.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </Reveal>
            
            <Reveal delay={0.2}>
              <div className="bg-surface border border-border shadow-surface rounded-2xl p-10 text-center relative overflow-hidden group hover:shadow-surface-hover transition-all">
                 <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
                 <div className="text-6xl mb-8 group-hover:scale-110 transition-transform duration-500 relative z-10 grayscale group-hover:grayscale-0">🌍</div>
                 <h3 className="text-2xl font-bold text-text-primary mb-4 relative z-10">Don't see your industry?</h3>
                 <p className="text-text-secondary mb-8 relative z-10 leading-relaxed">
                   Our core technology solutions are highly adaptable. We likely have experience solving operational challenges similar to yours.
                 </p>
                 <Link to="/contact" className="btn-primary inline-block px-8 py-3 relative z-10">
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
