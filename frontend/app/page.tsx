"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

function useCounter(target: number, duration: number, started: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let cur = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration, started]);
  return count;
}

function Stat({ n, suf, label, go }: { n: number; suf: string; label: string; go: boolean }) {
  const v = useCounter(n, 1600, go);
  return (
    <div className="text-center">
      <p className="text-4xl lg:text-5xl font-black text-white">{v.toLocaleString()}{suf}</p>
      <p className="text-indigo-200 text-sm mt-1 font-medium tracking-widest uppercase">{label}</p>
    </div>
  );
}

const NAV_LINKS = ['About', 'Services', 'How It Works', 'Testimonials'];

export default function Landing() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVis, setStatsVis] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVis(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const [heroRef, heroVis] = useInView(0.1);
  const [aboutRef, aboutVis] = useInView(0.1);
  const [servRef, servVis] = useInView(0.1);
  const [howRef, howVis] = useInView(0.1);
  const [testRef, testVis] = useInView(0.1);
  const [ctaRef, ctaVis] = useInView(0.2);

  const services = [
    { icon: '🎯', title: 'Practical Challenges', desc: 'Real-world tasks designed by employers to assess exactly the skills that matter on the job.' },
    { icon: '🤖', title: 'AI-Powered Matching', desc: 'Our intelligence engine scores every submission and surfaces the best-fit candidates automatically.' },
    { icon: '📈', title: 'Skills Analytics', desc: 'Deep dashboards tracking skill gaps, market demand trends, and team competency over time.' },
    { icon: '🏆', title: 'Verified Portfolios', desc: 'Every completed challenge becomes a cryptographically signed portfolio item.' },
    { icon: '🎓', title: 'Learning Pathways', desc: 'Personalised upskilling roadmaps based on your gap analysis, with curated resources.' },
    { icon: '🤝', title: 'Smart Recruiting', desc: 'Automated candidate pipelines, interview scheduling, and offer tracking.' },
  ];

  const steps = [
    { num: '01', title: 'Create Your Profile', desc: 'Sign up in 60 seconds. Add your skills, experience, and the kind of work you want to do.', color: 'from-indigo-500 to-indigo-600' },
    { num: '02', title: 'Discover or Post Challenges', desc: 'Candidates browse skill-matched challenges. Employers publish real tasks.', color: 'from-purple-500 to-purple-600' },
    { num: '03', title: 'Prove Your Skills', desc: 'Complete the challenge, deploy your solution, and submit. No resumes — just real output.', color: 'from-pink-500 to-rose-500' },
    { num: '04', title: 'Get Matched & Hired', desc: 'AI scores submissions, employers review ranked candidates, and offers go out.', color: 'from-orange-500 to-amber-500' },
  ];

  const testimonials = [
    { q: 'Six months of applications went nowhere. One week on RisingSkills and I had three technical interviews.', name: 'Daniel Chung', role: 'Frontend Developer', init: 'DC', hue: 250 },
    { q: 'We cut time-to-hire from eight weeks to ten days. Every shortlisted candidate the AI surfaces is genuinely strong.', name: 'Priya Nair', role: 'Head of Eng, Fintek', init: 'PN', hue: 170 },
    { q: 'Self-taught developers like me get ignored by ATS systems. RisingSkills let my work speak.', name: 'Marco Bianchi', role: 'Full-Stack Engineer', init: 'MB', hue: 310 },
  ];

  return (
    <div className="min-h-screen bg-[#07090f] text-white font-sans overflow-x-hidden">

      {/* AMBIENT BLOBS */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full bg-indigo-700/20 blur-[140px] animate-pulse" />
        <div className="absolute top-1/3 -right-80 w-[600px] h-[600px] rounded-full bg-purple-700/15 blur-[120px] animate-pulse" style={{animationDelay:'2s'}} />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-700/10 blur-[120px] animate-pulse" style={{animationDelay:'4s'}} />
      </div>

      {/* HEADER */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#07090f]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
              <span className="text-white font-black text-base">R</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Rising<span className="text-indigo-400">Skills</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} className="text-slate-400 hover:text-white text-sm font-medium transition-colors hover:text-indigo-300">{l}</a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-slate-300 hover:text-white text-sm font-semibold px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">Log In</Link>
            <Link href="/register" className="text-sm font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5">Get Started Free</Link>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {open && (
          <div className="md:hidden bg-[#0c0f1a] border-t border-white/5 px-6 py-5 space-y-2">
            {NAV_LINKS.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} onClick={() => setOpen(false)} className="block text-slate-300 hover:text-white py-2 text-sm">{l}</a>
            ))}
            <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
              <Link href="/login" className="text-center text-sm font-semibold py-2.5 rounded-xl border border-white/10 text-slate-300">Log In</Link>
              <Link href="/register" className="text-center text-sm font-bold py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">Get Started Free</Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section ref={heroRef} id="hero" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        <div className={`transition-all duration-1000 ${heroVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-widest uppercase mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            The Future of Skills-Based Hiring is Here
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[1.02] tracking-tight mb-7">
            <span className="block text-white">Prove Your Skills.</span>
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Land the Job.</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            RisingSkills replaces the broken resume game with real-world challenges. Candidates demonstrate ability. Employers discover talent. AI does the matching.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register" className="group inline-flex items-center gap-2 px-9 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base hover:from-indigo-400 hover:to-purple-500 transition-all shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1">
              Start as a Candidate
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/register" className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl border border-white/10 text-slate-200 font-bold text-base hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:text-white transition-all">
              Hire with RisingSkills
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex -space-x-2">
              {['AK','SH','MR','JP','LW','PK'].map((init,i) => (
                <div key={i} style={{background:`hsl(${220+i*18},65%,50%)`}} className="w-9 h-9 rounded-full border-2 border-[#07090f] flex items-center justify-center text-white text-[10px] font-bold">{init}</div>
              ))}
            </div>
            <span><strong className="text-white font-semibold">2,400+</strong> candidates placed this month</span>
            <span className="hidden sm:block w-px h-4 bg-white/10" />
            <span>⭐ <strong className="text-white font-semibold">4.9/5</strong> from 800+ reviews</span>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600 flex flex-col items-center gap-1">
          <span className="text-xs tracking-widest">SCROLL</span>
          <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </section>

      {/* STATS */}
      <div ref={statsRef} className="py-14 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-10 grid grid-cols-2 md:grid-cols-4 gap-8 shadow-2xl shadow-indigo-500/25">
          <Stat n={12400} suf="+" label="Active Candidates" go={statsVis} />
          <Stat n={840} suf="+" label="Employers" go={statsVis} />
          <Stat n={5200} suf="+" label="Challenges" go={statsVis} />
          <Stat n={94} suf="%" label="Placement Rate" go={statsVis} />
        </div>
      </div>

      {/* ABOUT */}
      <section ref={aboutRef} id="about" className="py-28 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className={`transition-all duration-1000 ${aboutVis ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="text-indigo-400 text-xs font-bold tracking-widest uppercase mb-4">About RisingSkills</div>
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
              Built to Fix<br /><span className="text-indigo-400">Broken Hiring</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              The traditional hiring funnel is broken. Candidates get filtered by keywords, not capability. Employers make expensive mistakes based on polished CVs. We built RisingSkills to change that — permanently.
            </p>
            <p className="text-slate-400 leading-relaxed mb-8">
              Our platform puts skills at the center of every hiring decision. Through AI-scored practical challenges, verified portfolios, and real-time match analytics, we create a transparent meritocracy.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Skills First','AI Verified','Zero Bias','Fast Hiring'].map(tag => (
                <span key={tag} className="px-4 py-1.5 rounded-full text-xs font-bold text-indigo-300 border border-indigo-500/30 bg-indigo-500/10">{tag}</span>
              ))}
            </div>
          </div>
          <div className={`transition-all duration-1000 delay-200 ${aboutVis ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl" />
              <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-5">
                {[
                  { label: 'Resume-based hires succeed', before: 54, after: null },
                  { label: 'RisingSkills hires succeed', before: null, after: 91 },
                ].map((row, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">{row.label}</span>
                      <span className="text-white font-bold">{row.before ?? row.after}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/5">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: aboutVis ? `${row.before ?? row.after}%` : '0%', background: row.before ? 'linear-gradient(to right, #ef4444, #f97316)' : 'linear-gradient(to right, #6366f1, #a855f7)' }} />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                  {[['60%','Fewer bad hires'],['3×','Faster hiring'],['2×','Better retention']].map(([v,l]) => (
                    <div key={l} className="text-center">
                      <div className="text-2xl font-black text-indigo-400">{v}</div>
                      <div className="text-slate-500 text-xs mt-1">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section ref={servRef} id="services" className="py-28 px-6 bg-white/[0.018] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">What We Offer</div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-5">Our Services</h2>
            <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">Everything you need — whether you are proving skills or discovering talent.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <div key={s.title} style={{ transitionDelay: `${i * 80}ms` }} className={`group rounded-2xl border border-white/8 bg-white/[0.03] p-7 hover:border-indigo-500/30 hover:bg-white/[0.07] hover:-translate-y-1.5 transition-all duration-500 ${servVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl mb-5 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">{s.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={howRef} id="how-it-works" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <div className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">Simple Process</div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-5">How It Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">From sign-up to hired in four clear steps.</p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute left-[2.75rem] top-12 bottom-12 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-orange-400 opacity-20" />
            <div className="space-y-8">
              {steps.map((s, i) => (
                <div key={i} style={{ transitionDelay: `${i * 150}ms` }} className={`flex gap-7 items-start group transition-all duration-700 ${howVis ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center font-black text-white text-lg shadow-xl group-hover:scale-110 transition-transform`}>{s.num}</div>
                  <div className="flex-1 pt-1">
                    <h4 className="text-white font-bold text-xl mb-2">{s.title}</h4>
                    <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section ref={testRef} id="testimonials" className="py-28 px-6 bg-white/[0.018] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-pink-400 text-xs font-bold tracking-widest uppercase mb-4">Social Proof</div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-5">Loved by Thousands</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Real stories from candidates who got hired and employers who hire better.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} style={{ transitionDelay: `${i * 120}ms` }} className={`rounded-2xl border border-white/8 bg-white/[0.03] p-7 hover:border-white/15 transition-all duration-700 ${testVis ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-6'}`}>
                <div className="flex gap-0.5 mb-5">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-sm">★</span>)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">&quot;{t.q}&quot;</p>
                <div className="flex items-center gap-3">
                  <div style={{background:`hsl(${t.hue},60%,50%)`}} className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{t.init}</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="py-32 px-6">
        <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${ctaVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative inline-block mb-10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-30" />
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] px-16 py-16">
              <div className="text-indigo-400 text-xs font-bold tracking-widest uppercase mb-4">Get Started Today</div>
              <h2 className="text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
                Ready to<br /><span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Rise?</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-lg mx-auto mb-10">
                Join 12,000+ candidates and 800+ employers transforming how skills-based hiring works.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register?role=candidate" className="px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base hover:from-indigo-400 hover:to-purple-500 transition-all shadow-2xl shadow-indigo-500/30 hover:-translate-y-1 hover:shadow-indigo-500/50">
                  I am a Candidate
                </Link>
                <Link href="/register?role=employer" className="px-10 py-4 rounded-2xl border border-white/10 text-slate-200 font-bold text-base hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:text-white transition-all">
                  I am an Employer
                </Link>
              </div>
              <p className="mt-6 text-slate-600 text-sm">Free to join. No credit card needed. Cancel anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-6 pt-16 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-black text-sm">R</span>
                </div>
                <span className="font-bold text-lg">Rising<span className="text-indigo-400">Skills</span></span>
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed">The skills-first hiring platform built for the modern workforce.</p>
            </div>
            {[
              { heading: 'Platform', links: ['Features', 'Pricing', 'For Employers', 'For Candidates', 'API'] },
              { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Contact'] },
              { heading: 'Legal', links: ['Privacy', 'Terms', 'Cookies', 'Security'] },
            ].map(col => (
              <div key={col.heading}>
                <h4 className="text-white font-semibold text-sm mb-4">{col.heading}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => <li key={l}><a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600 text-sm">
            <span>© 2026 RisingSkills. All rights reserved.</span>
            <div className="flex gap-4">
              {['Twitter','LinkedIn','GitHub'].map(s => <a key={s} href="#" className="hover:text-slate-400 transition-colors">{s}</a>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
