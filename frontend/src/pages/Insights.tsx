import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

/* ---------- SIMPLE SKELETON (NO STYLE IMPACT) ---------- */
const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-xl bg-muted/40 ${className}`} />
);

const Insights = () => {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [salaryData, setSalaryData] = useState<any[]>([]);
  const [hotSkills, setHotSkills] = useState<any[]>([]);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [marketTrends, setMarketTrends] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const payload = await apiFetch<{
          salaryData: any[];
          hotSkills: any[];
          topCompanies: any[];
          marketTrends: any[];
        }>("/api/insights/market");

        if (!mounted) return;

        setSalaryData(payload.salaryData ?? []);
        setHotSkills(payload.hotSkills ?? []);
        setTopCompanies(payload.topCompanies ?? []);
        setMarketTrends(payload.marketTrends ?? []);
        setFetchError(null);
      } catch (err: any) {
        console.error("Insights fetch error:", err);
        if (mounted) setFetchError("Failed to load insights");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header (UNCHANGED) */}
          <div className="text-center mb-12">
            <h1 className="font-mono text-4xl md:text-5xl font-bold mb-4">
              Industry <span className="gradient-text">Insights</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time market data, salary benchmarks, and trending skills.
            </p>
          </div>

          {/* ---------- LOADING STATE (MATCHES LAYOUT) ---------- */}
          {loading && (
            <>
              <div className="mb-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-36" />
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-52" />
                ))}
              </div>
            </>
          )}

          {/* ---------- ERROR STATE ---------- */}
          {fetchError && !loading && (
            <div className="text-center text-red-500 mt-16">
              {fetchError}
            </div>
          )}

          {/* ---------- REAL CONTENT (UNCHANGED STRUCTURE) ---------- */}
          {!loading && !fetchError && (
            <>
              {/* Market Trends */}
              <div className="mb-12">
                <h2 className="font-mono text-2xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Market Trends
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {marketTrends.map((trend, index) => (
                    <Card key={index} className="glass-card p-6 h-full">
                      <h3 className="font-mono font-semibold mb-2">
                        {trend.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {trend.description}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Median Salaries</h3>
                  {salaryData.map((s) => {
                    const median =
                      s.median ?? Math.round((s.min + s.max) / 2);
                    return (
                      <div
                        key={s.role}
                        className="flex justify-between items-center"
                      >
                        <span>{s.role}</span>
                        <span className="font-mono">
                          ₹{median.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Hot Skills</h3>
                  {hotSkills.map((h) => (
                    <div
                      key={h.name}
                      className="flex justify-between"
                    >
                      <span>{h.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {h.demand}
                      </span>
                    </div>
                  ))}
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">
                    Top Companies Hiring
                  </h3>
                  {topCompanies.map((c) => (
                    <div
                      key={c.name}
                      className="flex justify-between"
                    >
                      <span>{c.name}</span>
                      <span className="font-mono">
                        {c.openings}
                      </span>
                    </div>
                  ))}
                </Card>
              </div>

              <Card className="glass-card p-8 text-center mt-10">
                <h3 className="font-mono text-2xl font-bold mb-2">
                  Ready to Land Your Dream Job?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Use these insights to improve your resume and interviews.
                </p>
                <Button size="lg">
                  Build Resume
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Insights;
