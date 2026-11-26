// Dawnmail Run — shared constants: the course, the flight model and scoring.
// One valley, one mail run: 5,200 metres of fields, a river and a road, ten
// mail rings to fly through, storm clouds to avoid, and a runway at the end.

const FGConfig = (() => {
  const WIDTH = 1280;
  const HEIGHT = 800;

  const COURSE = {
    length: 5200,          // metres from take-off to the far end of the runway
    runwayStart: 4580,     // the runway strip runs from here…
    runwayEnd: 5180,       // …to here, centred on x = 0
    runwayHalfWidth: 19,   // land within this many metres of the centreline
    valleyHalf: 260,       // the valley walls: |x| may not pass this
    ceiling: 240,          // metres; the altimeter tops out here
  };

  // The ten mail rings: x across the valley, altitude in metres, z along it.
  const RINGS = [
    { x: -40, alt: 90, z: 620 },
    { x: 55, alt: 130, z: 1150 },
    { x: 0, alt: 70, z: 1680 },
    { x: -95, alt: 150, z: 2200 },
    { x: 80, alt: 100, z: 2680 },
    { x: -30, alt: 180, z: 3150 },
    { x: 35, alt: 85, z: 3560 },
    { x: -70, alt: 140, z: 3980 },
    { x: 15, alt: 60, z: 4320 },
    { x: 0, alt: 42, z: 4520 },
  ];
  const RING_RADIUS = 17;

  // Storm clouds: fly around them, or through them at a price.
  const STORMS = [
    { x: 30, alt: 120, z: 900 },
    { x: -60, alt: 95, z: 1900 },
    { x: 90, alt: 160, z: 2950 },
    { x: -15, alt: 75, z: 3380 },
    { x: -110, alt: 130, z: 4180 },
    { x: 55, alt: 55, z: 4420 },
  ];

  const FLIGHT = {
    startAlt: 110,
    startSpeed: 52,        // metres per second
    minSpeed: 34,
    maxSpeed: 96,
    climbRate: 24,         // metres per second at full pitch
    turnRate: 58,          // metres per second of sideways drift at full bank
    timeLimit: 120,        // seconds to deliver the mail
  };

  const SCORE = { ring: 150, ringTime: 3, cloud: -75, landBase: 500, landPerSecond: 10 };

  return { WIDTH, HEIGHT, COURSE, RINGS, RING_RADIUS, STORMS, FLIGHT, SCORE };
})();
