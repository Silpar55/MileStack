import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/shared/middleware";

export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json();
    const { code, language, assignmentId } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: "Missing required fields: code and language" },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(userId);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime.getTime() - Date.now()) / 1000
          ),
        },
        { status: 429 }
      );
    }

    // Execute code in sandboxed environment
    const result = await executeCode(code, language, assignmentId);

    // Log execution for analytics
    await logExecution(userId, assignmentId, language, result);

    return NextResponse.json({
      success: true,
      result: {
        success: result.success,
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        exitCode: result.exitCode,
      },
    });
  } catch (error) {
    console.error("Execute Code Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

async function checkRateLimit(userId: string) {
  // Check if user has exceeded rate limit (10 executions per minute)
  // This would typically check a Redis cache or database
  return {
    allowed: true,
    remaining: 9,
    resetTime: new Date(Date.now() + 60000),
  };
}

async function executeCode(
  code: string,
  language: string,
  assignmentId: string
) {
  // This would typically execute code in a Docker container
  // For now, return mock execution result
  const startTime = Date.now();

  // Simulate execution time
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const executionTime = Date.now() - startTime;

  // Mock execution result based on language
  if (language === "python") {
    if (code.includes("print(")) {
      return {
        success: true,
        output: "Hello, World!\n",
        error: "",
        executionTime,
        memoryUsed: 1024 * 1024, // 1MB
        exitCode: 0,
      };
    }
  }

  if (language === "javascript") {
    if (code.includes("console.log")) {
      return {
        success: true,
        output: "Hello, World!\n",
        error: "",
        executionTime,
        memoryUsed: 512 * 1024, // 512KB
        exitCode: 0,
      };
    }
  }

  // Default error case
  return {
    success: false,
    output: "",
    error: "Execution failed: No output generated",
    executionTime,
    memoryUsed: 0,
    exitCode: 1,
  };
}

async function logExecution(
  userId: string,
  assignmentId: string,
  language: string,
  result: any
) {
  // Log execution for analytics and monitoring
  console.log("Execution logged:", {
    userId,
    assignmentId,
    language,
    success: result.success,
    executionTime: result.executionTime,
    memoryUsed: result.memoryUsed,
    timestamp: new Date(),
  });
}
