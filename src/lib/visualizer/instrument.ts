/**
 * Rewrites a parsed program so that, when run with a tracer bound to `__viz`,
 * it reports every statement, call, return, loop pass and condition result.
 *
 * Injected calls (see runtime.ts for their implementation):
 *   __viz.step(line, reader)                     before each statement
 *   __viz.test(stepIndex, value, text)           wraps if/loop conditions
 *   __viz.cmp(stepIndex, l, r, op, lText, rText) wraps comparisons in conditions
 *   __viz.enter(name, line, endLine, reader)     at function entry
 *   __viz.ret(frame, line, value)                wraps return values
 *   __viz.fail(frame, error) / __viz.exit(frame) function catch / finally
 *   __viz.loopEnter(line, kind) / loopExit() / iter(line)
 *   __viz.guard(error)                           first thing in every catch
 *
 * A "reader" is `{ n: names, c: closureStart, g: (i) => value }`. The getter
 * reads one binding per call so the tracer can try/catch each one: a binding in
 * its temporal dead zone throws and is shown as "uninitialized".
 */
import {
  parse,
  parseExpressionAt,
  type AnyNode,
  type BlockStatement,
  type Class,
  type Expression,
  type Function as AcornFunction,
  type Identifier,
  type Pattern,
  type Program,
  type Statement,
  type TryStatement,
  type VariableDeclaration,
} from "acorn";
import { recursive } from "acorn-walk";
import { generate } from "astring";
import type { LoopState } from "./types";

const SNIPPET_OPTIONS = { ecmaVersion: "latest", allowReturnOutsideFunction: true } as const;
const HOLE_PREFIX = "__viz_P";
const COMPARISON_OPERATORS = new Set(["<", "<=", ">", ">=", "==", "!=", "===", "!=="]);

type Loose = Record<string, unknown>;

interface FnContext {
  kind: "program" | "function";
  hasThis: boolean;
  /** Free variables this function reads from an enclosing function. */
  closure: string[];
  readers: PendingReader[];
}

interface Scope {
  /** Everything declared here — used to resolve identifiers. */
  names: string[];
  /** What a snapshot shows here at the current point of the walk. */
  visible: string[];
  parent: Scope | null;
  fn: FnContext;
  isFunctionRoot: boolean;
  params: string[];
}

interface PendingReader {
  target: Expression;
  localNames: string[];
  ctx: FnContext;
}

// ---------------------------------------------------------------- helpers

function isNode(value: unknown): value is AnyNode {
  return typeof value === "object" && value !== null && typeof (value as Loose).type === "string";
}

interface Located {
  loc?: { start: { line: number }; end: { line: number } } | null;
}

function lineOf(node: Located): number {
  return node.loc?.start.line ?? 0;
}

function endLineOf(node: Located): number {
  return node.loc?.end.line ?? lineOf(node);
}

function parseExpr(source: string): Expression {
  return parseExpressionAt(source, 0, SNIPPET_OPTIONS);
}

function parseStatements(source: string): Statement[] {
  return parse(source, SNIPPET_OPTIONS).body as Statement[];
}

/** Replaces identifiers named `__viz_P<n>` inside a snippet with `holes[n]`. */
function fillHoles<T extends AnyNode>(root: T, holes: AnyNode[]): T {
  const replacement = (value: unknown): AnyNode | null =>
    isNode(value) && value.type === "Identifier" && value.name.startsWith(HOLE_PREFIX)
      ? (holes[Number(value.name.slice(HOLE_PREFIX.length))] ?? null)
      : null;
  const visit = (node: Loose): void => {
    for (const key of Object.keys(node)) {
      if (key === "loc") continue;
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach((item, index) => {
          const swap = replacement(item);
          if (swap) child[index] = swap;
          else if (isNode(item)) visit(item as unknown as Loose);
        });
      } else {
        const swap = replacement(child);
        if (swap) node[key] = swap;
        else if (isNode(child)) visit(child as unknown as Loose);
      }
    }
  };
  visit(root as unknown as Loose);
  return root;
}

function exprWith(source: string, ...holes: AnyNode[]): Expression {
  return fillHoles(parseExpr(source), holes);
}

function statementWith(source: string, ...holes: AnyNode[]): Statement {
  return fillHoles(parseStatements(source)[0], holes);
}

function block(body: Statement[]): BlockStatement {
  return { type: "BlockStatement", body, start: 0, end: 0 };
}

