export type BridgeLanguage = "pseudocode" | "typescript" | "python" | "java";

export const bridgeLanguages: Array<{
  id: BridgeLanguage;
  label: string;
  longLabel: string;
}> = [
  { id: "pseudocode", label: "PSEUDO", longLabel: "Pseudocode" },
  { id: "typescript", label: "TS", longLabel: "TypeScript" },
  { id: "python", label: "PY", longLabel: "Python" },
  { id: "java", label: "JAVA", longLabel: "Java" },
];

export function isPseudocodeSource(source: string) {
  return source
    .split(/\r?\n/)
    .some((line) =>
      /^(SET|READ|DISPLAY|IF|ELSE|END IF|WHILE|END WHILE|FOR|END FOR|FUNCTION|END FUNCTION|RETURN|APPEND)\b/i.test(
        line.trim(),
      ),
    );
}

function translateExpression(
  expression: string,
  language: Exclude<BridgeLanguage, "pseudocode">,
) {
  let translated = expression
    .replace(/\bIS NOT EQUAL TO\b/gi, "!=")
    .replace(/\bIS EQUAL TO\b/gi, "==")
    .replace(/\bIS AT LEAST\b/gi, ">=")
    .replace(/\bIS AT MOST\b/gi, "<=")
    .replace(/\bIS GREATER THAN\b/gi, ">")
    .replace(/\bIS LESS THAN\b/gi, "<");

  if (language === "python") {
    return translated
      .replace(/\bAND\b/gi, "and")
      .replace(/\bOR\b/gi, "or")
      .replace(/\bNOT\b/gi, "not")
      .replace(/\bTRUE\b/g, "True")
      .replace(/\bFALSE\b/g, "False")
      .replace(/\bNOTHING\b/g, "None")
      .replace(/\bLENGTH OF\s+([a-z_][a-z0-9_]*)/gi, "len($1)");
  }

  translated = translated
    .replace(/\bAND\b/gi, "&&")
    .replace(/\bOR\b/gi, "||")
    .replace(/\bNOT\b/gi, "!")
    .replace(/\bTRUE\b/g, "true")
    .replace(/\bFALSE\b/g, "false")
    .replace(/\bNOTHING\b/g, language === "java" ? "null" : "undefined")
    .replace(/\bLENGTH OF\s+([a-z_][a-z0-9_]*)/gi, "$1.length");
  return translated;
}

