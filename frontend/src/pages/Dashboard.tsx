import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Target,
  FileText,
  Clock,
  TrendingUp,
  Calendar,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-xl bg-muted/40 ${className}`} />
);

const iconMap = {
  MessageSquare,
  Target,
  FileText,
  Clock,
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const payload = await apiFetch<any>("/api/dashboard/metrics");

        if (!mounted) return;

        setData(payload);
        setFetchError(null);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        if (mounted) setFetchError("Failed to load dashboard data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const COLORS = {
    primary: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
    accent: "hsl(var(--accent))",
    "neon-green": "#00ff88",
    "neon-magenta": "#ff00ff",
    "neon-cyan": "#00ffff",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-mono text-4xl md:text-5xl font-bold mb-2">
              Welcome back, <span className="gradient-text">Champion</span>
            </h1>
            <p className="text-muted-foreground">
              Track your progress and level up your interview skills
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
              </div>
            </>
          )}

          {/* Error State */}
          {fetchError && !loading && (
            <div className="text-center text-red-500 mt-16">{fetchError}</div>
          )}

          {/* Real Content */}
          {!loading && !fetchError && data && (
            <>
              {/* Stats Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {data.stats?.map((stat: any, index: number) => {
                  const Icon = iconMap[stat.icon as keyof typeof iconMap];
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-card p-6 hover:scale-105 transition-transform">
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className={`w-12 h-12 rounded-xl bg-${stat.color}/20 flex items-center justify-center`}
                          >
                            {Icon && <Icon className={`w-6 h-6 text-${stat.color}`} />}
                          </div>
                          {stat.change && (
                            <Badge
                              className={`${
                                stat.change.startsWith("+")
                                  ? "bg-neon-green/20 text-neon-green"
                                  : "bg-red-500/20 text-red-500"
                              } border-0`}
                            >
                              {stat.change}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-sm text-muted-foreground mb-1">
                          {stat.label}
                        </h3>
                        <p className="text-3xl font-mono font-bold gradient-text">
                          {stat.value}
                        </p>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Performance Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-mono text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Performance Trend
                      </h2>
                      <Badge className="bg-primary/20 text-primary border-0">
                        Last 8 Weeks
                      </Badge>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={data.performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", r: 5 }}
                          name="Score"
                        />
                        <Line
                          type="monotone"
                          dataKey="interviews"
                          stroke="#00ff88"
                          strokeWidth={3}
                          dot={{ fill: "#00ff88", r: 5 }}
                          name="Sessions"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </motion.div>

                {/* Skills Progress */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-mono text-xl font-bold flex items-center gap-2">
                        <Award className="w-5 h-5 text-neon-magenta" />
                        Skills Mastery
                      </h2>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={data.skillsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </motion.div>
              </div>

              {/* Bottom Row */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Domain Breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="glass-card p-6">
                    <h2 className="font-mono text-lg font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-neon-cyan" />
                      Domain Focus
                    </h2>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={data.domainBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {data.domainBreakdown?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.color as keyof typeof COLORS] || COLORS.primary} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="lg:col-span-2"
                >
                  <Card className="glass-card p-6">
                    <h2 className="font-mono text-lg font-bold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Recent Activity
                    </h2>
                    <div className="space-y-3">
                      {data.recentActivity?.map((activity: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                activity.type === "interview"
                                  ? "bg-primary/20"
                                  : "bg-neon-green/20"
                              }`}
                            >
                              {activity.type === "interview" ? (
                                <MessageSquare className="w-5 h-5 text-primary" />
                              ) : (
                                <FileText className="w-5 h-5 text-neon-green" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{activity.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {activity.date}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={`${
                              activity.score >= 80
                                ? "bg-neon-green/20 text-neon-green"
                                : activity.score >= 60
                                ? "bg-primary/20 text-primary"
                                : "bg-yellow-500/20 text-yellow-500"
                            } border-0 font-mono`}
                          >
                            {activity.score}%
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* CTA Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-8"
              >
                <Card className="glass-card p-8 text-center bg-gradient-to-br from-primary/10 via-transparent to-neon-magenta/10">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
                  <h3 className="font-mono text-2xl font-bold mb-2 gradient-text">
                    Ready for Your Next Challenge?
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                    Keep the momentum going! Practice more interviews or build a
                    standout resume.
                  </p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Button variant="gradient" size="lg">
                      Start Interview
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button variant="neon" size="lg">
                      Build Resume
                      <FileText className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;