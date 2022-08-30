import { wrapToWidth } from '../common/game-text';

describe('wrapToWidth', () => {
  it('should wrap a string to a given width', () => {
    const str = `It’s believed Pupaya’s playfulness comes from its budding tail. As they grow, the tail will shed and regrow, draining them.`;
    const width = 224;
    const wrapped = wrapToWidth(str, width);
    expect(wrapped).toBe(
      `It's believed Pupaya's playfulness comes\nfrom its budding tail. As they grow, the\ntail will shed and regrow, draining them.`
    );
  });
});
