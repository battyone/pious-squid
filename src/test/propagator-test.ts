import * as assert from "assert";
import { DataHandler } from "../data/data-handler";
import {
  EpochUTC,
  J2000,
  KeplerPropagator,
  RungeKutta4Propagator,
  Vector3D
} from "../index";
import { InterpolatorPropagator } from "../propagators/interpolator-propagator";

DataHandler.setFinalsData([
  "181220 58472.00 I  0.111682 0.000013  0.267043 0.000011  I-0.0268992 0.0000042  0.8116 0.0029  I  -107.187    1.028    -6.992    0.043",
  "181221 58473.00 I  0.109899 0.000013  0.266778 0.000012  I-0.0276299 0.0000041  0.6550 0.0031  I  -107.216    1.028    -6.947    0.043",
  "181222 58474.00 I  0.107885 0.000012  0.266558 0.000012  I-0.0282132 0.0000046  0.5105 0.0030  I  -107.320    1.028    -7.168    0.043"
]);

const state = new J2000(
  EpochUTC.fromDateString("2018-12-21T00:00:00.000Z"),
  new Vector3D(-1117.913276, 73.093299, -7000.018272),
  new Vector3D(3.531365461, 6.583914964, -0.495649656)
);

const epoch = EpochUTC.fromDateString("2018-12-22T00:00:00.000Z");

const rk4Prop = new RungeKutta4Propagator(state);
const kepProp = new KeplerPropagator(state.toClassicalElements());

describe("KeplerPropagator", () => {
  describe("two-body", () => {
    rk4Prop.reset();
    rk4Prop.setStepSize(10);
    rk4Prop.forceModel.clearModel();
    rk4Prop.forceModel.setEarthGravity(0, 0);
    kepProp.reset();
    const rk4Result = rk4Prop.propagate(epoch).position;
    const kepResult = kepProp.propagate(epoch).position;
    it("should be within 1m of numerical two-body after 24 hours", () => {
      assert(kepResult.distance(rk4Result) < 0.001);
    });
  });
});

describe("RungeKutta4Propagator", () => {
  describe("high-accuracy", () => {
    rk4Prop.reset();
    rk4Prop.setStepSize(10);
    rk4Prop.forceModel.clearModel();
    rk4Prop.forceModel.setEarthGravity(50, 50);
    rk4Prop.forceModel.setThirdBody(true, true);
    const actual = rk4Prop.propagate(epoch).position;
    const expected = new Vector3D(-212.125533, -2464.351601, 6625.907454);
    it("should be within 25m of real-world ephemeris after 24 hours", () => {
      assert(expected.distance(actual) < 0.025);
    });
  });
});

describe("InterpolatorPropagator", () => {
  describe("interpolate", () => {
    const rk4Prop = new RungeKutta4Propagator(state);
    rk4Prop.setStepSize(5);
    rk4Prop.forceModel.setEarthGravity(50, 50);
    rk4Prop.forceModel.setThirdBody(true, true);
    const cacheDense = rk4Prop.step(state.epoch, 60, 86400 / 60);
    rk4Prop.reset();
    const cacheSparse = rk4Prop.step(state.epoch, 900, 86400 / 900);
    const interpolator = new InterpolatorPropagator(cacheSparse);
    interpolator.forceModel.setEarthGravity(2, 0);
    let maxError = 0;
    for (let cState of cacheDense) {
      const iState = interpolator.propagate(cState.epoch);
      const dist = cState.position.distance(iState.position);
      maxError = Math.max(maxError, dist);
    }
    it("should have a maximum error of 30m", () => {
      assert(maxError < 0.03);
    });
  });
});