/** All binding names introduced by a pattern, in source order. */
export function patternNames(pattern: Pattern | null): string[] {
  if (!pattern) return [];
  switch (pattern.type) {
    case "Identifier":
      return [pattern.name];
    case "AssignmentPattern":
      return patternNames(pattern.left);
    case "RestElement":
      return patternNames(pattern.argument);
    case "ArrayPattern":
      return pattern.elements.flatMap((element) => patternNames(element));
    case "ObjectPattern":
      return pattern.properties.flatMap((property) =>
        property.type === "RestElement" ? patternNames(property.argument) : patternNames(property.value),
      );
    default:
      return [];
  }
}

function declarationNames(declaration: VariableDeclaration): string[] {
  return declaration.declarations.flatMap((declarator) => patternNames(declarator.id));
}

function unique(names: string[]): string[] {
  return [...new Set(names)];
}

/** `var` names anywhere below a statement, not crossing into functions. */
function nestedVarNames(statement: Statement): string[] {
  const names: string[] = [];
  recursive(statement, null, {
    Function() {
      /* a nested function has its own var scope */
    },
    VariableDeclaration(node, state, walkChild) {
      if (node.kind === "var") names.push(...declarationNames(node));
      for (const declarator of node.declarations) {
        if (declarator.init) walkChild(declarator.init, state);
      }
    },
  });
  return names;
}

interface Hoisted {
  /** Initialised before any statement runs (var, function declarations). */
  early: string[];
  /** let / const / class — shown once their declaration runs. */
  lexical: string[];
}

function collectHoisted(statements: Statement[], isFunctionRoot: boolean): Hoisted {
  const early: string[] = [];
  const lexical: string[] = [];
  for (const statement of statements) {
    if (statement.type === "VariableDeclaration") {
      if (statement.kind === "var") {
        if (isFunctionRoot) early.push(...declarationNames(statement));
      } else {
        lexical.push(...declarationNames(statement));
      }
    } else if (statement.type === "FunctionDeclaration") {
      early.push(statement.id.name);
    } else if (statement.type === "ClassDeclaration") {
      lexical.push(statement.id.name);
    } else if (isFunctionRoot) {
      early.push(...nestedVarNames(statement));
    }
  }
  return { early: unique(early), lexical: unique(lexical) };
}

function lexicalNamesOf(statement: Statement): string[] {
  if (statement.type === "VariableDeclaration" && statement.kind !== "var") return declarationNames(statement);
  if (statement.type === "ClassDeclaration") return [statement.id.name];
  return [];
}

type LoopNode = Extract<
  Statement,
  { type: "ForStatement" | "WhileStatement" | "DoWhileStatement" | "ForInStatement" | "ForOfStatement" }
>;

function loopOf(statement: Statement): LoopNode | null {
  let current: Statement = statement;
  while (current.type === "LabeledStatement") current = current.body;
  switch (current.type) {
    case "ForStatement":
    case "WhileStatement":
    case "DoWhileStatement":
    case "ForInStatement":
    case "ForOfStatement":
      return current;
    default:
      return null;
  }
}

function loopKind(loop: LoopNode): LoopState["kind"] {
  switch (loop.type) {
    case "ForStatement":
      return "for";
    case "WhileStatement":
      return "while";
    case "DoWhileStatement":
      return "do-while";
    case "ForInStatement":
      return "for-in";
    case "ForOfStatement":
      return "for-of";
  }
}

function propertyKeyName(key: AnyNode, computed: boolean): string | undefined {
  if (computed) return undefined;
  if (key.type === "Identifier") return key.name;
  if (key.type === "PrivateIdentifier") return `#${key.name}`;
  if (key.type === "Literal") return String(key.value);
  return undefined;
}

// ---------------------------------------------------------------- instrumenter

class Instrumenter {
  constructor(private readonly source: string) {}

  run(program: Program): Program {
    const ctx: FnContext = { kind: "program", hasThis: false, closure: [], readers: [] };
    const statements = program.body as Statement[];
    const hoisted = collectHoisted(statements, true);
    const root: Scope = {
      names: unique([...hoisted.early, ...hoisted.lexical]),
      visible: [...hoisted.early],
      parent: null,
      fn: ctx,
      isFunctionRoot: true,
      params: [],
    };
    const { directives, rest } = splitDirectives(statements);
    program.body = [...directives, ...parseStatements("let __viz_t;"), ...this.statements(rest, root)];
    this.fillReaders(ctx);
    return program;
  }

  private textOf(node: AnyNode): string {
    return node.end > node.start ? this.source.slice(node.start, node.end) : generate(node as never);
  }

