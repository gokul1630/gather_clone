const list = document.querySelector(".chat-list");
const messageBox = document.querySelector('#messageBox');
const sendBtn = document.querySelector('#submitBtn');
const chatBox = document.querySelector('#chatbox');
let user = JSON.parse(window.localStorage.getItem("user"));
const video = document.querySelector('video');
const answerVideo = document.querySelector('.answer');
const callBtn = document.querySelector('.call');
const endBtn = document.querySelector('.end');

window.onload = () => {
  if (!user) window.location.href = 'index.html'
}

const currentUser = user?.userId
var map;
const players = {}
var cursors;
let users = []


messageBox.placeholder = `Hi ${user?.user}, Type Something...`

const messageClass = "flex w-auto"
const socket = io("https://dd05-3-109-129-91.ngrok-free.app");
const peer = new Peer(currentUser);

var config = {
  type: Phaser.CANVAS,
  canvas: document.getElementById('game-area'),
  height: window.innerHeight,
  width: window.innerWidth - 20,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);


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

      if (cursors.up.isDown == true && cursors.left.isDown == true) {
        this.player.setVelocity(-100, -100); //-100, -100
        this.player.anims.play('move-left', true);
      }

      else if (cursors.up.isDown == true && cursors.right.isDown == true) {
        this.player.setVelocity(100, -100);  //100, -100
        this.player.anims.play('move-right', true);
      }

      else if (cursors.down.isDown == true && cursors.left.isDown == true) {
        this.player.setVelocity(-100, 100); //-100, 100
        this, player.anims.play('move-left', true);
      }

      else if (cursors.down.isDown == true && cursors.right.isDown == true) {
        this.player.setVelocity(100, 100); //100, 100
        this.player.anims.play('move-right', true);
      }

      else if (cursors.up.isDown == true) {
        this.player.setVelocityY(-100);
        this.player.anims.play('move-up', true);
      }
      else if (cursors.down.isDown == true) {
        this.player.setVelocityY(100);
        this.player.anims.play('move-down', true);
      }
      else if (cursors.right.isDown == true) {
        this.player.setVelocityX(100);
        this.player.anims.play('move-right', true);
      }
      else if (cursors.left.isDown == true) {
        this.player.setVelocityX(-100);
        this.player.anims.play('move-left', true);
      }
    }
  }
}

function preload() {
  this.load.image("player", "./assets/gather_character/Idle_front_view.png");
  this.load.image("tiles", "./assets/maps/tileset.png");
  this.load.tilemapTiledJSON("map", "./assets/maps/gameMap.json");
  this.load.spritesheet("player-idle", "./assets/gather_character/Idle.png", {
    frameWidth: 32,
    frameHeight: 32
  });
  this.load.spritesheet("player-move", "./assets/gather_character/Walk.png", {
    frameWidth: 32,
    frameHeight: 32
  });
}

socket.on('removeUser', (user) => {
  players[user].player.destroy(true);
  delete players[user];
})

async function create() {
  socket.emit('newUser', currentUser)
  map = this.make.tilemap({ key: "map", tileWidth: 100, tileHeight: 100 });
  var tileset = map.addTilesetImage("game_tiles", "tiles");
  var groundLayer = map.createLayer("GroundLayer", tileset, 0, 0);
  var treesLayer = map.createLayer("TreesLayer", tileset, 0, 0);
  treesLayer.setCollisionBetween(30, 31, 32, 33, 34, 35, 39, 40, 41, 42, 43, 44, 48, 49, 50, 51, 52, 53);

  await socket.on('newUser', async (data) => {
    const { user, moves } = data
    if (this.physics && this.cameras && treesLayer && !players[user]) {
      if (moves) {
        const newUser = new Player(this.physics, this.cameras, treesLayer, moves.x ?? (Math.floor(Math.random() * 100)) + 300, moves.y ?? 500, user)
        newUser.player.anims.play(moves.move, true);
        players[user] = newUser
        return;
      }
      players[user] = new Player(this.physics, this.cameras, treesLayer, (Math.floor(Math.random() * 100)) + 300, 500, user)
    }
  })

  cursors = this.input.keyboard.createCursorKeys();

  this.anims.create({
    key: 'move-left',
    frames: this.anims.generateFrameNumbers('player-move', { start: 15, end: 18 }),
    frameRate: 10,
    repeat: 0,
    duration: 100
  });

  this.anims.create({
    key: 'move-up',
    frames: this.anims.generateFrameNumbers('player-move', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: 0,
    duration: 100
  });

  this.anims.create({
    key: 'move-right',
    frames: this.anims.generateFrameNumbers('player-move', { start: 10, end: 13 }),
    frameRate: 10,
    repeat: 0,
    duration: 100
  });


  this.anims.create({
    key: 'move-down',
    frames: this.anims.generateFrameNumbers('player-move', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: 0,
    duration: 100
  });

  this.anims.create({
    key: 'down-idle',
    frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 1 }),
    frameRate: 3,
    repeat: -1
  });


  // Set up the camera to follow the player
  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

}

