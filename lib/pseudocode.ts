export type RuntimeValue =
  | number
  | string
  | boolean
  | null
  | RuntimeValue[];

export interface TraceFrame {
  line: number;
  source: string;
  variables: Record<string, RuntimeValue>;
  output: string[];
  stack: string[];
}

export interface ExecutionResult {
  frames: TraceFrame[];
  output: string[];
  variables: Record<string, RuntimeValue>;
  error?: string;
}

interface SourceLine {
  line: number;
  text: string;
}

interface BaseStatement extends SourceLine {
  kind: string;
}

interface SetStatement extends BaseStatement {
  kind: "set";
  name: string;
  expression: string;
}

interface DisplayStatement extends BaseStatement {
  kind: "display";
  expression: string;
}

interface IfStatement extends BaseStatement {
  kind: "if";
  branches: Array<{ condition: string; body: Statement[] }>;
  otherwise: Statement[];
}

interface WhileStatement extends BaseStatement {
  kind: "while";
  condition: string;
  body: Statement[];
}

interface ForStatement extends BaseStatement {
  kind: "for";
  name: string;
  from: string;
  to: string;
  body: Statement[];
}

interface ForEachStatement extends BaseStatement {
  kind: "for-each";
  name: string;
  expression: string;
  body: Statement[];
}

interface AppendStatement extends BaseStatement {
  kind: "append";
  expression: string;
  target: string;
}

interface ReturnStatement extends BaseStatement {
  kind: "return";
  expression: string;
}

interface ExpressionStatement extends BaseStatement {
  kind: "expression";
  expression: string;
}

type Statement =
  | SetStatement
  | DisplayStatement
  | IfStatement
  | WhileStatement
  | ForStatement
  | ForEachStatement
  | AppendStatement
  | ReturnStatement
  | ExpressionStatement;

interface FunctionDefinition {
  name: string;
  parameters: string[];
  body: Statement[];
}

interface Program {
  body: Statement[];
  functions: Map<string, FunctionDefinition>;
}

interface Token {
  type: "number" | "string" | "identifier" | "operator" | "punctuation";
  value: string;
}

const MAX_TRACE_FRAMES = 400;

function normalizeExpression(expression: string) {
  return expression
    .replace(/\bIS NOT EQUAL TO\b/gi, "!=")
    .replace(/\bIS EQUAL TO\b/gi, "==")
    .replace(/\bIS AT LEAST\b/gi, ">=")
    .replace(/\bIS AT MOST\b/gi, "<=")
    .replace(/\bIS GREATER THAN\b/gi, ">")
    .replace(/\bIS LESS THAN\b/gi, "<")
    .replace(/\bAND\b/gi, "&&")
    .replace(/\bOR\b/gi, "||")
    .replace(/\bNOT\b/gi, "!")
    .replace(/\bTRUE\b/gi, "true")
    .replace(/\bFALSE\b/gi, "false")
    .replace(/\bNOTHING\b/gi, "null");
}

function tokenize(expression: string) {
  const source = normalizeExpression(expression);
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const current = source[index];
    if (/\s/.test(current)) {
      index += 1;
      continue;
    }

    if (current === '"') {
      let value = "";
      index += 1;
      while (index < source.length && source[index] !== '"') {
        if (source[index] === "\\" && index + 1 < source.length) {
          index += 1;
          value += source[index];
        } else {
          value += source[index];
        }
        index += 1;
      }
      if (source[index] !== '"') throw new Error("Unterminated text value");
      index += 1;
      tokens.push({ type: "string", value });
      continue;
    }

    const number = source.slice(index).match(/^\d+(?:\.\d+)?/);
    if (number) {
      tokens.push({ type: "number", value: number[0] });
      index += number[0].length;
      continue;
    }

    const identifier = source.slice(index).match(/^[a-z_][a-z0-9_]*/i);
    if (identifier) {
      tokens.push({ type: "identifier", value: identifier[0] });
      index += identifier[0].length;
      continue;
    }

    const operator = ["==", "!=", ">=", "<=", "&&", "||"].find((candidate) =>
      source.startsWith(candidate, index),
    );
    if (operator) {
      tokens.push({ type: "operator", value: operator });
      index += operator.length;
      continue;
    }

    if ("+-*/!<>".includes(current)) {
      tokens.push({ type: "operator", value: current });
      index += 1;
      continue;
    }

    if ("(),[]".includes(current)) {
      tokens.push({ type: "punctuation", value: current });
      index += 1;
      continue;
    }

    throw new Error(`Unsupported expression token "${current}"`);
  }

  return tokens;
}

