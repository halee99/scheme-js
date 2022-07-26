import * as assert from 'assert';
import { evaluate, parse, nil, genGlobalEnv } from '../src';

const schemeEval = (str: string): any => {
  const ast = parse(str);
  const globalEnv = genGlobalEnv();
  return evaluate(ast, globalEnv);
}

test(`evaluate: + - * /`, () => {
  assert.strictEqual(schemeEval('(+ 1 2)'), 3);
  assert.strictEqual(schemeEval('(* (+ 5 5) 2)'), 20);
  assert.strictEqual(schemeEval('(* (/ 5 5) (- 4 2))'), 2);
  assert.strictEqual(
    schemeEval(`
      (+ (* 3 (+ (* 2 4) (+ 3 5))) (+ (- 10 7) 6))
    `), 
    57
  );
});

test(`evaluate: > < =`, () => {
  assert.strictEqual(schemeEval('(> 1 2)'), false);
  assert.strictEqual(schemeEval('(> 2 1)'), true);
  assert.strictEqual(schemeEval('(= 2 (+ 1 1))'), true);
  assert.strictEqual(
    schemeEval(`
      (= (+ (* 3 (+ (* 2 4) (+ 3 5))) (+ (- 10 7) 6)) 57)
    `), 
    true
  );
});

test(`evaluate: if`, () => {
  assert.strictEqual(schemeEval('(if 1 2 3)'), 2);
  assert.strictEqual(schemeEval('(if 0 2 3)'), 3);
  assert.strictEqual(schemeEval('(if 0 2)'), nil);
});

test(`evaluate: cond`, () => {
  assert.strictEqual(schemeEval(`
    (cond (1 2) (0 3) (else 4))
  `), 2);

  assert.strictEqual(schemeEval(`
    (cond (0 2) (0 3) (else (+ 4 5)))
  `), 9);
});


test(`evaluate: define constant`, () => {
  assert.strictEqual(schemeEval(`
    (define PI100 314)
    (+ PI100 1)
  `), 315);

  assert.strictEqual(schemeEval(`
    (define a 5)
    (define b 6)
    (+ a b)
  `), 11);
});

test(`evaluate: define function`, () => {
  assert.strictEqual(schemeEval(`
    (define (add a b) (+ a b))
    (add 1 2)
  `), 3);

  assert.strictEqual(schemeEval(`
    (define (a-plus-abs-b a b)
      ((if (> b 0) + -) a b))
    (a-plus-abs-b 1 -1)
  `), 2);
});


test(`evaluate: lambda`, () => {
  assert.strictEqual(schemeEval(`
    ((lambda (x) (+ x 1)) 2)
  `), 3);
  assert.strictEqual(schemeEval(`
    ((lambda (x y) (+ x y)) 2 3)
  `), 5);
});

test(`evaluate: fib`, () => {
  assert.strictEqual(schemeEval(`
    (define (fib n)
      (cond ((= n 0) 0)
            ((= n 1) 1)
            (else (+ (fib (- n 1)) (fib (- n 2))))))
    (fib 10)
  `), 55);

  assert.strictEqual(schemeEval(`
    (define (fib n)
      (fib-iter 1 0 n))
    
    (define (fib-iter a b n)
      (if (= n 0)
        b
        (fib-iter (+ a b) a (- n 1))))

    (fib 10)
  `), 55);
})


test(`evaluate: let`, () => {
  assert.strictEqual(schemeEval(`
    (+ (let ((x 3))
          (+ x (* x 10)))
      17)
  `), 50);
})

test(`evaluate: cons`, () => {
  assert.strictEqual(schemeEval(`
    (+ (let ((p (cons 2 3)))
          (cdr p))
      17)
  `), 20);
})

test(`evaluate: quote`, () => {
  assert.strictEqual(schemeEval(`
    (car '(a b c))
  `), 'a');

  assert.strictEqual(schemeEval(`
    (pair? '(begin (define (add a b) (+ a b)) (add 1 2)))
  `), true);
})

test(`evaluate: list`, () => {
  assert.strictEqual(schemeEval(`
    (define a 1)
    (define b 1)

    (car (list a b))
  `), 1);
})

test(`evaluate: eq?`, () => {
  assert.strictEqual(schemeEval(`
    (eq? 'abc 'abc)
  `), true);
  assert.strictEqual(schemeEval(`
    (define a 'abc)
    (define b 1)
    (eq? (car (list a b)) a)
  `), true);
})

test(`evaluate: eq?`, () => {
  assert.strictEqual(schemeEval(`
    (eq? 'abc 'abc)
  `), true);

  assert.strictEqual(schemeEval(`
    (define a 'abc)
    (define b 1)
    (eq? (car (list a b)) a)
  `), true);
})


test(`evaluate: memq`, () => {
  assert.strictEqual(schemeEval(`
    (define (memq item x)
      (cond ((null? x) false)
            ((eq? item (car x)) true)
            (else (memq item (cdr x)))))
    (memq 'b '(a b c))
  `), true);
})

test(`evaluate: begin`, () => {
  assert.strictEqual(schemeEval(`
    (define a 2)
    (if (= a 2) (begin (define x 3) (+ a x)) 1)
  `), 5);
})

test(`evaluate: apply`, () => {
  assert.strictEqual(schemeEval(`
    (apply + '(2 3))
  `), 5);
})

test(`evaluate: set!`, () => {
  assert.strictEqual(schemeEval(`
    (define x 3)
    (set! x 4)
    (+ x 1)
  `), 5);
})

test(`evaluate: map`, () => {
  assert.deepStrictEqual(schemeEval(`
    (define l (list 1 2 3))
    (map (lambda (x) (+ x 1)) l)
  `).toArray(), [2, 3, 4]);
})