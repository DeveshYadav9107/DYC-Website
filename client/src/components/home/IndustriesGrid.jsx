const IndustriesGrid = () => {
  const industries = [
    { name: 'Manufacturing', icon: '🏭', desc: 'Optimize supply chains and production planning.' },
    { name: 'Retail & FMCG', icon: '🛒', desc: 'Streamline inventory and enhance customer experiences.' },
    { name: 'Healthcare', icon: '🏥', desc: 'Secure data management and compliance tracking.' },
    { name: 'Automotive', icon: '🚗', desc: 'Just-in-time manufacturing and dealer management.' },
    { name: 'Logistics', icon: '🚢', desc: 'Real-time fleet tracking and warehouse management.' },
    { name: 'Finance', icon: '🏦', desc: 'Strict regulatory compliance and risk management.' },
  ];

  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">Industries We Serve</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tailored enterprise solutions designed for the unique regulatory and operational challenges of your sector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((ind, idx) => (
            <div key={idx} className="flex items-start gap-4 p-6 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition">
              <div className="text-4xl">{ind.icon}</div>
              <div>
                <h3 className="font-bold text-xl text-primary-900 mb-2">{ind.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{ind.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustriesGrid;
