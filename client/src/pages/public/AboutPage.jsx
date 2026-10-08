import { Link } from 'react-router-dom';
import siteConfig from '../../config/siteConfig';
import Reveal from '../../components/animations/Reveal';
import { StaggerContainer, StaggerItem } from '../../components/animations/Stagger';

const AboutPage = () => {
  return (
    <div className="bg-bg-primary min-h-screen text-text-primary">
      {/* Header */}
      <div className="bg-bg-tertiary text-text-primary py-24 px-6 relative overflow-hidden border-b border-border-light">
        
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0 opacity-50">
          <img src="/images/about-banner.png" alt="About Dinesh Yadav & Company" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_right,var(--color-primary-light),transparent_70%)] z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg-tertiary via-transparent to-transparent z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center pt-10">
          <Reveal>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">About <span className="text-primary">{siteConfig.company.name}</span></h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              {siteConfig.company.description}
            </p>
          </Reveal>
        </div>
      </div>

      {/* Story & Vision */}
      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div>
              <div className="text-primary font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                <span className="w-8 h-px bg-primary"></span>
                Our Origin
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6 tracking-tight">Our Story</h2>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Founded on the principle that technology should drive measurable business value, Dinesh Yadav & Company (DYC) has grown into a trusted partner for enterprises navigating complex digital transformations.
              </p>
              <p className="text-text-secondary mb-8 leading-relaxed">
                With over {siteConfig.metrics.yearsExperience.value} years of excellence, we bridge the gap between business strategy and IT execution. Whether it's sourcing the perfect SAP consultant, managing an S/4HANA migration, or building custom ERP software from the ground up, we bring deep industry expertise to every engagement.
              </p>
              <Link to="/contact" className="btn-secondary inline-block px-6 py-2.5">
                Work With Us
              </Link>
            </div>
          </Reveal>
          
          <Reveal delay={0.2}>
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl transform translate-x-4 translate-y-4 blur-sm group-hover:translate-x-6 group-hover:translate-y-6 transition-all duration-500"></div>
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="DYC Team Collaboration" 
                className="rounded-2xl shadow-surface relative z-10 transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </Reveal>
        </div>
      </div>

      {/* Values */}
      <div className="bg-bg-secondary py-32 px-6 border-y border-border-light">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4 tracking-tight">Our Core Values</h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                The principles that guide our consultants, developers, and leadership team every day.
              </p>
            </div>
          </Reveal>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            <StaggerItem className="bg-surface border border-border p-8 rounded-2xl shadow-surface text-center group hover:shadow-surface-hover hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-bg-secondary border border-border-light rounded-full flex items-center justify-center text-2xl mx-auto mb-6 group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300">🤝</div>
              <h3 className="text-xl font-bold text-text-primary mb-4 group-hover:text-primary transition-colors">Client Partnership</h3>
              <p className="text-text-secondary leading-relaxed">We don't just act as vendors; we integrate with your team to deeply understand and solve your business challenges.</p>
            </StaggerItem>
            
            <StaggerItem className="bg-surface border border-border p-8 rounded-2xl shadow-surface text-center group hover:shadow-surface-hover hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-bg-secondary border border-border-light rounded-full flex items-center justify-center text-2xl mx-auto mb-6 group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300">🎯</div>
              <h3 className="text-xl font-bold text-text-primary mb-4 group-hover:text-primary transition-colors">Excellence in Execution</h3>
              <p className="text-text-secondary leading-relaxed">From a single staffing placement to a massive SAP rollout, we commit to the highest standards of quality.</p>
            </StaggerItem>
            
            <StaggerItem className="bg-surface border border-border p-8 rounded-2xl shadow-surface text-center group hover:shadow-surface-hover hover:-translate-y-1 transition-all">
              <div className="w-16 h-16 bg-bg-secondary border border-border-light rounded-full flex items-center justify-center text-2xl mx-auto mb-6 group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300">💡</div>
              <h3 className="text-xl font-bold text-text-primary mb-4 group-hover:text-primary transition-colors">Continuous Innovation</h3>
              <p className="text-text-secondary leading-relaxed">Technology evolves rapidly. We constantly upskill our teams to bring you the latest in cloud, ERP, and automation.</p>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>

      {/* CTA */}
      <div className="py-32 px-6 text-center bg-bg-primary">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">Ready to work with us?</h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Join the growing list of enterprises that trust DYC for their SAP, staffing, and software needs.
          </p>
          <Link to="/contact" className="btn-primary inline-block px-8 py-4 text-lg">
            Contact Our Team
          </Link>
        </Reveal>
      </div>
    </div>
  );
};

export default AboutPage;
