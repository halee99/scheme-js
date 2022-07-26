import { kleft, kmid, rep_sc, Token } from 'typescript-parsec';
import { expectEOF, expectSingleResult, rule } from 'typescript-parsec';
import { alt, apply, seq, tok, kright, str } from 'typescript-parsec';

import { TokenKind, tokenizer } from './tokenizer';
import { AST } from './ast';

const NUMBER = rule<TokenKind, AST.NumberLiteral>();
const STRING = rule<TokenKind, AST.StringLiteral>();
const IDENTIFIER = rule<TokenKind, AST.Identifier>();
const PROCEDURE_CALL = rule<TokenKind, AST.ProcedureCallExpression>();
const NOT_EXPRESSION = rule<TokenKind, AST.NotExpression>();
const EXPRESSION = rule<TokenKind, AST.Expression>();
const IF_EXPRESSION = rule<TokenKind, AST.IfExpression>();
const COND_EXPRESSION = rule<TokenKind, AST.CondExpression>();
const SEQUENCE = rule<TokenKind, AST.Expression[]>();
const VARIABLE = rule<TokenKind, AST.Identifier>();
const BUILT_IN_IDENTIFIER = rule<TokenKind, AST.Identifier>();
const BODY = rule<TokenKind, AST.Expression[]>();
const CALL_PATTERN = rule<TokenKind, [AST.Identifier, AST.Identifier[]]>();
const DEFINITION = rule<TokenKind, AST.DefineConstantExpression | AST.DefineFunctionExpression>();
const BOUND_VAR_LIST = rule<TokenKind, AST.Identifier[]>();
const LAMBDA = rule<TokenKind, AST.LambdaExpression>();
const BINDING_SPEC = rule<TokenKind, [AST.Identifier, AST.Expression]>();
const LET = rule<TokenKind, AST.Expression>();
const DATUM = rule<TokenKind, AST.QuotationExpression | AST.Quote | AST.NumberLiteral>();
const LIST = rule<TokenKind, AST.QuotationExpression>();
const QUOTATION = rule<TokenKind, AST.QuotationExpression | AST.Quote | AST.NumberLiteral>();
const BEGIN = rule<TokenKind, AST.SequenceExpression>();
const SET = rule<TokenKind, AST.SetExpression>();


NUMBER.setPattern(apply(tok(TokenKind.NumberLiteral), t => new AST.NumberLiteral(t)));
STRING.setPattern(apply(tok(TokenKind.StringLiteral), t => new AST.StringLiteral(t)));
IDENTIFIER.setPattern(apply(tok(TokenKind.Identifier), t => new AST.Identifier(t)));
BUILT_IN_IDENTIFIER.setPattern(
  apply(tok(TokenKind.BuiltInIdentifier), t => new AST.Identifier(t))
);
// =======  DEFINE PARSER RULES =======
/**
 * SEQUENCE ::= <EXPRESSION>+
 */
SEQUENCE.setPattern(apply(seq(EXPRESSION, rep_sc(EXPRESSION)), ([head, tail]) => [head, ...tail]));

VARIABLE.setPattern(apply(IDENTIFIER, t => t));
// <body> ::= <definition>* <sequence>
BODY.setPattern(apply(seq(rep_sc(DEFINITION), SEQUENCE), ([definitions, sequence]) => [...definitions, ...sequence]));

// <definition> ::= (define <variable> <expression>)
//     | (define <call pattern> <body>)
DEFINITION.setPattern(
  alt(
    apply(
      seq(tok(TokenKind.OpenParen), kright(tok(TokenKind.Define), VARIABLE), EXPRESSION, tok(TokenKind.CloseParen)),
      ([_, identifier, exp]) => new AST.DefineConstantExpression(identifier.name, exp)
    ),
    apply(
      seq(kright(tok(TokenKind.OpenParen), tok(TokenKind.Define)), CALL_PATTERN, BODY, tok(TokenKind.CloseParen)),
      ([_, [identifier, paramIdentifiers], body]) =>
        new AST.DefineFunctionExpression(
          identifier.name,
          paramIdentifiers.map(e => e.name),
          body
        )
    )
  )
);

