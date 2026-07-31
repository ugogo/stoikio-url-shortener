export function ShortLinkReveal({ shortLinkUrl }: { shortLinkUrl: string }) {
  return (
    <>
      <span className="sr-only">{shortLinkUrl}</span>
      <span
        aria-hidden
        className="min-w-0 flex-1 truncate font-mono text-base font-medium sm:text-lg"
      >
        {[...shortLinkUrl].map((character, index) => (
          <span
            className="animate-short-link-char inline-block [animation-delay:calc(var(--i)*6ms)] motion-reduce:animate-none"
            key={`${character}-${String(index)}`}
            style={{ '--i': index } as React.CSSProperties}
          >
            {character}
          </span>
        ))}
      </span>
    </>
  );
}
