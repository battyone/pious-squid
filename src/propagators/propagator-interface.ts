import { J2000 } from '../coordinates/j2000'

/** Options for the Kepler propagation model. */
export interface KeplerModel {
  /** First derivative mean motion, in revolutions/day^2. */
  nDot: number
  /** Second derivative of mean motion, in revolutions/day^3 */
  nDDot: number
  /** Model effects of atmospheric drag, if true. */
  atmosphericDrag: boolean
  /** Model J2 effect, if true. */
  j2Effect: boolean
}

/** Options for the Kepler propagation constructor. */
export type KeplerOptions = Partial<KeplerModel>

/** Options for numerical integration propagation models. */
export interface NumericalModel {
  /** Step size, in seconds. */
  stepSize: number
  /** Model J2 effect, if true. */
  j2Effect: boolean
  /** Model J3 effect, if true. */
  j3Effect: boolean
  /** Model J4 effect, if true. */
  j4Effect: boolean
  /** Model Solar gravity, if true. */
  gravitySun: boolean
  /** Model Lunar gravity, if true. */
  gravityMoon: boolean
  /** Model Solar radiation pressure, if true. */
  solarRadiation: boolean
  /** Model atmospheric drag, if true. */
  atmosphericDrag: boolean
  /** Satellite mass, in kilograms */
  mass: number
  /** Satellite surface area, in meters squared */
  area: number
  /** Satellite drag coefficient. */
  drag: number
  /** Satellite reflectivity coefficient. */
  reflect: number
}

/** Options for numerical integration propagation constructors. */
export type NumericalOptions = Partial<NumericalModel>

/** Common interface for propagator objects. */
export interface Propagator {
  /** Propagator identifier string. */
  type: string
  /** Cache for last computed statellite state. */
  state: J2000
  /** Propagate state to a new epoch. */
  propagate (millis: number): J2000
  /** Propagate state by some number of seconds, repeatedly. */
  step (millis: number, interval: number, count: number): J2000[]
  /** Restore initial propagator state. */
  reset (): Propagator
}

/** Propagator type identifiers. */
export enum PropagatorType {
  RUNGE_KUTTA_4 = 'runge-kutta-4',
  KEPLER = 'kepler',
  INTERPOLATOR = 'interpolator'
}
