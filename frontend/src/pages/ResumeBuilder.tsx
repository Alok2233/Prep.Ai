// src/pages/ResumeBuilder.tsx
import { useState } from "react";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Briefcase, GraduationCap, Code, Award, FileText, 
  Sparkles, CheckCircle2, AlertCircle, Plus, Trash2 
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Badge } from "lucide-react";
interface Experience {
  id: string;
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

const ResumeBuilder = () => {
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  });

  const [experiences, setExperiences] = useState<Experience[]>([
    { id: "1", company: "", position: "", duration: "", description: "" },
  ]);

  const [education, setEducation] = useState<Education[]>([
    { id: "1", institution: "", degree: "", year: "" },
  ]);

  const [skills, setSkills] = useState("");
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { id: Date.now().toString(), company: "", position: "", duration: "", description: "" },
    ]);
  };

  const removeExperience = (id: string) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((exp) => exp.id !== id));
    }
  };

  const addEducation = () => {
    setEducation([
      ...education,
      { id: Date.now().toString(), institution: "", degree: "", year: "" },
    ]);
  };

  const removeEducation = (id: string) => {
    if (education.length > 1) {
      setEducation(education.filter((edu) => edu.id !== id));
    }
  };

 
  const analyzeResume = async () => {
    setIsAnalyzing(true);
    try {
      const body = {
        userId: "demo-user", // replace with real user id if available
        personalInfo,
        experiences,
        education,
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
      };
      const res = await apiFetch<{
        atsScore?: number;
        improvements?: string[];
        strengths?: string[];
      }>("/api/resume/analyze", {
        method: "POST",
        body,
      });

      // backend returns structured JSON as defined in server code
      setAtsScore(res.atsScore ?? null);
      // optional: show improvements or strengths via toast
      if (res.improvements && res.improvements.length) {
        toast.success(`Suggestions: ${res.improvements.slice(0,3).join(", ")}`);
      }
      toast.success(`ATS Score: ${res.atsScore ?? "N/A"}%`, {
        description: res.atsScore && res.atsScore >= 85 ? "Great job! Your resume is ATS-optimized." : "Consider improving keywords and formatting.",
      });
    } catch (err: any) {
      console.error("Resume analyze error:", err);
      toast.error("Resume analysis failed: " + (err.message || ""));
    } finally {
      setIsAnalyzing(false);
    }
  };
