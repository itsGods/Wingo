export type GameInterval = 1 | 3 | 5 | 10;
export type GameColor = 'red' | 'green' | 'violet';
export type GameSize = 'big' | 'small';
export type BetOption = GameColor | GameSize | number;

export interface GameRecord {
  period: string;
  number: number;
  size: GameSize;
  color: GameColor[];
}
