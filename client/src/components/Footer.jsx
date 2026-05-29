import React from 'react';

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2E5AA7] flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-[#FFA628]" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-slate-900">
                Campus<span className="text-[#2E5AA7]">Hub</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              The simplest way to discover, manage, and stay updated with everything happening on campus.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-5 flex gap-2 max-w-sm"
            >
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
              />
              <button className="bg-[#2E5AA7] hover:bg-[#244a8c] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Subscribe
              </button>
            </form>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">Explore</p>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-slate-600 hover:text-[#2E5AA7] transition-colors">Home</a></li>
              <li><a href="/events/upcoming" className="text-slate-600 hover:text-[#2E5AA7] transition-colors">Events</a></li>
              <li><a href="/events/calendar" className="text-slate-600 hover:text-[#2E5AA7] transition-colors">Calendar</a></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">Committees</p>
            <ul className="space-y-2 text-sm">
              <li><a href="/admin/register" className="text-slate-600 hover:text-[#2E5AA7] transition-colors">Register</a></li>
              <li><a href="/admin/login" className="text-slate-600 hover:text-[#2E5AA7] transition-colors">Log in</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} CampusHub. All rights reserved.</p>
          <p>Crafted for student life.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
