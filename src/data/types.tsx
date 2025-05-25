export type TrackType =
  | "straight-horizontal"
  | "straight-vertical"
  | "curve-ne"
  | "curve-nw"
  | "curve-se"
  | "curve-sw"
  | "split"
  | "merge";

export interface Cell {
  type: "empty" | "start" | "end" | "track";
  color?: "blue" | "red" | "green" | "yellow";
  direction?: "up" | "down" | "left" | "right"; // Only for 'start'
  trackType?: TrackType; // Only for 'track'
}
