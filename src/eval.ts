import { AST } from './ast';
import { nil, NIL, SFunction, UserFunction, SString, Construct } from './basic-type';
import { Env } from './env';
import { invariant } from './utils';

const numberLiteralEval = (ast: AST.NumberLiteral, env) => {
  return ast.value;
}

const quoteEval = (ast: AST.Quote, env) => {
  return ast.value;
}

const identifierEval = (ast: AST.Identifier, env: Env) => {
  const value = env.getValue(ast.name)
  if (value === undefined) {
    invariant(false, `variable ${ast.name} not found`, env);
  }
  return value;
}

const notEval = (ast: AST.NotExpression, env: Env) => {
  const value = evaluate(ast.operand, env);
  if (value === nil) {
    return true;
  }
  return !value;
}

const ifEval = (ast: AST.IfExpression, env: Env) => {
  const test = evaluate(ast.test, env);
  if (test) {
    return evaluate(ast.consequent, env);
  } else {
    return ast.alternate ? evaluate(ast.alternate, env) : nil;
  }
}

const condEval = (ast: AST.CondExpression, env: Env) => {
  for (const [test, consequent] of ast.cases) {
    const testResult = evaluate(test, env);
    if (testResult) {
      return evaluate(consequent, env);
    }
  }
  return ast.defaultCase ? evaluate(ast.defaultCase, env) : nil;
}

const defineConstantEval = (ast: AST.DefineConstantExpression, env: Env): NIL => {
  const value = evaluate(ast.exp, env);
  env.define(ast.name, value);
  return nil;
}

const defineFunctionEval = (ast: AST.DefineFunctionExpression, env: Env): NIL => {
  const func = new UserFunction({
    name: ast.name,
    params: ast.params,
    lambda: (fucEnv: Env) => {
      return evaluate(ast.body, fucEnv);
    },
    env,
  });

  env.define(ast.name, func);
  return nil;
}

const procedureCallEval = (ast: AST.ProcedureCallExpression, env: Env) => {
  const operator = ast.operator;
  let vFunction: SFunction;
  if (operator instanceof AST.Identifier) {
    vFunction = env.getValue(operator.name) as UserFunction;
    invariant(vFunction, `SFunction ${operator.name} not found`);
    invariant(vFunction instanceof SFunction, `SFunction ${operator.name} is not a function`);
  } else {
    vFunction = evaluate(operator, env) as SFunction;
    invariant(vFunction instanceof SFunction, `SFunction ${vFunction} is not a function`);
  }

  const argValues = ast.operands.map(arg => evaluate(arg, env));
  return vFunction.call(argValues);
}

const lambdaEval = (ast: AST.LambdaExpression, env: Env) => {
  const vFunc = new UserFunction({
    params: ast.params,
    lambda: (fucEnv: Env) => {
      return evaluate(ast.body, fucEnv);
    },
    env,
  });
  return vFunc;
}

const stringEval = (ast: AST.StringLiteral, env: Env) => {
  return new SString(ast.value);
}

const quotationEval = (ast: AST.QuotationExpression, env: Env) => {
  return Construct.fromList(ast.quote.map(q => evaluate(q, env)));
}

const sequenceEval = (ast: AST.SequenceExpression, env: Env) => {
  const result = ast.sequence.map(expr => evaluate(expr, env));
  return result[result.length - 1] ?? nil;
}

const setEval = (ast: AST.SetExpression, env: Env) => {
  const value = evaluate(ast.value, env);
  const variable = env.find(ast.variable.name);
  invariant(variable, `variable ${ast.variable.name} not found`, env);
  if (ast.operation === 'set!') {
    variable?.set(value);
  } else if (ast.operation === 'set-car!') {
    (variable?.get() as Construct).setCar(value);
  } else if (ast.operation === 'set-cdr!') {
    (variable?.get() as Construct).setCdr(value);
  }
  return nil;
}

export const evaluate = (ast: AST.Expression[] | AST.Expression, env: Env): any => {
  const asts = Array.isArray(ast) ? ast : [ast];
  return asts.reduce((_, _ast) => {
    switch (_ast.type) {
      case 'NumberLiteral': {
        return numberLiteralEval(_ast as AST.NumberLiteral, env);
      }
      case 'Identifier': {
        return identifierEval(_ast as AST.Identifier, env);
      }
      case 'NotExpression': {
        return notEval(_ast as AST.NotExpression, env);
      }
      case 'IfExpression': {
        return ifEval(_ast as AST.IfExpression, env);
      }
      case 'CondExpression': {
        return condEval(_ast as AST.CondExpression, env);
      }
      case 'DefineConstantExpression': {
        return defineConstantEval(_ast as AST.DefineConstantExpression, env);
      }
      case 'DefineFunctionExpression': {
        return defineFunctionEval(_ast as AST.DefineFunctionExpression, env);
      }
      case 'ProcedureCallExpression': {
        return procedureCallEval(_ast as AST.ProcedureCallExpression, env);
      }
      case 'LambdaExpression': {
        return lambdaEval(_ast as AST.LambdaExpression, env);
      }
      case 'StringLiteral': {
        return stringEval(_ast as AST.StringLiteral, env);
      }
      case 'QuotationExpression': {
        return quotationEval(_ast as AST.QuotationExpression, env);
      }
      case 'SequenceExpression': {
        return sequenceEval(_ast as AST.SequenceExpression, env);
      }
      case 'SetExpression': {
        return setEval(_ast as AST.SetExpression, env);
      }
      case 'Quote': {
        return quoteEval(_ast as AST.Quote, env);
      }
      default: {
        throw new Error(`Unknown expression type ${_ast.type}`);
      }
    }
  }, nil);
}