// <call pattern> ::= (<pattern> <variable>*)
// <pattern> ::= <variable> | <call pattern>
CALL_PATTERN.setPattern(
  apply(
    seq(kright(tok(TokenKind.OpenParen), VARIABLE), rep_sc(VARIABLE), tok(TokenKind.CloseParen)),
    ([identifier, params]) => [identifier, params]
  )
);

// ======== lambda parser rules =======
// BOUND_VAR_LIST ::= <VARIABLE>
//       | (<VARIABLE>*)
// LAMBDA ::= (lambda <BOUND_VAR_LIST> <body>)
BOUND_VAR_LIST.setPattern(
  alt(
    apply(VARIABLE, id => [id]),
    apply(seq(kright(tok(TokenKind.OpenParen), rep_sc(VARIABLE)), tok(TokenKind.CloseParen)), ([ids]) => ids)
  )
);
LAMBDA.setPattern(
  apply(
    seq(kright(tok(TokenKind.OpenParen), tok(TokenKind.Lambda)), BOUND_VAR_LIST, BODY, tok(TokenKind.CloseParen)),
    ([_, params, body]) =>
      new AST.LambdaExpression(
        params.map(e => e.name),
        body
      )
  )
);

/**
 * PROCEDURE_CALL ::= (<EXPRESSION> <EXPRESSION>*)
 */
PROCEDURE_CALL.setPattern(
  apply(
    seq(kright(tok(TokenKind.OpenParen), EXPRESSION), rep_sc(EXPRESSION), tok(TokenKind.CloseParen)),
    ([operator, operands]) => new AST.ProcedureCallExpression(operator, operands)
  )
);

NOT_EXPRESSION.setPattern(
  apply(
    seq(kright(tok(TokenKind.OpenParen), tok(TokenKind.Not)), EXPRESSION, tok(TokenKind.CloseParen)),
    ([_, exp]) => new AST.NotExpression(exp)
  )
);

/**
 * IF_EXPRESSION ::= (if <EXPRESSION> <EXPRESSION> <EXPRESSION>)
 */
IF_EXPRESSION.setPattern(
  alt(
    apply(
      seq(
        tok(TokenKind.OpenParen),
        kright(tok(TokenKind.If), EXPRESSION),
        EXPRESSION,
        EXPRESSION,
        tok(TokenKind.CloseParen)
      ),
      ([_, test, consequent, alternate]) => new AST.IfExpression(test, consequent, alternate)
    ),
    apply(
      seq(tok(TokenKind.OpenParen), kright(tok(TokenKind.If), EXPRESSION), EXPRESSION, tok(TokenKind.CloseParen)),
      ([_, test, consequent]) => new AST.IfExpression(test, consequent)
    )
  )
);

/**
 * CASE_EXPRESSION ::= (<EXPRESSION> <EXPRESSION>)
 */
const CASE_EXPRESSION = rule<TokenKind, [AST.Expression, AST.Expression[]]>();
CASE_EXPRESSION.setPattern(
  apply(
    seq(kright(tok(TokenKind.OpenParen), EXPRESSION), SEQUENCE, tok(TokenKind.CloseParen)),
    ([test, sequence]) => [test, sequence]
  )
);
/**
 * ELSE_EXPRESSION ::= (else <EXPRESSION>)
 */
const ELSE_EXPRESSION = rule<TokenKind, AST.Expression[]>();
ELSE_EXPRESSION.setPattern(
  apply(
    seq(tok(TokenKind.OpenParen), kright(tok(TokenKind.Else), SEQUENCE), tok(TokenKind.CloseParen)),
    ([_, sequence]) => sequence
  )
);
/**
 * COND_EXPRESSION ::= (cond <CASE_EXPRESSION>* <ELSE_EXPRESSION>+)
 */
COND_EXPRESSION.setPattern(
  alt(
    apply(
      seq(
        kright(tok(TokenKind.OpenParen), tok(TokenKind.Cond)),
        rep_sc(CASE_EXPRESSION),
        ELSE_EXPRESSION,
        tok(TokenKind.CloseParen)
      ),
      ([_, cases, _else]) => new AST.CondExpression(cases, _else)
    ),
    apply(
      seq(kright(tok(TokenKind.OpenParen), tok(TokenKind.Cond)), rep_sc(CASE_EXPRESSION), tok(TokenKind.CloseParen)),
      ([_, cases]) => new AST.CondExpression(cases)
    )
  )
);

