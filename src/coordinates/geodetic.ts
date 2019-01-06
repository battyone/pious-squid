import { EARTH_ECC_SQ, EARTH_RAD_EQ, RAD2DEG } from "../math/constants";
import { CoordinateType, ICoordinate } from "./coordinate-config";
import { EarthCenteredFixed } from "./earth-centered-fixed";

/** Class representing Geodetic (LLA) coordinates. */
export class Geodetic implements ICoordinate {
  /** Coordinate identifier string. */
  public readonly type: string;
  /** Geodetic latitude, in radians. */
  public readonly latitude: number;
  /** Geodetic longitude, in radians. */
  public readonly longitude: number;
  /** Geodetic altitude, in kilometers. */
  public readonly altitude: number;

  /**
   * Create a new Geodetic object.
   *
   * @param latitude geodetic latitude, in radians
   * @param longitude geodetic longitude, in radians
   * @param altitude geodetic altitude, in kilometers
   */
  constructor(latitude: number, longitude: number, altitude: number) {
    this.type = CoordinateType.GEODETIC;
    this.latitude = latitude;
    this.longitude = longitude;
    this.altitude = altitude;
  }

  /** Geocentric latitude of the object. */
  get geocentric(): number {
    return Math.atan((1 - EARTH_ECC_SQ) * Math.tan(this.latitude));
  }

  /** Return a string representation of the object. */
  public toString(): string {
    const { latitude, longitude, altitude } = this;
    const output = [
      "[Geodetic]",
      `  Latitude:  ${(latitude * RAD2DEG).toFixed(3)}\u00b0`,
      `  Longitude:  ${(longitude * RAD2DEG).toFixed(3)}\u00b0`,
      `  Altitude:  ${altitude.toFixed(3)} km`
    ];
    return output.join("\n");
  }

  /** Convert to the Earth Centered Earth Fixed (ECEF) coordinate frame. */
  public toECEF(): EarthCenteredFixed {
    const { latitude, longitude, altitude } = this;
    const sLat = Math.sin(latitude);
    const cLat = Math.cos(latitude);
    const nVal = EARTH_RAD_EQ / Math.sqrt(1 - EARTH_ECC_SQ * sLat * sLat);
    const rx = (nVal + altitude) * cLat * Math.cos(longitude);
    const ry = (nVal + altitude) * cLat * Math.sin(longitude);
    const rz = (nVal * (1 - EARTH_ECC_SQ) + altitude) * sLat;
    return new EarthCenteredFixed(rx, ry, rz);
  }
}
