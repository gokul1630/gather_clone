const list = document.querySelector(".chat-list");
const messageBox = document.querySelector('#messageBox');
const sendBtn = document.querySelector('#submitBtn');
const chatBox = document.querySelector('#chatbox');
let user = JSON.parse(window.localStorage.getItem("user"))

const currentUser = user?.user

messageBox.placeholder = `Hi ${user?.user}, Type Something...`

const messageClass = "flex w-auto"
const socket = io("ws://localhost:8081");


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
let currentPlayer;
let player2;
var cursors;
let physics, cameras, treesLayer

class Player {
  physics
  cameras
  player
  user
  constructor (scene, camera, treesLayer, x, y, user) {
    if (scene && camera && treesLayer && user) {

      this.user = user
      this.cameras = camera
      this.physics = scene
      this.player = this.physics.add.sprite(x, y, "player");
      this.player.setScale(2);
      this.player.playerId = user
      this.physics.add.collider(treesLayer, this.player);
      this.cameras.main.startFollow(this.player);
    }
  }

  update() {
    if (this.user === currentUser) {
      this.player.setVelocityY(0);
      this.player.setVelocityX(0);

      if (cursors.up.isDown) {
        this.player.setVelocityY(-100);
      }
      if (cursors.down.isDown) {
        this.player.setVelocityY(100);
      }
      if (cursors.right.isDown) {
        this.player.setVelocityX(100);
      }
      if (cursors.left.isDown) {
        this.player.setVelocityX(-100);
      }
    }
  }
}

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
  map = this.make.tilemap({ key: "map", tileWidth: 100, tileHeight: 100 });
  var tileset = map.addTilesetImage("game_tiles", "tiles");
  var groundLayer = map.createLayer("GroundLayer", tileset, 0, 0);
  var treesLayer = map.createLayer("TreesLayer", tileset, 0, 0);
  treesLayer.setCollisionBetween(30, 31, 32, 33, 34, 35, 39, 40, 41, 42, 43, 44, 48, 49, 50, 51, 52, 53);



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
  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  currentPlayer = new Player(this.physics, this.cameras, treesLayer, 100, 200, "gokul")

  player2 = new Player(this.physics, this.cameras, treesLayer, 200, 300, "anuvindh")


}

let collisionFlag = false

const createMessage = (message, user) => {
  const listItem = document.createElement("li")
  const messageContainer = document.createElement("div")
  const messageItem = document.createElement("p")
  const messageUser = document.createElement("p")
  messageUser.className = "text-[12px]"
  messageContainer.className = `max-w-[200px] px-3 py-2 bg-white m-2 ${user === currentUser ? "rounded-tl-lg rounded-br-lg rounded-bl-lg" : "rounded-tr-lg rounded-bl-lg rounded-br-lg"}`
  listItem.className = user === currentUser ? `${messageClass} justify-end` : `${messageClass} justify-start`;
  messageItem.innerText = message
  messageUser.innerText = user
  messageContainer.append(messageItem, messageUser)
  listItem.appendChild(messageContainer)
  list.appendChild(listItem)
}

function update() {
  currentPlayer.update(currentUser);
  player2.update("");

  collision = checkCollision(player2.player, currentPlayer.player);

  if (collision !== collisionFlag) {
    collisionFlag = collision;
    socket.on(currentUser, (event) => {
      createMessage(event.message, event.user)
    })


    sendBtn.addEventListener('click', () => {
      if(messageBox.value){
        socket.emit('chat', { message: messageBox.value, users: [{ from: currentUser, to: currentUser === 'anuvindh' ? 'gokul' : 'anuvindh' }] })
        createMessage(messageBox.value, currentUser)        

      }
    })
    if(!collision){
      sendBtn.removeEventListener('click',{})
    } 
  } 
  if(collisionFlag){
    chatBox.className ='block'
  } else{
    chatBox.className ='hidden'
  }

  if(cursors.up.isDown || cursors.down.isDown || cursors.left.isDown || cursors.right.isDown){
    if(currentUser!=='anuvindh'){
      socket.emit('movement',{x:currentPlayer.player.x,y:currentPlayer.player.y, player: currentPlayer.player.x,player:currentPlayer.player.playerId})
    }else{
      socket.emit('movement',{x:player2.player.x,y:player2.player.y, player: player2.player.x,player:player2.player.playerId})
    }
  }

}
socket.on(`movement`,(event)=>{
  if(event.player!==currentUser){
    if(event.player==='gokul'){
      currentPlayer.player.setPosition(event.x,event.y)
    }else{
      player2.player.setPosition(event.x,event.y)
    }
  }else{
  }
}
)

function checkCollision(object1, object2) {
  // Calculate the distance between the two objects
  var distanceX = object1.x - object2.x;
  var distanceY = object1.y - object2.y;
  var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  // Check if the distance is less than the sum of the object sizes (assuming square objects)
  var objectSize = object1.width; // Assuming both objects have the same size
  var collisionDistance = objectSize * 2;

  return distance < collisionDistance
}
