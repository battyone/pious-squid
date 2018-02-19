import { atmosphericDensity, moonPosition, sunPosition } from './bodies'
import * as c from './constants'
import { Epoch } from './epoch'
import { NumericalModel } from './propagators/propagator-interface'
import { Vector } from './vector'

/**
 * Calculate acceleration in km/s^2 due to J2 effect.
 *
 * @param position satellite J2000 position 3-vector, in kilometers
 */
export function j2Effect (position: Vector): Vector {
  const pow = Math.pow
  const [i, j, k] = position.state
  const r = position.magnitude()
  const aPre = -((3 * c.EARTH_J2 * c.EARTH_MU
    * pow(c.EARTH_RAD_EQ, 2)) / (2 * pow(r, 5)))
  const aijPost = 1 - ((5 * pow(k, 2)) / pow(r, 2))
  const akPost = 3 - ((5 * pow(k, 2)) / pow(r, 2))
  return new Vector(
    aPre * i * aijPost,
    aPre * j * aijPost,
    aPre * k * akPost
  )
}

/**
 * Calculate acceleration in km/s^2 due to J3 effect.
 *
 * @param position satellite J2000 position 3-vector, in kilometers
 */
export function j3Effect (position: Vector): Vector {
  const pow = Math.pow
  const [i, j, k] = position.state
  const r = position.magnitude()
  const aPre = -((5 * c.EARTH_J3 * c.EARTH_MU
    * pow(c.EARTH_RAD_EQ, 3)) / (2 * pow(r, 7)))
  const aijPost = (3 * k) - ((7 * pow(k, 3)) / pow(r, 2))
  const akPost = ((6 * pow(k, 2)) - ((7 * pow(k, 4)) / pow(r, 2))
    - ((3 / 5) * pow(r, 2)))
  return new Vector(
    aPre * i * aijPost,
    aPre * j * aijPost,
    aPre * akPost
  )
}

/**
 * Calculate acceleration in km/s^2 due to J4 effect.
 *
 * @param position satellite J2000 position 3-vector, in kilometers
 */
export function j4Effect (position: Vector): Vector {
  const pow = Math.pow
  const [i, j, k] = position.state
  const r = position.magnitude()
  const aPre = (15 * c.EARTH_J4 * c.EARTH_MU
    * pow(c.EARTH_RAD_EQ, 4)) / (8 * pow(r, 7))
  const aijPost = (1 - ((14 * pow(k, 2)) / pow(r, 2))
    + ((21 * pow(k, 4)) / pow(r, 4)))
  const akPost = (5 - ((70 * pow(k, 2)) / (3 * pow(r, 2))) +
    ((21 * pow(k, 4)) / pow(r, 4)))
  return new Vector(
    aPre * i * aijPost,
    aPre * j * aijPost,
    aPre * k * akPost
  )
}

/**
 * Calculate acceleration in km/s^2 due Earth's gravity.
 *
 * @param position satellite J2000 position 3-vector, in kilometers
 */
export function gravityEarth (position: Vector): Vector {
  const dist = position.magnitude()
  return position.scale(-c.EARTH_MU / Math.pow(dist, 3))
}

/**
 * Calculate acceleration in km/s^2 due the Moon's gravity.
 *
 * @param epoch satellite state epoch
 * @param position satellite J2000 position 3-vector, in kilometers
 */
export function gravityMoon (epoch: Epoch, position: Vector): Vector {
  const rMoon = moonPosition(epoch)
  const aNum = rMoon.add(position.scale(-1))
  const aDen = Math.pow(aNum.magnitude(), 3)
  const bNum = rMoon
  const bDen = Math.pow(rMoon.magnitude(), 3)
  const grav = aNum.scale(1 / aDen).add(bNum.scale(-1 / bDen))
  return grav.scale(c.MOON_MU)
}

/**
 * Calculate satellite acceleration in km/s^2 due the Sun's gravity.
 *
 * @param epoch satellite state epoch
 * @param position satellite J2000 position 3-vector, in kilometers
 */
export function gravitySun (epoch: Epoch, position: Vector): Vector {
  const rSun = sunPosition(epoch)
  const aNum = rSun.add(position.scale(-1))
  const aDen = Math.pow(aNum.magnitude(), 3)
  const bNum = rSun
  const bDen = Math.pow(rSun.magnitude(), 3)
  const grav = aNum.scale(1 / aDen).add(bNum.scale(-1 / bDen))
  return grav.scale(c.SUN_MU)
}

