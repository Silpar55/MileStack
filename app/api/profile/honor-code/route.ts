import { NextResponse } from "next/server";

export async function GET() {
  try {
    const honorCode = {
      title: "Academic Integrity Honor Code",
      version: "1.0",
      lastUpdated: "2024-01-15",
      content: {
        preamble:
          "Milestack is built on the foundation of academic integrity and ethical learning. We believe that true learning happens when students engage authentically with educational content.",

        studentResponsibilities: [
          "All work submitted must be your own original work",
          "Use AI assistance as a learning tool, not a shortcut",
          "Clearly document all sources and collaboration",
          "Report any violations you witness",
          "Maintain respectful and inclusive interactions",
        ],

        aiGuidelines: {
          title: "AI Assistance Guidelines",
          description:
            "Our AI assistant is designed to guide your learning, not complete your work. Acceptable uses include:",
          acceptableUses: [
            "Asking for conceptual explanations",
            "Requesting code reviews and feedback",
            "Getting help with debugging",
            "Learning new programming concepts",
            "Understanding error messages",
            "Exploring alternative approaches",
          ],
          prohibitedUses: [
            "Submitting AI-generated code as your own",
            "Using AI to complete entire assignments",
            "Bypassing learning objectives",
            "Misrepresenting AI assistance as original work",
          ],
        },

        consequences: {
          title: "Consequences of Violations",
          description: "Violations of this honor code may result in:",
          violations: [
            "Assignment failure",
            "Academic probation",
            "Record on transcript",
            "Loss of platform access",
            "Notification to academic institution",
          ],
        },

        reporting: {
          title: "Reporting Violations",
          description:
            "If you witness a violation of this honor code, please report it through:",
          methods: [
            "In-app reporting system",
            "Email: integrity@milestack.edu",
            "Anonymous tip line",
            "Direct contact with instructors",
          ],
        },

        appeals: {
          title: "Appeals Process",
          description:
            "Students have the right to appeal honor code violations through:",
          process: [
            "Submit written appeal within 7 days",
            "Review by independent committee",
            "Opportunity for student to present case",
            "Final decision within 14 days",
          ],
        },
      },

      digitalSignature: {
        required: true,
        description:
          "By digitally signing this honor code, you acknowledge that you have read, understood, and agree to abide by all terms and conditions.",
        timestamp: "Required for legal validity",
      },

      legal: {
        jurisdiction: "United States",
        governingLaw: "Federal and state education law",
        privacyPolicy: "https://milestack.edu/privacy",
        termsOfService: "https://milestack.edu/terms",
      },
    };

    return NextResponse.json(honorCode);
  } catch (error) {
    console.error("Honor code retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
