import siteConfig from '../../config/siteConfig';

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
    <section className="py-20 bg-primary-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-primary-900 to-primary-900"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-accent-400 mb-2 font-mono flex items-center justify-center">
                <span>{stat.value}</span>
                <span>{stat.suffix}</span>
              </div>
              <div className="text-primary-200 font-medium md:text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
