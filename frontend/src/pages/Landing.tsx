import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shirt, Sparkles, Grid3X3, Upload, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-illustration.png";

const features = [
  { icon: Upload, title: "Upload Your Clothes", desc: "Snap a photo and let AI categorize your items instantly." },
  { icon: Grid3X3, title: "Digital Closet", desc: "Browse your entire wardrobe in a beautiful visual grid." },
  { icon: Shirt, title: "Build Outfits", desc: "Mix and match pieces to create polished looks in seconds." },
  { icon: Sparkles, title: "AI Recommendations", desc: "Get personalized outfit suggestions based on your style." },
];

const steps = [
  { num: "01", title: "Upload", desc: "Take a photo of your clothing and upload it to your digital closet." },
  { num: "02", title: "Organize", desc: "AI automatically categorizes by type, color, and season." },
  { num: "03", title: "Style", desc: "Get smart outfit recommendations tailored to your wardrobe." },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-body">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-card/70 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-xl text-foreground tracking-tight">SmartClosetAI</Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
          </div>
          <Link to="/auth">
            <Button variant="hero" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 py-24 md:py-32 grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full gradient-subtle text-xs font-medium text-primary mb-6">
              <Sparkles className="h-3 w-3" /> AI-Powered Wardrobe Management
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.1] tracking-tight">
              Organize your wardrobe.{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
                Style smarter.
              </span>
            </h1>
            <p className="text-[17px] text-muted-foreground mt-6 max-w-lg leading-relaxed">
              Your AI-powered digital closet that helps you build outfits, discover new combinations, and make the most of every piece you own.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link to="/auth"><Button variant="hero" size="lg" className="h-12 px-8 text-[15px]">Start Free <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
              <Link to="/dashboard"><Button variant="hero-outline" size="lg" className="h-12 px-8 text-[15px]">See Demo</Button></Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-full opacity-[0.06] blur-3xl scale-125" />
              <img src={heroImg} alt="SmartClosetAI app preview" className="w-full max-w-md drop-shadow-2xl relative" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-5 py-24">
        <div className="text-center mb-16">
          <motion.div {...fadeUp} viewport={{ once: true }} whileInView="animate" initial="initial">
            <p className="text-sm font-medium text-primary tracking-wider uppercase mb-3">Features</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Everything you need for effortless style
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-[15px]">
              From uploading to outfit planning — SmartClosetAI handles it all.
            </p>
          </motion.div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="rounded-2xl bg-card p-7 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="p-3.5 rounded-xl gradient-subtle w-fit group-hover:gradient-primary transition-all duration-300">
                <f.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-heading font-semibold text-[17px] mt-5 text-card-foreground tracking-tight">{f.title}</h3>
              <p className="text-muted-foreground text-sm mt-2.5 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="gradient-subtle">
        <div className="max-w-6xl mx-auto px-5 py-24">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary tracking-wider uppercase mb-3">How it works</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">Three simple steps</h2>
            <p className="text-muted-foreground mt-4 text-[15px]">Get started in under a minute.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="text-center"
              >
                <div className="text-6xl font-heading font-bold bg-clip-text text-transparent leading-none" style={{ backgroundImage: "var(--gradient-primary)" }}>
                  {s.num}
                </div>
                <h3 className="font-heading font-semibold text-xl mt-5 text-foreground tracking-tight">{s.title}</h3>
                <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl gradient-primary p-14 md:p-20 shadow-elevated relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="relative">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground tracking-tight">
              Ready to elevate your style?
            </h2>
            <p className="text-primary-foreground/75 mt-5 max-w-md mx-auto text-[15px] leading-relaxed">
              Join thousands who are already using SmartClosetAI to dress better every day.
            </p>
            <Link to="/auth">
              <Button variant="hero-outline" size="lg" className="mt-10 border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10 h-12 px-8">
                Get Started Free <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-12">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-heading font-bold text-foreground tracking-tight">SmartClosetAI</span>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <span className="text-xs text-muted-foreground/70">© 2026 SmartClosetAI</span>
        </div>
      </footer>
    </div>
  );
}
