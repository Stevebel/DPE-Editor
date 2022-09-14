import { messageHandler } from '../../common/file-handlers/handlers/message-handler';
import { trimMultiline } from '../../common/test-utils';

describe('MessageHandler', () => {
  const MULTILINE_INPUT = `_(
    "Bulbasaur can be seen napping in bright\\n"
    "sunlight. There is a seed on its back.\\n"
    "By soaking up the sun's rays, the seed\\n"
    "grows progressively larger.")`;

  const MULTILINE_OUTPUT = `Bulbasaur can be seen napping in bright
    sunlight. There is a seed on its back.
    By soaking up the sun's rays, the seed
    grows progressively larger.`;

  it('should parse a message', () => {
    const handler = messageHandler(12);
    const result = handler.parse(`_("Hello!")`);
    expect(result.value).toBe('Hello!');
  });
  it('should throw error if message cannot be parsed', () => {
    const handler = messageHandler(12);
    expect(() => handler.parse(`not a message`)).toThrow();
  });
  it('should format a message', () => {
    const handler = messageHandler(12);
    expect(handler.format('Hello!')).toBe(`_("Hello!")`);
  });

  it('should cut off if the message is too long', () => {
    const handler = messageHandler(5);
    const result = handler.format('Hello!');
    expect(result).toBe(`_("Hello")`);
  });

  it('should format a multiline message', () => {
    const handler = messageHandler();
    const result = handler.format(MULTILINE_OUTPUT);
    expect(trimMultiline(result)).toBe(trimMultiline(MULTILINE_INPUT));
  });
});