  // ---- scopes & readers

  private childScope(parent: Scope, names: string[], visible: string[] = names): Scope {
    return { names: unique(names), visible: [...visible], parent, fn: parent.fn, isFunctionRoot: false, params: [] };
  }

  private reference(name: string, scope: Scope): void {
    for (let current: Scope | null = scope; current; current = current.parent) {
      if (!current.names.includes(name)) continue;
      const owner = current.fn;
      if (owner !== scope.fn && owner.kind === "function" && !scope.fn.closure.includes(name)) {
        scope.fn.closure.push(name);
      }
      return;
    }
  }

  private reader(scope: Scope, paramsOnly = false): Expression {
    const chain: Scope[] = [];
    for (let current: Scope | null = scope; current; current = current.parent) {
      chain.unshift(current);
      if (current.isFunctionRoot) break;
    }
    const localNames = paramsOnly ? scope.params : unique(chain.flatMap((s) => s.visible));
    const target = parseExpr("0");
    scope.fn.readers.push({ target, localNames, ctx: scope.fn });
    return target;
  }

  /** Once a function is fully walked its closure list is known; build its readers. */
  private fillReaders(ctx: FnContext): void {
    for (const pending of ctx.readers) {
      const locals = pending.localNames;
      const closure = ctx.closure.filter((name) => !locals.includes(name));
      const names = [...(ctx.hasThis ? ["this"] : []), ...locals, ...closure];
      const cases = names.map((name, index) => `case ${index}: return ${name};`).join(" ");
      const source = `({ n: ${JSON.stringify(names)}, c: ${names.length - closure.length}, g: (__viz_i) => { switch (__viz_i) { ${cases} } } })`;
      const built = parseExpr(source);
      const target = pending.target as unknown as Loose;
      for (const key of Object.keys(target)) delete target[key];
      Object.assign(target, built);
    }
  }

  private stepStatement(line: number, scope: Scope): Statement {
    return statementWith(`__viz.step(${line}, ${HOLE_PREFIX}0);`, this.reader(scope));
  }

  /** `(__viz_t = step, test(__viz_t, cond))` — records state, then the condition's result. */
  private condition(test: Expression | null, line: number, scope: Scope): Expression {
    const text = test ? this.textOf(test) : "true";
    const processed = test ? this.withComparisons(this.expression(test, scope) as Expression) : parseExpr("true");
    return exprWith(
      `(__viz_t = __viz.step(${line}, ${HOLE_PREFIX}0), __viz.test(__viz_t, ${HOLE_PREFIX}1, ${JSON.stringify(text)}))`,
      this.reader(scope),
      processed,
    );
  }

  private withComparisons(node: Expression): Expression {
    if (node.type === "BinaryExpression" && COMPARISON_OPERATORS.has(node.operator) && node.left.type !== "PrivateIdentifier") {
      const args = [node.operator, this.textOf(node.left), this.textOf(node.right)].map((s) => JSON.stringify(s)).join(", ");
      return exprWith(`__viz.cmp(__viz_t, ${HOLE_PREFIX}0, ${HOLE_PREFIX}1, ${args})`, node.left, node.right);
    }
    if (node.type === "LogicalExpression") {
      node.left = this.withComparisons(node.left);
      node.right = this.withComparisons(node.right);
    } else if (node.type === "UnaryExpression" && node.operator === "!") {
      node.argument = this.withComparisons(node.argument);
    }
    return node;
  }

  // ---- statements

  private statements(list: Statement[], scope: Scope): Statement[] {
    const out: Statement[] = [];
    for (const statement of list) {
      const loop = loopOf(statement);
      if (loop) {
        if (loop.type === "ForInStatement" || loop.type === "ForOfStatement" || loop.type === "DoWhileStatement") {
          out.push(this.stepStatement(lineOf(statement), scope));
        }
        const processed = this.statement(statement, scope);
        out.push(parseStatements(`__viz.loopEnter(${lineOf(loop)}, ${JSON.stringify(loopKind(loop))});`)[0]);
        const guard = parseStatements("try {} finally { __viz.loopExit(); }")[0] as TryStatement;
        guard.block.body = [processed];
        out.push(guard);
      } else if (
        statement.type === "FunctionDeclaration" ||
        statement.type === "EmptyStatement" ||
        statement.type === "IfStatement"
      ) {
        // Functions are hoisted (nothing runs); `if` records its own step with the condition.
        out.push(this.statement(statement, scope));
      } else {
        out.push(this.stepStatement(lineOf(statement), scope));
        out.push(this.statement(statement, scope));
      }
      for (const name of lexicalNamesOf(statement)) {
        if (!scope.visible.includes(name)) scope.visible.push(name);
      }
    }
    return out;
  }

