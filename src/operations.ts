import { TWO_PI } from "./constants";

/**
 * Calculate the factorial of a number.
 *
 * Throws an error if argument is not a positive integer.
 *
 * @param n a positive integer
 */
export function factorial(n: number): number {
  if (n < 0) {
    throw new Error("Argument must be a positive integer.");
  }
  let output = 1;
  for (let i = n; i > 1; i--) {
    output *= i;
  }
  return output;
}

/**
 * Evaluate a polynomial given a variable and its coefficients. Exponents are
 * implied to start at zero.
 *
 * @param x variable
 * @param coeffs coefficients, from lowest to highest
 */
export function evalPoly(x: number, coeffs: number[]): number {
  let output = 0;
  for (let n = 0; n < coeffs.length; n++) {
    output += coeffs[n] * x ** n;
  }
  return output;
}

/**
 * Return the sign of the number, 1 if positive, -1 if negative, 0 if zero.
 *
 * @param n a number
 */
export function sign(n: number): number {
  if (n < 0) {
    return -1;
  }
  if (n > 0) {
    return 1;
  }
  return 0;
}

/**
 * Return the angle (original or inverse) that exists in the half plane of the
 * match argument.
 *
 * @param angle angle to (possibly) adjust
 * @param match reference angle
 */
export function matchHalfPlane(angle: number, match: number): number {
  const [a1, a2] = [angle, TWO_PI - angle];
  const d1 = Math.atan2(Math.sin(a1 - match), Math.cos(a1 - match));
  const d2 = Math.atan2(Math.sin(a2 - match), Math.cos(a2 - match));
  return Math.abs(d1) < Math.abs(d2) ? a1 : a2;
}

/**
 * Linearly interpolate between two known points.
 *
 * @param x value to interpolate
 * @param x0 start x-value
 * @param y0 start y-value
 * @param x1 end x-value
 * @param y1 end y-value
 */
export function linearInterpolate(
  x: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): number {
  return (y0 * (x1 - x) + y1 * (x - x0)) / (x1 - x0);
}

export function legendreFunction(l: number, m: number, phi: number): number {
  if (m > l) {
    return 0;
  }
  if (l === 0 && m === 0) {
    return 1;
  }
  if (l === 1 && m === 0) {
    return Math.sin(phi);
  }
  if (l === 1 && m === 1) {
    return Math.cos(phi);
  }
  if (l === 2 && m === 0) {
    return (1.0 / 2.0) * (3 * Math.sin(phi) ** 2 - 1);
  }
  if (l === 2 && m === 1) {
    return 3 * Math.sin(phi) * Math.cos(phi);
  }
  if (l === 2 && m === 2) {
    return 3 * Math.cos(phi) ** 2;
  }
  if (l === 3 && m === 0) {
    return (1.0 / 2.0) * (5 * Math.sin(phi) ** 3 - 3 * Math.sin(phi));
  }
  if (l === 3 && m === 1) {
    return (1.0 / 2.0) * Math.cos(phi) * (15 * Math.sin(phi) ** 2 - 3);
  }
  if (l === 3 && m === 2) {
    return 15 * Math.cos(phi) ** 2 * Math.sin(phi);
  }
  if (l === 3 && m === 3) {
    return 15 * Math.cos(phi) ** 3;
  }
  if (l === 4 && m === 0) {
    return (
      (1.0 / 8.0) * (35 * Math.sin(phi) ** 4 - 30 * Math.sin(phi) ** 2 + 3)
    );
  }
  if (l === 4 && m === 1) {
    return (
      (5.0 / 2.0) * Math.cos(phi) * (7 * Math.sin(phi) ** 3 - 3 * Math.sin(phi))
    );
  }
  if (l === 4 && m === 2) {
    return (15.0 / 2.0) * Math.cos(phi) ** 2 * (7 * Math.sin(phi) ** 2 - 1);
  }
  if (l === 4 && m === 3) {
    return 105 * Math.cos(phi) ** 3 * Math.sin(phi);
  }
  if (l === 4 && m === 4) {
    return 105 * Math.cos(phi) ** 4;
  }
  return 0;
}

export function normFactor(l: number, m: number): number {
  let k = 2;
  if (m === 0) {
    k = 1;
  }
  const a = factorial(l + m);
  const b = factorial(l - m) * k * (2 * l + 1);
  return Math.sqrt(a / b);
}
