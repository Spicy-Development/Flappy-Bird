(() => {
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const groundHeight = 58;
    const bird = { x: 105, y: 270, velocity: 0, radius: 14 };
    const pipes = [];
    const pipeWidth = 62;
    const gapRandom = 158; // 158, 198
    let score = 0;
    let best = Number(localStorage.getItem("flappy-best") || 0);
    let state = "ready";
    let lastTime = 0;
    let pipeTimer = 0;

    function gapRandom() {
        return rand(148, 248);
    }

    function reset() {
        bird.y = 270;
        bird.velocity = 0;
        pipes.length = 0;
        score = 0;
        pipeTimer = 0;
        state = "playing";
        flap();
    }

    function flap() {
        bird.velocity = -300; //-280
    }

    function handleAction(event) {
        if (event.type === "keydown" && (event.code !== "Space" || event.repeat)) return;
        if (event.type === "keydown") event.preventDefault();
        if (state === "ready" || state === "over") reset();
        else flap();
    }

    function addPipe() {
        const margin = 78;
        const topHeight = margin + Math.random() * (height - groundHeight - gapRandom() - margin * 2);
        pipes.push({ x: width + 10, top: topHeight, scored: false });
    }

    function endGame() {
        state = "over";
        best = Math.max(best, score);
        localStorage.setItem("flappy-best", best);
    }

    function update(delta) {
        if (state !== "playing") return;
        bird.velocity += 1150 * delta;
        bird.y += bird.velocity * delta;
        pipeTimer += delta;
        if (pipeTimer > 3) { //1.45
            addPipe();
            pipeTimer = 0;
        }

        for (const pipe of pipes) {
            pipe.x -= 155 * delta;
            const inPipeX = bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipeWidth;
            if (inPipeX && (bird.y - bird.radius < pipe.top || bird.y + bird.radius > pipe.top + gapRandom())) endGame();
            if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
                pipe.scored = true;
                score += 1;
            }
        }

        while (pipes.length && pipes[0].x + pipeWidth < 0) pipes.shift();
        if (bird.y - bird.radius < 0 || bird.y + bird.radius > height - groundHeight) endGame();
    }

    function drawBackground() {
        const sky = ctx.createLinearGradient(0, 0, 0, height);
        sky.addColorStop(0, "#82d9d4");
        sky.addColorStop(1, "#d8f2bf");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#ffffff80";
        for (const cloud of [{ x: 70, y: 112 }, { x: 300, y: 185 }, { x: 215, y: 65 }]) {
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, 31, 10, 0, 0, Math.PI * 2);
            ctx.ellipse(cloud.x - 12, cloud.y - 7, 13, 12, 0, 0, Math.PI * 2);
            ctx.ellipse(cloud.x + 5, cloud.y - 10, 17, 15, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawPipes() {
        for (const pipe of pipes) {
            const bottomY = pipe.top + gapRandom();
            ctx.fillStyle = "#318a59";
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
            ctx.fillRect(pipe.x, bottomY, pipeWidth, height - groundHeight - bottomY);
            ctx.fillStyle = "#55b96b";
            ctx.fillRect(pipe.x + 8, 0, 12, pipe.top);
            ctx.fillRect(pipe.x + 8, bottomY, 12, height - groundHeight - bottomY);
            ctx.fillStyle = "#226b4b";
            ctx.fillRect(pipe.x - 5, pipe.top - 19, pipeWidth + 10, 19);
            ctx.fillRect(pipe.x - 5, bottomY, pipeWidth + 10, 19);
        }
    }

    function drawBird() {
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 5, bird.velocity / 700)));
        ctx.fillStyle = "#f6c84a";
        ctx.beginPath();
        ctx.ellipse(0, 0, 17, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e99c35";
        ctx.beginPath();
        ctx.ellipse(-5, 5, 8, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(8, -5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#173c45";
        ctx.beginPath();
        ctx.arc(10, -5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e87445";
        ctx.beginPath();
        ctx.moveTo(13, 1);
        ctx.lineTo(26, 5);
        ctx.lineTo(13, 9);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawGround() {
        ctx.fillStyle = "#e8c66c";
        ctx.fillRect(0, height - groundHeight, width, groundHeight);
        ctx.fillStyle = "#6aa85b";
        ctx.fillRect(0, height - groundHeight, width, 9);
        ctx.fillStyle = "#d3a94f";
        for (let x = -20; x < width; x += 38) {
            ctx.fillRect(x, height - 31, 20, 5);
            ctx.fillRect(x + 16, height - 15, 18, 5);
        }
    }

    function drawMessage(title, subtitle) {
        ctx.fillStyle = "#173c45";
        ctx.textAlign = "center";
        ctx.font = "bold 31px Trebuchet MS, sans-serif";
        ctx.fillText(title, width / 2, 230);
        ctx.font = "bold 16px Trebuchet MS, sans-serif";
        ctx.fillText(subtitle, width / 2, 260);
    }

    function draw() {
        drawBackground();
        drawPipes();
        drawGround();
        drawBird();
        ctx.textAlign = "center";
        ctx.fillStyle = "#173c45";
        ctx.font = "bold 38px Trebuchet MS, sans-serif";
        ctx.fillText(score, width / 2, 58);
        ctx.font = "bold 13px Trebuchet MS, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`BEST ${best}`, 14, 25);

        if (state === "ready") drawMessage("Ready?", "Tap or press Space to start");
        if (state === "over") drawMessage("Game over", "Tap or press Space to try again");
    }

    function frame(time) {
        const delta = Math.min((time - lastTime) / 1000, 0.04);
        lastTime = time;
        update(delta);
        draw();
        requestAnimationFrame(frame);
    }

    canvas.addEventListener("pointerdown", handleAction);
    window.addEventListener("keydown", handleAction);
    requestAnimationFrame(frame);
})();