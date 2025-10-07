import { spawn } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  executionTime: number;
  memoryUsed: number;
}

interface TestCase {
  input: any;
  expectedOutput: any;
  description: string;
  isHidden: boolean;
}

interface TestResult {
  testCaseId: number;
  input: any;
  expectedOutput: any;
  actualOutput: any;
  passed: boolean;
  executionTime: number;
  error?: string;
}

export class CodeExecutionService {
  private static instance: CodeExecutionService;

  public static getInstance(): CodeExecutionService {
    if (!CodeExecutionService.instance) {
      CodeExecutionService.instance = new CodeExecutionService();
    }
    return CodeExecutionService.instance;
  }

  async executeCode(
    code: string,
    language: string,
    testCases: TestCase[],
    timeLimit: number = 5000, // 5 seconds default
    memoryLimit: number = 128 // 128MB default
  ): Promise<{
    status: string;
    executionTime: number;
    memoryUsed: number;
    testResults: TestResult[];
    errorMessage?: string;
  }> {
    const startTime = Date.now();
    const testResults: TestResult[] = [];
    let totalExecutionTime = 0;
    let maxMemoryUsed = 0;

    try {
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const testStartTime = Date.now();

        try {
          const result = await this.runSingleTest(
            code,
            language,
            testCase.input,
            timeLimit,
            memoryLimit
          );

          const testExecutionTime = Date.now() - testStartTime;
          totalExecutionTime += testExecutionTime;

          // Check if output matches expected
          const actualOutput = this.parseOutput(result.output);
          const expectedOutput = this.parseOutput(testCase.expectedOutput);
          const passed = this.compareOutputs(actualOutput, expectedOutput);

          testResults.push({
            testCaseId: i + 1,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: actualOutput,
            passed,
            executionTime: testExecutionTime,
            error: result.error || undefined,
          });

          maxMemoryUsed = Math.max(maxMemoryUsed, result.memoryUsed);

          // If test failed, we can stop here or continue with other tests
          if (!passed && !result.success) {
            break;
          }
        } catch (error) {
          const testExecutionTime = Date.now() - testStartTime;
          totalExecutionTime += testExecutionTime;

          testResults.push({
            testCaseId: i + 1,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: null,
            passed: false,
            executionTime: testExecutionTime,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      const allPassed = testResults.every((result) => result.passed);
      const hasErrors = testResults.some((result) => result.error);

      return {
        status: allPassed ? "passed" : hasErrors ? "error" : "failed",
        executionTime: totalExecutionTime,
        memoryUsed: maxMemoryUsed,
        testResults,
        errorMessage: hasErrors
          ? "Some test cases failed with errors"
          : undefined,
      };
    } catch (error) {
      return {
        status: "error",
        executionTime: Date.now() - startTime,
        memoryUsed: 0,
        testResults,
        errorMessage:
          error instanceof Error ? error.message : "Execution failed",
      };
    }
  }

  private async runSingleTest(
    code: string,
    language: string,
    input: any,
    timeLimit: number,
    memoryLimit: number
  ): Promise<ExecutionResult> {
    const tempDir = tmpdir();
    const fileName = `solution_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    let filePath: string;
    let command: string;
    let args: string[];

    // Prepare file and execution command based on language
    switch (language.toLowerCase()) {
      case "javascript":
        filePath = join(tempDir, `${fileName}.js`);
        await writeFile(filePath, code);
        command = "node";
        args = [filePath];
        break;

      case "python":
        filePath = join(tempDir, `${fileName}.py`);
        await writeFile(filePath, code);
        command = "python3";
        args = [filePath];
        break;

      case "java":
        filePath = join(tempDir, `${fileName}.java`);
        await writeFile(filePath, code);
        command = "javac";
        args = [filePath];
        // Compile first, then run
        await this.executeCommand(command, args, timeLimit);
        command = "java";
        args = [fileName];
        break;

      case "cpp":
        filePath = join(tempDir, `${fileName}.cpp`);
        await writeFile(filePath, code);
        command = "g++";
        args = ["-o", join(tempDir, fileName), filePath];
        // Compile first, then run
        await this.executeCommand(command, args, timeLimit);
        command = join(tempDir, fileName);
        args = [];
        break;

      case "c":
        filePath = join(tempDir, `${fileName}.c`);
        await writeFile(filePath, code);
        command = "gcc";
        args = ["-o", join(tempDir, fileName), filePath];
        // Compile first, then run
        await this.executeCommand(command, args, timeLimit);
        command = join(tempDir, fileName);
        args = [];
        break;

      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    // Execute the code
    const result = await this.executeCommand(command, args, timeLimit, input);

    // Clean up temporary files
    try {
      await unlink(filePath);
      if (language === "java" || language === "cpp" || language === "c") {
        await unlink(join(tempDir, fileName));
      }
    } catch (error) {
      // Ignore cleanup errors
    }

    return result;
  }

  private async executeCommand(
    command: string,
    args: string[],
    timeLimit: number,
    input?: any
  ): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let output = "";
      let error = "";
      let memoryUsed = 0;

      const process = spawn(command, args, {
        stdio: ["pipe", "pipe", "pipe"],
        timeout: timeLimit,
      });

      // Set memory limit if possible
      if (process.setMaxListeners) {
        process.setMaxListeners(1);
      }

      // Send input if provided
      if (input !== undefined) {
        process.stdin.write(JSON.stringify(input));
        process.stdin.end();
      }

      process.stdout.on("data", (data) => {
        output += data.toString();
      });

      process.stderr.on("data", (data) => {
        error += data.toString();
      });

      process.on("close", (code) => {
        const executionTime = Date.now() - startTime;

        resolve({
          success: code === 0,
          output: output.trim(),
          error: error.trim(),
          executionTime,
          memoryUsed, // This would need more sophisticated monitoring
        });
      });

      process.on("error", (err) => {
        const executionTime = Date.now() - startTime;

        resolve({
          success: false,
          output: "",
          error: err.message,
          executionTime,
          memoryUsed: 0,
        });
      });

      // Handle timeout
      setTimeout(() => {
        if (!process.killed) {
          process.kill("SIGTERM");
          resolve({
            success: false,
            output: "",
            error: "Execution timeout",
            executionTime: timeLimit,
            memoryUsed: 0,
          });
        }
      }, timeLimit);
    });
  }

  private parseOutput(output: any): any {
    if (typeof output === "string") {
      try {
        // Try to parse as JSON first
        return JSON.parse(output);
      } catch {
        // If not JSON, return as string
        return output.trim();
      }
    }
    return output;
  }

  private compareOutputs(actual: any, expected: any): boolean {
    // Deep comparison for objects and arrays
    if (typeof actual === "object" && typeof expected === "object") {
      return JSON.stringify(actual) === JSON.stringify(expected);
    }

    // String comparison with trimming
    if (typeof actual === "string" && typeof expected === "string") {
      return actual.trim() === expected.trim();
    }

    // Direct comparison for primitives
    return actual === expected;
  }
}

// Export singleton instance
export const codeExecutionService = CodeExecutionService.getInstance();
