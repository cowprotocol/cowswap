const MAX_PARALLEL_INSTRUCTIONS = 20;

const LINE_CLEARING_ENABLED =
  process.stdout.isTTY &&
  process.stdout.clearLine !== undefined &&
  process.stdout.cursorTo !== undefined;

export interface DisappearingLogFunctions {
  consoleWarn: typeof console.warn;
  consoleLog: typeof console.log;
  consoleError: typeof console.error;
}

interface VanishingProgressMessage {
  message: string;
}

interface RateLimitOptionalParameters {
  message?: string;
  rateLimit?: number;
}

function createDisappearingLogFunctions(
  vanishingProgressMessage: VanishingProgressMessage,
): DisappearingLogFunctions {
  // note: if the message contains more than a line, only the last line is going
  // to vanish
  function clearable<LogInput extends unknown[]>(
    logFunction: (...input: LogInput) => void,
  ): (...input: LogInput) => void {
    return (...args: LogInput) => {
      if (LINE_CLEARING_ENABLED) {
        process.stdout.clearLine(0);
      }
      logFunction(...args);
      if (LINE_CLEARING_ENABLED) {
        process.stdout.write(vanishingProgressMessage.message);
        process.stdout.cursorTo(0);
      }
    };
  }
  return {
    consoleWarn: clearable(console.warn),
    consoleLog: clearable(console.log),
    consoleError: clearable(console.error),
  };
}

export async function promiseAllWithRateLimit<T>(
  instructions: ((logFunctions: DisappearingLogFunctions) => Promise<T>)[],
  { rateLimit: rateLimitInput, message }: RateLimitOptionalParameters = {},
): Promise<T[]> {
  const rateLimit = Math.floor(rateLimitInput ?? MAX_PARALLEL_INSTRUCTIONS);
  if (rateLimit < 1) {
    throw new Error(`Rate limit must be one or larger, found ${rateLimit}`);
  }
  const output: T[] = [];
  const vanishingProgressMessage = { message: "" };
  const disappearingLogFunctions = createDisappearingLogFunctions(
    vanishingProgressMessage,
  );
  for (let step = 0; step < instructions.length / rateLimit; step++) {
    const remainingInstructions = instructions.length - rateLimit * step;
    const instructionsInBatch =
      remainingInstructions >= rateLimit ? rateLimit : remainingInstructions;
    vanishingProgressMessage.message = `Processing steps ${
      step * rateLimit + 1
    } to ${step * rateLimit + instructionsInBatch} of ${instructions.length}${
      message !== undefined ? ` (${message})` : ""
    }...`;
    if (LINE_CLEARING_ENABLED) {
      process.stdout.write(vanishingProgressMessage.message);
      process.stdout.cursorTo(0);
    }
    output.push(
      ...(await Promise.all(
        Array(instructionsInBatch)
          .fill(undefined)
          .map((_, i) =>
            instructions[step * rateLimit + i](disappearingLogFunctions),
          ),
      )),
    );
  }
  if (LINE_CLEARING_ENABLED) {
    process.stdout.clearLine(0);
  }
  return output;
}
