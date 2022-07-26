import { evaluate, parse, nil, genGlobalEnv } from '../src';
import { code } from './scheme-code';
import * as assert from 'assert';

const genSchemeEval = (): any => {
  const globalEnv = genGlobalEnv();
  return (str: string) => evaluate(parse(str), globalEnv);
}

test('scheme', () => {
  const globalEnv = genGlobalEnv();
  const schemeEval = (str: string) => evaluate(parse(str), globalEnv);

  schemeEval(code);
  const r = schemeEval(`
  (let ((env the-global-environment))
    (eval '(begin (define (add a b) (+ a b)) (add 1 2)) env))
  `)

  assert.strictEqual(r, 3)
})