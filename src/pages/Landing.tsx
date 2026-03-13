import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, FileText, Video, Library, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Auto Recording",
    description: "NoteTaker.AI joins your meetings automatically and records everything so you never miss a detail.",
  },
  {
    icon: FileText,
    title: "AI Summary & Action Items",
    description: "Get instant AI-generated summaries and clear action items after every meeting.",
  },
  {
    icon: Library,
    title: "Your Meeting Library",
    description: "All your meetings organized in one place. Search, review, and share anytime.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
            <Mic className="h-6 w-6 text-primary-dark" />
            NoteTaker.AI
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center md:py-32">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-foreground opacity-0 animate-fade-in md:text-6xl">
          Your meetings. Recorded, Summarized, Done.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground opacity-0 animate-fade-in [animation-delay:150ms]">
          NoteTaker.AI automatically joins your meetings, records them, and delivers AI summaries and action items instantly.
        </p>
        <div className="mt-10 opacity-0 animate-fade-in [animation-delay:300ms]">
          <Button variant="hero" size="xl" asChild>
            <Link to="/signup">
              Get Started Free <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-card p-8 shadow-card opacity-0 animate-fade-in"
              style={{ animationDelay: `${400 + i * 100}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/40">
                <feature.icon className="h-6 w-6 text-primary-dark" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} NoteTaker.AI — All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
