consoleWidtg

var config = {
    type: Phaser.AUTO,
    width: 1080,
    height: 600,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
  };

  var game = new Phaser.Game(config);

  var map;
  var player;
  var cursors;

  function preload() {
    this.load.image("player", "./assets/gather_character/Idle_front_view.png");
    this.load.image("tiles", "./assets/maps/tileset.png");
    this.load.tilemapTiledJSON("map", "./assets/maps/gameMap.json");
    this.load.spritesheet("player", "./assets/gather_character/Idle.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  function create() {
    console.log (this.cache.tilemap.get ('map').data);
    map = this.make.tilemap({ key: "map", tileWidth: 100, tileHeight: 100 });
    var tileset = map.addTilesetImage("game_tiles","tiles");
    var groundLayer = map.createLayer("GroundLayer", tileset, 0, 0);
    var treesLayer = map.createLayer("TreesLayer", tileset, 0, 0);

    player = this.physics.add.sprite(300, 100, "player");
    player.setScale(2);
    this.physics.add.collider(treesLayer, player);
    treesLayer.setCollisionBetween(30,31,32,33,34,35,39,40,41,42,43,44,48,49,50,51,52,53);



    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", { start: 3, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", { start: 9, end: 11 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("player", { start: 6, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    cursors = this.input.keyboard.createCursorKeys();

    // Set up the camera to follow the player
    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  function update() {
    player.setVelocityY(0);
    player.setVelocityX(0);

    if(cursors.up.isDown == true) {
        player.setVelocityY(-100);
    }
    if(cursors.down.isDown == true) {
        player.setVelocityY(100);
    }
    if(cursors.right.isDown == true) {
        player.setVelocityX(100);
    }
    if(cursors.left.isDown == true) {
        player.setVelocityX(-100);
    }
  }