  private blockScope(body: Statement[], parent: Scope): Scope {
    const hoisted = collectHoisted(body, false);
    return this.childScope(parent, [...hoisted.early, ...hoisted.lexical], hoisted.early);
  }

  /**
   * Always returns a block so we can insert steps into single-statement bodies.
   * `prefix` runs first; `headerLine` adds a step (inside the body's scope) after it.
   */
  private asBlock(body: Statement, scope: Scope, prefix: Statement[] = [], headerLine?: number): BlockStatement {
    const list = body.type === "BlockStatement" ? body.body : [body];
    const inner = this.blockScope(list, scope);
    const header = headerLine === undefined ? [] : [this.stepStatement(headerLine, inner)];
    const processed = this.statements(list, inner);
    return block([...prefix, ...header, ...processed]);
  }

  /** Loop body with an iteration counter (and, for for-of/in, a header step). */
  private loopBody(loop: LoopNode, scope: Scope, headerStep: boolean): BlockStatement {
    const line = lineOf(loop);
    const counter = parseStatements(`__viz.iter(${line});`);
    return this.asBlock(loop.body, scope, counter, headerStep ? line : undefined);
  }

  private statement(statement: Statement, scope: Scope): Statement {
    switch (statement.type) {
      case "BlockStatement":
        return this.asBlock(statement, scope);
      case "ExpressionStatement":
        statement.expression = this.expression(statement.expression, scope) as Expression;
        return statement;
      case "VariableDeclaration":
        this.declaration(statement, scope);
        return statement;
      case "FunctionDeclaration":
        this.fn(statement, statement.id.name, false, scope);
        return statement;
      case "ClassDeclaration":
        this.cls(statement, scope, statement.id.name);
        return statement;
      case "ReturnStatement": {
        const argument = statement.argument
          ? (this.expression(statement.argument, scope) as Expression)
          : parseExpr("undefined");
        statement.argument = exprWith(`__viz.ret(__viz_f, ${lineOf(statement)}, ${HOLE_PREFIX}0)`, argument);
        return statement;
      }
      case "IfStatement":
        statement.test = this.condition(statement.test, lineOf(statement), scope);
        statement.consequent = this.asBlock(statement.consequent, scope);
        if (statement.alternate) {
          statement.alternate =
            statement.alternate.type === "IfStatement"
              ? this.statement(statement.alternate, scope)
              : this.asBlock(statement.alternate, scope);
        }
        return statement;
      case "ForStatement": {
        const init = statement.init;
        const loopScope = this.childScope(
          scope,
          init?.type === "VariableDeclaration" && init.kind !== "var" ? declarationNames(init) : [],
        );
        if (init?.type === "VariableDeclaration") this.declaration(init, loopScope);
        else if (init) statement.init = this.expression(init, scope) as Expression;
        statement.test = this.condition(statement.test ?? null, lineOf(statement), loopScope);
        if (statement.update) statement.update = this.expression(statement.update, loopScope) as Expression;
        statement.body = this.loopBody(statement, loopScope, false);
        return statement;
      }
      case "WhileStatement":
        statement.test = this.condition(statement.test, lineOf(statement), scope);
        statement.body = this.loopBody(statement, scope, false);
        return statement;
      case "DoWhileStatement":
        statement.body = this.loopBody(statement, scope, false);
        statement.test = this.condition(statement.test, lineOf(statement.test), scope);
        return statement;
      case "ForInStatement":
      case "ForOfStatement": {
        statement.right = this.expression(statement.right, scope) as Expression;
        const left = statement.left;
        const loopScope = this.childScope(
          scope,
          left.type === "VariableDeclaration" && left.kind !== "var" ? declarationNames(left) : [],
        );
        if (left.type === "VariableDeclaration") this.declaration(left, loopScope);
        else this.pattern(left, scope);
        statement.body = this.loopBody(statement, loopScope, true);
        return statement;
      }
      case "SwitchStatement": {
        statement.discriminant = this.expression(statement.discriminant, scope) as Expression;
        const caseBodies = statement.cases.flatMap((c) => c.consequent);
        const switchScope = this.blockScope(caseBodies, scope);
        for (const switchCase of statement.cases) {
          if (switchCase.test) switchCase.test = this.expression(switchCase.test, switchScope) as Expression;
          switchCase.consequent = this.statements(switchCase.consequent, switchScope);
        }
        return statement;
      }
      case "TryStatement":
        statement.block = this.asBlock(statement.block, scope);
        if (statement.handler) {
          const handler = statement.handler;
          const original = handler.param;
          const names = patternNames(original ?? null);
          const catchScope = this.childScope(scope, names);
          const prefix: Statement[] = [];
          if (original?.type === "Identifier") {
            prefix.push(parseStatements(`__viz.guard(${original.name});`)[0]);
          } else {
            const caught: Identifier = { type: "Identifier", name: "__viz_ce", start: 0, end: 0 };
            handler.param = caught;
            prefix.push(parseStatements("__viz.guard(__viz_ce);")[0]);
            if (original) {
              this.pattern(original, catchScope);
              prefix.push(statementWith(`let ${HOLE_PREFIX}0 = __viz_ce;`, original));
            }
          }
          handler.body = block([...prefix, ...this.asBlock(handler.body, catchScope).body]);
        }
        if (statement.finalizer) statement.finalizer = this.asBlock(statement.finalizer, scope);
        return statement;
      case "ThrowStatement":
        statement.argument = this.expression(statement.argument, scope) as Expression;
        return statement;
      case "LabeledStatement":
        statement.body = this.statement(statement.body, scope);
        return statement;
      default:
        return statement;
    }
  }

