const base = (output: any, ...code: (number | string)[]) => {
  console.log(`${code.map(c => `\x1b[${c}m`).join('')}%s\x1b[0m`, output);
}

export const yellow = (output: any) => base(output, 33);
export const cyan = (output: any) => base(output, 36);
export const green = (output: any) => base(output, 32);
export const wow = (output: any) => base(output, 42);
