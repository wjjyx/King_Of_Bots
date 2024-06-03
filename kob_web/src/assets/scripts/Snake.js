import { AcGameObject } from "./AcGameObject";
import { Cell } from "./Cell";

export class Snake extends AcGameObject {
    constructor(info, gamemap) {
        super();

        this.id = info.id;
        this.color = info.color;
        this.gamemap = gamemap;

        this.cells = [new Cell(info.r, info.c)];//store body of snake,cells[0]store snake head
        this.next_cell = null; // the destination of next step

        this.speed = 5; //snake walks 5 cells every second
        this.direction = -1; //-1 indicates no command, 0123 indicateds up right down left
        this.status = "idle"; // 3 status: idle-stable, move, die

        this.dr = [-1, 0, 1, 0]; // offset of rows in four directions
        this.dc = [0, 1, 0, -1]; // offset of columns in four directions

        this.step = 0; // indicates count of rounds
        this.eps = 1e-2; // allowable error 0.01

        // the snake's eyes in the lower left corner initially point upwards
        // the snake's eyes in the upper right corner initially point downwards
        this.eye_direction = 0;
        if (this.id === 1) this.eye_direction = 2;

        this.eye_dx = [ // offsets of snake eyes on x in four directions
            [-1, 1],
            [1, 1],
            [1, -1],
            [-1, -1],
        ];
        this.eye_dy = [ // offsets of snake eyes on y in four directions
            [-1, -1],
            [-1, 1],
            [1, 1],
            [-1, 1],
        ];

    }

    start() {

    }

    set_direction(d) {
        this.direction = d;
    }

    check_tail_increasing() { // check whether the snake increase at current round
        if (this.step <= 10) return true; // first ten steps, move one cell each step
        if (this.step % 3 === 1) return true;// after 10 steps, move one cell every 3 steps
        return false;

    }

    next_step() { // update the status of snakes to next step
        const d = this.direction; //take out current direction
        this.next_cell = new Cell(this.cells[0].r + this.dr[d], this.cells[0].c + this.dc[d]);
        this.eye_direction = d;
        this.direction = -1; // clear 
        this.status = "move";
        this.step++;

        const k = this.cells.length;
        for (let i = k; i > 0; i--) {
            this.cells[i] = JSON.parse(JSON.stringify(this.cells[i - 1]));

        }

        if (!this.gamemap.check_valid(this.next_cell)) { // if not legal, snake die
            this.status = "die";
        }


    }


    update_move() {

        const dx = this.next_cell.x - this.cells[0].x;
        const dy = this.next_cell.y - this.cells[0].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.eps) { // reach the destination
            this.cells[0] = this.next_cell; // update new snake head
            this.next_cell = null;
            this.status = "idle"; //finish walking, stop

            if (!this.check_tail_increasing()) {
                this.cells.pop(); // if the length of snake doesn't change, clear the tail 
            }
        } else {
            const move_distance = this.speed * this.timedelta / 1000; //move distance between every two frame
            this.cells[0].x += move_distance * dx / distance;
            this.cells[0].y += move_distance * dy / distance;

            if (!this.check_tail_increasing()) {
                const k = this.cells.length;
                const tail = this.cells[k - 1], tail_target = this.cells[k - 2];
                const tail_dx = tail_target.x - tail.x;
                const tail_dy = tail_target.y - tail.y;
                tail.x += move_distance * tail_dx / distance;
                tail.y += move_distance * tail_dy / distance;

            }
        }

    }

    update() {  //excute once per frame
        if (this.status === 'move') {
            this.update_move();
        }

        this.render();
    }

    render() {
        const L = this.gamemap.L;
        const ctx = this.gamemap.ctx;

        //draw the snake
        ctx.fillStyle = this.color;
        if (this.status === "die") {
            ctx.fillStyle = "white";
        }

        for (const cell of this.cells) {
            ctx.beginPath();
            ctx.arc(cell.x * L, cell.y * L, L / 2 * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 1; i < this.cells.length; i++) {
            const a = this.cells[i - 1], b = this.cells[i];
            if (Math.abs(a.x - b.x) < this.eps && Math.abs(a.y - b.y) < this.eps)
                continue;
            if (Math.abs(a.x - b.x) < this.eps) {
                ctx.fillRect((a.x - 0.5 + 0.1) * L, Math.min(a.y, b.y) * L, L * 0.8, Math.abs(a.y - b.y) * L);
            } else {
                ctx.fillRect(Math.min(a.x, b.x) * L, (a.y - 0.5 + 0.1) * L, Math.abs(a.x - b.x) * L, L * 0.8);
            }
        }

        ctx.fillStyle = "black";
        for (let i = 0; i < 2; i++) {
            const eye_x = (this.cells[0].x + this.eye_dx[this.eye_direction][i] * 0.15) * L;
            const eye_y = (this.cells[0].y + this.eye_dy[this.eye_direction][i] * 0.15) * L;
            ctx.beginPath();
            ctx.arc(eye_x, eye_y, L * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}