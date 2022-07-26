import { BasicType } from "./basic-type"

export class Variable {
  private value: BasicType
  constructor(value: BasicType) {
    this.value = value
  }

  public set(value: BasicType) {
    this.value = value
    return value
  }

  public get(): BasicType {
    return this.value
  }
}

export class Env {
  private variables: { [key: string]: Variable } = {}
  private parent?: Env
  constructor(parent?: Env) {
      this.parent = parent
  }
  
  getValue(key: string): BasicType {
    const variable = this.find(key)
    if (variable === null) {
      throw new Error(`Variable ${key} not found`)
    }
    return variable.get()
  }

  find(key: string): Variable | null {
    if (this.variables.hasOwnProperty(key)) {
      return this.variables[key]
    } else if (this.parent !== null) {
      return this.parent?.find(key) ?? null;
    } else {
      return null
    }
  }

  define = (key: string, value: BasicType) => {
    if (this.variables.hasOwnProperty(key)) {
      throw new Error(`Variable ${key} already defined`)
    }
    this.variables[key] = new Variable(value)
  }

  delete = (key: string) => {
    delete this.variables[key]
  }

  createChildEnv() {
    return new Env(this)
  }
}