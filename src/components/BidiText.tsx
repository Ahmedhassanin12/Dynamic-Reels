import type { CSSProperties, ReactNode } from 'react';

type Props = {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
};

/**
 * Renders bidirectional text with explicit isolation.
 * Automatically wraps embedded Latin/alphanumeric runs in <bdi dir="ltr">
 * so that numbers, English terms, and phrases (e.g. "100K user", "Hash Map", "O(1)")
 * flow seamlessly within RTL Arabic sentences without punctuation or word flipping.
 */
export const BidiText = ({ children, style, as: Tag = 'bdi' }: Props) => {
  if (typeof children !== 'string') {
    return (
      <Tag dir="rtl" style={{ unicodeBidi: 'isolate', ...style }}>
        {children}
      </Tag>
    );
  }

  // Match full Latin/alphanumeric runs starting with an alphanumeric character (e.g. "100K user", "Hash Map", "array.filter(x => x.id)", "Map<string, User>")
  // Preceding punctuation (like ":" in "الحلقة الجاية: Stack") and trailing punctuation stay in the RTL stream with the Arabic text.
  const parts = children.split(
    /([a-zA-Z0-9][a-zA-Z0-9_#$@%<>()\[\]{}:.\/=+*^'"]*(?:(?:\s+[=+*\/<>&|!\u2192-]+\s+|\s+|,\s*)[a-zA-Z0-9][a-zA-Z0-9_#$@%<>()\[\]{}:.\/=+*^'"]*)*)/g,
  );

  return (
    <Tag dir="rtl" style={{ unicodeBidi: 'isolate', ...style }}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (/[a-zA-Z0-9]/.test(part)) {
          return (
            <bdi key={i} dir="ltr">
              {part}
            </bdi>
          );
        }
        return part;
      })}
    </Tag>
  );
};
