import { CANVAS_HEIGHT, CANVAS_WIDTH, MAX_BOX_HEIGHT, MAX_BOX_WIDTH } from "./config.js";
import type { CellInput, Store } from "./store.js";

export interface ValidCell {
  x: number;
  y: number;
  rgb: number;
}

/**
 * In-memory canvas: a single 512*512*3 RGB buffer, latest write wins.
 * Seeded from the store on boot; every accepted draw is persisted with a
 * monotonically increasing seq number before being applied to the buffer.
 */
export class CanvasState {
  readonly width = CANVAS_WIDTH;
  readonly height = CANVAS_HEIGHT;
  readonly buf: Buffer;

  constructor(private readonly store: Store) {
    this.buf = Buffer.alloc(this.width * this.height * 3, 0);
    // Replay history in order so the buffer matches what clients saw.
    for (const row of store.getCellsSince(0)) this.setPixel(row.x, row.y, row.rgb);
  }

  get seq(): number {
    return this.store.maxSeq();
  }

  private getPixel(x: number, y: number): number {
    const i = (y * this.width + x) * 3;
    return (this.buf[i] << 16) | (this.buf[i + 1] << 8) | this.buf[i + 2];
  }

  private setPixel(x: number, y: number, rgb: number): void {
    const i = (y * this.width + x) * 3;
    this.buf[i] = (rgb >> 16) & 0xff;
    this.buf[i + 1] = (rgb >> 8) & 0xff;
    this.buf[i + 2] = rgb & 0xff;
  }

  /** Validate raw cells; returns null (with reason) on any invalid cell. */
  validateCells(raw: unknown): { ok: true; cells: ValidCell[] } | { ok: false; reason: string } {
    if (!Array.isArray(raw) || raw.length === 0) return { ok: false, reason: "cells must be a non-empty array" };
    const cells: ValidCell[] = [];
    for (const c of raw) {
      if (typeof c !== "object" || c === null) return { ok: false, reason: "invalid cell" };
      const { x, y, color } = c as Record<string, unknown>;
      const xi = Number(x);
      const yi = Number(y);
      const rgb = typeof color === "string" ? parseInt(color, 16) : Number(color);
      if (!Number.isInteger(xi) || !Number.isInteger(yi) || !Number.isInteger(rgb))
        return { ok: false, reason: "x, y and color must be integers" };
      if (xi < 0 || xi >= this.width || yi < 0 || yi >= this.height)
        return { ok: false, reason: `cell (${xi},${yi}) out of bounds` };
      if (rgb < 0 || rgb > 0xffffff) return { ok: false, reason: "color must be 24-bit RGB" };
      cells.push({ x: xi, y: yi, rgb });
    }
    // bounding-box limit: keep each graffiti to a reasonable rectangle
    const xs = cells.map((c) => c.x);
    const ys = cells.map((c) => c.y);
    const boxW = Math.max(...xs) - Math.min(...xs) + 1;
    const boxH = Math.max(...ys) - Math.min(...ys) + 1;
    // frames come in landscape (256×128) OR portrait (128×256): allow either
    // orientation, but never both dimensions large.
    const boxMax = Math.max(boxW, boxH);
    const boxMin = Math.min(boxW, boxH);
    if (boxMax > MAX_BOX_WIDTH || boxMin > MAX_BOX_HEIGHT)
      return {
        ok: false,
        reason: `drawing too large: ${boxW}×${boxH} cells (max 256×128 or 128×256)`,
      };
    // no-op writes are free: cells identical to the current wall color don't
    // count toward cost (mirrors the client; hostile clients can't pad cost).
    const changing = cells.filter((c) => this.getPixel(c.x, c.y) !== c.rgb);

    // Dedupe cells covering the same coordinate (cost counts unique cells).
    const seen = new Set<number>();
    const unique = changing.filter((c) => {
      const k = c.y * this.width + c.x;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    return { ok: true, cells: unique };
  }

  /** Persist and apply a validated draw. Returns the new seq. */
  applyDraw(cells: CellInput[]): number {
    const seq = this.store.appendCells(cells);
    for (const c of cells) this.setPixel(c.x, c.y, c.rgb);
    return seq;
  }
}