function applyOperator(
  operator: string,
  left: RuntimeValue,
  right: RuntimeValue,
): RuntimeValue {
  switch (operator) {
    case "+":
      return typeof left === "string" || typeof right === "string"
        ? `${left ?? ""}${right ?? ""}`
        : Number(left) + Number(right);
    case "-":
      return Number(left) - Number(right);
    case "*":
      return Number(left) * Number(right);
    case "/":
      if (Number(right) === 0) throw new Error("Cannot divide by zero");
      return Number(left) / Number(right);
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    case ">":
      return Number(left) > Number(right);
    case "<":
      return Number(left) < Number(right);
    case ">=":
      return Number(left) >= Number(right);
    case "<=":
      return Number(left) <= Number(right);
    case "&&":
      return Boolean(left) && Boolean(right);
    case "||":
      return Boolean(left) || Boolean(right);
    default:
      throw new Error(`Unsupported operator "${operator}"`);
  }
}

function evaluateExpression(
  expression: string,
  scope: Record<string, RuntimeValue>,
  callFunction: (name: string, values: RuntimeValue[]) => RuntimeValue,
) {
  const tokens = tokenize(expression);
  let position = 0;
  const precedence: Record<string, number> = {
    "||": 1,
    "&&": 2,
    "==": 3,
    "!=": 3,
    ">": 4,
    "<": 4,
    ">=": 4,
    "<=": 4,
    "+": 5,
    "-": 5,
    "*": 6,
    "/": 6,
  };

  const parsePrimary = (): RuntimeValue => {
    const token = tokens[position];
    if (!token) throw new Error("Expected a value");

    if (token.type === "operator" && (token.value === "!" || token.value === "-")) {
      position += 1;
      const value = parsePrimary();
      return token.value === "!" ? !Boolean(value) : -Number(value);
    }

    if (token.value === "(") {
      position += 1;
      const value = parseBinary(0);
      if (tokens[position]?.value !== ")") throw new Error('Expected ")"');
      position += 1;
      return value;
    }

    if (token.value === "[") {
      position += 1;
      const values: RuntimeValue[] = [];
      while (tokens[position]?.value !== "]") {
        values.push(parseBinary(0));
        if (tokens[position]?.value === ",") position += 1;
        else if (tokens[position]?.value !== "]")
          throw new Error('Expected "," or "]"');
      }
      position += 1;
      return values;
    }

    position += 1;
    if (token.type === "number") return Number(token.value);
    if (token.type === "string") return token.value;
    if (token.type !== "identifier")
      throw new Error(`Expected a value, found "${token.value}"`);

    if (token.value === "true") return true;
    if (token.value === "false") return false;
    if (token.value === "null") return null;

    if (tokens[position]?.value === "(") {
      position += 1;
      const values: RuntimeValue[] = [];
      while (tokens[position]?.value !== ")") {
        values.push(parseBinary(0));
        if (tokens[position]?.value === ",") position += 1;
        else if (tokens[position]?.value !== ")")
          throw new Error('Expected "," or ")"');
      }
      position += 1;
      return callFunction(token.value, values);
    }

    if (!(token.value in scope))
      throw new Error(`Unknown variable "${token.value}"`);
    return scope[token.value];
  };

  const parseBinary = (minimumPrecedence: number): RuntimeValue => {
    let left = parsePrimary();
    while (true) {
      const operator = tokens[position];
      const currentPrecedence =
        operator?.type === "operator" ? precedence[operator.value] : undefined;
      if (
        currentPrecedence === undefined ||
        currentPrecedence < minimumPrecedence
      ) {
        break;
      }
      position += 1;
      const right = parseBinary(currentPrecedence + 1);
      left = applyOperator(operator.value, left, right);
    }
    return left;
  };

  const value = parseBinary(0);
  if (position !== tokens.length)
    throw new Error(`Unexpected token "${tokens[position].value}"`);
  return value;
}

