import Matter from 'matter-js';

export class Game {
    private engine: Matter.Engine;
    private render: Matter.Render;
    private players: Matter.Body[];
    private platforms: Matter.Body[];
    private world: Matter.World;
    private keysPressed: Set<string> = new Set();
    private jumpCounts: Map<Matter.Body, number> = new Map();

    constructor() {
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        
        // Create renderer
        this.render = Matter.Render.create({
            element: document.body,
            engine: this.engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: '#2c2c2c'
            }
        });

        this.players = this.createPlayers();
        this.platforms = this.createPlatforms();
        this.setupCollisions();
        this.setupControls();
        
        Matter.Render.run(this.render);
        Matter.Runner.run(Matter.Runner.create(), this.engine);
    }

    private createPlayers(): Matter.Body[] {
        const player1 = Matter.Bodies.rectangle(100, 200, 30, 60, {
            render: {
                fillStyle: '#ff0000'
            },
            friction: 0.05,
            frictionAir: 0.01,
            density: 0.002,
            restitution: 0,
            label: 'player1',
            inertia: Infinity,
            slop: 0
        });

        const player2 = Matter.Bodies.rectangle(700, 200, 30, 60, {
            render: {
                fillStyle: '#0000ff'
            },
            friction: 0.05,
            frictionAir: 0.01,
            density: 0.002,
            restitution: 0,
            label: 'player2',
            inertia: Infinity,
            slop: 0
        });

        // Initialize jump counts
        this.jumpCounts.set(player1, 0);
        this.jumpCounts.set(player2, 0);

        Matter.World.add(this.world, [player1, player2]);
        return [player1, player2];
    }

    private createPlatforms(): Matter.Body[] {
        const ground = Matter.Bodies.rectangle(
            window.innerWidth / 2,
            window.innerHeight - 30,
            window.innerWidth,
            60,
            { isStatic: true }
        );

        const platform1 = Matter.Bodies.rectangle(300, 400, 200, 20, {
            isStatic: true
        });

        const platform2 = Matter.Bodies.rectangle(600, 300, 200, 20, {
            isStatic: true
        });

        Matter.World.add(this.world, [ground, platform1, platform2]);
        return [ground, platform1, platform2];
    }

    private setupControls() {
        const moveSpeed = 3;
        const jumpForce = -8;

        document.addEventListener('keydown', (e) => {
            this.keysPressed.add(e.key);
            this.handleMovement(moveSpeed, jumpForce);
        });

        document.addEventListener('keyup', (e) => {
            this.keysPressed.delete(e.key);
            // Immediately stop horizontal movement when movement keys are released
            if (['a', 'd'].includes(e.key)) {
                Matter.Body.setVelocity(this.players[0], { x: 0, y: this.players[0].velocity.y });
            }
            if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
                Matter.Body.setVelocity(this.players[1], { x: 0, y: this.players[1].velocity.y });
            }
        });

        Matter.Events.on(this.engine, 'beforeUpdate', () => {
            this.handleMovement(moveSpeed, jumpForce);
        });
    }

    private handleMovement(moveSpeed: number, jumpForce: number) {
        const player1 = this.players[0];
        const player2 = this.players[1];

        // Player 1 movement
        if (this.keysPressed.has('a')) {
            Matter.Body.setVelocity(player1, { x: -moveSpeed, y: player1.velocity.y });
        } else if (this.keysPressed.has('d')) {
            Matter.Body.setVelocity(player1, { x: moveSpeed, y: player1.velocity.y });
        }
        if (this.keysPressed.has('w') && this.canJump(player1)) {
            Matter.Body.setVelocity(player1, { x: player1.velocity.x, y: jumpForce });
            this.jumpCounts.set(player1, (this.jumpCounts.get(player1) || 0) + 1);
        }

        // Player 2 movement
        if (this.keysPressed.has('ArrowLeft')) {
            Matter.Body.setVelocity(player2, { x: -moveSpeed, y: player2.velocity.y });
        } else if (this.keysPressed.has('ArrowRight')) {
            Matter.Body.setVelocity(player2, { x: moveSpeed, y: player2.velocity.y });
        }
        if (this.keysPressed.has('ArrowUp') && this.canJump(player2)) {
            Matter.Body.setVelocity(player2, { x: player2.velocity.x, y: jumpForce });
            this.jumpCounts.set(player2, (this.jumpCounts.get(player2) || 0) + 1);
        }
    }

    private canJump(player: Matter.Body): boolean {
        const jumpCount = this.jumpCounts.get(player) || 0;
        return jumpCount < 2 && Math.abs(player.velocity.y) < 0.5;
    }

    private setupCollisions() {
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                // Reset jump count when player touches a platform or ground
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
                
                if (this.players.includes(bodyA)) {
                    this.jumpCounts.set(bodyA, 0);
                }
                if (this.players.includes(bodyB)) {
                    this.jumpCounts.set(bodyB, 0);
                }
            });
        });
    }
} 