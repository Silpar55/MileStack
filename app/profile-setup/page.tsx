"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MilestackLogo } from "@/components/MilestackLogo";
import {
  ArrowRight,
  ArrowLeft,
  User,
  GraduationCap,
  Target,
  Code,
  Shield,
  BookOpen,
  CheckCircle,
  Search,
  Building,
  Award,
  FileText,
} from "lucide-react";

interface FormData {
  // Personal Information
  fullName: string;
  email: string;
  university: string;
  major: string;
  year: string;

  // Skills Assessment
  programmingLanguages: { [key: string]: string };
  experienceLevel: string;
  learningGoals: string[];

  // Institution
  institutionId: string;
  institutionName: string;

  // Academic Integrity
  honorCodeAccepted: boolean;
  digitalSignature: string;
  signatureTimestamp: string;

  // Privacy & Consent
  dataUsageConsent: boolean;
  marketingConsent: boolean;
  researchParticipation: boolean;
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [institutionResults, setInstitutionResults] = useState([]);
  const [showHonorCodeModal, setShowHonorCodeModal] = useState(false);
  const [showWhyThisWorks, setShowWhyThisWorks] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    university: "",
    major: "",
    year: "",
    programmingLanguages: {},
    experienceLevel: "",
    learningGoals: [],
    institutionId: "",
    institutionName: "",
    honorCodeAccepted: false,
    digitalSignature: "",
    signatureTimestamp: "",
    dataUsageConsent: false,
    marketingConsent: false,
    researchParticipation: false,
  });

  // Form persistence in localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("profileSetupData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("profileSetupData", JSON.stringify(formData));
  }, [formData]);

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const programmingLanguages = [
    { id: "javascript", name: "JavaScript", icon: "🟨" },
    { id: "python", name: "Python", icon: "🐍" },
    { id: "java", name: "Java", icon: "☕" },
    { id: "cpp", name: "C++", icon: "⚡" },
    { id: "csharp", name: "C#", icon: "🔷" },
    { id: "go", name: "Go", icon: "🐹" },
    { id: "rust", name: "Rust", icon: "🦀" },
    { id: "php", name: "PHP", icon: "🐘" },
    { id: "ruby", name: "Ruby", icon: "💎" },
    { id: "swift", name: "Swift", icon: "🍎" },
    { id: "kotlin", name: "Kotlin", icon: "🟣" },
    { id: "typescript", name: "TypeScript", icon: "🔷" },
  ];

  const proficiencyLevels = [
    {
      value: "beginner",
      label: "Beginner",
      description: "New to programming or this language",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "Can write basic programs and understand concepts",
    },
    {
      value: "advanced",
      label: "Advanced",
      description: "Experienced with complex projects and best practices",
    },
  ];

  const learningGoals = [
    "Improve coding skills",
    "Prepare for job interviews",
    "Complete academic assignments",
    "Learn new technologies",
    "Build a portfolio",
    "Collaborate with peers",
    "Get AI assistance for learning",
    "Track learning progress",
    "Contribute to open source",
    "Start a tech career",
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Submit to API
      const response = await fetch("/api/profile/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        localStorage.removeItem("profileSetupData");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Profile setup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchInstitutions = async (query: string) => {
    if (query.length < 2) return;

    try {
      const response = await fetch(
        `/api/institutions/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setInstitutionResults(data.institutions || []);
    } catch (error) {
      console.error("Institution search error:", error);
    }
  };

  const handleInstitutionSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInstitutionSearch(query);
    searchInstitutions(query);
  };

  const selectInstitution = (institution: any) => {
    setFormData({
      ...formData,
      institutionId: institution.id,
      institutionName: institution.name,
    });
    setInstitutionSearch(institution.name);
    setInstitutionResults([]);
  };

  const updateProgrammingLanguage = (
    languageId: string,
    proficiency: string
  ) => {
    setFormData({
      ...formData,
      programmingLanguages: {
        ...formData.programmingLanguages,
        [languageId]: proficiency,
      },
    });
  };

  const toggleLearningGoal = (goal: string) => {
    const goals = formData.learningGoals.includes(goal)
      ? formData.learningGoals.filter((g) => g !== goal)
      : [...formData.learningGoals, goal];

    setFormData({ ...formData, learningGoals: goals });
  };

  const handleHonorCodeAcceptance = () => {
    const signature = prompt(
      "Please type your full name to digitally sign the honor code:"
    );
    if (signature) {
      setFormData({
        ...formData,
        honorCodeAccepted: true,
        digitalSignature: signature,
        signatureTimestamp: new Date().toISOString(),
      });
      setShowHonorCodeModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MilestackLogo size={60} />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <p className="text-muted-foreground">
            Help us personalize your learning experience and establish your
            academic integrity commitment
          </p>

          {/* Progress Indicator */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>
                Step {step} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="your.email@university.edu"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="major">Major/Field of Study *</Label>
                    <Input
                      id="major"
                      value={formData.major}
                      onChange={(e) =>
                        setFormData({ ...formData, major: e.target.value })
                      }
                      placeholder="e.g., Computer Science, Engineering"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Academic Year *</Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) =>
                        setFormData({ ...formData, year: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="freshman">Freshman</SelectItem>
                        <SelectItem value="sophomore">Sophomore</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Skills Assessment */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <Code className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="text-lg font-semibold">Skills Assessment</h3>
                </div>

                <div>
                  <Label className="text-base font-medium mb-4 block">
                    Programming Languages & Proficiency
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programmingLanguages.map((language) => (
                      <Card key={language.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">
                              {language.icon}
                            </span>
                            <span className="font-medium">{language.name}</span>
                          </div>
                          {formData.programmingLanguages[language.id] && (
                            <Badge variant="outline">
                              {
                                proficiencyLevels.find(
                                  (p) =>
                                    p.value ===
                                    formData.programmingLanguages[language.id]
                                )?.label
                              }
                            </Badge>
                          )}
                        </div>
                        <Select
                          value={
                            formData.programmingLanguages[language.id] || ""
                          }
                          onValueChange={(value) =>
                            updateProgrammingLanguage(language.id, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select proficiency" />
                          </SelectTrigger>
                          <SelectContent>
                            {proficiencyLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                <div>
                                  <div className="font-medium">
                                    {level.label}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {level.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Institution Selection */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <Building className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Institution Selection
                  </h3>
                </div>

                <div>
                  <Label htmlFor="institution">
                    Your Institution (Optional)
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="institution"
                      value={institutionSearch}
                      onChange={handleInstitutionSearch}
                      placeholder="Search for your university or institution..."
                      className="pl-10"
                    />
                    {institutionResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {institutionResults.map((institution: any) => (
                          <button
                            key={institution.id}
                            onClick={() => selectInstitution(institution)}
                            className="w-full text-left px-4 py-2 hover:bg-muted border-b last:border-b-0"
                          >
                            <div className="font-medium">
                              {institution.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {institution.location}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    This helps us provide institution-specific features and
                    partnerships.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Learning Goals */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <Target className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="text-lg font-semibold">Learning Goals</h3>
                </div>

                <div>
                  <Label className="text-base font-medium mb-4 block">
                    What are your primary learning goals? (Select all that
                    apply)
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {learningGoals.map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          id={goal}
                          checked={formData.learningGoals.includes(goal)}
                          onCheckedChange={() => toggleLearningGoal(goal)}
                        />
                        <Label
                          htmlFor={goal}
                          className="text-sm cursor-pointer"
                        >
                          {goal}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Academic Integrity */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Academic Integrity Commitment
                  </h3>
                </div>

                <Card className="border-2 border-primary/20">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold">
                            Academic Integrity Pledge
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            By using Milestack, you commit to maintaining the
                            highest standards of academic integrity.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <p>
                          • All work submitted must be your own original work
                        </p>
                        <p>
                          • Use AI assistance as a learning tool, not a shortcut
                        </p>
                        <p>• Document all sources and collaboration</p>
                        <p>• Report any violations you witness</p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowHonorCodeModal(true)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Read Full Honor Code
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowWhyThisWorks(true)}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Why This Works
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="honorCode"
                          checked={formData.honorCodeAccepted}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleHonorCodeAcceptance();
                            } else {
                              setFormData({
                                ...formData,
                                honorCodeAccepted: false,
                                digitalSignature: "",
                                signatureTimestamp: "",
                              });
                            }
                          }}
                        />
                        <Label htmlFor="honorCode" className="text-sm">
                          I accept the Academic Integrity Honor Code and commit
                          to ethical learning practices
                        </Label>
                      </div>

                      {formData.honorCodeAccepted && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              Digitally signed by: {formData.digitalSignature}
                            </span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            Signed on{" "}
                            {new Date(
                              formData.signatureTimestamp
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 6: Privacy & Consent */}
            {step === 6 && (
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <Award className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="text-lg font-semibold">Privacy & Consent</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="dataUsage"
                      checked={formData.dataUsageConsent}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          dataUsageConsent: !!checked,
                        })
                      }
                    />
                    <div>
                      <Label htmlFor="dataUsage" className="font-medium">
                        Data Usage Consent *
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        I consent to Milestack using my learning data to improve
                        the platform and provide personalized educational
                        experiences.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="marketing"
                      checked={formData.marketingConsent}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          marketingConsent: !!checked,
                        })
                      }
                    />
                    <div>
                      <Label htmlFor="marketing">
                        Marketing Communications (Optional)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        I would like to receive updates about new features,
                        educational content, and platform improvements.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="research"
                      checked={formData.researchParticipation}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          researchParticipation: !!checked,
                        })
                      }
                    />
                    <div>
                      <Label htmlFor="research">
                        Research Participation (Optional)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        I agree to participate in educational research studies
                        that may help improve learning outcomes for all
                        students.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={
                  isLoading ||
                  (step === 5 && !formData.honorCodeAccepted) ||
                  (step === 6 && !formData.dataUsageConsent)
                }
                className="bg-gradient-to-r from-primary to-blue-400"
              >
                {isLoading
                  ? "Saving..."
                  : step === totalSteps
                  ? "Complete Setup"
                  : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Honor Code Modal */}
      {showHonorCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Academic Integrity Honor Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <h4>Our Commitment to Academic Integrity</h4>
                <p>
                  Milestack is built on the foundation of academic integrity and
                  ethical learning. We believe that true learning happens when
                  students engage authentically with educational content.
                </p>

                <h4>Student Responsibilities</h4>
                <ul>
                  <li>All work submitted must be your own original work</li>
                  <li>Use AI assistance as a learning tool, not a shortcut</li>
                  <li>Clearly document all sources and collaboration</li>
                  <li>Report any violations you witness</li>
                  <li>Maintain respectful and inclusive interactions</li>
                </ul>

                <h4>AI Assistance Guidelines</h4>
                <p>
                  Our AI assistant is designed to guide your learning, not
                  complete your work. Acceptable uses include:
                </p>
                <ul>
                  <li>Asking for conceptual explanations</li>
                  <li>Requesting code reviews and feedback</li>
                  <li>Getting help with debugging</li>
                  <li>Learning new programming concepts</li>
                </ul>

                <h4>Consequences of Violations</h4>
                <p>Violations of this honor code may result in:</p>
                <ul>
                  <li>Assignment failure</li>
                  <li>Academic probation</li>
                  <li>Record on transcript</li>
                  <li>Loss of platform access</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowHonorCodeModal(false)}
                >
                  Close
                </Button>
                <Button onClick={handleHonorCodeAcceptance}>
                  I Accept & Sign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Why This Works Modal */}
      {showWhyThisWorks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Why This Works: The Science Behind Milestack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <h4>Research-Backed Learning Approach</h4>
                <p>
                  Milestack is built on decades of educational research showing
                  that students learn best when they:
                </p>
                <ul>
                  <li>
                    Engage actively with material rather than passively
                    consuming it
                  </li>
                  <li>Receive immediate feedback on their understanding</li>
                  <li>Practice explaining concepts to others</li>
                  <li>Build connections between new and existing knowledge</li>
                </ul>

                <h4>Key Research Citations</h4>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-primary pl-4">
                    <p>
                      <strong>Active Learning:</strong> Freeman et al. (2014)
                      found that active learning increases student performance
                      by 6% in STEM courses.{" "}
                      <em>Proceedings of the National Academy of Sciences</em>.
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p>
                      <strong>Immediate Feedback:</strong> Shute (2008)
                      demonstrated that formative feedback improves learning
                      outcomes by 0.4 standard deviations.{" "}
                      <em>Review of Educational Research</em>.
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <p>
                      <strong>Peer Learning:</strong> Johnson & Johnson (2009)
                      showed that cooperative learning increases achievement by
                      0.5 standard deviations.{" "}
                      <em>Educational Psychology Review</em>.
                    </p>
                  </div>
                </div>

                <h4>AI-Assisted Learning Benefits</h4>
                <p>Our AI system is designed to:</p>
                <ul>
                  <li>
                    Provide personalized explanations based on your learning
                    style
                  </li>
                  <li>
                    Ask Socratic questions that guide you to discover answers
                  </li>
                  <li>
                    Adapt difficulty based on your demonstrated understanding
                  </li>
                  <li>
                    Encourage metacognitive reflection on your learning process
                  </li>
                </ul>

                <h4>Academic Integrity Through Design</h4>
                <p>Rather than fighting AI use, we embrace it ethically by:</p>
                <ul>
                  <li>
                    Designing assignments that require understanding, not just
                    completion
                  </li>
                  <li>
                    Using AI to enhance learning rather than replace thinking
                  </li>
                  <li>
                    Creating transparent systems that track learning progress
                  </li>
                  <li>Building community around shared learning goals</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowWhyThisWorks(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
