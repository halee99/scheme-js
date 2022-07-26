import { Env } from './env';

export class NIL {}

export const nil = new NIL();

export abstract class SFunction {
  name?: string;
  constructor(name?: string) {
    this.name = name;
  }

  public get(): SFunction {
    return this;
  }

  public abstract call(args: any[]): any;
}

export class UserFunction extends SFunction {
  private argumentNames: string[];
  private env: Env;
  private lambda: ((env: Env) => any);
  
  constructor({
    name,
    params,
    lambda,
    env,
  }: {
    name?: string;
    params: string[];
    lambda: (env: Env) => any;
    env: Env;
  }) {
    super(name);
    this.argumentNames = [...params];
    this.env = env;
    this.lambda = lambda;
  }
  public call(args: any[]) {
    const newEnv = this.env.createChildEnv();
    args.forEach((v, i) => {
      newEnv.define(this.argumentNames[i], v);
    })
    return this.lambda(newEnv);
  }
}

export class BuiltInFunction extends SFunction {
  private lambda: (...args: any[]) => any;
  constructor({
    name,
    lambda,
  }: {
    name: string;
    lambda: (...args: any[]) => any;
  }) {
    super(name);
    this.lambda = lambda;
  }

  public call(args: any[]) {
    return this.lambda(...args);
  }
}

export class Construct {
  private pair: [BasicType, BasicType];
  constructor(a: BasicType, b: BasicType) {
    this.pair = [a, b];
  }

  static fromList(arr: BasicType[]) {
    if (arr.length === 0) {
      return nil;
    }
    const head = arr[0];
    const tail = arr.slice(1);
    if (tail.length === 0) {
      return new Construct(head, nil);
    }
    return new Construct(head, Construct.fromList(tail));
  }

  car(): BasicType {
    return this.pair[0];
  }

  cdr(): Construct | NIL {
    return this.pair[1] ?? nil;
  }

  setCar(a: BasicType) {
    this.pair[0] = a;
  }

  setCdr(a: BasicType) {
    this.pair[1] = a;
  }

  getLength() {
    let count = 1;
    let re = this.cdr();
    while(re instanceof Construct) {
      count += 1;
      re = re.cdr();
    }

    return count;
  }

  toPrint() {
    let cdrStr = this.cdr();
    cdrStr = cdrStr instanceof Construct ? cdrStr.toPrint() : cdrStr;
    return [this.car(), cdrStr];
  }

  toArray() {
    const ca = this.car();
    let arr = [ca];
    let cd = this.cdr();
    while(cd instanceof Construct) {
      arr.push(cd.car());
      cd = cd.cdr();
    }
    return arr;
  }

  map(fun: SFunction) {
    const arr = this.toArray();
    return Construct.fromList(this.toArray().map(e => fun.call([e])));
  }
}

export class SString {
  private value: string;
  constructor(value: string) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}

export type BasicType = number | string | SFunction | NIL | Construct | SString;
