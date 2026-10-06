import { Link } from 'react-router-dom';
import siteConfig from '../../config/siteConfig';

const AboutPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-primary-900 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-accent-400 via-primary-900 to-primary-900"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About {siteConfig.company.name}</h1>
          <p className="text-xl text-primary-200 max-w-3xl mx-auto leading-relaxed">
            {siteConfig.company.description}
          </p>
        </div>
      </div>

      {/* Story & Vision */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Founded on the principle that technology should drive measurable business value, Dinesh Yadav & Company (DYC) has grown into a trusted partner for enterprises navigating complex digital transformations.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              With over {siteConfig.metrics.yearsExperience.value} years of excellence, we bridge the gap between business strategy and IT execution. Whether it's sourcing the perfect SAP consultant, managing an S/4HANA migration, or building custom ERP software from the ground up, we bring deep industry expertise to every engagement.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-accent-500 rounded-2xl transform translate-x-4 translate-y-4 opacity-20"></div>
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="DYC Team Collaboration" 
              className="rounded-2xl shadow-lg relative z-10"
            />
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-20 px-6 border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide our consultants, developers, and leadership team every day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm mx-auto mb-6">🤝</div>
              <h3 className="text-xl font-bold text-primary-900 mb-4">Client Partnership</h3>
              <p className="text-gray-600">We don't just act as vendors; we integrate with your team to deeply understand and solve your business challenges.</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm mx-auto mb-6">🎯</div>
              <h3 className="text-xl font-bold text-primary-900 mb-4">Excellence in Execution</h3>
              <p className="text-gray-600">From a single staffing placement to a massive SAP rollout, we commit to the highest standards of quality.</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm mx-auto mb-6">💡</div>
              <h3 className="text-xl font-bold text-primary-900 mb-4">Continuous Innovation</h3>
              <p className="text-gray-600">Technology evolves rapidly. We constantly upskill our teams to bring you the latest in cloud, ERP, and automation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-primary-900 mb-4">Ready to work with us?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Join the growing list of enterprises that trust DYC for their SAP, staffing, and software needs.
        </p>
        <Link to="/contact" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded shadow transition">
          Contact Our Team
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
