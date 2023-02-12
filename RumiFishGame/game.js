let canvas = document.getElementById("gameCanvas");
canvas.width = canvas.parentElement.offsetWidth;
canvas.height = canvas.parentElement.offsetHeight;
let canvasContext = canvas.getContext("2d");
let globalObjectList = []

const levels = [];

const preloadBackgrounds = () => {
	const backgrounds = ["background0.jpg", "background1.jpg", "background2.jpg", "background3.jpg", "background4.jpg", "background5.jpg"];
	backgrounds.forEach((bg) => {
		const image = new Image();
		image.src = bg;
		levels.push(image);
	});
};

preloadBackgrounds();

let current_level = 0;

class RumiFish {
	constructor() {
		this.isDead = false;
		this.width = 50;
		this.height = 50;
		this.x = 0;
		this.y = 0;
		this.image = new Image();
		this.image.src = "RumiFish.png";
		this.image.onload = () => {
			this.width = this.image.naturalWidth;
			this.height = this.image.naturalHeight;
		};
		this.transparentMatrix = RumiFish_pixel_data;
		this.score = 0;
		this.scoreSpan = document.getElementById("score");
		this.spawn()
	}

	spawn() {
		this.x = this.width;
		this.y = canvas.height / 2 - this.height / 2;
		document.addEventListener("mousemove", this.move.bind(this));
		document.addEventListener("touchmove", this.touchMove.bind(this));
		this.scoreSpan.innerHTML = this.score;
	}

	updateScore() {
		this.score++;
		this.scoreSpan.innerHTML = this.score;
	}
	draw() {
		canvasContext.drawImage(this.image, this.x, this.y, this.width, this.height);
	}

	move(event) {
		let rect = canvas.getBoundingClientRect();
		this.x = event.clientX - rect.left - this.width / 2;
		this.y = event.clientY - rect.top - this.height / 2;
		this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
		this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
		this.checkForCollision();
	}
	touchMove(event) {
		event.preventDefault();
		let rect = canvas.getBoundingClientRect();
		let touch = event.touches[0];
		this.x = touch.clientX - rect.left - this.width / 2;
		this.y = touch.clientY - rect.top - this.height / 2;
		this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
		this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
		this.checkForCollision();
	}

	checkForCollision() {
		for (let i = 0; i < globalObjectList.length; i++) {
			let object = globalObjectList[i];
			if (this === object)
				continue;
			let thisTransparentMatrix = this.transparentMatrix;
			let objectTransparentMatrix = object.transparentMatrix;
			let xMin = Math.max(this.x, object.x);
			let xMax = Math.min(this.x + this.width, object.x + object.width);
			let yMin = Math.max(this.y, object.y);
			let yMax = Math.min(this.y + this.height, object.y + object.height);
			if (xMin < xMax && yMin < yMax) {
				for (let x = xMin; x < xMax; x++) {
					for (let y = yMin; y < yMax; y++) {
						let x1 = Math.floor(x - this.x);
						let y1 = Math.floor(y - this.y);
						let x2 = Math.floor(x - object.x);
						let y2 = Math.floor(y - object.y);
						if (
							thisTransparentMatrix[y1][x1] === 1 &&
							objectTransparentMatrix[y2][x2] === 1) {
							if (object instanceof Shark || object instanceof Eel) {
								gameOver();
								return;
							} else if (object instanceof FoodFish) {
								this.updateScore();
								globalObjectList.splice(i, 1);
								i--;
								return;
							} else if (object instanceof Finish) {
								levelFinished();
								return;
							}
							break;
						}
					}
				}
			}
		}
	}
}

class SomeObject {
	constructor() {
		this.x = canvas.width;
		this.y = 50;
		this.height = 50;
		this.width = 50;
		this.speed = 5 * ((1 + current_level) / (3)) + Math.random()*(5+current_level);
		this.image = new Image();
		this.transparentMatrix = [];

	}

	loadImage(imageSrc) {
		this.image.src = imageSrc;
		this.image.onload = () => {
			this.width = this.image.naturalWidth;
			this.height = this.image.naturalHeight;
		};
	}

	move() {
		this.x -= this.speed;
		if (this.x + this.width < 0) {
			this.delete();
		}
	}

	delete () {
		// delete this instance
	}

