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
      value: '100',
      suffix: '%',
      label: 'Committed Delivery',
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-[#F8F5EE] text-[#252720] relative overflow-hidden border-b border-[#E7E0D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {stats.map((stat, idx) => (
              <StaggerItem key={idx} className="flex flex-col items-center group cursor-default">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#174B39] mb-2 tracking-tight flex items-center justify-center transition-transform group-hover:scale-105">
                  <span>{stat.value}</span>
                  <span className="text-[#B88A3B]">{stat.suffix}</span>
                </div>
                <div className="text-[#66665D] font-medium text-sm sm:text-base">{stat.label}</div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Reveal>
      </div>
    </section>
  );
};

export default Stats;