  private declaration(declaration: VariableDeclaration, scope: Scope): void {
    for (const declarator of declaration.declarations) {
      this.pattern(declarator.id, scope);
      if (declarator.init) {
        const hint = declarator.id.type === "Identifier" ? declarator.id.name : undefined;
        declarator.init = this.expression(declarator.init, scope, hint) as Expression;
      }
    }
  }

  // ---- functions & classes

  private fn(node: AcornFunction, name: string, hasThis: boolean, scope: Scope): void {
    const ctx: FnContext = { kind: "function", hasThis, closure: [], readers: [] };
    const params = unique(node.params.flatMap((param) => patternNames(param)));
    const bodyStatements = node.body.type === "BlockStatement" ? node.body.body : [];
    const hoisted = collectHoisted(bodyStatements, true);
    const root: Scope = {
      names: unique([...params, ...hoisted.early, ...hoisted.lexical]),
      visible: unique([...params, ...hoisted.early]),
      parent: scope,
      fn: ctx,
      isFunctionRoot: true,
      params,
    };
    node.params.forEach((param) => this.pattern(param, root));

    let directives: Statement[] = [];
    let body: Statement[];
    if (node.body.type === "BlockStatement") {
      const split = splitDirectives(node.body.body);
      directives = split.directives;
      body = this.statements(split.rest, root);
    } else {
      // Concise arrow body: give it a step and an explicit return.
      const line = lineOf(node.body);
      const value = this.expression(node.body, root) as Expression;
      body = [
        this.stepStatement(line, root),
        statementWith(`return __viz.ret(__viz_f, ${line}, ${HOLE_PREFIX}0);`, value),
      ];
    }

    const paramReader = this.reader(root, true);
    const entry = parseStatements(
      `const __viz_f = __viz.enter(${JSON.stringify(name)}, ${lineOf(node)}, ${endLineOf(node.body)}, ${HOLE_PREFIX}0); let __viz_t;`,
    ).map((statement) => fillHoles(statement, [paramReader]));
    const wrapper = parseStatements(
      "try {} catch (__viz_e) { __viz.fail(__viz_f, __viz_e); throw __viz_e; } finally { __viz.exit(__viz_f); }",
    )[0] as TryStatement;
    wrapper.block.body = body;

    node.body = block([...directives, ...entry, wrapper]);
    node.expression = false;
    this.fillReaders(ctx);
  }

  private cls(node: Class, scope: Scope, nameHint?: string): void {
    if (node.superClass) node.superClass = this.expression(node.superClass, scope) as Expression;
    const className = node.id?.name ?? nameHint ?? "anonymous";
    for (const member of node.body.body) {
      if (member.type === "MethodDefinition") {
        if (member.computed) member.key = this.expression(member.key, scope) as Expression;
        const key = propertyKeyName(member.key, member.computed) ?? "method";
        this.fn(member.value, `${className}.${key}`, true, scope);
      } else if (member.type === "PropertyDefinition") {
        if (member.computed) member.key = this.expression(member.key, scope) as Expression;
        const value = member.value;
        if (value && (value.type === "ArrowFunctionExpression" || value.type === "FunctionExpression")) {
          const key = propertyKeyName(member.key, member.computed) ?? "field";
          this.fn(value, `${className}.${key}`, true, scope);
        } else if (value) {
          member.value = this.expression(value, scope) as Expression;
        }
      }
      // Static blocks are left as they are (they run untraced).
    }
  }

