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
        <div className="absolute inset-0 z-0 opacity-100">
          <img src="/images/about-banner.png" alt="About Dinesh Yadav & Company" className="w-full h-full object-cover object-center" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-bg-tertiary/80 via-bg-tertiary/30 to-transparent z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10 pt-10">
          <Reveal>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight !text-[#102A43]">About <span className="!text-[#102A43]">{siteConfig.company.name}</span></h1>
                <p className="text-xl text-text-secondary leading-relaxed max-w-xl">
                  {siteConfig.company.description}
                </p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl border border-white/50 shadow-sm hidden md:block">
                <h3 className="text-xl font-bold text-[#102A43] mb-4">Our Commitment</h3>
                <p className="text-[#102A43]/90 leading-relaxed font-medium">
                  We bridge the gap between exceptional talent and transformative technology. Our goal is to empower enterprises to scale efficiently through world-class SAP integration, innovative ERP solutions, and unparalleled strategic staffing tailored to your exact needs.
                </p>
              </div>
            </div>
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
                  <div className="relative rounded-2xl overflow-hidden h-[380px] flex flex-col justify-end p-8 border border-border shadow-surface transition-all duration-500 hover:shadow-surface-hover cursor-default group-hover:-translate-y-2 group-hover:border-primary/30">
                    
                    {/* Background Image */}
                    <img
                      src={val.image}
                      alt={val.title}
                      className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                    />
                    
                    {/* Gradient Overlay Base */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent group-hover:opacity-0 transition-opacity duration-300 z-0"></div>

                    {/* Content Base State */}
                    <div className="relative z-10 mt-auto group-hover:opacity-0 transition-opacity duration-300 text-center md:text-left">
                      <h3 className="text-xl font-bold text-text-primary mb-3 tracking-tight transition-colors">
                        {val.title}
                      </h3>
                      <p className="text-text-secondary leading-relaxed line-clamp-3">
                        {val.desc}
                      </p>
                    </div>

                    {/* Hover Overlay State */}
                    <div className="absolute inset-0 bg-bg-navy/95 text-white p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end z-20 backdrop-blur-sm text-center md:text-left">
                      <h4 className="text-2xl font-bold mb-4 tracking-tight text-white">{val.title}</h4>
                      <p className="text-white/90 leading-relaxed text-lg">{val.desc}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
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
