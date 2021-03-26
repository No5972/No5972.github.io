    add([
      sprite("title00"),
      scale(width() / 640, height() / 480),
		  origin("topleft"),
    ]);

    play("th06_01");
    
    add([
      pos(width() / 2, 40),
      text("Touhou Akamakyou", 32),
      color(1, 0, 0)
    ]);

    add([
      pos(width() / 2, 80),
      text("V3.1"),
      color(1, 0, 0)
    ]);

    add([
      pos(width() / 2, height() / 2 + 120),
      text("Enter: Start")
    ]);

    add([
      pos(width() / 2, height() / 2 + 130),
      text("Arrow Keys (Hold): Move")
    ]);

    add([
      pos(width() / 2, height() / 2 + 140),
      text("Z (Hold): Fire")
    ]);

    add([
      pos(width() / 2, height() / 2 + 150),
      text("X: Bomb")
    ]);

    add([
      pos(width() / 2, height() / 2 + 160),
      text("Shift (Hold): Slow down and concentrate fire")
    ]);

    add([
      pos(width() / 2, height() / 2 + 170),
      text("@2021 No.5972 . MIT License.")
    ]);

    add([
      pos(width() / 2, height() / 2 + 185),
      text("This project is of 2ndary creation based on Touhou Koumakyou. \nCopyright of the material belongs to the original author.")
    ]);

    keyPress("enter", () => {
      go("level1", {});
    })