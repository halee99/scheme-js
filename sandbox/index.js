import { evaluate, parse, tokenizer, env, genGlobalEnv } from '../lib';
import { code } from './scheme-code';

const globalEnv = genGlobalEnv();
window.globalEnv = globalEnv;
const schemeEval = str => evaluate(parse(str), globalEnv);

window.schemeEval = schemeEval;

schemeEval(code);
const r = schemeEval(`
(let ((env the-global-environment))
  (eval '(begin (define (add a b) (+ a b)) (add 1 2)) env))
`);

console.log('** r: ', r, globalEnv);