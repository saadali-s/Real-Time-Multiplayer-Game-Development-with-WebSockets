Math.minmax = (value, limit) => {
    return Math.max(Math.min(value, limit), -limit);
};

const distance2D = (p1, p2) => {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
};

// Angle between the two points
const getAngle = (p1, p2) => {
    let angle = Math.atan((p2.y - p1.y) / (p2.x - p1.x));
    if (p2.x - p1.x < 0) angle += Math.PI;
    return angle;
};

// Closest a ball can be to a wall cap
const closestItCanBe = (cap, ball) => {
    let angle = getAngle(cap, ball);

    const deltaX = Math.cos(angle) * (wallW / 2 + ballSize / 2);
    const deltaY = Math.sin(angle) * (wallW / 2 + ballSize / 2);

    return { x: cap.x + deltaX, y: cap.y + deltaY };
};

// Roll the ball around the wall cap
const rollAroundCap = (cap, ball) => {
    let impactAngle = getAngle(ball, cap);

    let heading = getAngle(
        { x: 0, y: 0 },
        { x: ball.velocityX, y: ball.velocityY }
    );

    let impactHeadingAngle = impactAngle - heading;
    const velocityMagnitude = distance2D(
        { x: 0, y: 0 },
        { x: ball.velocityX, y: ball.velocityY }
    );
    const velocityMagnitudeDiagonalToTheImpact =
        Math.sin(impactHeadingAngle) * velocityMagnitude;

    const closestDistance = wallW / 2 + ballSize / 2;

    const rotationAngle = Math.atan(
        velocityMagnitudeDiagonalToTheImpact / closestDistance
    );

    const deltaFromCap = {
        x: Math.cos(impactAngle + Math.PI - rotationAngle) * closestDistance,
        y: Math.sin(impactAngle + Math.PI - rotationAngle) * closestDistance
    };

    const x = ball.x;
    const y = ball.y;
    const velocityX = ball.x - (cap.x + deltaFromCap.x);
    const velocityY = ball.y - (cap.y + deltaFromCap.y);
    const nextX = x + velocityX;
    const nextY = y + velocityY;

    return { x, y, velocityX, velocityY, nextX, nextY };
};

// Decrease a number by difference but maintain its sign
const slow = (number, difference) => {
    if (Math.abs(number) <= difference) return 0;
    if (number > difference) return number - difference;
    return number + difference;
};

// DOM elements
const mazeElement = document.getElementById("maze");
const joystickHeadElement = document.getElementById("joystick-head");
const noteElement = document.getElementById("note");

let hardMode = false;
let previousTimestamp;
let gameInProgress;
let mouseStartX;
let mouseStartY;
let accelerationX;
let accelerationY;
let frictionX;
let frictionY;

// Constants
const pathW = 25; // Path width
const wallW = 10; // Wall width
const ballSize = 10; // Ball dimensions
const holeSize = 18;

const debugMode = false;

let balls = [];
let ballElements = [];
let holeElements = [];

resetGame();

// Draw balls initially
balls.forEach(({ x, y }) => {
    const ball = document.createElement("div");
    ball.setAttribute("class", "ball");
    ball.style.cssText = `left: ${x}px; top: ${y}px; `;

    mazeElement.appendChild(ball);
    ballElements.push(ball);
});

// Define walls and draw them
const walls = [
    { column: 0, row: 0, horizontal: true, length: 10 },
    { column: 0, row: 0, horizontal: false, length: 9 },
    { column: 0, row: 9, horizontal: true, length: 10 },
    { column: 10, row: 0, horizontal: false, length: 9 },
    { column: 0, row: 6, horizontal: true, length: 1 },
    { column: 2, row: 4, horizontal: false, length: 2 }
].map((wall) => ({
    x: wall.column * (pathW + wallW),
    y: wall.row * (pathW + wallW),
    horizontal: wall.horizontal,
    length: wall.length * (pathW + wallW)
}));

walls.forEach(({ x, y, horizontal, length }) => {
    const wall = document.createElement("div");
    wall.setAttribute("class", "wall");
    wall.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${wallW}px;
        height: ${length}px;
        transform: rotate(${horizontal ? -90 : 0}deg);
    `;

    mazeElement.appendChild(wall);
});

// Define holes
const holes = [
    { column: 2, row: 4 },
    { column: 4, row: 6 },
].map((hole) => ({
    x: hole.column * (wallW + pathW) + (wallW / 2 + pathW / 2),
    y: hole.row * (wallW + pathW) + (wallW / 2 + pathW / 2)
}));

// Add joystick functionality
joystickHeadElement.addEventListener("mousedown", (event) => {
    if (!gameInProgress) {
        mouseStartX = event.clientX;
        mouseStartY = event.clientY;
        gameInProgress = true;
        window.requestAnimationFrame(main);
        noteElement.style.opacity = 0;
        joystickHeadElement.style.cssText = `
            animation: none;
            cursor: grabbing;
        `;
    }
});

window.addEventListener("mousemove", (event) => {
    if (gameInProgress) {
        const mouseDeltaX = -Math.minmax(mouseStartX - event.clientX, 15);
        const mouseDeltaY = -Math.minmax(mouseStartY - event.clientY, 15);

        joystickHeadElement.style.cssText = `
            left: ${mouseDeltaX}px;
            top: ${mouseDeltaY}px;
            animation: none;
            cursor: grabbing;
        `;

        const rotationY = mouseDeltaX * 0.8; 
        const rotationX = mouseDeltaY * 0.8;

        mazeElement.style.cssText = `
            transform: rotateY(${rotationY}deg) rotateX(${-rotationX}deg)
        `;

        const gravity = 2;
        const friction = 0.01; 

        accelerationX = gravity * Math.sin((rotationY / 180) * Math.PI);
        accelerationY = gravity * Math.sin((rotationX / 180) * Math.PI);
        frictionX = gravity * Math.cos((rotationY / 180) * Math.PI) * friction;
        frictionY = gravity * Math.cos((rotationX / 180) * Math.PI) * friction;
    }
});

function resetGame() {
    // Logic to reset balls, holes, and game state
}

function main(timestamp) {
    // Main game loop logic
}

resetGame();