let collisionFlag = false
let collision = false

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

const moveDirection = () => {
  if (cursors.up.isDown) {
    return "move-up"
  } else if (cursors.down.isDown) {
    return "move-down"
  } else if (cursors.left.isDown) {
    return "move-left"
  } else {
    return "move-right"
  }
}

function update() {

  Object.values(players).forEach((player) => {
    player.update()
    player.player.setCollideWorldBounds(true)
  })

  const collidedUsers = new Set()

  if (Object.values(players).length) {
    Object.values(players).forEach(playerOne => Object.values(players).forEach(playerTwo => {
      if (playerOne.player !== playerTwo.player && checkCollision(playerOne.player, playerTwo.player)) {
        collision = checkCollision(playerOne.player, playerTwo.player)
        collidedUsers.add(playerOne.player.playerId)
        collidedUsers.add(playerTwo.player.playerId)
      }
    }))
  }

  users = [...collidedUsers.keys()].filter(user => user !== currentUser).map(user => ({ from: currentUser, to: user }))

  if (collision !== collisionFlag) {
    collisionFlag = collision;
    socket.on(currentUser, (event) => {
      createMessage(event.message, event.user)
    })

    sendBtn.addEventListener('click', () => {
      if (messageBox.value) {
        socket.emit('chat', { message: messageBox.value, users })
        createMessage(messageBox.value, currentUser)
      }
    })
    if (!collision) {
      sendBtn.removeEventListener('click', {})
    }
  }
  if (collisionFlag) {
    chatBox.className = 'block'
    callBtn.className = 'block'
  } else {
    chatBox.className = 'hidden'
    // callBtn.className = 'hidden'
  }

  if (cursors.up.isDown || cursors.down.isDown || cursors.left.isDown || cursors.right.isDown) {
    Object.values(players).forEach(player => {
      if (player.player.playerId === currentUser) {
        socket.emit('movement', { x: player.player.x, y: player.player.y, player: player.player.playerId, move: moveDirection() })
      }
    })
  }
}
socket.on(`movement`, (event) => {
  Object.values(players).forEach(player => {
    const playerId = player.player.playerId;
    if (playerId === event.player && event.player !== currentUser) {
      player.player.setPosition(event.x, event.y)
      player.player.anims.play(event.move, true);
    }
  })
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


function hasUserMedia() {
  return navigator.mediaDevices.getUserMedia;
}

const clr = document.querySelector(".clr");


clr.addEventListener('click', () => {
  localStorage.clear()
  window.location.reload()
})

let call = false
let outgoingCall
callBtn.addEventListener('click', () => {
  const mediaDevice = navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  call = !call

  if (peer && call && hasUserMedia()) {

    video.className = 'w-[400px] h-[200px] absolute top-10 left-10 rounded-lg bg-black z-10 block'
    answerVideo.className = 'w-[400px] h-[200px] absolute top-10 right-10 rounded-lg bg-yellow-100 z-10 block'

    mediaDevice.then(stream => {
      window.localStream = stream
      video.srcObject = stream;

      if (users) {
        outgoingCall = peer.call(users[0].to, stream)
        outgoingCall.on('stream', (data) => answerVideo.srcObject = data)
      }

    }).catch(console.log)
  }
})

peer.on('call', (call) => {
  const mediaDevice = navigator.mediaDevices.getUserMedia({ video: true, audio: true });

  mediaDevice.then(stream => {
    window.localStream = stream
    video.srcObject = stream

    answerVideo.className = 'w-[400px] h-[200px] absolute top-10 right-10 rounded-lg bg-yellow-100 z-10 block'
    video.className = 'w-[400px] h-[200px] absolute top-10 left-10 rounded-lg bg-black z-10 block'

    call.answer(stream)
    call.on('stream', (e) => {
      answerVideo.srcObject = e
    })
    call.on('close', (e) => {
      console.log('closed')
    })
  }).catch(console.log)
})

endBtn.addEventListener('click', () => {
  video.className = 'w-[400px] h-[200px] absolute top-10 left-10 rounded-lg bg-black z-10 hidden'
  answerVideo.className = 'w-[400px] h-[200px] absolute top-10 right-10 rounded-lg bg-yellow-100 z-10 hidden'
  localStream.getTracks().forEach(track => track.stop())

})
video.className = 'w-[400px] h-[200px] absolute top-10 left-10 rounded-lg bg-black z-10 hidden'
answerVideo.className = 'w-[400px] h-[200px] absolute top-10 right-10 rounded-lg bg-yellow-100 z-10 hidden'
