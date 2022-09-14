import { SourceValueHandler } from '../file-handler.interface';

/* Handle messages in format _("Flabébé"), with input/output of 'Flabébé'
 * and multi-line messages in format:
 * _(
 *  "Test message\n"
 *  "Showing off multi-line messages")
 * with input/output of:
 * "Test message\nShowing off multi-line messages"
 */
const WHOLE_MSG_RE = /_\(\s*(".*?")+\s*\)/gs;
const MSG_LINE_RE = /\s*"(.*)"\s*/g;

export function messageHandler(
  fixedLength?: number
): SourceValueHandler<string> {
  return {
    parse: (raw) => {
      // Clear WHOLE_MSG_RE
      WHOLE_MSG_RE.lastIndex = 0;
      const match = WHOLE_MSG_RE.exec(raw.trim());
      if (!match) {
        throw new Error(`Could not find messages in ${raw}`);
      }
      const msgLines = match[1];
      let msg = msgLines.replace(MSG_LINE_RE, '$1\n');
      // Remove last newline
      msg = msg.slice(0, -1);

      return {
        start: match.index,
        end: match.index + match[0].length,
        value: msg,
      };
    },
    format: (value) => {
      let val = value;
      if (fixedLength && val.length > fixedLength) {
        val = val.substring(0, fixedLength);
      }
      if (val.includes('\n')) {
        // Multi-line message
        const lines = val.split('\n');
        const formattedLines = lines.map((line, i) =>
          i < lines.length - 1 ? `\t"${line.trim()}\\n"` : `\t"${line.trim()}"`
        );
        return `_(\n${formattedLines.join('\n')})`;
      }
      return `_("${val}")`;
    },
  };
}
