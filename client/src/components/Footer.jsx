import React from 'react';
 
function Footer() {
  return (
    <footer className="bg-gradient-to-b from-blue-50 via-white to-indigo-50 border-t border-blue-100 py-10 px-4 mt-16 shadow-inner">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 mb-2">CampusHub</h2>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-2 items-center"
          >
            <input
              type="email"
              placeholder="Your email"
              className="px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/70 text-gray-700 min-w-[200px] placeholder:text-gray-400"
              required
            />
            <button className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white px-5 py-2 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-300 transition">
              Subscribe
            </button>
          </form>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-gray-700 text-center text-base">
          <div>
            <strong className="text-blue-800 block mb-2">Product</strong>
            <a href="#" className="block hover:text-blue-600 transition-colors">Features</a>
            <a href="#" className="block hover:text-blue-600 transition-colors">Pricing</a>
          </div>
          <div>
            <strong className="text-blue-800 block mb-2">Resources</strong>
            <a href="#" className="block hover:text-blue-600 transition-colors">Blog</a>
            <a href="#" className="block hover:text-blue-600 transition-colors">Webinars</a>
          </div>
          <div>
            <strong className="text-blue-800 block mb-2">Company</strong>
            <a href="#" className="block hover:text-blue-600 transition-colors">About Us</a>
            <a href="#" className="block hover:text-blue-600 transition-colors">Contact</a>
          </div>
          <div>
            <strong className="text-blue-800 block mb-2">Plans</strong>
            <a href="#" className="block hover:text-blue-600 transition-colors">Startup</a>
            <a href="#" className="block hover:text-blue-600 transition-colors">Organization</a>
          </div>
        </div>
        <div className="text-gray-500 text-sm border-t border-blue-100 pt-6 text-center">&copy; 2024 CampusHub. All rights reserved.</div>
      </div>
    </footer>
  );
}
 
export default Footer;