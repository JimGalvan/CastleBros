export interface PlayerState {
    id: number;
    x: number;
    y: number;
    direction: 'left' | 'right';
    isJumping: boolean;
    isAttacking: boolean;
}

export interface GameState {
    players: PlayerState[];
    platforms: { x: number; y: number; width: number; height: number; }[];
} 