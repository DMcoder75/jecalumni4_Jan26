import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Briefcase, Calendar, Star, MessageSquare, Trophy, TrendingUp, Heart } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      id: "directory",
      icon: Users,
      title: "Alumni Directory",
      description: "Connect with thousands of JEC MCA alumni across batches and industries",
      stats: "2000+ Alumni",
    },
    {
      id: "jobs",
      icon: Briefcase,
      title: "Job Board",
      description: "Discover career opportunities posted by alumni and recruiters",
      stats: "150+ Postings",
    },
    {
      id: "events",
      icon: Calendar,
      title: "Events & Reunions",
      description: "Attend batch reunions, webinars, and networking events",
      stats: "50+ Events",
    },
    {
      id: "mentorship",
      icon: Star,
      title: "Mentorship Program",
      description: "Get guidance from experienced alumni mentors in your field",
      stats: "300+ Pairs",
    },
    {
      id: "messaging",
      icon: MessageSquare,
      title: "Direct Messaging",
      description: "Connect privately with alumni and build meaningful relationships",
      stats: "Real-time Chat",
    },
    {
      id: "stories",
      icon: Trophy,
      title: "Success Stories",
      description: "Celebrate alumni achievements and get inspired by their journeys",
      stats: "100+ Stories",
    },
  ];

  const stats = [
    { label: "Alumni Connected", value: "2000+" },
    { label: "Job Opportunities", value: "150+" },
    { label: "Events Organized", value: "50+" },
    { label: "Mentorship Pairs", value: "300+" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-32 md:pt-16 md:pb-48 overflow-hidden bg-white">
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <h1 className="text-6xl md:text-8xl font-black text-[#987284] leading-tight tracking-tighter mb-4">
              🎓 JEC MCA Alumni Network
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold text-[#1F1F1F] leading-tight tracking-tight">
              Connect, Grow, <span className="text-[#EE7674]">Succeed</span>
            </h2>
            <p className="text-2xl text-[#4A4A4A] max-w-3xl mx-auto font-medium leading-relaxed">
              A comprehensive digital platform designed to foster lifelong connections among Jabalpur Engineering College MCA alumni, facilitating networking, career development, and community engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-10">
              <Button onClick={() => setLocation('/auth')} size="lg" className="bg-[#EE7674] hover:bg-[#EE7674]/90 text-white px-12 py-8 text-xl font-black shadow-xl">
                Explore Platform
              </Button>
              <Button onClick={() => setLocation('/auth')} size="lg" variant="outline" className="bg-white border-2 border-[#EE7674] text-[#EE7674] hover:bg-[#EE7674]/10 px-12 py-8 text-xl font-black">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20 md:py-32 bg-white">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-black text-[#1F1F1F] mb-4">Core Features</h3>
          <div className="w-24 h-2 bg-[#EE7674] mx-auto mb-6"></div>
          <p className="text-xl text-[#4A4A4A] font-medium">Everything you need to stay connected with the JEC MCA community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeFeature === feature.id;
            return (
              <Card
                key={feature.id}
                className={`p-8 cursor-pointer transition-all duration-300 border-2 ${
                  isActive ? "border-[#EE7674] bg-[#F9B5AC]/10 shadow-xl" : "border-[#D0D6B5] hover:border-[#EE7674] hover:shadow-xl"
                }`}
                onClick={() => setActiveFeature(isActive ? null : feature.id)}
              >
                <div className="flex items-start gap-5 mb-6">
                  <div className="p-4 bg-[#EE7674]/10 rounded-xl">
                    <Icon className="w-8 h-8 text-[#EE7674]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-[#1F1F1F]">{feature.title}</h4>
                    <p className="text-sm font-bold text-[#EE7674] mt-1 uppercase tracking-wider">{feature.stats}</p>
                  </div>
                </div>
                <p className="text-base text-[#4A4A4A] leading-relaxed">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="bg-[#9DBF9E] py-24 md:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-black text-white mb-4">Our Impact</h3>
            <div className="w-24 h-2 bg-white mx-auto mb-6"></div>
            <p className="text-xl text-white/90 font-medium">Metrics that showcase the platform's reach and engagement</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-10 text-center border-none shadow-2xl bg-white">
                <p className="text-4xl md:text-5xl font-black text-[#EE7674] mb-3">{stat.value}</p>
                <p className="text-base font-bold text-[#1F1F1F] uppercase tracking-widest">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="container py-24 md:py-32 bg-white">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-black text-[#1F1F1F] mb-4">Technical Architecture</h3>
          <div className="w-24 h-2 bg-[#EE7674] mx-auto mb-6"></div>
          <p className="text-xl text-[#4A4A4A] font-medium">Built on modern, scalable technologies</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Card className="p-10 border-4 border-[#987284]/20 bg-white hover:border-[#987284] transition-colors">
            <h4 className="font-black text-2xl text-[#987284] mb-6 flex items-center gap-3">
              <TrendingUp className="w-7 h-7" />
              Frontend
            </h4>
            <ul className="space-y-4 text-lg text-[#4A4A4A] font-medium">
              <li className="flex items-center gap-2"><span className="text-[#987284]">●</span> React 19 + TS</li>
              <li className="flex items-center gap-2"><span className="text-[#987284]">●</span> Tailwind CSS 4</li>
              <li className="flex items-center gap-2"><span className="text-[#987284]">●</span> shadcn/ui</li>
              <li className="flex items-center gap-2"><span className="text-[#987284]">●</span> Responsive UI</li>
            </ul>
          </Card>

          <Card className="p-10 border-4 border-[#9DBF9E]/20 bg-white hover:border-[#9DBF9E] transition-colors">
            <h4 className="font-black text-2xl text-[#9DBF9E] mb-6 flex items-center gap-3">
              <TrendingUp className="w-7 h-7" />
              Backend
            </h4>
            <ul className="space-y-4 text-lg text-[#4A4A4A] font-medium">
              <li className="flex items-center gap-2"><span className="text-[#9DBF9E]">●</span> Supabase Auth</li>
              <li className="flex items-center gap-2"><span className="text-[#9DBF9E]">●</span> Client-side Logic</li>
              <li className="flex items-center gap-2"><span className="text-[#9DBF9E]">●</span> Firebase Hosting</li>
              <li className="flex items-center gap-2"><span className="text-[#9DBF9E]">●</span> Direct DB Access</li>
            </ul>
          </Card>

          <Card className="p-10 border-4 border-[#D0D6B5]/20 bg-white hover:border-[#D0D6B5] transition-colors">
            <h4 className="font-black text-2xl text-[#D0D6B5] mb-6 flex items-center gap-3">
              <TrendingUp className="w-7 h-7" />
              Database
            </h4>
            <ul className="space-y-4 text-lg text-[#4A4A4A] font-medium">
              <li className="flex items-center gap-2"><span className="text-[#D0D6B5]">●</span> Supabase DB</li>
              <li className="flex items-center gap-2"><span className="text-[#D0D6B5]">●</span> Custom Schema</li>
              <li className="flex items-center gap-2"><span className="text-[#D0D6B5]">●</span> Real-time Sync</li>
              <li className="flex items-center gap-2"><span className="text-[#D0D6B5]">●</span> Scalable Design</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="bg-[#F9B5AC] py-24 md:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-black text-[#1F1F1F] mb-4">Why Choose This Platform?</h3>
            <div className="w-24 h-2 bg-[#EE7674] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="flex gap-6 bg-white p-8 rounded-2xl shadow-xl">
              <Heart className="w-10 h-10 text-[#EE7674] flex-shrink-0" />
              <div>
                <h4 className="text-xl font-black text-[#1F1F1F] mb-3">Community Focused</h4>
                <p className="text-base text-[#4A4A4A] font-medium">Built specifically for JEC MCA alumni to foster meaningful connections and lifelong relationships.</p>
              </div>
            </div>

            <div className="flex gap-6 bg-white p-8 rounded-2xl shadow-xl">
              <TrendingUp className="w-10 h-10 text-[#EE7674] flex-shrink-0" />
              <div>
                <h4 className="text-xl font-black text-[#1F1F1F] mb-3">Career Growth</h4>
                <p className="text-base text-[#4A4A4A] font-medium">Job board, mentorship program, and success stories to support professional development.</p>
              </div>
            </div>

            <div className="flex gap-6 bg-white p-8 rounded-2xl shadow-xl">
              <Users className="w-10 h-10 text-[#EE7674] flex-shrink-0" />
              <div>
                <h4 className="text-xl font-black text-[#1F1F1F] mb-3">Easy Networking</h4>
                <p className="text-base text-[#4A4A4A] font-medium">Search alumni by batch, company, or skills. Connect and message directly with ease.</p>
              </div>
            </div>

            <div className="flex gap-6 bg-white p-8 rounded-2xl shadow-xl">
              <Star className="w-10 h-10 text-[#EE7674] flex-shrink-0" />
              <div>
                <h4 className="text-xl font-black text-[#1F1F1F] mb-3">Secure & Private</h4>
                <p className="text-base text-[#4A4A4A] font-medium">Supabase authentication, privacy controls, and secure data handling for peace of mind.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 md:py-32">
        <Card className="p-16 bg-[#987284] border-none text-center shadow-2xl">
          <h3 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to Join the Network?</h3>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
            Connect with fellow JEC MCA alumni, explore career opportunities, and grow together as a community.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button onClick={() => setLocation('/auth')} size="lg" className="bg-white text-[#987284] hover:bg-white/90 px-12 py-8 text-xl font-black shadow-xl">
              Create Account
            </Button>
            <Button onClick={() => setLocation('/auth')} size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-12 py-8 text-xl font-black">
              View Directory
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-[#1F1F1F] py-16 text-white">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EE7674] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl">JEC</span>
              </div>
              <span className="text-2xl font-black tracking-tighter">JEC MCA Alumni Network</span>
            </div>
            <div className="flex gap-10 text-base font-bold">
              <a href="#" className="hover:text-[#EE7674] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#EE7674] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#EE7674] transition-colors">Contact Us</a>
            </div>
            <p className="text-base text-white/60 font-medium">
              © {new Date().getFullYear()} JEC MCA Alumni Network.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
