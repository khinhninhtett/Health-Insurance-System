import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Shield, HeartPulse, Zap, ShieldCheck, Clock3, Award, Check, ArrowRight,
  Phone, Mail, MapPin, Menu, X, Facebook, Twitter, Instagram, Linkedin, Send,
} from "lucide-react";
import { apiFetch } from "../utils/api";
import { formatCurrency } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

interface Plan {
  id: number;
  name: string;
  description: string;
  coverage_amount: number;
  monthly_premium: number;
  annual_premium: number;
  benefits: string[];
  color: string;
  popular: boolean;
}

const navLinks = [
  { label: "Home", target: "home" },
  { label: "About", target: "about" },
  { label: "Plans", target: "plans" },
  { label: "Contact", target: "contact" },
];

const features = [
  {
    icon: Zap,
    color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    title: "Instant Adjudication",
    text: "Claims processed within minutes through our automated pipeline architecture.",
  },
  {
    icon: ShieldCheck,
    color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    title: "Verified Coverage",
    text: "Identity and medical verification keep every policy genuine and fraud-free.",
  },
  {
    icon: Clock3,
    color: "text-sky-400 border-sky-400/30 bg-sky-400/10",
    title: "Flexible Payments",
    text: "Pay annually or in 12 monthly installments with local wallets like KBZPay and WavePay.",
  },
  {
    icon: Award,
    color: "text-purple-400 border-purple-400/30 bg-purple-400/10",
    title: "1-Year Guaranteed",
    text: "Every policy covers you for a full year with a digital insurance card from day one.",
  },
];

