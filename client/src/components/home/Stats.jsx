import siteConfig from '../../config/siteConfig';
import { StaggerContainer, StaggerItem } from '../animations/Stagger';
import Reveal from '../animations/Reveal';

const Stats = () => {
  const stats = [
    {
      value: siteConfig.metrics.yearsExperience.value,
      suffix: siteConfig.metrics.yearsExperience.suffix,
      label: 'Years of Excellence',
    },
    {
      value: siteConfig.metrics.sapProjects.value,
      suffix: siteConfig.metrics.sapProjects.suffix,
      label: 'SAP Projects Delivered',
    },
    {
      value: siteConfig.metrics.certifiedConsultants.value,
      suffix: siteConfig.metrics.certifiedConsultants.suffix,
      label: 'Certified Consultants',
    },
    {
      value: '100', // Placeholder
      suffix: '%',
      label: 'Client Satisfaction',
    },
  ];

  return (
    <section className="py-24 bg-surface text-text-primary relative overflow-hidden border-b border-border/50">
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {stats.map((stat, idx) => (
              <StaggerItem key={idx} className="flex flex-col items-center group cursor-default">
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-2 tracking-tighter flex items-center justify-center transition-transform group-hover:scale-105 group-hover:text-primary-bright">
                  <span>{stat.value}</span>
                  <span>{stat.suffix}</span>
                </div>
                <div className="text-text-secondary font-medium md:text-lg">{stat.label}</div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Reveal>
      </div>
    </section>
  );
};

export default Stats;
