// Tunable values for the whole game. Change numbers here, not in the other files.
// Positions and distances are in feet on a regulation 94 x 50 ft court.

const COURT = {
  WIDTH_FT: 94,
  HEIGHT_FT: 50,
  PX_PER_FT: 11,          // drawing scale
  MARGIN_PX: 24,          // out-of-bounds border around the court
};

// The one active hoop, at the left end of the court
const HOOP = { X_FT: 5.25, Y_FT: 25 };

const THREE_POINT = {
  ARC_RADIUS_FT: 23.75,
  CORNER_DISTANCE_FT: 22,
};

// Points per made shot and how long the meter takes to fill from each zone
const ZONES = {
  TWO:   { points: 2, fillSeconds: 3.0 },
  THREE: { points: 3, fillSeconds: 1.5 },
  FOUR:  { points: 4, fillSeconds: 0.5 },
};

const METER = {
  TARGET: 0.90,           // target line, as a fraction of the bar's height
  MAKE_MIN: 0.85,         // make window, inclusive on both ends
  MAKE_MAX: 0.95,
  WIDTH_PX: 24,
  HEIGHT_PX: 150,
};

const PLAYER = {
  RADIUS_FT: 1.3,
  FOLLOW_SPEED: 14,       // higher = player catches up to the mouse faster
  START_X_FT: 30,
  START_Y_FT: 25,
};

const ROUND_SECONDS = 60;
const RESULT_SHOW_SECONDS = 1.2;   // how long "MAKE" / "MISS" stays on screen
