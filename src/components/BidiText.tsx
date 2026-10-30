import type { CSSProperties, ReactNode } from 'react';

type Props = {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
};

const ARABIC_CHAR_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

// Match full Latin/alphanumeric runs (including parenthesized suffixes like "Primary Key (PK)", "users(id)", "O(log n)")
const LATIN_RUN_RE =
  /([a-zA-Z0-9][a-zA-Z0-9_#$@%<>()\[\]{}:.\/=+*^'"]*(?:(?:\s+[=+*\/<>&|!\u2192-]+\s+|\s+|,\s*)[(\['"]*[a-zA-Z0-9][a-zA-Z0-9_#$@%<>()\[\]{}:.\/=+*^'"]*)*)/g;

/**
 * Renders bidirectional text with explicit isolation.
 * - Pure Latin/ASCII strings render in an isolated LTR container so parentheses like "Primary Key (PK)" never mirror.
 * - Mixed Arabic + Latin strings isolate each Latin run in <bdi dir="ltr"> with explicit CSS direction and slight inline breathing room.
 */
export const BidiText = ({ children, style, as: Tag = 'bdi' }: Props) => {
  if (typeof children !== 'string') {
    return (
      <Tag dir="rtl" style={{ unicodeBidi: 'isolate', ...style }}>
        {children}
      </Tag>
    );
  }

  // If the string contains no Arabic script characters at all, render it as a single LTR run
  if (!ARABIC_CHAR_RE.test(children)) {
    return (
      <Tag dir="ltr" style={{ direction: 'ltr', unicodeBidi: 'isolate', ...style }}>
        {children}
      </Tag>
    );
  }

  const parts = children.split(LATIN_RUN_RE);

  return (
    <Tag dir="rtl" style={{ direction: 'rtl', unicodeBidi: 'isolate', ...style }}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (/[a-zA-Z0-9]/.test(part)) {
          return (
            <bdi
              key={i}
              dir="ltr"
              style={{
                direction: 'ltr',
                unicodeBidi: 'isolate',
                display: 'inline-block',
                marginInline: '0.08em',
              }}
            >
              {part}
            </bdi>
          );
        }
        return part;
      })}
    </Tag>
  );
};
