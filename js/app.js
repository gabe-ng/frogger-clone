// random integer generator - credits: https://gist.github.com/alfredwesterveld/8864936
const randomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
};

//arrays to store possible obstacle poisitions
let obstacleXPosition = [0, 100, 200, 300, 400, 500, 600]
let obstacleYPosition = [215, 300, 380, 465, 545]

//arrays to hold players previous X, Y positions
let prevX = [];
let prevY = [];

//determines if game is over
let win = false;

//background music indicator
let soundOn = true;

//sound variables and functions
let splash = 'splash';
let rescue = 'rescued';
let blocked = 'rock';
let caught = 'shark';
let congrats = 'tada';
let background = 'ocean-background';

//function to preload all sound files
function loadSounds() {
  createjs.Sound.registerSound('sounds/splash.wav', splash);
  createjs.Sound.registerSound('sounds/rescued.wav', rescue);
  createjs.Sound.registerSound('sounds/rock.mp3', blocked);
  createjs.Sound.registerSound('sounds/shark.wav', caught);
  createjs.Sound.registerSound('sounds/tada.wav', congrats);
  createjs.Sound.registerSound('sounds/ocean-background.wav', background);

};

//functions used to play/stop sounds
function playSplash() {
  createjs.Sound.play(splash);
};

function playRescue() {
  createjs.Sound.play(rescue);
};

function playBlocked() {
  createjs.Sound.play(blocked);
};

function playCaught() {
  createjs.Sound.play(caught);
};

function playCongrats() {
  createjs.Sound.play(congrats);
};

function stopCongrats() {
  createjs.Sound.stop(congrats);
}

function playBackground() {
  createjs.Sound.play(background);
  console.log('background sound on')
};

function stopBackground() {
  createjs.Sound.stop(background);
  console.log('background sound off')
}

//load all sounds
loadSounds();


// enemies our player must avoid
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = randomInt(110, 220);
    this.sprite = 'images/shark-fin.png';
    this.spriteHeight = 90;
    this.spriteWidth = 150;
  }

  // update the enemy's position
  // parameter: dt, a time delta between ticks
  // dt ensures the game runs at the same speed for all computers
  update(dt) {
    this.x += this.speed * dt;
    if (this.x > 725) {
      this.x = 0;
    }
  }

  // draws enemy characters
  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.spriteHeight, this.spriteWidth);
  }
};

class FastEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.speed = randomInt(275, 350);;
  }

};


class Player {
  constructor() {
    this.sprite = 'images/char-boy.png';
  }

  // updates player position and checks for collisions
  // parameter: dt, a time delta between ticks
  // dt ensures the game runs at the same speed for all computers
  update(dt) {
    this.checkEnemyCollision();
    this.checkObstacleCollision();
  }


  // draws player
  render() {
    //checks to see if game is over or not
    (!win) ?
    //if game is not over, draw player
    (ctx.drawImage(Resources.get(this.sprite), this.x, this.y)) :
    //if game is over draw player and win screen
    (ctx.drawImage(Resources.get(this.sprite), this.x, this.y), playerWon())
  }

  // method that controls player movement
  handleInput(key) {
    this.currentPosition();
    switch (key) {
      case 'left':
        this.x -= 100;
        this.boundary();
        if (this.y < 555) {
          playSplash();
        };
        break;
      case 'up':
        this.y -= 85;
        //check for score
        this.scored();
        if (this.y < 555) {
          playSplash();
        };
        break;
      case 'right':
        this.x += 100;
        this.boundary();
        if (this.y < 555) {
          playSplash();
        };
        break;
      case 'down':
        this.y += 85;
        this.boundary();
        if (this.y < 555) {
          playSplash();
        };
        break;
      case 'enter':
        if (win = true) {
          gameReset();
        }
    }
  };

  // prevent player from leaving the game canvas
  boundary() {
    if (this.x < 0) {
      this.x = 0;
      console.log('Player can\'t go past this point');
    } else if (this.x > 610) {
      this.x = 600;
      console.log('Player can\'t go past this point');
    } else if (this.y > 570) {
      this.y = 550;
      console.log('Player can\'t go past this point');
    }
  }

  checkEnemyCollision() {
    for (var e = 0; e < allEnemies.length; e++) {
      if (allEnemies[e].x < this.x + 50 &&
        allEnemies[e].x + 50 > this.x &&
        allEnemies[e].y < this.y + 40 &&
        40 + allEnemies[e].y > this.y) {
        this.died();
      }
    }
  }


  // check to see if player reaches the water
  scored() {
    if (this.y < 120) {
      console.log('Player rescued a friend!')
      this.resetPosition();
      //change rock positions
      allObstacles.forEach(function(obstacles) {
        obstacles.positionReset();
      });
      // removes a captured friend
      capturedFriends.pop();
      // turns the caputred friend into a freed friend
      if (freedFriends.length === 0) {
        freedFriends.push(freedFriend1);
      } else if (freedFriends.length === 1) {
        freedFriends.push(freedFriend2);
      } else if (freedFriends.length === 2) {
        freedFriends.push(freedFriend3);
      } else if (freedFriends.length === 3) {
        freedFriends.push(freedFriend4);
      };
      // checks to see if all friends are rescued and game is over
      if (capturedFriends.length === 0) {
        win = true;
      }
      playRescue();
    }
  }

