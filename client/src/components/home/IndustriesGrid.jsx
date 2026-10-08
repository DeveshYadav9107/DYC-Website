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
    <section className="py-32 bg-bg-primary px-6 relative border-t border-border-light">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--color-primary-light),transparent_50%)] opacity-30"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal>
          <div className="text-center mb-20">
            <div className="text-primary font-bold uppercase tracking-wider text-xs mb-3 inline-flex items-center gap-2">
              <span className="w-8 h-px bg-primary"></span>
              Sectors
              <span className="w-8 h-px bg-primary"></span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">Industries We Serve</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Tailored enterprise solutions designed for the unique regulatory and operational challenges of your sector.
            </p>
          </div>
        </Reveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {industries.map((ind, idx) => (
            <StaggerItem key={idx}>
              <Link to="/industries" className="block group h-full">
                <div className="relative rounded-2xl overflow-hidden h-[420px] flex flex-col justify-end p-8 border border-border hover:border-primary/30 transition-all duration-500 shadow-surface group-hover:-translate-y-2 group-hover:shadow-surface-hover">

                  {/* Background Image */}
                  <img
                    src={ind.image}
                    alt={ind.name}
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent"></div>
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-multiply"></div>

                  {/* Content */}
                  <div className="relative z-10 mt-auto">
                    <h3 className="text-2xl font-bold text-text-primary mb-3 tracking-tight group-hover:text-primary transition-colors">
                      {ind.name}
                    </h3>
                    <p className="text-text-secondary leading-relaxed mb-6">
                      {ind.desc}
                    </p>

                    <div className="text-primary font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                      Explore <span aria-hidden="true">→</span>
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
