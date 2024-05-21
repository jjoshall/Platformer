class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");

        this.score = 0;
        this.scoreNum = 0;
        this.lives = 3;
        this.livesNum = null;
    }

    init() {
        // variables and settings
        this.ACCELERATION = 500;
        this.DRAG = 5550;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 1.5;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.audio("wins", ["jingles_SAX16.ogg"]);
        this.load.audio("jumps", ["error_004.ogg"]);
        this.load.audio("collects", ["confirmation_003.ogg"]);
        this.load.audio("dies", ["laserRetro_001.ogg"]);
        this.load.audio("power", ["jump-15984.mp3"]);
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 100 tiles wide and 20 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 100, 20);
        this.physics.world.setBounds(0,0, 100*18 , 20*18);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.tilesetBack = this.map.addTilesetImage("kenny_tilemap_backgrounds_packed", "tilemap_background");

        // Create a layer
        this.backLayer = this.map.createLayer("Background", this.tilesetBack, 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        
        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // TODO: Add createFromObjects here
        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        // Since we scaled the groundLayer, we also need to adjust the x, y, and coin size
        // by the same scale

        this.coins.map((coin) => {
            coin.x *= 1;
            coin.y *= 1;
            coin.setScale(1);
        });

        
        // TODO: Add turn into Arcade Physics here
        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 245, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // TODO: Add coin collision handler
        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.score += 1;
            this.scoreNum.setText(this.score.toString());
            const collects = this.sound.add("collects");
            collects.play(); 
        });

        this.flags = this.map.createFromObjects("Flag", {
            name: "Flag",
            key: "tilemap_sheet",
            frame: 111
        });

        this.physics.world.enable(this.flags, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.flagGroup = this.add.group(this.flags);
        
        this.physics.add.overlap(my.sprite.player, this.flagGroup, (obj1, obj2) => {
            const wins = this.sound.add("wins");
            wins.play();
            const endText = this.add.text(1320, 100, "YOU WIN", {
                fontFamily: "Arial",
                fontSize: 48,
                color: "#1ABC9C"
            });
            this.add.text(1162, 150, "COINS COLLECTED: " + this.score, {
                fontFamily: "Arial",
                fontSize: 48,
                color: "#17202A"
            });
            const newScene = this.add.text(1200, 200, "CLICK TO RESTART", {
                fontFamily: "Arial",
                fontSize: 48,
                color: "#FF0000"
            });

            my.sprite.player.setVelocity(0, 0);
            my.sprite.player.body.moves = false;

            this.input.once("pointerdown", function () {
                this.score = 0;
                this.scoreNum = 0;
                this.lives = 3;
                this.livesNum.setText(this.lives.toString());
                this.scene.restart();
            }, this);
        });

        this.spikes = this.map.createFromObjects("Spikes", {
            name: "spike",
            key: "tilemap_sheet",
            frame: 68
        });

        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.spikeGroup = this.add.group(this.spikes);

        this.physics.add.overlap(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            const dies = this.sound.add("dies");
            dies.play();

            my.sprite.player.setVelocity(0, 0);
            my.sprite.player.body.moves = false;

            this.lives -= 1;
            this.livesNum.setText(this.lives.toString());
            if(this.lives === 0) {
                this.lives = 3;
                this.score = 0;
                this.scoreNum = 0;
                this.scene.start("endingScene");
            }
            else {
                this.score = 0;
                this.scoreNum = 0;
                this.scene.restart();
            }         
        });

        this.powerups = this.map.createFromObjects("powerup", {
            name: "Powerups",
            key: "tilemap_sheet",
            frame: 67
        });

        this.physics.world.enable(this.powerups, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.powerGroup = this.add.group(this.powerups);
        
        this.physics.add.overlap(my.sprite.player, this.powerGroup, (obj1, obj2) => {
            obj2.destroy();
            const power = this.sound.add("power");
            power.play();
            this.JUMP_VELOCITY -= 100;
        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');
        this.spaceKey = this.input.keyboard.addKey('SPACE');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // TODO: Add movement vfx here
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['dirt_01.png', 'dirt_03.png'],
            // TODO: Try: add random: true
            random: true,
            scale: {start: 0.03, end: 0.08},
            // TODO: Try: maxAliveParticles: 8,
            maxAliveParticles: 5,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            gravityY: -40,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();

        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['muzzle_01.png', 'muzzle_05.png'],
            // TODO: Try: add random: true
            scale: {start: 0.1, end: 0.03},
            // TODO: Try: maxAliveParticles: 8,
            maxAliveParticles: 1,
            lifespan: 500,
            // TODO: Try: gravityY: -400,
            gravityY: 40,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.jumping.stop();

        // TODO: add camera code here
        this.cameras.main.setBounds(0, 0, 100*18 , 20*18);

        this.cameras.main.startFollow(my.sprite.player, true, 0.2, 0.2); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(400, 200);
        this.cameras.main.setZoom(2);
        
        this.add.text(15, 370, "Coins: ", {
            fontFamily: "Arial",
            fontSize: 23,
            color: "#2ECC71"
        });
        this.scoreNum = this.add.text(85, 370, this.score.toString(), {
            fontFamily: "Arial",
            fontSize: 23,
            color: "#FFAA00"
        });
        const livesText = this.add.text(15, 394, "Lives: ", {
            fontFamily: "Arial",
            fontSize: 23,
            color: "#2ECC71"
        });
        this.livesNum = this.add.text(85, 394, this.lives.toString(), {
            fontFamily: "Arial",
            fontSize: 23,
            color: "#1E90FF"
        });
    }

    update() {
        if(cursors.left.isDown) {
            this.cameras.main.scrollX -= 4;
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-5, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
            

        } else if(cursors.right.isDown) {
            this.cameras.main.scrollX += 4;
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-15, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.spaceKey))
        {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2 - 10, my.sprite.player.displayHeight/2-10, false);
            my.vfx.jumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            const jumps = this.sound.add("jumps");
            jumps.play();
            
            if (my.sprite.player.body.blocked.down) {

                my.vfx.jumping.start();

            }
        };
        this.input.keyboard.on('keyup-SPACE', event =>
        {
            my.vfx.jumping.stop();
        });


        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.score = 0;
            this.scoreNum = 0;
            this.scene.restart();
        }

        

    }
}