	draw() {
		canvasContext.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
}

class Shark extends SomeObject {
	constructor() {
		super();
		this.loadImage("shark.png");
		this.y = Math.random() * (canvas.height - this.height);
		this.transparentMatrix = shark_pixel_data;
		this.draw();
	}
}

class Eel extends SomeObject {
	constructor() {
		super();
		this.loadImage("eel.png");
		this.y = Math.random() * (canvas.height - this.height);
		this.transparentMatrix = eel_pixel_data;
		this.draw();
	}
}

class FoodFish extends SomeObject {
	constructor() {
		super();
		this.loadImage("foodFish.png");
		this.y = Math.random() * (canvas.height - this.height);
		this.transparentMatrix = foodFish_pixel_data;
		this.draw();
	}
}

class Finish extends SomeObject {
	constructor() {
		super();
		this.loadImage("finish.png");
		this.x = canvas.width - this.width;
		this.y = canvas.height / 2 - this.height / 2;
		this.speed = 0;
		this.transparentMatrix = finish_pixel_data;
		this.draw();
	}
	move() {
		this.x = canvas.width - this.width;
		this.y = canvas.height / 2 - this.height / 2;
	}
}

let rumiFish = new RumiFish(canvasContext);
let timer = 1;
let timer_counter = 0;
setInterval(function () {
	timer++;
}, 1000);

function startGameLoop() {

	document.getElementById("messageBox").style.display = "none";
	document.getElementById("startButton").style.display = "none";
	document.getElementById("playAgainButton").style.display = "none";
	document.getElementById("nextButton").style.display = "none";
	rumiFish.scoreSpan.innerHTML = rumiFish.score;
	rumiFish.isDead = false;
	timer = 1;
	timer_counter = 0;

	update()
}

function spawnObject() {
	if (timer % Math.ceil(Math.random()*(levels.length/2 - current_level/2)) === 0 && timer > timer_counter) {
		let randomNum = Math.floor(Math.random() * 3);
		let x = canvas.width;
		let y = Math.floor(Math.random() * canvas.height);

		switch (randomNum) {
		case 0:
			globalObjectList.push(new Shark());
			break;
		case 1:
			globalObjectList.push(new Eel());
			break;
		case 2:
			globalObjectList.push(new FoodFish());
			break;
		}
	}

	if (timer === 60 && timer > timer_counter) {
		let x = canvas.width;
		let y = canvas.height / 2;
		let width = 50;
		let height = 50;
		globalObjectList.push(new Finish());
	}
	timer_counter = timer;
}

function gameOver() {
	document.getElementById("messageBox").innerHTML = "Game Over. Score: " + rumiFish.score;
	document.getElementById("messageBox").style.display = "block";
	document.getElementById("playAgainButton").style.display = "block";
	document.getElementById("playAgainButton").setAttribute("onclick", "startGameLoop()");

	for (let i = 0; i < globalObjectList.length; i++) {
		globalObjectList.splice(i, 1);
		i--;
	}
	current_level = 0;
	rumiFish.isDead = true;
	rumiFish.score = 0;
}

function levelFinished() {
	current_level += 1
	if (current_level == levels.length) {
		document.getElementById("messageBox").innerHTML = "Game Completed. Score: " + rumiFish.score;
		document.getElementById("playAgainButton").style.display = "block";
		document.getElementById("playAgainButton").setAttribute("onclick", "startGameLoop()");
		rumiFish.score = 0;
		current_level = 0;
	} else {
		document.getElementById("messageBox").innerHTML = "Level Completed";
		document.getElementById("nextButton").style.display = "block";
		document.getElementById("nextButton").setAttribute("onclick", "startGameLoop()");
	}
	document.getElementById("messageBox").style.display = "block";

	for (let i = 0; i < globalObjectList.length; i++) {
		globalObjectList.splice(i, 1);
		i--;
	}

	rumiFish.isDead = true;
}

function drawObjects() {
	canvasContext.drawImage(levels[current_level], 0, 0, canvas.width, canvas.height);
	rumiFish.draw()
	for (let i = 0; i < globalObjectList.length; i++) {
		let object = globalObjectList[i];
		if (object.x + object.width < 0) {
			globalObjectList.splice(i, 1);
			i--;
			object.move();
			// delete(object)
			continue;
		}
		object.move();
		object.draw();
	}
}

function update() {
	if (!rumiFish.isDead) {
		canvasContext.clearRect(0, 0, canvas.width, canvas.height);
		spawnObject();
		drawObjects();
		requestAnimationFrame(update);
	}
}

document.getElementById("startButton").setAttribute("onclick", "startGameLoop()");
