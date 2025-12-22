import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Briefcase, Calendar, Star, MessageSquare, Trophy, TrendingUp, Heart } from "lucide-react";
import { useState } from "react";

export default function Home() {
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">JEC</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">JEC MCA</h1>
              <p className="text-xs text-muted-foreground">Alumni Network</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition">Features</a>
            <a href="#stats" className="text-sm font-medium hover:text-primary transition">Impact</a>
            <a href="#architecture" className="text-sm font-medium hover:text-primary transition">Architecture</a>
            <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-block px-4 py-2 bg-accent rounded-full">
            <p className="text-sm font-medium text-accent-foreground">🎓 JEC MCA Alumni Network</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Connect, Grow, <span className="text-primary">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive digital platform designed to foster lifelong connections among Jabalpur Engineering College MCA alumni, facilitating networking, career development, and community engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Explore Platform
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Core Features</h3>
          <p className="text-lg text-muted-foreground">Everything you need to stay connected with the JEC MCA community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeFeature === feature.id;
            return (
              <Card
                key={feature.id}
                className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isActive ? "ring-2 ring-primary bg-primary/5" : ""
                }`}
                onClick={() => setActiveFeature(isActive ? null : feature.id)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground">{feature.title}</h4>
                    <p className="text-xs font-medium text-primary mt-1">{feature.stats}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="bg-primary/5 py-16 md:py-24 border-y border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Platform Impact</h3>
            <p className="text-lg text-muted-foreground">Metrics that showcase the platform's reach and engagement</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Technical Architecture</h3>
          <p className="text-lg text-muted-foreground">Built on modern, scalable technologies</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 border-2 border-primary/20">
            <h4 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Frontend
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ React 19 with TypeScript</li>
              <li>✓ Tailwind CSS 4</li>
              <li>✓ shadcn/ui Components</li>
              <li>✓ Responsive Design</li>
            </ul>
          </Card>

          <Card className="p-8 border-2 border-primary/20">
            <h4 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Backend
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Express.js & Node.js</li>
              <li>✓ tRPC for Type-Safe APIs</li>
              <li>✓ Manus OAuth</li>
              <li>✓ AWS S3 Storage</li>
            </ul>
          </Card>

          <Card className="p-8 border-2 border-primary/20">
            <h4 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Database
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ MySQL/TiDB</li>
              <li>✓ Drizzle ORM</li>
              <li>✓ Optimized Queries</li>
              <li>✓ Scalable Design</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="bg-primary/5 py-16 md:py-24 border-y border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose This Platform?</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="flex gap-4">
              <Heart className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-foreground mb-2">Community Focused</h4>
                <p className="text-sm text-muted-foreground">Built specifically for JEC MCA alumni to foster meaningful connections and lifelong relationships.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <TrendingUp className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-foreground mb-2">Career Growth</h4>
                <p className="text-sm text-muted-foreground">Job board, mentorship program, and success stories to support professional development.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-foreground mb-2">Easy Networking</h4>
                <p className="text-sm text-muted-foreground">Search alumni by batch, company, or skills. Connect and message directly with ease.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Star className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-foreground mb-2">Secure & Private</h4>
                <p className="text-sm text-muted-foreground">OAuth authentication, privacy controls, and secure data handling for peace of mind.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <Card className="p-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Join the Network?</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with fellow JEC MCA alumni, explore career opportunities, and grow together as a community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Create Account
            </Button>
            <Button size="lg" variant="outline">
              View Documentation
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-foreground mb-4">JEC MCA Alumni</h4>
              <p className="text-sm text-muted-foreground">Connecting alumni for lifelong growth and success.</p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Features</a></li>
                <li><a href="#" className="hover:text-primary transition">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition">Architecture</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Alumni Directory</a></li>
                <li><a href="#" className="hover:text-primary transition">Events</a></li>
                <li><a href="#" className="hover:text-primary transition">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">About JEC</a></li>
                <li><a href="#" className="hover:text-primary transition">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Jabalpur Engineering College MCA Alumni Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
