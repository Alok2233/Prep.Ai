import { motion } from "framer-motion";
import { FileText, Mic, BarChart3, Lightbulb, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "ATS Resume Builder",
    description: "Create professionally formatted resumes that pass through Applicant Tracking Systems with a high score.",
    color: "primary",
  },
  {
    icon: Mic,
    title: "AI Interview Practice",
    description: "Practice with voice and text-based interviews. Get real-time transcription and instant AI feedback.",
    color: "secondary",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track your progress with comprehensive analytics. Identify strengths and areas for improvement.",
    color: "accent",
  },
  {
    icon: Lightbulb,
    title: "Industry Insights",
    description: "Stay updated with real-time industry trends, salary benchmarks, and skill demands.",
    color: "neon-green",
  },
  {
    icon: Shield,
    title: "ATS Score Checker",
    description: "Analyze your resume against ATS algorithms and get actionable suggestions to improve your score.",
    color: "neon-blue",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Receive detailed AI-powered feedback on your interview responses with improvement tips.",
    color: "neon-magenta",
  },
];

const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-mono text-3xl md:text-5xl font-bold mb-4">
            Powerful <span className="gradient-text">Features</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to prepare for your dream job, powered by cutting-edge AI technology.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group glass-card p-6 rounded-2xl hover:border-primary/50 transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  style={{
                    boxShadow: `0 0 20px hsl(var(--${feature.color}) / 0.3)`,
                  }}
                >
                  <Icon className={`w-7 h-7 text-${feature.color}`} />
                </div>
                <h3 className="font-mono text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