const downloadResumePDF = () => {
  const doc = new jsPDF();

  let y = 20;

  // Helper
  const addLine = (text: string, size = 11, bold = false) => {
    doc.setFont("Helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.text(text, 20, y);
    y += size + 4;
  };

  // Name
  addLine(personalInfo.name || "Your Name", 18, true);

  // Contact
  const contact = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
  ].filter(Boolean).join(" | ");
  if (contact) {
    addLine(contact, 10);
    y += 4;
  }

  // Summary
  if (personalInfo.summary) {
    addLine("PROFESSIONAL SUMMARY", 12, true);
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(personalInfo.summary, 170);
    doc.text(summaryLines, 20, y);
    y += summaryLines.length * 6 + 6;
  }

  // Experience
  if (experiences.some(e => e.company || e.position)) {
    addLine("EXPERIENCE", 12, true);
    experiences.forEach(exp => {
      if (!exp.company && !exp.position) return;

      addLine(`${exp.position} - ${exp.company}`, 11, true);
      if (exp.duration) addLine(exp.duration, 9);
      if (exp.description) {
        const descLines = doc.splitTextToSize(exp.description, 170);
        doc.setFontSize(10);
        doc.text(descLines, 20, y);
        y += descLines.length * 6 + 4;
      }
      y += 2;
    });
  }

  // Education
  if (education.some(e => e.institution || e.degree)) {
    addLine("EDUCATION", 12, true);
    education.forEach(ed => {
      if (!ed.institution && !ed.degree) return;
      addLine(`${ed.degree} - ${ed.institution}`, 11, true);
      if (ed.year) addLine(ed.year, 9);
      y += 2;
    });
  }

  // Skills
  if (skills) {
    addLine("SKILLS", 12, true);
    const skillText = skills
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .join(", ");
    const skillLines = doc.splitTextToSize(skillText, 170);
    doc.setFontSize(10);
    doc.text(skillLines, 20, y);
  }

  doc.save(`${personalInfo.name || "resume"}.pdf`);
};

  /* ---------- ORIGINAL JSX BELOW (UNCHANGED) ---------- */
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
          <div className="text-center mb-12">
            <h1 className="font-mono text-4xl md:text-5xl font-bold mb-4">
              ATS Resume <span className="gradient-text">Builder</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create a professionally formatted resume optimized for Applicant Tracking Systems.
            </p>
          </div>

          {/* ATS Score Card */}
          {atsScore !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Card className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      atsScore >= 85 ? "bg-neon-green/20" : atsScore >= 70 ? "bg-primary/20" : "bg-destructive/20"
                    }`}>
                      {atsScore >= 85 ? (
                        <CheckCircle2 className="w-6 h-6 text-neon-green" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-mono font-semibold">ATS Score</h3>
                      <p className="text-sm text-muted-foreground">
                        {atsScore >= 85 ? "Excellent" : atsScore >= 70 ? "Good" : "Needs Improvement"}
                      </p>
                    </div>
                  </div>
                  <div className="font-mono text-4xl font-bold gradient-text">
                    {atsScore}%
                  </div>
                </div>
                <Progress value={atsScore ?? 0} className="h-2" />
              </Card>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6 glass-card p-1">
                  <TabsTrigger value="personal" className="data-[state=active]:bg-primary/20">
                    <User className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="experience" className="data-[state=active]:bg-primary/20">
                    <Briefcase className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="education" className="data-[state=active]:bg-primary/20">
                    <GraduationCap className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="data-[state=active]:bg-primary/20">
                    <Code className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="achievements" className="data-[state=active]:bg-primary/20">
                    <Award className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <Card className="glass-card p-6">
                    <h3 className="font-mono text-lg font-semibold mb-4">Personal Info</h3>
                    <div className="space-y-3">
                      <Input placeholder="Full name" value={personalInfo.name} onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })} />
                      <Input placeholder="Email" value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} />
                      <Input placeholder="Phone" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} />
                      <Input placeholder="Location" value={personalInfo.location} onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })} />
                      <Textarea placeholder="Professional summary" value={personalInfo.summary} onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })} rows={4} />
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="experience">
                  <Card className="glass-card p-6">
                    <h3 className="font-mono text-lg font-semibold mb-4">Experience</h3>
                    <div className="space-y-4">
                      {experiences.map((exp, idx) => (
                        <div key={exp.id} className="space-y-2">
                          <Input placeholder="Position" value={exp.position} onChange={(e) => setExperiences(experiences.map((ex, i) => i === idx ? { ...ex, position: e.target.value } : ex))} />
                          <Input placeholder="Company" value={exp.company} onChange={(e) => setExperiences(experiences.map((ex, i) => i === idx ? { ...ex, company: e.target.value } : ex))} />
                          <Input placeholder="Duration" value={exp.duration} onChange={(e) => setExperiences(experiences.map((ex, i) => i === idx ? { ...ex, duration: e.target.value } : ex))} />
                          <Textarea placeholder="Description" value={exp.description} onChange={(e) => setExperiences(experiences.map((ex, i) => i === idx ? { ...ex, description: e.target.value } : ex))} rows={3} />
                          <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => removeExperience(exp.id)}>
                              <Trash2 /> Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="ghost" onClick={addExperience}><Plus /> Add Experience</Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="education">
                  <Card className="glass-card p-6">
                    <h3 className="font-mono text-lg font-semibold mb-4">Education</h3>
                    <div className="space-y-4">
                      {education.map((edu, idx) => (
                        <div key={edu.id} className="space-y-2">
                          <Input placeholder="Institution" value={edu.institution} onChange={(e) => setEducation(education.map((ed, i) => i === idx ? { ...ed, institution: e.target.value } : ed))} />
                          <Input placeholder="Degree" value={edu.degree} onChange={(e) => setEducation(education.map((ed, i) => i === idx ? { ...ed, degree: e.target.value } : ed))} />
                          <Input placeholder="Year" value={edu.year} onChange={(e) => setEducation(education.map((ed, i) => i === idx ? { ...ed, year: e.target.value } : ed))} />
                          <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => removeEducation(edu.id)}>
                              <Trash2 /> Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="ghost" onClick={addEducation}><Plus /> Add Education</Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="skills">
                  <Card className="glass-card p-6">
                    <h3 className="font-mono text-lg font-semibold mb-4">Skills</h3>
                    <div className="space-y-2">
                      <Label>Comma separated</Label>
                      <Input placeholder="React, Node, SQL" value={skills} onChange={(e) => setSkills(e.target.value)} />
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="achievements">
                  <Card className="glass-card p-6">
                    <h3 className="font-mono text-lg font-semibold mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-neon-magenta" />
                      Achievements & Certifications
                    </h3>
                    <div className="space-y-2">
                      <Label>Notable Achievements</Label>
                      <Textarea
                        placeholder="• AWS Certified Solutions Architect&#10;• Led team that increased revenue by 40%&#10;• Published research paper on ML algorithms"
                        rows={6}
                        className="bg-muted/50"
                      />
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 mt-6">
                <Button variant="gradient" size="lg" className="flex-1" onClick={analyzeResume} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze ATS Score
                    </>
                  )}
                </Button>
                <Button variant="neon" size="lg" onClick={downloadResumePDF}>

                  <FileText className="w-5 h-5" />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Card className="glass-card p-8 min-h-[600px]">
                <div className="text-center mb-6">
                  <h2 className="font-mono text-2xl font-bold">
                    {personalInfo.name || "Your Name"}
                  </h2>
                  <div className="text-sm text-muted-foreground mt-2 flex items-center justify-center flex-wrap gap-2">
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {personalInfo.email && personalInfo.phone && <span>•</span>}
                    {personalInfo.phone && <span>{personalInfo.phone}</span>}
                    {personalInfo.phone && personalInfo.location && <span>•</span>}
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                  </div>
                </div>

                {personalInfo.summary && (
                  <div className="mb-6">
                    <h3 className="font-mono font-semibold text-primary mb-2 border-b border-border pb-1">
                      PROFESSIONAL SUMMARY
                    </h3>
                    <p className="text-sm text-muted-foreground">{personalInfo.summary}</p>
                  </div>
                )}

                {experiences.some((exp) => exp.company || exp.position) && (
                  <div className="mb-6">
                    <h3 className="font-mono font-semibold text-primary mb-2 border-b border-border pb-1">
                      EXPERIENCE
                    </h3>
                    {experiences.map((exp) =>
                      (exp.company || exp.position) && (
                        <div key={exp.id} className="mb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm">{exp.position}</p>
                              <p className="text-sm text-muted-foreground">{exp.company}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{exp.duration}</span>
                          </div>
                          {exp.description && <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>}
                        </div>
                      )
                    )}
                  </div>
                )}

                {education.some((ed) => ed.institution || ed.degree) && (
                  <div className="mb-6">
                    <h3 className="font-mono font-semibold text-primary mb-2 border-b border-border pb-1">
                      EDUCATION
                    </h3>
                    {education.map((ed) =>
                      (ed.institution || ed.degree) && (
                        <div key={ed.id} className="mb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm">{ed.degree}</p>
                              <p className="text-sm text-muted-foreground">{ed.institution}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{ed.year}</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {skills && (
                  <div>
                    <h3 className="font-mono font-semibold text-primary mb-2 border-b border-border pb-1">
                      SKILLS
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.split(",").map((s) => s.trim()).filter(Boolean).map((s, i) => (
                        <Badge key={i} className="bg-muted/20">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ResumeBuilder;
