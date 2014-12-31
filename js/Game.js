var TopDownGame = TopDownGame || {};

//title screen
TopDownGame.Game = function(){};

TopDownGame.Game.prototype = {
  init: function(levelName, startX, startY) {
    this.levelName = levelName || 'level1';
    this.startX = startX;
    this.startY = startY;
  },
  create: function() {
    this.map = this.game.add.tilemap(this.levelName);

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('tiles', 'gameTiles');

    //create layer
    this.backgroundlayer = this.map.createLayer('backgroundLayer');
    this.blockedLayer = this.map.createLayer('blockedLayer');

    //collision on blockedLayer
    this.map.setCollisionBetween(1, 2000, true, 'blockedLayer');

    //resizes the game world to match the layer dimensions
    this.backgroundlayer.resizeWorld();

    this.createItems();
    this.createDoors();

    //create player
    if(this.startX === undefined) {
      var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer');
      this.startX = Math.round(result[0].x);
      this.startY = Math.round(result[0].y);// - this.map.tileHeight;
    }
    this.player = this.game.add.sprite(this.startX, this.startY, 'player');
    this.game.physics.arcade.enable(this.player);

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();

  },
  createItems: function() {
    this.createObjectsFromLayer('items', 'item', 'objectsLayer');
  },
  createDoors: function() {
    this.createObjectsFromLayer('doors', 'door', 'objectsLayer');
  },
  createObjectsFromLayer: function(name, type, layer) {
    this[name] = target = this.game.add.group();
    target.enableBody = true;
    result = this.findObjectsByType(type, this.map, layer);
    result.forEach(function(element){
      this.createFromTiledObject(element, target);
    }, this);
  },

  //find objects in a Tiled layer that containt a property called "type" equal to a certain value
  findObjectsByType: function(type, map, layer) {
    var result = [];
    map.objects[layer].forEach(function(element){
      if(element.properties.type === type) {
        //Phaser uses top left, Tiled bottom left so we have to adjust
        //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
        //so they might not be placed in the exact position as in Tiled
        element.y -= map.tileHeight;
        result.push(element);
      }
    });
    return result;
  },
  //create a sprite from an object
  createFromTiledObject: function(element, group) {
    var sprite = group.create(element.x, element.y, element.properties.sprite);

      //copy all properties to the sprite
      Object.keys(element.properties).forEach(function(key){
        sprite[key] = element.properties[key];
      });
  },
  update: function() {
    //collision
    this.game.physics.arcade.collide(this.player, this.blockedLayer);
    this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
    this.game.physics.arcade.overlap(this.player, this.doors, this.enterDoor, null, this);

    //player movement
    this.player.body.velocity.y = 0;
    this.player.body.velocity.x = 0;

    if(this.cursors.up.isDown) {
      this.player.body.velocity.y -= 50;
    }
    else if(this.cursors.down.isDown) {
      this.player.body.velocity.y += 50;
    }
    if(this.cursors.left.isDown) {
      this.player.body.velocity.x -= 50;
    }
    else if(this.cursors.right.isDown) {
      this.player.body.velocity.x += 50;
    }
  },
  collect: function(player, collectable) {
    console.log('yummy!');

    //remove sprite
    collectable.destroy();
  },
  enterDoor: function(player, door) {
    console.log('entering door that will take you to '+door.targetTilemap+' on x:'+door.targetX+' and y:'+door.targetY);
    this.game.state.start('Game', true, false, door.targetTilemap, parseInt(door.targetX, 10), parseInt(door.targetY, 10) - this.map.tileHeight);
  },
};
