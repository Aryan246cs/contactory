import { guideCropPixels } from './cropToGuide';

describe('guideCropPixels', () => {
  it('maps a centered guide into pixels from a center-cropped camera preview', () => {
    const crop = guideCropPixels(600, 800, { x: 0, y: 0, width: 400, height: 800 }, { x: 100, y: 300, width: 200, height: 200 });
    expect(crop).toEqual({ originX: 200, originY: 300, width: 200, height: 200 });
  });

  it('keeps guide coordinates inside the source photo', () => {
    const crop = guideCropPixels(400, 800, { x: 0, y: 0, width: 400, height: 800 }, { x: -20, y: 700, width: 100, height: 200 });
    expect(crop.originX).toBe(0);
    expect(crop.originY).toBe(700);
    expect(crop.width).toBe(80);
    expect(crop.height).toBe(100);
  });
});