  died() {
    console.log('Shark food!')
    this.resetPosition();
    playCaught();
  }

  //resets the player to initial position
  resetPosition() {
    this.x = 300;
    this.y = 555;
  }

  //captures the player's previous position
  currentPosition() {
    prevX.pop();
    prevX.push(this.x);
    prevY.pop();
    prevY.push(this.y);
  }
  //function used by obstacles to stop movement and keep player in same position
  stopMove() {
    this.x = prevX[0];
    this.y = prevY[0];
  }

  checkObstacleCollision() {
    for (var o = 0; o < allObstacles.length; o++) {
      if (allObstacles[o].x < this.x + 75 &&
        allObstacles[o].x + 75 > this.x &&
        allObstacles[o].y - 85 < this.y + 40 &&
        40 + allObstacles[o].y - 85 > this.y) {
        console.log('Path is blocked!');
        this.stopMove();
        playBlocked();
      }
    }
  }
};


class Obstacle {
  constructor(width, height, image) {
    this.x = obstacleXPosition[Math.floor(Math.random() * obstacleXPosition.length)];
    this.y = obstacleYPosition[Math.floor(Math.random() * obstacleYPosition.length)];
    this.sprite = image;
    this.width = width;
    this.height = height;
  }
  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.width, this.height);
  }
  update(dt) {

  }
  // resets the poisitons every time a friend is rescued
  positionReset() {
    this.x = obstacleXPosition[Math.floor(Math.random() * obstacleXPosition.length)];
    this.y = obstacleYPosition[Math.floor(Math.random() * obstacleYPosition.length)];
    this.render();
  }
};

class Friend {
  constructor(x, y, image) {
    this.x = x;
    this.y = y;
    this.sprite = image;
  }
  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
  update(dt) {

  }

};

// clears game board and congradulates player
function playerWon() {
  allEnemies = [];
  allObstacles = [];

  ctx.fillStyle = 'rgb(9, 246, 246)';
  ctx.font = 'bold 36pt Pirata One';
  ctx.textAlign = 'center';
  ctx.fillText('CONGRATULATIONS!', 353, 363);
  ctx.font = 'bold 23pt Pirata One';
  ctx.fillText('Press Enter to Play Again!', 353, 440);
  ctx.lineWidth = 1;

  playCongrats();
  setTimeout(stopCongrats, 6000);
};

// resets game to start state
function gameReset() {
  allEnemies = [enemy1, enemy2, enemy3, enemy4, enemy5, enemy6];
  allObstacles = [rock1, rock2, rock3, rock4, rock5, rock6];
  capturedFriends = [capturedFriend1, capturedFriend2, capturedFriend3, capturedFriend4];
  freedFriends = [];
  win = false;
  player.resetPosition();
  stopBackground();
  loadSounds();
  soundOn = true;
  icon.setAttribute('class', 'fa fa-volume-up');
  setTimeout(playBackground, 6000);
};

// instantiate objects
let player = new Player(300, 550);

let capturedFriend1 = new Friend(150, 25, 'images/char-cat-girl-sad.png')
let capturedFriend2 = new Friend(250, 25, 'images/char-pink-girl-sad.png')
let capturedFriend3 = new Friend(350, 25, 'images/char-princess-girl-sad.png')
let capturedFriend4 = new Friend(450, 25, 'images/char-horn-girl-sad.png')

let freedFriend1 = new Friend(0, 555, 'images/char-horn-girl.png');
let freedFriend2 = new Friend(100, 555, 'images/char-princess-girl.png');
let freedFriend3 = new Friend(500, 555, 'images/char-pink-girl.png');
let freedFriend4 = new Friend(600, 555, 'images/char-cat-girl.png');

let rock1 = new Obstacle(100, 80, 'images/sea-rock.png');
let rock2 = new Obstacle(100, 80, 'images/sea-rock.png');
let rock3 = new Obstacle(100, 80, 'images/sea-rock.png');
let rock4 = new Obstacle(100, 80, 'images/sea-rock2.png');
let rock5 = new Obstacle(100, 80, 'images/sea-rock2.png');
let rock6 = new Obstacle(100, 80, 'images/sea-rock2.png');

let enemy1 = new Enemy(10, 140);
let enemy2 = new Enemy(10, 215);
let enemy3 = new Enemy(10, 300);
let enemy4 = new Enemy(10, 385);
let enemy5 = new FastEnemy(300, 215);
let enemy6 = new FastEnemy(300, 385);

// arrays holding all objects
let allEnemies = [enemy1, enemy2, enemy3, enemy4, enemy5, enemy6];
let allObstacles = [rock1, rock2, rock3, rock4, rock5, rock6];
let capturedFriends = [capturedFriend1, capturedFriend2, capturedFriend3, capturedFriend4]
let freedFriends = [];

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    13: 'enter',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});


//mute background sound button

let button = document.getElementsByTagName('button');
let icon = button[0].firstElementChild;

//only mutes background sound, not sound effects
function toggleMute() {
  if (soundOn === true) {
    stopBackground();
    icon.setAttribute('class', 'fa fa-volume-off');
    soundOn = false;
  } else if (soundOn === false) {
    playBackground();
    icon.setAttribute('class', 'fa fa-volume-up');
    soundOn = true;
  };
};

button[0].addEventListener('click', toggleMute);