function parseProgram(source: string): Program {
  const lines = source
    .split(/\r?\n/)
    .map((text, index) => ({
      line: index + 1,
      text: text.trim(),
    }))
    .filter(({ text }) => text && !text.startsWith("//"));
  const functions = new Map<string, FunctionDefinition>();

  const parseBlock = (
    start: number,
    stop: (text: string) => boolean,
  ): { statements: Statement[]; next: number } => {
    const statements: Statement[] = [];
    let index = start;

    while (index < lines.length && !stop(lines[index].text)) {
      const current = lines[index];

      const functionMatch = current.text.match(
        /^FUNCTION\s+([a-z_][a-z0-9_]*)\((.*)\)$/i,
      );
      if (functionMatch) {
        const parsed = parseBlock(
          index + 1,
          (text) => text.toUpperCase() === "END FUNCTION",
        );
        if (lines[parsed.next]?.text.toUpperCase() !== "END FUNCTION")
          throw new Error(`Line ${current.line}: missing END FUNCTION`);
        functions.set(functionMatch[1], {
          name: functionMatch[1],
          parameters: functionMatch[2]
            .split(",")
            .map((parameter) => parameter.trim())
            .filter(Boolean),
          body: parsed.statements,
        });
        index = parsed.next + 1;
        continue;
      }

      const ifMatch = current.text.match(/^IF\s+(.+)\s+THEN$/i);
      if (ifMatch) {
        const branches: IfStatement["branches"] = [];
        const first = parseBlock(index + 1, (text) =>
          /^(ELSE IF\b|ELSE$|END IF$)/i.test(text),
        );
        branches.push({ condition: ifMatch[1], body: first.statements });
        index = first.next;

        while (/^ELSE IF\b/i.test(lines[index]?.text ?? "")) {
          const elseIf = lines[index].text.match(/^ELSE IF\s+(.+)\s+THEN$/i);
          if (!elseIf)
            throw new Error(`Line ${lines[index].line}: invalid ELSE IF`);
          const branch = parseBlock(index + 1, (text) =>
            /^(ELSE IF\b|ELSE$|END IF$)/i.test(text),
          );
          branches.push({ condition: elseIf[1], body: branch.statements });
          index = branch.next;
        }

        let otherwise: Statement[] = [];
        if (lines[index]?.text.toUpperCase() === "ELSE") {
          const fallback = parseBlock(
            index + 1,
            (text) => text.toUpperCase() === "END IF",
          );
          otherwise = fallback.statements;
          index = fallback.next;
        }
        if (lines[index]?.text.toUpperCase() !== "END IF")
          throw new Error(`Line ${current.line}: missing END IF`);
        statements.push({
          kind: "if",
          ...current,
          branches,
          otherwise,
        });
        index += 1;
        continue;
      }

      const whileMatch = current.text.match(/^WHILE\s+(.+)$/i);
      if (whileMatch) {
        const parsed = parseBlock(
          index + 1,
          (text) => text.toUpperCase() === "END WHILE",
        );
        if (lines[parsed.next]?.text.toUpperCase() !== "END WHILE")
          throw new Error(`Line ${current.line}: missing END WHILE`);
        statements.push({
          kind: "while",
          ...current,
          condition: whileMatch[1],
          body: parsed.statements,
        });
        index = parsed.next + 1;
        continue;
      }

      const forEachMatch = current.text.match(
        /^FOR EACH\s+([a-z_][a-z0-9_]*)\s+IN\s+(.+)$/i,
      );
      if (forEachMatch) {
        const parsed = parseBlock(
          index + 1,
          (text) => text.toUpperCase() === "END FOR",
        );
        if (lines[parsed.next]?.text.toUpperCase() !== "END FOR")
          throw new Error(`Line ${current.line}: missing END FOR`);
        statements.push({
          kind: "for-each",
          ...current,
          name: forEachMatch[1],
          expression: forEachMatch[2],
          body: parsed.statements,
        });
        index = parsed.next + 1;
        continue;
      }

      const forMatch = current.text.match(
        /^FOR\s+([a-z_][a-z0-9_]*)\s+FROM\s+(.+)\s+TO\s+(.+)$/i,
      );
      if (forMatch) {
        const parsed = parseBlock(
          index + 1,
          (text) => text.toUpperCase() === "END FOR",
        );
        if (lines[parsed.next]?.text.toUpperCase() !== "END FOR")
          throw new Error(`Line ${current.line}: missing END FOR`);
        statements.push({
          kind: "for",
          ...current,
          name: forMatch[1],
          from: forMatch[2],
          to: forMatch[3],
          body: parsed.statements,
        });
        index = parsed.next + 1;
        continue;
      }

      const setMatch = current.text.match(
        /^SET\s+([a-z_][a-z0-9_]*)\s+TO\s+(.+)$/i,
      );
      if (setMatch) {
        statements.push({
          kind: "set",
          ...current,
          name: setMatch[1],
          expression: setMatch[2],
        });
        index += 1;
        continue;
      }

      const displayMatch = current.text.match(/^DISPLAY\s+(.+)$/i);
      if (displayMatch) {
        statements.push({
          kind: "display",
          ...current,
          expression: displayMatch[1],
        });
        index += 1;
        continue;
      }

      const appendMatch = current.text.match(/^APPEND\s+(.+)\s+TO\s+([a-z_][a-z0-9_]*)$/i);
      if (appendMatch) {
        statements.push({
          kind: "append",
          ...current,
          expression: appendMatch[1],
          target: appendMatch[2],
        });
        index += 1;
        continue;
      }

      const returnMatch = current.text.match(/^RETURN(?:\s+(.+))?$/i);
      if (returnMatch) {
        statements.push({
          kind: "return",
          ...current,
          expression: returnMatch[1] ?? "NOTHING",
        });
        index += 1;
        continue;
      }

      if (/^[a-z_][a-z0-9_]*\(.*\)$/i.test(current.text)) {
        statements.push({
          kind: "expression",
          ...current,
          expression: current.text,
        });
        index += 1;
        continue;
      }

      throw new Error(`Line ${current.line}: unsupported instruction`);
    }

    return { statements, next: index };
  };

  const parsed = parseBlock(0, () => false);
  return { body: parsed.statements, functions };
}

