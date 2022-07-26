import { Token } from 'typescript-parsec';
import { TokenKind } from './tokenizer';

export namespace AST {
  interface BaseNode {
    type: string;
  }

  export class Identifier implements BaseNode {
    type = 'Identifier';
    name: string;
    constructor(t: Token<TokenKind>) {
      this.name = t.text;
    }
  }

  export class NumberLiteral implements BaseNode {
    type = 'NumberLiteral';
    value: number;
    constructor(t: Token<TokenKind>) {
      this.value = +t.text;
    }
  }

  export class Quote implements BaseNode {
    type = 'Quote';
    value: string;
    constructor(t: Token<TokenKind>) {
      this.value = t.text;
    }
  }

  export class ProcedureCallExpression implements BaseNode {
    type = 'ProcedureCallExpression';
    operator: Expression;
    operands: Expression[];
    constructor(operator: Expression, operands: Expression[]) {
      this.operator = operator;
      this.operands = operands;
    }
  }

  export class NotExpression implements BaseNode {
    type = 'NotExpression';
    operand: Expression;
    constructor(operand: Expression) {
      this.operand = operand;
    }
  }

  export class IfExpression implements BaseNode {
    type = 'IfExpression';
    test: Expression;
    consequent: Expression;
    alternate?: Expression;
    constructor(test: Expression, consequent: Expression, alternate?: Expression) {
      this.test = test;
      this.consequent = consequent;
      this.alternate = alternate;
    }
  }

  export class CondExpression implements BaseNode {
    type = 'CondExpression';
    cases: [Expression, Expression[]][];
    defaultCase?: Expression[];
    constructor(cases: [Expression, Expression[]][], defaultCase?: Expression[]) {
      this.cases = cases;
      this.defaultCase = defaultCase;
    }
  }

  export class DefineConstantExpression implements BaseNode {
    type = 'DefineConstantExpression';
    name: string;
    exp: Expression;
    constructor(name: string, exp: Expression) {
      this.name = name;
      this.exp = exp;
    }
  }

  export class DefineFunctionExpression implements BaseNode {
    type = 'DefineFunctionExpression';
    name: string;
    params: string[];
    body: Expression[];
    constructor(name: string, params: string[], body: Expression[]) {
      this.name = name;
      this.params = params;
      this.body = body;
    }
  }

  export class LambdaExpression implements BaseNode {
    type = 'LambdaExpression';
    params: string[];
    body: Expression[];
    constructor(params: string[], body: Expression[]) {
      this.params = params;
      this.body = body;
    }
  }

  export class StringLiteral implements BaseNode {
    type = 'StringLiteral';
    value: string;
    constructor(t: Token<TokenKind>) {
      this.value = t.text;
    }
  }

  export class QuotationExpression implements BaseNode {
    type = 'QuotationExpression';
    quote: (Quote | NumberLiteral | StringLiteral | QuotationExpression)[];
    constructor(q: (Quote | NumberLiteral | StringLiteral | QuotationExpression)[]) {
      this.quote = q;
    }
  }

  export class SequenceExpression implements BaseNode {
    type = 'SequenceExpression';
    sequence: Expression[];
    constructor(sequence: Expression[]) {
      this.sequence = sequence;
    }
  }

  export class SetExpression implements BaseNode {
    type = 'SetExpression';
    operation: 'set!' | 'set-car!' | 'set-cdr!';
    variable: Identifier;
    value: Expression;
    constructor(operation: 'set!' | 'set-car!' | 'set-cdr!', variable: Identifier, value: Expression) {
      this.operation = operation;
      this.variable = variable;
      this.value = value;
    }
  }

  export type Literal = NumberLiteral | StringLiteral;

  export type Expression =
    | Identifier
    | Literal
    | Quote
    | ProcedureCallExpression
    | NotExpression
    | IfExpression
    | CondExpression
    | DefineConstantExpression
    | DefineFunctionExpression
    | LambdaExpression
    | SequenceExpression
    | QuotationExpression
    | SetExpression;
}