// LET ::= (let (<BINDING_SPEC>*) <BODY>)
LET.setPattern(
  apply(
    seq(
      kmid(tok(TokenKind.OpenParen), str('let'), tok(TokenKind.OpenParen)),
      kleft(rep_sc(BINDING_SPEC), tok(TokenKind.CloseParen)),
      BODY,
      tok(TokenKind.CloseParen)
    ),
    ([_, bindings, body]) =>
      new AST.ProcedureCallExpression(
        new AST.LambdaExpression(
          bindings.map(e => e[0].name),
          body
        ),
        bindings.map(e => e[1])
      )
  )
);
// <BINDING_SPEC> ::= (<VARIABLE> <EXPRESSION>)
BINDING_SPEC.setPattern(
  apply(seq(kright(tok(TokenKind.OpenParen), VARIABLE), EXPRESSION, tok(TokenKind.CloseParen)), ([identifier, exp]) => [
    identifier,
    exp,
  ])
);

// 
DATUM.setPattern(
  alt(
    apply(tok(TokenKind.BuiltInIdentifier), t => new AST.Quote(t)),
    apply(tok(TokenKind.If), t => new AST.Quote(t)),
    apply(tok(TokenKind.Cond), t => new AST.Quote(t)),
    apply(tok(TokenKind.Else), t => new AST.Quote(t)),
    apply(tok(TokenKind.Define), t => new AST.Quote(t)),
    apply(tok(TokenKind.Lambda), t => new AST.Quote(t)),
    apply(tok(TokenKind.Quote), t => new AST.Quote(t)),
    apply(tok(TokenKind.Begin), t => new AST.Quote(t)),
    apply(tok(TokenKind.Set), t => new AST.Quote(t)),
    apply(tok(TokenKind.Identifier), t => new AST.Quote(t)),
    apply(tok(TokenKind.NumberLiteral), t => new AST.NumberLiteral(t)),
    apply(tok(TokenKind.StringLiteral), t => new AST.StringLiteral(t)),
    apply(LIST, t => t),
  )
)
LIST.setPattern(
  apply(
    seq(tok(TokenKind.OpenParen), rep_sc(DATUM), tok(TokenKind.CloseParen)),
    ([_, datums]) => new AST.QuotationExpression(datums),
  )
)

QUOTATION.setPattern(
  alt(
    apply(
      seq(kleft(tok(TokenKind.OpenParen), tok(TokenKind.Quote)), DATUM, tok(TokenKind.CloseParen)),
      ([_, datum]) => datum,
    ),
    apply(
      seq(tok(TokenKind.OneQuotation), DATUM),
      ([_, datum]) => datum,
    )
  )
)

BEGIN.setPattern(
  apply(
    seq(kright(tok(TokenKind.OpenParen), tok(TokenKind.Begin)), rep_sc(EXPRESSION), tok(TokenKind.CloseParen)),
    ([_, expressions]) => new AST.SequenceExpression(expressions),
  )
)

SET.setPattern(
  apply(
    seq(kright(tok(TokenKind.OpenParen), tok(TokenKind.Set)), IDENTIFIER, EXPRESSION, tok(TokenKind.CloseParen)),
    ([op, identifier, expression]) => new AST.SetExpression(op.text as any, identifier, expression),
  )
)

/**
 * EXPRESSION ::= NUMBER
 * | IDENTIFIER
 * | IF_EXPRESSION
 * | COND_EXPRESSION
 * | PROCEDURE_CALL
 * | LAMBDA
 */

EXPRESSION.setPattern(
  alt(
    NUMBER,
    IDENTIFIER,
    BUILT_IN_IDENTIFIER,
    IF_EXPRESSION,
    COND_EXPRESSION,
    NOT_EXPRESSION,
    PROCEDURE_CALL,
    DEFINITION,
    LAMBDA,
    LET,
    QUOTATION,
    BEGIN,
    STRING,
    SET,
  )
);

export function parse(expr: string): AST.Expression[] | AST.Expression {
  return expectSingleResult(expectEOF(SEQUENCE.parse(tokenizer.parse(expr))));
}
