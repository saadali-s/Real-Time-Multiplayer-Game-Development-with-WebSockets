const mazeElement = document.getElementById("maze");
const joystickHeadElement = document.getElementById("joystick-head");
const btnCreate = document.getElementById("btnCreate");

let clientId = null;
let ws = new WebSocket("ws://localhost:9090");

// Ball properties
const ball = {
    x: 50,
    y: 50,
    velocityX: 0,
    velocityY: 0,
    element: null,
};

// Maze and joystick settings
const gravity = 2;
const friction = 0.01;

// Create and add the ball to the maze
function initializeBall() {
    ball.element = document.createElement("div");
    ball.element.classList.add("ball");
    ball.element.style.cssText = `left: ${ball.x}px; top: ${ball.y}px;`;
    mazeElement.appendChild(ball.element);
}

// Joystick controls
joystickHeadElement.addEventListener("mousedown", (event) => {
    const startX = event.clientX;
    const startY = event.clientY;

    const onMouseMove = (e) => {
        const deltaX = Math.min(Math.max(startX - e.clientX, -15), 15);
        const deltaY = Math.min(Math.max(startY - e.clientY, -15), 15);

        joystickHeadElement.style.cssText = `
            left: ${-deltaX}px;
            top: ${-deltaY}px;
        `;

        const rotationY = deltaX * 0.8;
        const rotationX = deltaY * 0.8;

        mazeElement.style.cssText = `
            transform: rotateY(${rotationY}deg) rotateX(${rotationX}deg);
        `;

        ball.velocityX = gravity * Math.sin((rotationY / 180) * Math.PI);
        ball.velocityY = gravity * Math.sin((rotationX / 180) * Math.PI);
    };

    const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        joystickHeadElement.style.cssText = `left: 0; top: 0;`;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
});

// Ball movement and friction
function updateBallPosition() {
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Apply friction
    ball.velocityX *= 1 - friction;
    ball.velocityY *= 1 - friction;

    // Constrain the ball within the maze
    ball.x = Math.max(0, Math.min(mazeElement.offsetWidth - 10, ball.x));
    ball.y = Math.max(0, Math.min(mazeElement.offsetHeight - 10, ball.y));

    // Update ball position
    ball.element.style.cssText = `left: ${ball.x}px; top: ${ball.y}px;`;

    requestAnimationFrame(updateBallPosition);
}

// WebSocket communication
ws.onmessage = (message) => {
    const response = JSON.parse(message.data);

    if (response.method === "connect") {
        clientId = response.clientId;
        console.log("Client ID set successfully: " + clientId);
    }

    if (response.method === "create") {
        console.log(
            `Game created with ID: ${response.game.id} and ${response.game.balls} balls`
        );
    }
};

btnCreate.addEventListener("click", () => {
    const payload = {
        method: "create",
        clientId: clientId,
    };
    ws.send(JSON.stringify(payload));
});

initializeBall();
updateBallPosition();