  // ---- expressions & patterns

  private expression(node: AnyNode, scope: Scope, nameHint?: string): AnyNode {
    switch (node.type) {
      case "Identifier":
        this.reference(node.name, scope);
        return node;
      case "FunctionExpression":
      case "ArrowFunctionExpression":
        this.fn(node, node.type === "FunctionExpression" && node.id ? node.id.name : (nameHint ?? "anonymous"), false, scope);
        return node;
      case "ClassExpression":
        this.cls(node, scope, nameHint);
        return node;
      case "MemberExpression":
        node.object = this.expression(node.object, scope) as Expression;
        if (node.computed) node.property = this.expression(node.property, scope) as Expression;
        return node;
      case "ObjectExpression":
        for (const property of node.properties) {
          if (property.type === "SpreadElement") {
            property.argument = this.expression(property.argument, scope) as Expression;
            continue;
          }
          if (property.computed) property.key = this.expression(property.key, scope) as Expression;
          const value = property.value;
          const key = propertyKeyName(property.key, property.computed);
          if (value.type === "FunctionExpression" || value.type === "ArrowFunctionExpression") {
            this.fn(value, value.type === "FunctionExpression" && value.id ? value.id.name : (key ?? "anonymous"), value.type === "FunctionExpression", scope);
          } else {
            property.value = this.expression(value, scope, key) as Expression;
          }
        }
        return node;
      case "AssignmentExpression": {
        if (node.left.type === "MemberExpression" || node.left.type === "Identifier") {
          node.left = this.expression(node.left, scope) as typeof node.left;
        } else {
          this.pattern(node.left, scope);
        }
        const hint =
          node.left.type === "Identifier"
            ? node.left.name
            : node.left.type === "MemberExpression"
              ? propertyKeyName(node.left.property, node.left.computed)
              : undefined;
        node.right = this.expression(node.right, scope, hint) as Expression;
        return node;
      }
      case "MetaProperty":
      case "Literal":
      case "ThisExpression":
      case "Super":
      case "TemplateElement":
        return node;
      default:
        this.children(node, scope);
        return node;
    }
  }

  private children(node: AnyNode, scope: Scope): void {
    const record = node as unknown as Loose;
    for (const key of Object.keys(record)) {
      if (key === "loc" || key === "type") continue;
      const child = record[key];
      if (Array.isArray(child)) {
        child.forEach((item, index) => {
          if (isNode(item)) child[index] = this.expression(item, scope);
        });
      } else if (isNode(child)) {
        record[key] = this.expression(child, scope);
      }
    }
  }

  private pattern(node: Pattern, scope: Scope): void {
    switch (node.type) {
      case "Identifier":
        this.reference(node.name, scope);
        return;
      case "AssignmentPattern": {
        this.pattern(node.left, scope);
        const hint = node.left.type === "Identifier" ? node.left.name : undefined;
        node.right = this.expression(node.right, scope, hint) as Expression;
        return;
      }
      case "RestElement":
        this.pattern(node.argument, scope);
        return;
      case "ArrayPattern":
        for (const element of node.elements) if (element) this.pattern(element, scope);
        return;
      case "ObjectPattern":
        for (const property of node.properties) {
          if (property.type === "RestElement") {
            this.pattern(property.argument, scope);
          } else {
            if (property.computed) property.key = this.expression(property.key, scope) as Expression;
            this.pattern(property.value, scope);
          }
        }
        return;
      case "MemberExpression":
        this.expression(node, scope);
        return;
    }
  }
}

function splitDirectives(statements: Statement[]): { directives: Statement[]; rest: Statement[] } {
  let count = 0;
  while (count < statements.length) {
    const statement = statements[count] as Statement & { directive?: string };
    if (statement.type !== "ExpressionStatement" || typeof statement.directive !== "string") break;
    count += 1;
  }
  return { directives: statements.slice(0, count), rest: statements.slice(count) };
}

/** Instruments a parsed program (mutating it) and returns runnable source. */
export function instrument(program: Program, source: string): string {
  const result = new Instrumenter(source).run(program);
  return generate(result as never);
}
