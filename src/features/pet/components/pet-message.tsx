interface PetMessageProps {
  message?: string;
  visible: boolean;
}

export function PetMessage({ message, visible }: PetMessageProps) {
  return (
    <aside className={`pet-note${visible && message ? " is-visible" : ""}`} aria-live="polite">
      {message}
    </aside>
  );
}
