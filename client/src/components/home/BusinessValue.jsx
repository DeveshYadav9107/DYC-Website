const BusinessValue = () => {
  const values = [
    {
      title: 'Connected Enterprise',
      desc: 'Break down silos and unify your business processes.',
      icon: '🔗',
    },
    {
      title: 'Operational Visibility',
      desc: 'Real-time insights across your entire organization.',
      icon: '👁️',
    },
    {
      title: 'Scalable Growth',
      desc: 'Future-proof systems that grow with your business.',
      icon: '📈',
    },
    {
      title: 'Measurable Outcomes',
      desc: 'Data-driven results that impact your bottom line.',
      icon: '🎯',
    },
  ];

  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">Why Businesses Choose Us</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We deliver technology solutions that drive actual business value, not just IT implementations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((val, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-8 border border-gray-100 hover:shadow-card transition duration-300 group">
              <div className="w-14 h-14 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                {val.icon}
              </div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">{val.title}</h3>
              <p className="text-gray-600 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessValue;