class ReturnSignal {
  readonly value: RuntimeValue;

  constructor(value: RuntimeValue) {
    this.value = value;
  }
}

function displayValue(value: RuntimeValue): string {
  if (value === null) return "NOTHING";
  if (Array.isArray(value)) return `[${value.map(displayValue).join(", ")}]`;
  return String(value);
}

export function executePseudocode(source: string): ExecutionResult {
  const output: string[] = [];
  const frames: TraceFrame[] = [];
  const globals: Record<string, RuntimeValue> = {};

  try {
    const program = parseProgram(source);
    const trace = (
      statement: SourceLine,
      scope: Record<string, RuntimeValue>,
      stack: string[],
    ) => {
      if (frames.length >= MAX_TRACE_FRAMES)
        throw new Error(
          `Simulation stopped after ${MAX_TRACE_FRAMES} steps. Check loop termination.`,
        );
      frames.push({
        line: statement.line,
        source: statement.text,
        variables: { ...scope },
        output: [...output],
        stack: [...stack],
      });
    };

    const runStatements = (
      statements: Statement[],
      scope: Record<string, RuntimeValue>,
      stack: string[],
    ): void => {
      const callFunction = (name: string, values: RuntimeValue[]) => {
        const definition = program.functions.get(name);
        if (!definition) throw new Error(`Unknown function "${name}"`);
        if (values.length !== definition.parameters.length) {
          throw new Error(
            `${name} expects ${definition.parameters.length} arguments, received ${values.length}`,
          );
        }
        const localScope: Record<string, RuntimeValue> = { ...globals };
        definition.parameters.forEach((parameter, index) => {
          localScope[parameter] = values[index];
        });
        try {
          runStatements(definition.body, localScope, [...stack, name]);
        } catch (signal) {
          if (signal instanceof ReturnSignal) return signal.value;
          throw signal;
        }
        return null;
      };
      const evaluate = (expression: string) =>
        evaluateExpression(expression, scope, callFunction);

      for (const statement of statements) {
        switch (statement.kind) {
          case "set":
            scope[statement.name] = evaluate(statement.expression);
            trace(statement, scope, stack);
            break;
          case "display":
            output.push(displayValue(evaluate(statement.expression)));
            trace(statement, scope, stack);
            break;
          case "expression":
            evaluate(statement.expression);
            trace(statement, scope, stack);
            break;
          case "append": {
            const target = scope[statement.target];
            if (!Array.isArray(target))
              throw new Error(`"${statement.target}" is not a list`);
            target.push(evaluate(statement.expression));
            trace(statement, scope, stack);
            break;
          }
          case "if": {
            const branch = statement.branches.find(({ condition }) =>
              Boolean(evaluate(condition)),
            );
            trace(statement, scope, stack);
            runStatements(branch?.body ?? statement.otherwise, scope, stack);
            break;
          }
          case "while":
            while (Boolean(evaluate(statement.condition))) {
              trace(statement, scope, stack);
              runStatements(statement.body, scope, stack);
            }
            trace(statement, scope, stack);
            break;
          case "for": {
            const start = Number(evaluate(statement.from));
            const end = Number(evaluate(statement.to));
            for (let value = start; value <= end; value += 1) {
              scope[statement.name] = value;
              trace(statement, scope, stack);
              runStatements(statement.body, scope, stack);
            }
            break;
          }
          case "for-each": {
            const values = evaluate(statement.expression);
            if (!Array.isArray(values))
              throw new Error(`"${statement.expression}" is not a list`);
            for (const value of values) {
              scope[statement.name] = value;
              trace(statement, scope, stack);
              runStatements(statement.body, scope, stack);
            }
            break;
          }
          case "return": {
            const value = evaluate(statement.expression);
            trace(statement, scope, stack);
            throw new ReturnSignal(value);
          }
        }
      }
    };

    runStatements(program.body, globals, ["main"]);
    return { frames, output, variables: globals };
  } catch (error) {
    return {
      frames,
      output,
      variables: globals,
      error: error instanceof Error ? error.message : "Simulation failed",
    };
  }
}

export function outputMatches(result: ExecutionResult, expected: string[]) {
  return (
    !result.error &&
    result.output.length === expected.length &&
    result.output.every((value, index) => value === expected[index])
  );
}
