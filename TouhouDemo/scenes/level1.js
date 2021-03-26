	const BULLET_SPEED = 800;
  const ENEMY_BULLET_SPEED = 100;
	const ENEMY_SPEED = 60;
	const PLAYER_SPEED = 200;
  const INITIAL_POWERUP_POINT_SPEED = -60;
  const INITIAL_POWERUP_POWER_SPEED = -50;

  let isFiring = false;
  let power = 1;
  let position = 0;
  let life = 3;
  let isRespawning = false;
  let isInvincible = false;
  let isFocusing = false;
  let isBossExist = false;

  gravity(200);

  function mapWidth() {
    return width() / 3 * 2;
  }

  const enemyALocation = [ 9, 12, 13, 14, 22, 23, 24, 
                         109, 112, 113, 114, 122, 123, 124,
                         209, 212, 213, 214, 222, 223, 224];
  const enemyBLocation = [32, 34, 36, 38, 40, 52, 54, 56, 58, 60,
                       132, 134, 136, 138, 140, 152, 154, 156, 158, 160,
                       232, 234, 236, 238, 240, 252, 254, 256, 258, 260];
  const enemyCLocation = [31, 33, 35, 37, 39, 51, 53, 55, 57, 59,
                      131, 133, 135, 137, 139, 151, 153, 155, 157, 159,
                      231, 233, 235, 237, 239, 251, 253, 255, 257, 259];
  const enemyDLocation = [72, 74, 76, 78, 80, 92, 94, 96, 98, 100,
                          172, 174, 176, 178, 180, 192, 194, 196, 198, 200,
                          272, 274, 276, 278, 280, 292, 294, 296, 298, 300];
  
  play("th06_02");

	let player = add([
		sprite("player01"),
		pos(mapWidth() / 2, height() - 15),
		scale(1),
    "player"
	]);

  let playerHitJudgePoint = add([
    sprite("hitpoint"),
    pos(player.pos.x, player.pos.y),
    scale(0.7),
    "playerHitJudgePoint"
  ]);

	keyDown("left", () => {
    if (player.pos.x > 0) {
		  player.move(-PLAYER_SPEED * (isFocusing ? 0.5 : 1), 0);
    } else {
      player.pos.x = 0;
    }
	});

	keyDown("right", () => {
    if (player.pos.x < mapWidth()) {
		  player.move(PLAYER_SPEED * (isFocusing ? 0.5 : 1), 0);
    } else {
      player.pos.x = mapWidth();
    }
	});

  keyDown("up", () => {
    if (player.pos.y > 0) {
		  player.move(0, -PLAYER_SPEED * (isFocusing ? 0.5 : 1));
    } else {
      player.pos.y = 0;
    }
	});

  keyDown("down", () => {
    if (player.pos.y < height()) {
		  player.move(0, PLAYER_SPEED * (isFocusing ? 0.5 : 1));
    } else {
      player.pos.y = height();
    }
	});

  keyDown("z", () => { isFiring = true; });

  keyRelease("z", () => { isFiring = false; });

  keyDown("shift", () => { isFocusing = true;});

  keyRelease("shift", () => { isFocusing = false;}); // shift key has issues