const stats = [
  { value: "1 Year", label: "Coverage per policy" },
  { value: "12x", label: "Installment option" },
  { value: "24/7", label: "Digital claims portal" },
  { value: "100%", label: "Online enrollment" },
];

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    apiFetch("/api/plans")
      .then((res) => setPlans(res.plans))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoadingPlans(false));
  }, []);

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/customer/dashboard"} replace />;
  }

  return (
    <div id="home" className="min-h-screen bg-[#050a24] text-white">
      {/* Navbar */}
      <header className="fixed top-4 inset-x-0 z-50 px-[50px]">
        <nav className="w-full flex items-center justify-between px-5 py-3 rounded-2xl border border-white/10 bg-[#0b1233]/80 backdrop-blur-xl shadow-lg shadow-black/30">
          <button onClick={() => scrollTo("home")} className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span className="font-semibold">
              Insure<span className="text-emerald-400">Glass</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
            {navLinks.map((l) => (
              <button key={l.target} onClick={() => scrollTo(l.target)} className="hover:text-white transition-colors">
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium transition-colors">
              Get Started
            </Link>
          </div>

          <button className="md:hidden text-gray-300" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="md:hidden w-full mt-2 p-4 rounded-2xl border border-white/10 bg-[#0b1233]/95 backdrop-blur-xl space-y-2">
            {navLinks.map((l) => (
              <button
                key={l.target}
                onClick={() => { setMenuOpen(false); scrollTo(l.target); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5"
              >
                {l.label}
              </button>
            ))}
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <Link to="/login" className="flex-1 text-center px-3 py-2 rounded-lg text-sm text-gray-300 border border-white/10">Sign In</Link>
              <Link to="/register" className="flex-1 text-center px-3 py-2 rounded-lg text-sm bg-emerald-500 text-white">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-28 px-4 bg-gradient-to-b from-[#1b1f4e] via-[#161a45] to-[#050a24]">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-indigo-600/25 blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/30 bg-white/5 backdrop-blur text-emerald-300 text-sm mb-8">
            <HeartPulse className="w-4 h-4" />
            Next Generation Health Coverage
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
            Crystal Clear Protection
            <br />
            For <span className="text-emerald-400">Your Future</span>
          </h1>

          <p className="text-gray-300 max-w-xl mx-auto mb-10">
            Experience premium health insurance stripping away the standard corporate clutter.
            Simple, transparent, and completely digitized — from enrollment to claims.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => scrollTo("plans")}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-colors shadow-lg shadow-emerald-500/25"
            >
              View Pricing Plan <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollTo("about")}
              className="px-6 py-3 rounded-full border border-white/15 bg-white/5 backdrop-blur hover:bg-white/10 text-white font-medium transition-colors"
            >
              Learn Advantages
            </button>
          </div>
        </motion.div>
      </section>

      {/* Why Choose */}
      <section id="about" className="py-24 px-4 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl mb-3">Why Choose InsureGlass?</h2>
            <p className="text-sm text-gray-400">We redefined health coverage with a modernized, user-first digital experience.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
            {stats.map((s) => (
              <div key={s.label} className="text-center p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
                <p className="text-2xl font-semibold text-emerald-400">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="plans" className="py-24 px-4 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl mb-3">Transparent Pricing Tiers</h2>
            <p className="text-sm text-gray-400">Every plan covers you for one full year — pay annually or in 12 monthly installments.</p>
          </div>

          {loadingPlans ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          ) : plans.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative flex flex-col p-7 rounded-2xl border transition-transform hover:-translate-y-1 ${
                    plan.popular
                      ? "border-emerald-400/60 bg-gradient-to-b from-emerald-500/15 to-white/[0.03] shadow-xl shadow-emerald-500/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  {!!plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                      Most Popular
                    </span>
                  )}

                  <h3 className="font-serif text-lg mb-3">{plan.name}</h3>
                  <p className="mb-1">
                    <span className="text-4xl font-semibold">{formatCurrency(plan.monthly_premium)}</span>
                    <span className="text-sm text-gray-400"> /month</span>
                  </p>
                  <p className="text-xs text-gray-400 mb-5">
                    or {formatCurrency(plan.annual_premium)} per year · covers up to {formatCurrency(plan.coverage_amount)}
                  </p>

                  <hr className="border-white/10 mb-5" />

                  <ul className="space-y-3 mb-8 flex-1">
                    {(Array.isArray(plan.benefits) ? plan.benefits : []).map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate("/register")}
                    className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${
                      plan.popular
                        ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                        : "border border-white/15 bg-white/5 hover:bg-white/10 text-white"
                    }`}
                  >
                    Choose Policy
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500 py-16">Plans are being prepared — check back soon.</p>
          )}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-4 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl mb-3">Get In Touch</h2>
            <p className="text-sm text-gray-400">Questions about coverage, claims, or payments? Our team is here to help.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: Phone, title: "Call Us", line1: "+95 9 000 000 000", line2: "Mon–Sat, 9am–6pm" },
              { icon: Mail, title: "Email Us", line1: "support@insureglass.mm", line2: "We reply within 24 hours" },
              { icon: MapPin, title: "Visit Us", line1: "InsureGlass Inc.", line2: "Yangon, Myanmar" },
            ].map((c) => (
              <div key={c.title} className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] text-center">
                <div className="w-11 h-11 mx-auto rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 flex items-center justify-center mb-4">
                  <c.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{c.title}</h3>
                <p className="text-sm text-gray-300">{c.line1}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.line2}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 max-w-3xl mx-auto text-center p-10 rounded-2xl border border-emerald-400/30 bg-gradient-to-b from-emerald-500/15 to-white/[0.03]">
            <h3 className="font-serif text-2xl mb-2">Ready to get covered?</h3>
            <p className="text-sm text-gray-400 mb-6">Create an account, verify your identity, and activate a 1-year policy — all online.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-colors"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#03071c]">
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr]">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-emerald-400" />
                <span className="text-lg font-semibold">
                  Insure<span className="text-emerald-400">Glass</span>
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-xs">
                Crystal clear health insurance for Myanmar. Verified coverage, instant digital claims,
                and flexible payments — all in one transparent portal.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Instagram, label: "Instagram" },
                  { icon: Linkedin, label: "LinkedIn" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    onClick={(e) => e.preventDefault()}
                    className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-400/40 transition-colors"
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {navLinks.map((l) => (
                  <li key={l.target}>
                    <button onClick={() => scrollTo(l.target)} className="text-sm font-normal hover:text-emerald-400 transition-colors">
                      {l.label}
                    </button>
                  </li>
                ))}
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Create Account</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Our Services</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li>Health Coverage Plans</li>
                <li>Digital Claims Processing</li>
                <li>Medical Verification</li>
                <li>Installment Payments</li>
                <li>Digital Insurance Cards</li>
              </ul>
            </div>

            {/* Contact + newsletter */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Stay In Touch</h4>
              <ul className="space-y-3 text-sm text-gray-400 mb-5">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  InsureGlass Inc., Yangon, Myanmar
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  +95 9 000 000 000
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  support@insureglass.mm
                </li>
              </ul>
              
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} InsureGlass Inc. All rights reserved.</p>
            <div className="flex items-center gap-5 text-xs text-gray-500">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((label) => (
                <a key={label} href="#" onClick={(e) => e.preventDefault()} className="hover:text-emerald-400 transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
