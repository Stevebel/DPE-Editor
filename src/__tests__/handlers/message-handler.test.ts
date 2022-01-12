import { messageHandler } from '../../common/file-handlers/handlers/message-handler';

describe('MessageHandler', () => {
  it('should parse a message', () => {
    const handler = messageHandler(12);
    const result = handler.parse(
      `{_H, _e, _l, _l, _o, _EXCLAMATION, _END, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE}`
    );
    expect(result.value).toBe('Hello!');
  });
  it('should replace unknown characters with question mark', () => {
    const handler = messageHandler(12);
    const result = handler.parse(
      `{_H, _e, _l, _l, _o, _FAKE, _END, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE}`
    );
    expect(result.value).toBe('Hello?');
  });
  it('should throw error if message cannot be parsed', () => {
    const handler = messageHandler(12);
    expect(() => handler.parse(`not a message`)).toThrow();
  });
  it('should format a message', () => {
    const handler = messageHandler(12);
    expect(handler.format('Hello!')).toBe(
      `{_H, _e, _l, _l, _o, _EXCLAMATION, _END, _SPACE, _SPACE, _SPACE, _SPACE, _SPACE}`
    );
  });

  it('should cut off if the message is too long', () => {
    const handler = messageHandler(5);
    const result = handler.format('Hello!');
    expect(result).toBe(`{_H, _e, _l, _l, _o}`);
  });
});
