"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [institutionResults, setInstitutionResults] = useState([]);
  const [showHonorCodeModal, setShowHonorCodeModal] = useState(false);
  const [showWhyThisWorks, setShowWhyThisWorks] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    fullName:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : "",
    email: user?.email || "",
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Update form data when user data changes (for OAuth users)
  useEffect(() => {
    if (user && !formData.fullName && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        fullName:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : prev.fullName,
        email: user.email || prev.email,
      }));
    }
  }, [user, formData.fullName, formData.email]);

  // Pre-populate with user data from auth
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || "",
      }));
    }
  }, [user]);

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

  const totalSteps = 5; // Reduced from 6 since we removed personal info step
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
    // Clear any existing error messages
    setErrorMessage(null);

    // Validate mandatory fields before proceeding
    if (step === 4 && !formData.honorCodeAccepted) {
      setErrorMessage(
        "Please accept the Academic Integrity Honor Code to continue."
      );
      return;
    }

    if (step === 5 && !formData.dataUsageConsent) {
      setErrorMessage("Please accept the Data Usage Consent to continue.");
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSkip = () => {
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

  const validateForm = () => {
    // Check mandatory fields
    if (!formData.dataUsageConsent) {
      setErrorMessage("Please accept the Data Usage Consent to continue.");
      return false;
    }

    if (!formData.honorCodeAccepted) {
      setErrorMessage(
        "Please accept the Academic Integrity Honor Code to continue."
      );
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleSubmit = async () => {
    // Validate mandatory fields
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Get auth token from localStorage or session (for manual login users)
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add Authorization header only if we have a JWT token (for manual login users)
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Submit to API
      const response = await fetch("/api/profile/setup", {
        method: "POST",
        headers,
        credentials: "include", // Include NextAuth session cookies for OAuth users
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.removeItem("profileSetupData");

        // Show success message
        alert(
          `Profile setup completed successfully! Welcome, ${result.user.name}!`
        );
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        alert(`Profile setup failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Profile setup error:", error);
      alert("An unexpected error occurred. Please try again.");
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
    if (signature && signature.trim().length > 0) {
      setFormData({
        ...formData,
        honorCodeAccepted: true,
        digitalSignature: signature.trim(),
        signatureTimestamp: new Date().toISOString(),
      });
      setShowHonorCodeModal(false);
    } else if (signature !== null) {
      alert("Please enter a valid signature.");
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MilestackLogo size={60} />
          </div>
          <CardTitle className="text-2xl">
            Welcome{user ? `, ${user.firstName || "there"}` : ""}! 👋
          </CardTitle>
          <p className="text-muted-foreground">
            Let's personalize your learning experience and set up your academic
            profile. All steps are optional - complete what you'd like!
          </p>

          {/* Progress Indicator */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>
                Step {step} of {totalSteps} (All Optional)
              </span>
              <span>{Math.round(progress)}% Progress</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              💡 You can skip any step and complete your profile later
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Error Message Display */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Skills Assessment */}
            {step === 1 && (
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

            {/* Step 2: Institution Selection */}
            {step === 2 && (
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

            {/* Step 3: Learning Goals */}
            {step === 3 && (
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

            {/* Step 4: Academic Integrity */}
            {step === 4 && (
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

            {/* Step 5: Privacy & Consent */}
            {step === 5 && (
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
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="text-muted-foreground"
                >
                  Skip Step
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary to-blue-400"
                >
                  {isLoading
                    ? "Saving..."
                    : step === totalSteps
                    ? "Complete Setup"
                    : "Continue"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
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
