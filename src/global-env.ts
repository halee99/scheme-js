import { invariant } from './utils';
import { BuiltInFunction, BasicType, Construct, nil, SFunction, SString } from './basic-type';
import { Env } from './env';

export const genGlobalEnv = (): Env => {
  const globalEnv = new Env();

  globalEnv.define(
    '+',
    new BuiltInFunction({
      name: '+',
      lambda: (...args: number[]) => {
        const r = args.reduce((acc, cur) => acc + cur, 0);
        invariant(typeof r === 'number', `${r} is not a number`);
        return r;
      },
    })
  );

  globalEnv.define(
    '-',
    new BuiltInFunction({
      name: '-',
      lambda: (...args: number[]) => {
        const r = args.reduce((acc, cur) => acc - cur);
        invariant(typeof r === 'number', `${r} is not a number`);
        return r;
      },
    })
  );

  globalEnv.define(
    '*',
    new BuiltInFunction({
      name: '*',
      lambda: (...args: number[]) => {
        const r = args.reduce((acc, cur) => acc * cur);
        invariant(typeof r === 'number', `${r} is not a number`);
        return r;
      },
    })
  );

  globalEnv.define(
    '/',
    new BuiltInFunction({
      name: '/',
      lambda: (...args: number[]) => {
        const r = args.reduce((acc, cur) => acc / cur);
        invariant(typeof r === 'number', `${r} is not a number`);
        return r;
      },
    })
  );

  globalEnv.define(
    '>',
    new BuiltInFunction({
      name: '>',
      lambda: (...args: number[]) => {
        return args.slice(1).reduce(
          (acc, v) => {
            invariant(typeof v === 'number', `${v} is not a number`);
            invariant(typeof acc.v === 'number', `${acc.v} is not a number`);
            return {
              r: acc.r && acc.v > v,
              v,
            };
          },
          { r: true, v: args[0] }
        ).r;
      },
    })
  );

  globalEnv.define(
    '<',
    new BuiltInFunction({
      name: '<',
      lambda: (...args: number[]) => {
        return args.slice(1).reduce(
          (acc, v) => {
            invariant(typeof v === 'number', `${v} is not a number`);
            invariant(typeof acc.v === 'number', `${acc.v} is not a number`);
            return {
              r: acc.r && acc.v < v,
              v,
            };
          },
          { r: true, v: args[0] }
        ).r;
      },
    })
  );

  globalEnv.define(
    '=',
    new BuiltInFunction({
      name: '=',
      lambda: (...args: number[]) => {
        return args.slice(1).reduce(
          (acc, v) => {
            invariant(typeof v === 'number', `${v} is not a number`);
            invariant(typeof acc.v === 'number', `${acc.v} is not a number`);
            return {
              r: acc.r && acc.v === v,
              v,
            };
          },
          { r: true, v: args[0] }
        ).r;
      },
    })
  );

  globalEnv.define('cons', new BuiltInFunction({
    name: 'cons',
    lambda: (a: BasicType, b: BasicType) => {
      return new Construct(a, b);
    }
  }))

  globalEnv.define('car', new BuiltInFunction({
    name: 'car',
    lambda: (l: Construct) => {
      return l.car();
    }
  }))

  globalEnv.define('cdr', new BuiltInFunction({
    name: 'cdr',
    lambda: (l: Construct) => {
      return l.cdr();
    }
  }))

  globalEnv.define('cadr', new BuiltInFunction({
    name: 'cadr',
    lambda: (l: Construct) => {
      return (l.cdr() as Construct).car();
    }
  }))

  globalEnv.define('caadr', new BuiltInFunction({
    name: 'caadr',
    lambda: (l: Construct) => {
      return ((l.cdr() as Construct).car() as Construct).car();
    }
  }))

  globalEnv.define('caddr', new BuiltInFunction({
    name: 'caddr',
    lambda: (l: Construct) => {
      return ((l.cdr() as Construct).cdr() as Construct).car();
    }
  }))

  globalEnv.define('cadddr', new BuiltInFunction({
    name: 'cadddr',
    lambda: (l: Construct) => {
      return (((l.cdr() as Construct).cdr() as Construct).cdr() as Construct).car();
    }
  }))

  globalEnv.define('cddr', new BuiltInFunction({
    name: 'cddr',
    lambda: (l: Construct) => {
      return (l.cdr() as Construct).cdr();
    }
  }))

  globalEnv.define('cdddr', new BuiltInFunction({
    name: 'cdddr',
    lambda: (l: Construct) => {
      return ((l.cdr() as Construct).cdr() as Construct).cdr();
    }
  }))
  
  globalEnv.define('cdadr', new BuiltInFunction({
    name: 'cdadr',
    lambda: (l: Construct) => {
      return ((l.cdr() as Construct).car() as Construct).cdr();
    }
  }))

  globalEnv.define('list', new BuiltInFunction({
    name: 'list',
    lambda: (...args: BasicType[]) => {
      return Construct.fromList(args);
    }
  })),

  globalEnv.define('eq?', new BuiltInFunction({
    name: 'eq?',
    lambda: (a: BasicType, b: BasicType) => {
      return a === b;
    }
  }));

  globalEnv.define('null?', new BuiltInFunction({
    name: 'null?',
    lambda: (x: BasicType) => {
      return x === nil;
    }
  }));
  
  globalEnv.define('apply', new BuiltInFunction({
    name: 'apply',
    lambda: (fun: SFunction, params: Construct) => {
      if (fun instanceof SFunction) {
        return fun.call(params.toArray());
      }
      throw new Error(`${fun} is not a function`);
    }
  }))

  globalEnv.define('symbol?', new BuiltInFunction({
    name: 'symbol?',
    lambda: (a: BasicType[]) => {
      return typeof a === 'string';
    }
  }))

  globalEnv.define('map', new BuiltInFunction({
    name: 'map',
    lambda: (fun: SFunction, l: Construct) => {
      return l.map(fun);
    }
  }))

  const getPrint = (param: BasicType[]) => {
    return param.map(p => {
      if (p instanceof SString) {
        return p.getValue();
      }
      if (p instanceof Construct) {
        return p.toPrint();
      }
      return p;
    })
  }

  globalEnv.define('display', new BuiltInFunction({
    name: 'display',
    lambda: (...param: BasicType[]) => {
      const print = getPrint(param);
      console.log(...print);
      return nil;
    }
  }))

  globalEnv.define('error', new BuiltInFunction({
    name: 'error',
    lambda: (...param: BasicType[]) => {
      const print = getPrint(param);
      console.error(...print);
      return nil;
    }
  }))

  globalEnv.define('length', new BuiltInFunction({
    name: 'length',
    lambda: (l: Construct) => {
      return l.getLength();
    }
  }))

  globalEnv.define('number?', new BuiltInFunction({
    name: 'number?',
    lambda: (x: BasicType) => {
      return typeof x === 'number';
    }
  }))

  globalEnv.define('string?', new BuiltInFunction({
    name: 'string?',
    lambda: (x: BasicType) => {
      return x instanceof SString;
    }
  }))

  globalEnv.define('pair?', new BuiltInFunction({
    name: 'pair?',
    lambda: (x: BasicType) => {
      return x instanceof Construct || x instanceof Construct;
    }
  }))

  globalEnv.define('nil', nil);
  globalEnv.define('true', true);
  globalEnv.define('false', false);
  return globalEnv;
};