function translateLine(
  trimmed: string,
  indentation: string,
  language: Exclude<BridgeLanguage, "pseudocode">,
  declared: Set<string>,
) {
  if (!trimmed) return "";
  if (trimmed.startsWith("//")) return `${indentation}${trimmed}`;

  const set = trimmed.match(/^SET\s+([a-z_][a-z0-9_]*)\s+TO\s+(.+)$/i);
  if (set) {
    const [, name, expression] = set;
    const value = translateExpression(expression, language);
    if (language === "python") return `${indentation}${name} = ${value}`;
    const declaration = declared.has(name)
      ? ""
      : language === "java"
        ? "var "
        : "let ";
    declared.add(name);
    return `${indentation}${declaration}${name} = ${value};`;
  }

  const display = trimmed.match(/^DISPLAY\s+(.+)$/i);
  if (display) {
    const value = translateExpression(display[1], language);
    if (language === "python") return `${indentation}print(${value})`;
    if (language === "java")
      return `${indentation}System.out.println(${value});`;
    return `${indentation}console.log(${value});`;
  }

  const read = trimmed.match(/^READ\s+(.+)\s+INTO\s+([a-z_][a-z0-9_]*)$/i);
  if (read) {
    const [, prompt, name] = read;
    declared.add(name);
    if (language === "python")
      return `${indentation}${name} = input(${prompt})`;
    if (language === "java")
      return `${indentation}var ${name} = scanner.nextLine(); // ${prompt}`;
    return `${indentation}const ${name} = prompt(${prompt});`;
  }

  const ifLine = trimmed.match(/^IF\s+(.+)\s+THEN$/i);
  if (ifLine) {
    const condition = translateExpression(ifLine[1], language);
    return language === "python"
      ? `${indentation}if ${condition}:`
      : `${indentation}if (${condition}) {`;
  }

  const elseIf = trimmed.match(/^ELSE IF\s+(.+)\s+THEN$/i);
  if (elseIf) {
    const condition = translateExpression(elseIf[1], language);
    return language === "python"
      ? `${indentation}elif ${condition}:`
      : `${indentation}} else if (${condition}) {`;
  }

  if (/^ELSE$/i.test(trimmed))
    return language === "python"
      ? `${indentation}else:`
      : `${indentation}} else {`;
  if (/^END (IF|WHILE|FOR|FUNCTION)$/i.test(trimmed))
    return language === "python" ? "" : `${indentation}}`;

  const whileLine = trimmed.match(/^WHILE\s+(.+)$/i);
  if (whileLine) {
    const condition = translateExpression(whileLine[1], language);
    return language === "python"
      ? `${indentation}while ${condition}:`
      : `${indentation}while (${condition}) {`;
  }

  const forEach = trimmed.match(
    /^FOR EACH\s+([a-z_][a-z0-9_]*)\s+IN\s+(.+)$/i,
  );
  if (forEach) {
    const [, name, expression] = forEach;
    const values = translateExpression(expression, language);
    if (language === "python")
      return `${indentation}for ${name} in ${values}:`;
    if (language === "java")
      return `${indentation}for (var ${name} : ${values}) {`;
    return `${indentation}for (const ${name} of ${values}) {`;
  }

  const forLine = trimmed.match(
    /^FOR\s+([a-z_][a-z0-9_]*)\s+FROM\s+(.+)\s+TO\s+(.+)$/i,
  );
  if (forLine) {
    const [, name, from, to] = forLine;
    const start = translateExpression(from, language);
    const end = translateExpression(to, language);
    if (language === "python")
      return `${indentation}for ${name} in range(${start}, ${end} + 1):`;
    const declaration = language === "java" ? "int" : "let";
    return `${indentation}for (${declaration} ${name} = ${start}; ${name} <= ${end}; ${name} += 1) {`;
  }

  const functionLine = trimmed.match(
    /^FUNCTION\s+([a-z_][a-z0-9_]*)\((.*)\)$/i,
  );
  if (functionLine) {
    const [, name, parameters] = functionLine;
    if (language === "python")
      return `${indentation}def ${name}(${parameters}):`;
    if (language === "java") {
      const javaParameters = parameters
        .split(",")
        .map((parameter) => parameter.trim())
        .filter(Boolean)
        .map((parameter) => `Object ${parameter}`)
        .join(", ");
      return `${indentation}static Object ${name}(${javaParameters}) {`;
    }
    return `${indentation}function ${name}(${parameters}) {`;
  }

  const returnLine = trimmed.match(/^RETURN(?:\s+(.+))?$/i);
  if (returnLine) {
    const value = returnLine[1]
      ? ` ${translateExpression(returnLine[1], language)}`
      : "";
    return language === "python"
      ? `${indentation}return${value}`
      : `${indentation}return${value};`;
  }

  const append = trimmed.match(
    /^APPEND\s+(.+)\s+TO\s+([a-z_][a-z0-9_]*)$/i,
  );
  if (append) {
    const value = translateExpression(append[1], language);
    const method = language === "python" ? "append" : "push";
    return language === "java"
      ? `${indentation}${append[2]}.add(${value});`
      : `${indentation}${append[2]}.${method}(${value})${language === "python" ? "" : ";"}`;
  }

  if (/^[a-z_][a-z0-9_]*\(.*\)$/i.test(trimmed))
    return `${indentation}${translateExpression(trimmed, language)}${language === "python" ? "" : ";"}`;

  const comment = language === "python" ? "#" : "//";
  return `${indentation}${comment} ${trimmed}`;
}

export function translatePseudocode(
  source: string,
  language: BridgeLanguage,
) {
  if (language === "pseudocode") return source;
  const declared = new Set<string>();
  return source
    .split(/\r?\n/)
    .map((line) => {
      const indentation = line.match(/^\s*/)?.[0] ?? "";
      return translateLine(line.trim(), indentation, language, declared);
    })
    .filter((line, index, lines) => line || lines[index - 1])
    .join("\n")
    .trimEnd();
}
