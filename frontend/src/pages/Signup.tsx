import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { 
  Zap, Mail, Lock, ArrowRight, User, 
  AlertCircle, Loader2, Eye, EyeOff, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  const passwordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    return strength;
  };

  const strength = passwordStrength(password);
  const strengthLabel = ["Weak", "Fair", "Good", "Strong"][strength] || "";
  const strengthColor = ["red", "orange", "yellow", "green"][strength] || "gray";

  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: { name, email, password },
      });
      
      saveAuth({ user: res.user, token: res.token });
      toast.success("Account created!", {
        description: "Welcome to PREP.AI. Let's get started!",
      });
      nav("/dashboard");
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      setError(errorMsg);
      toast.error("Signup failed", {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-neon-magenta/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-4">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>
          </Link>
          <h1 className="font-mono text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Join PREP.AI
          </h1>
          <p className="text-slate-400">
            Start your interview preparation journey today
          </p>
        </div>

        {/* Signup Card */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-500">{error}</p>
              </motion.div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300 font-semibold">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="pl-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary h-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSignup();
                  }}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 font-semibold">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary h-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSignup();
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 pr-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary h-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSignup();
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= strength
                            ? strengthColor === "red"
                              ? "bg-red-500"
                              : strengthColor === "orange"
                              ? "bg-orange-500"
                              : strengthColor === "yellow"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    strengthColor === "red"
                      ? "text-red-500"
                      : strengthColor === "orange"
                      ? "text-orange-500"
                      : strengthColor === "yellow"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}>
                    {strengthLabel} password
                  </p>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                By signing up, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSignup}
              disabled={loading}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900/50 text-slate-400">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link to="/login">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-slate-700 hover:bg-slate-800/50 text-slate-300"
            >
              Sign In Instead
            </Button>
          </Link>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;