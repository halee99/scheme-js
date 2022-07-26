import { buildLexer } from 'typescript-parsec';

export enum TokenKind {
  OpenParen,
  CloseParen,
  If,
  Cond,
  Else,
  Define,
  Let,
  Not,
  Lambda,
  Begin,
  Quote,
  Set,
  BuiltInIdentifier,
  Identifier,

  StringLiteral,
  NumberLiteral,

  OneQuotation,
  Space,
}

export const tokenizer = buildLexer([
  [true, /^\(/g, TokenKind.OpenParen],
  [true, /^\)/g, TokenKind.CloseParen],
  [true, /^\'/g, TokenKind.OneQuotation],
  [true, /^if/g, TokenKind.If],
  [true, /^cond/g, TokenKind.Cond],
  [true, /^else/g, TokenKind.Else],
  [true, /^define/g, TokenKind.Define],
  [true, /^lambda/g, TokenKind.Lambda],
  [true, /^let/g, TokenKind.Let],
  [true, /^quote/g, TokenKind.Quote],
  [true, /^begin/g, TokenKind.Begin],
  [true, /^(set\!|set\-car\!|set\-cdr\!)/g, TokenKind.Set],

  [true, /^[\+\-]?\d+(\.\d+)?/g, TokenKind.NumberLiteral],

  [true, /^([\+\-\*\/\>\<\=]|not)/g, TokenKind.BuiltInIdentifier],

  [true, /^[a-zA-Z_][a-zA-Z0-9\_\-\?\>\!]*/g, TokenKind.Identifier],

  [true, /^"(.*?)"/g, TokenKind.StringLiteral],

  [false, /^\s+/g, TokenKind.Space]
]);
