import { Link } from "react-router-dom";
import { Zap, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-mono text-xl font-bold gradient-text">
                PREP.AI
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md mb-4">
              The ultimate AI-powered placement preparation platform. Build resumes, 
              practice interviews, and land your dream job.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Resume Builder", "Interview Practice", "Industry Insights", "Dashboard"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-mono font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {["Documentation", "Blog", "Support", "Privacy Policy"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 PREP.AI. All rights reserved. Built with 💜 for job seekers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