/*
	keyPress("space", () => {
		add([
			sprite("bullet00"),
			pos(player.pos),
			// strings here means a tag
			"bullet",
		]);
	});
*/
	// run this callback every frame for all objects with tag "bullet"
	action("bullet", (b) => {
		b.move(Math.cos(b.direction) * BULLET_SPEED, -Math.sin(b.direction) * BULLET_SPEED);
		// remove the bullet if it's out of the scene for performance
		if (b.pos.y < 0 || b.pos.x < 0 || b.pos.x > mapWidth()) {
			destroy(b);
		}
	});

	function spawnEnemyA() { return add([	sprite("enemy00"),	pos(rand(0, mapWidth()), 0), "enemyA", ]);}
  function spawnEnemyB() { return add([	sprite("enemy00"),	pos(0, 48), "enemyB", ]);}
  function spawnEnemyC() { return add([	sprite("enemy00"),	pos(mapWidth(), 48), "enemyC", ]);}
  function spawnEnemyD() { return add([	sprite("enemy01"),	pos(rand(0, mapWidth()), 0), "enemyD", {
    time: 0
  }]);}

  const hudBorder = add([
    // width, height
    rect(209, 470),
    pos(533, 240),
    color(1, 1, 1),
  ]);

  const hud = add([
    // width, height
    rect(207, 468),
    pos(533, 240),
    color(0, 0, 0),
  ]);

	const score = add([
		pos(width() - 200, 12),
		text("Score   0"),
		// all objects defaults origin to center, we want score text to be top left
		origin("topleft"),
		// plain objects becomes fields of score
		{
			value: 0,
		},
	]);

  const powerText = add([
    pos(width() - 200, 20),
    text("Power   1.0"),
    origin("topleft"),
    {}
  ])

  const lifeText = add([
    pos(width() - 200, 28),
    text("Player  " + life),
    origin("topleft"),
    {}
  ])

  function defeatAnEnemy(b, e) {
    play("kill", {volume: 0.3});
		destroy(b);
		destroy(e);
		score.value += 1;
		score.text = "Score   " + score.value;

    let rand = Math.random();
    if (rand > 0.6) {
      add([
        sprite("point"),
        pos(e.pos),
        body(),
        // strings here means a tag
        "powerup-point",
      ]);
    }

    if (rand > 0.1 && rand <= 0.4) {
      add([
        sprite("power"),
        pos(e.pos),
        body(),
        // strings here means a tag
        "powerup-power",
      ]);
    }
  }

	// if a "bullet" and a "enemy" collides, remove both of them
	collides("bullet", "enemyA", (b, e) => { defeatAnEnemy(b, e); });
  collides("bullet", "enemyB", (b, e) => { defeatAnEnemy(b, e); });
  collides("bullet", "enemyC", (b, e) => { defeatAnEnemy(b, e); });
  collides("bullet", "enemyD", (b, e) => { defeatAnEnemy(b, e); });


  collides("player", "powerup-point", (p, pp) => {
    if (isRespawning) { return; }
    play("pick", {volume: 0.5});
    let getScore = parseInt(100 + height() - p.pos.y);
    if (getScore > 800) {
      getScore = 800;
    }
    score.value += getScore;
    score.text = "Score   " + score.value;
    destroy(pp);
  });

  collides("player", "powerup-power", (p, pp) => {
    if (isRespawning) { return; }
    play("pick", {volume: 0.5});
    if (power < 10) {
      //power+=2.3;
      power+=0.3;
      powerText.text = "Power   " + power.toFixed(1);
      if (power > 10) {
        power = 10;
        powerText.text = "Power   MAX";
      }
      
    }
    destroy(pp);
  });

  function playerHit(p, e) {
    if (isInvincible || isRespawning) { return; }
    isRespawning = true;
    play("hit");
    life--;
    power--;
    if (power < 1) { power = 1; }
    lifeText.text = "Player  " + life;
    powerText.text = "Power   " + power.toFixed(1);
    if (life < 0) {
      go("gameover", score);
      return;
    }
    p.hidden = true;
    player.hidden = true;
    wait(2, () => {
      player.pos.x = mapWidth() / 2;
      player.pos.y = height() - 15;
      p.hidden = false;
      player.hidden = false;
      isRespawning = false;
      isInvincible = true;
      wait(3, () => {
        isInvincible = false;
      });
    });
  }

  collides("playerHitJudgePoint", "enemyBullet1", (e, eb) => { playerHit(e, eb); });
  collides("playerHitJudgePoint", "enemyA", (e, eb) => { playerHit(e, eb); });
  collides("playerHitJudgePoint", "enemyB", (e, eb) => { playerHit(e, eb); });
  collides("playerHitJudgePoint", "enemyC", (e, eb) => { playerHit(e, eb); });
  collides("playerHitJudgePoint", "enemyD", (e, eb) => { playerHit(e, eb); });

	action("enemyA", (e) => {
		e.move(0, ENEMY_SPEED);
		if (e.pos.y > height()) {
			destroy(e);
		}
	});

  action("enemyB", (e) => {
		e.move(ENEMY_SPEED, 0);
		if (e.pos.x > mapWidth()) {
			destroy(e);
		}
	});

  action("enemyC", (e) => {
		e.move(-ENEMY_SPEED, 0);
		if (e.pos.x < 0) {
			destroy(e);
		}
	});

  action("enemyD", (e) => {
		e.move(0, ENEMY_SPEED);
    e.time++;
    if (e.time % 100 == 0) { // enemy shoot
      let randDirection = rand(0, Math.PI * 2);
      for (let i = 0; i < 6; i ++) {
        add([	sprite("eb1"),	pos(e.pos.x, e.pos.y), "enemyBullet1", {
          direction: randDirection + ((Math.PI / 3) * i)
        }]);
      }
    }
		if (e.pos.y > height()) {
			destroy(e);
		}
	});

  action("powerup-point", (pp) => {
    let currentSpeed = INITIAL_POWERUP_POINT_SPEED;
    pp.move(0, currentSpeed++);
    if (pp.pos > height()) {
      destroy(pp);
    }
  });

  action("powerup-power", (pp) => {
    let currentSpeed = INITIAL_POWERUP_POWER_SPEED;
    pp.move(0, currentSpeed++);
    if (pp.pos > height()) {
      destroy(pp);
    }
  });

  action("enemyBullet1", (eb) => {
    let currentSpeed = ENEMY_BULLET_SPEED;
    eb.move(Math.cos(eb.direction) * currentSpeed, Math.sin(eb.direction) * currentSpeed);
    if (eb.pos.x < 0 || eb.pos.x > mapWidth() || eb.pos.y < 0 || eb.pos.y > height()) {
      destroy(eb);
    }
  });

  action("player", (p) => {
    playerHitJudgePoint.pos.x = p.pos.x + 2;
    playerHitJudgePoint.pos.y = p.pos.y - 2;
  });

	// spawn an enemy every 1 second
	loop(0.3, () => {
    if (!isBossExist) {
      position++;
    }
    if (enemyALocation.lastIndexOf(position) != -1) spawnEnemyA();
    if (enemyBLocation.lastIndexOf(position) != -1) spawnEnemyB();
    if (enemyCLocation.lastIndexOf(position) != -1) spawnEnemyC();
    if (enemyDLocation.lastIndexOf(position) != -1) spawnEnemyD();
  });

  loop(0.05, () => {
    if (isFiring && !isRespawning) {
      play("fire", {volume: 0.3});
      // console.log(isFocusing);
      for (let i = 0; i < parseInt(power); i++) {
        add([
          sprite("bullet00"),
          pos(player.pos),
          // strings here means a tag
          "bullet",
          {
            direction: Math.PI / 2 + ((isFocusing ? 0.03 : 0.07) * parseInt(i + 1 / 2) * Math.pow(-1, i))
          }
        ]);
      }
    } 
  });