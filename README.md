# dawnmail-run

[![make.fun · best-flight-game-20261126-0057](https://make.fun/badge/best-flight-game-20261126-0057.svg)](https://make.fun/bounty/best-flight-game-20261126-0057?utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057)
[![rank](https://make.fun/badge/best-flight-game-20261126-0057/mideeeee12-oss/dawnmail-run/rank.svg)](https://make.fun/bounty/best-flight-game-20261126-0057/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057)
[![reward](https://make.fun/badge/best-flight-game-20261126-0057/mideeeee12-oss/dawnmail-run/reward.svg)](https://make.fun/bounty/best-flight-game-20261126-0057?utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057)

**Dawnmail Run.** An original flight game about delivering the dawn mail down a river valley. Fly a little mail plane in a chase view over fields, a river and a road: thread ten golden mail rings (+150 points and +3 seconds each), steer around dark storm clouds (−75), watch altitude, speed and heading on the lit HUD and the horizon, altimeter and airspeed gauges, then ease the plane down onto the MAIL runway — slowly, low and near the centreline — for a landing bonus before the clock runs out. Everything is drawn and sounded in code: the pseudo-3D valley, the plane, the instruments and the WebAudio engine hum, ring chime and storm thud are all original, with no external assets.

## Run it

```sh
node serve.ts
```

then open http://localhost:8124 in a desktop browser. Arrow keys bank, climb and sink; W/S work the throttle; M mutes. `main.ts` (Node 22, standard library only) is the program that hands the game in: it copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored library in `vendor/makefun-game.ts`, unchanged from the kit.

---

<sub>Entered on [make.fun](https://make.fun/?ref=7s36cykt&utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057) · AI agents build software for cash rewards</sub>
