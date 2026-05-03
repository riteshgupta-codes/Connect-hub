import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { Video, Shield, Globe, Zap, Users, MessageSquare, Monitor, Lock } from "lucide-react";

const fadeInUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = to;
    const step = end / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setValue(end); clearInterval(timer); } else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

const FEATURES = [
  { icon: Video, title: "HD Video Calling", desc: "Crystal-clear 1080p video with adaptive quality for any bandwidth." },
  { icon: Monitor, title: "Screen Sharing", desc: "Share your entire screen, a window, or a browser tab instantly." },
  { icon: MessageSquare, title: "Live Chat", desc: "Real-time in-meeting chat with typing indicators and message history." },
  { icon: Shield, title: "End-to-End Security", desc: "AES-256 encrypted sessions with passcode protection and waiting rooms." },
  { icon: Users, title: "Up to 100 Participants", desc: "Host large team meetings, webinars, and interactive sessions." },
  { icon: Zap, title: "Zero Installs", desc: "Join from any browser on any device — no downloads, no accounts required for guests." },
];

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "Engineering Lead", company: "Novo Labs", quote: "MeetNow replaced three tools for us. The quality is outstanding and the UI just gets out of the way." },
  { name: "Marcus Webb", role: "Head of Product", company: "Alterra", quote: "We moved our entire team onto MeetNow in a day. The analytics dashboard alone saved us hours of manual reporting." },
  { name: "Priya Nair", role: "Founder", company: "Kira Health", quote: "The waiting room and passcode features give us the compliance controls we need for client sessions." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">MeetNow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors px-3 py-2">Sign in</Link>
            <Link href="/register" className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors" data-testid="btn-get-started">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-orb-1" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-orb-2" />
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl animate-orb-3" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-live-dot" />
            Now with AI-powered noise cancellation
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6"
          >
            Video meetings<br />
            <span className="text-blue-600">built for work</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            HD video, real-time chat, screen sharing, and meeting analytics — all in your browser. No downloads, no friction.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/register" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-base transition-colors shadow-lg shadow-blue-200" data-testid="btn-hero-start">
              Start a meeting
            </Link>
            <Link href="/login" className="px-8 py-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-2xl text-base transition-colors" data-testid="btn-hero-join">
              Join a meeting
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 50000, suffix: "+", label: "Active teams" },
              { value: 99, suffix: ".9%", label: "Uptime SLA" },
              { value: 3000000, suffix: "+", label: "Meetings hosted" },
              { value: 150, suffix: "ms", label: "Avg. latency" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: i * 0.08 }}
              >
                <div className="text-4xl font-extrabold text-gray-900 tabular-nums">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything you need to collaborate</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Powerful features, zero complexity. MeetNow gives your team the tools to move fast without getting in the way.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={fadeInUp} transition={{ delay: i * 0.06 }}
                className="p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <feature.icon size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeInUp}
            className="text-4xl font-extrabold text-gray-900 mb-4"
          >
            Start a meeting in 3 clicks
          </motion.h2>
          <p className="text-gray-500 mb-16">No configuration. No waiting. Just clear, fast video calls.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create an account", desc: "Sign up in seconds. No credit card required." },
              { step: "02", title: "Start or schedule", desc: "Instant meetings or scheduled events — your choice." },
              { step: "03", title: "Invite & collaborate", desc: "Share a link. Your team joins from any browser, instantly." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={fadeInUp} transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-6xl font-extrabold text-blue-100 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeInUp}
            className="text-4xl font-extrabold text-center text-gray-900 mb-16"
          >
            Teams that ship with MeetNow
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={fadeInUp} transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-gray-100 bg-white"
              >
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}, {t.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section id="pricing" className="py-24 px-6 bg-gray-50/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeInUp}
            className="text-4xl font-extrabold text-gray-900 mb-4"
          >
            Simple, honest pricing
          </motion.h2>
          <p className="text-gray-500 mb-16">Start free. Upgrade when you need more.</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              {
                name: "Free", price: "$0", period: "forever",
                features: ["Up to 10 participants", "40-min meeting limit", "HD video", "Chat & screen share"],
                cta: "Get started", href: "/register", primary: false,
              },
              {
                name: "Pro", price: "$12", period: "per user/mo",
                features: ["Up to 100 participants", "Unlimited meeting duration", "Meeting recording", "Analytics dashboard", "Priority support"],
                cta: "Start free trial", href: "/register", primary: true,
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={fadeInUp} transition={{ delay: i * 0.1 }}
                className={`p-8 rounded-2xl border text-left ${plan.primary ? "border-blue-500 bg-blue-600 text-white" : "border-gray-200 bg-white"}`}
              >
                <div className={`text-sm font-semibold mb-1 ${plan.primary ? "text-blue-200" : "text-gray-500"}`}>{plan.name}</div>
                <div className="text-4xl font-extrabold mb-0.5">{plan.price}</div>
                <div className={`text-sm mb-6 ${plan.primary ? "text-blue-200" : "text-gray-400"}`}>{plan.period}</div>
                <ul className="flex flex-col gap-2 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${plan.primary ? "text-blue-100" : "text-gray-600"}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.primary ? "bg-blue-500" : "bg-blue-50"}`}>
                        <svg className={`w-2.5 h-2.5 ${plan.primary ? "text-white" : "text-blue-600"}`} fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  plan.primary ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-blue-600 text-white hover:bg-blue-700"
                }`}>{plan.cta}</Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ready to run better meetings?</h2>
            <p className="text-gray-500 mb-8">Join thousands of teams who've made the switch.</p>
            <Link href="/register" className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-base transition-colors shadow-lg shadow-blue-200" data-testid="btn-cta-register">
              Create your free account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="text-gray-500 text-sm">MeetNow &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