/**
 * Return 1 if the the satellite has line of sight with the Sun, otherwise
 * return 0.
 *
 * @param rSat satellite J2000 position 3-vector, in kilometers
 * @param rSun Sun J2000 position 3-vector, in kilometers
 */
function shadowFactor (rSat: Vector, rSun: Vector): number {
  const n = Math.pow(rSat.magnitude(), 2) - rSat.dot(rSun)
  const d = (Math.pow(rSat.magnitude(), 2)
    + Math.pow(rSun.magnitude(), 2) - 2 * rSat.dot(rSun))
  const tMin = (n / d)
  const cVal = ((1 - tMin) * Math.pow(rSat.magnitude(), 2)
    + rSat.dot(rSun) * tMin)
  if (tMin < 0 || tMin > 1) {
    return 1
  }
  if (cVal >= Math.pow(c.EARTH_RAD_EQ, 2)) {
    return 1
  }
  return 0
}

/**
 * Calculate acceleration in km/s^2 due to solar radiation pressure.
 *
 * @param epoch satellite state epoch
 * @param position satellite J2000 position 3-vector, in kilometers
 * @param mass satellite mass, in kilograms
 * @param area satellite surface area, in meters squared
 * @param reflect satellite reflectivity coefficient
 */
export function solarRadiation (epoch: Epoch, position: Vector, mass: number,
  area: number, reflect: number): Vector {
  const rSat = position
  const rSun = sunPosition(epoch)
  const sFactor = shadowFactor(rSat, rSun)
  const rDist = rSat.add(rSun.scale(-1))
  const fScale = (
    (c.SOLAR_FLUX * Math.pow(c.ASTRONOMICAL_UNIT, 2)
      * reflect * (area / 1000.0)) /
    (mass * Math.pow(rDist.magnitude(), 2) * c.SPEED_OF_LIGHT)
  )
  const unitVec = rDist.normalize()
  return unitVec.scale(sFactor * fScale)
}

/**
 * Calculate acceleration in km/s^2 due to atmospheric drag.
 *
 * @param position satellite J2000 position 3-vector, in kilometers
 * @param velocity satellite J2000 velocity 3-vector, in kilometers per second
 * @param mass satellite mass, in kilograms
 * @param area satellite surface area, in meters squared
 * @param drag satellite drag coefficient
 */
export function atmosphericDrag (position: Vector, velocity: Vector,
  mass: number, area: number, drag: number): Vector {
  const rotVel = c.EARTH_ROTATION.cross(position)
  const vRel = velocity.add(rotVel.scale(-1)).scale(1000)
  const vMag = vRel.magnitude()
  const density = atmosphericDensity(position)
  const fScale = -0.5 * ((drag * area) / mass) * density * Math.pow(vMag, 2)
  const velVec = vRel.normalize()
  return velVec.scale(fScale / 1000)
}

/**
 * Calculate the velocity and acceleration, in km/s and km/s^2 of a satellite
 * due to orbital perturbations.
 *
 * @param epoch satellite state epoch
 * @param posVel satellite J2000 position and velocity 6-vector, in km and km/s
 * @param flags options for calculating acceleration
 */
export function derivative (epoch: Epoch, posVel: Vector,
  flags: NumericalModel): Vector {
  const position = posVel.slice(0, 3)
  const velocity = posVel.slice(3, 6)
  const { mass, area, drag, reflect } = flags
  let acceleration = gravityEarth(position)
  if (flags.j2Effect) {
    acceleration = acceleration.add(j2Effect(position))
  }
  if (flags.j3Effect) {
    acceleration = acceleration.add(j3Effect(position))
  }
  if (flags.j4Effect) {
    acceleration = acceleration.add(j4Effect(position))
  }
  if (flags.gravitySun) {
    acceleration = acceleration.add(gravitySun(epoch, position))
  }
  if (flags.gravityMoon) {
    acceleration = acceleration.add(gravityMoon(epoch, position))
  }
  if (flags.solarRadiation) {
    acceleration = acceleration.add(
      solarRadiation(epoch, position, mass, area, reflect)
    )
  }
  if (flags.atmosphericDrag) {
    acceleration = acceleration.add(
      atmosphericDrag(position, velocity, mass, area, drag)
    )
  }
  return velocity.concat(acceleration)
}
