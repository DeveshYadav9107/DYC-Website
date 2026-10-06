import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="relative py-24 bg-primary-900 overflow-hidden px-6">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-accent-500 rounded-full blur-[150px] opacity-20"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to transform your business?</h2>
        <p className="text-xl text-primary-200 mb-10 max-w-2xl mx-auto leading-relaxed">
          Whether you need immediate SAP support, expert staffing, or a custom ERP build, our team is ready to deliver measurable results.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/contact" className="bg-accent-500 hover:bg-accent-400 text-white px-8 py-4 rounded shadow-lg font-bold text-lg transition duration-300">
            Contact Us Today
          </Link>
          <a href="mailto:info@dycinfo.com" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded font-bold text-lg transition duration-300 backdrop-blur-sm">
            Email info@dycinfo.com
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
