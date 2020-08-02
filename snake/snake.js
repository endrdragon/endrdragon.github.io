let canvas = document.querySelector('#canvas');
let ctx = canvas.getContext('2d');

let s = 25; // 1 game pixel = s canvas pixels
let toC = g => (g || [0,0]).map(x => x * s);             // converts a game value to canvas value
let toG = c => (c || [0,0]).map(x => Math.floor(x / s)); // converts a canvas value to game value
let arrEq = (a1, a2) => a1.every((x, i) => x == a2[i]);
let includes = (metarr, arr) => metarr.some(x => arrEq(x, arr));
let isOutBound = g => g[0] < 0 || g[0] >= gMaxWidth || g[1] < 0 || g[1] >= gMaxHeight; // game bounds [0, gMaxWidth), [0, gMaxHeight)
let [gMaxWidth, gMaxHeight] = toG([canvas.width, canvas.height]);
let snake = [[Math.floor(gMaxWidth / 4), Math.floor(gMaxHeight / 2)]]; // [head, ..., tail]
let facing = 'e'; //n, e, s, w

let apple;

// CONFIG //
const pal = { // color palette
    bg: '#222',
    snake: '#0b0',
    apple: '#d00',
    death: '#fff',
}
snake.length = 5; // initial snake length
const tpu = 75; // ticks per update


drawGRect([0,0], canvas.width, canvas.height, pal.bg, [0, 0]); // draw bg
drawGRect(snake[0], s - 2, s - 2, pal.snake); // draw snake
drawApple();
let int = setInterval(update, tpu);

document.onkeydown = e => {
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            if (facing != 's' && facing != 'n') {
                facing = 'n';
                update();
            }
            break;
        case 'a':
        case 'ArrowLeft':
            if (facing != 'e' && facing != 'w') {
                facing = 'w';
                update();
            }
            break;
        case 's':
        case 'ArrowDown':
            if (facing != 's' && facing != 'n') {
                facing = 's';
                update();
            }
            break;
        case 'd':
        case 'ArrowRight':
            if (facing != 'e' && facing != 'w') {
                facing = 'e';
                update();
            }
            break;
        case 'r':
            die()
            break;
    }
};

document.onblur = () => {
    clearInterval(int);
    int = undefined;
}

document.onfocus = () => {
    int = int || setInterval(update, tpu);
}
function drawGRect(g, cw, ch, color, cshift = [1,1]) {
    let c = toC(g).map((x, i) => x + cshift[i]); // conv g coord and then shift point in c space
    ctx.fillStyle = color;
    ctx.fillRect(...c, cw, ch);
}

function drawSnakeSeg(g) {
    /*
     * if s = 4,
     * ........
     * .xx..xx.
     * .xx..xx.
     * ........
     * o.......
     * .xx..xx.
     * .xx..xx.
     * ........
     *
     *
     *
     */
    switch (facing) {
        case 'n':
            drawGRect(g, s-2, s, pal.snake)//, [1, 1]);
            break;    
        case 'e':
            drawGRect(g, s, s-2, pal.snake, [-1, 1])//, [-1, 1]);
            break;
        case 's':
            drawGRect(g, s-2, s, pal.snake, [1, -1])//, [1, -1]);
            break;
        case 'w':
            drawGRect(g, s, s-2, pal.snake)//, [1, 1]);
            break;
    }
}

function drawApple() {
    do {
        apple = [Math.floor(Math.random() * gMaxWidth), Math.floor(Math.random() * gMaxHeight)];
    } while (snake.some(x => arrEq(x, apple)))
    drawGRect(apple, s - 2, s - 2, pal.apple); // spawn apple
}

function update() {
    let nextPos = [...snake[0]]; //clone head
    switch (facing) {
        case 'n':
            nextPos[1]--;
            break;
        case 'e':
            nextPos[0]++;
            break;
        case 's':
            nextPos[1]++;
            break;
        case 'w':
            nextPos[0]--;
            break;
    }
    if(!arrEq(apple, nextPos)) drawGRect(snake.pop(), s + 2, s + 2, pal.bg, [-1, -1]); // if next pos is not apple, delete tail
    if(arrEq(apple, nextPos)) drawApple(); // if next pos is apple, spawn a new apple
    if(includes(snake, nextPos)) die(); // if next pos is snake, die
    if (isOutBound(nextPos)) die(); // if next pos is void, die
    //console.log(nextColor, appleData);
    snake.unshift(nextPos);
    drawSnakeSeg(nextPos);
    document.querySelector('#score').textContent = `Score: ${snake.length}`;
}

function die() {
    clearInterval(int);
    ctx.fillStyle = pal.death;
    ctx.font = `${canvas.width * 250 / 700}px 'Comic Sans MS', 'Papyrus', 'Impact', fantasy, cursive, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('F', canvas.width / 2, canvas.height / 2);

    document.onkeydown = e => e.key == 'r' ? location.reload() : void 0;
    document.onfocus = null;

    let button = document.createElement('button');
    button.textContent = 'Restart';
    button.onclick = () => location.reload();
    document.body.appendChild(button);
}