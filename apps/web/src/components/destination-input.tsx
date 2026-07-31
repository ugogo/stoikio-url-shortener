import { InputPrimitive } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const DESTINATION_ERROR_ID = 'destination-error';

const DESTINATION_FIELD_ID = 'destination';

export function DestinationInput({
  disabled = false,
  invalid = false,
  ref,
}: {
  disabled?: boolean;
  invalid?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}) {
  return (
    <>
      <Label className="sr-only" htmlFor={DESTINATION_FIELD_ID}>
        Destination URL
      </Label>

      {/* The primitive, not `Input`: that wrapper's own inset would misalign the typed
          text with the short link that replaces it. */}
      <InputPrimitive
        aria-describedby={invalid ? DESTINATION_ERROR_ID : undefined}
        aria-invalid={invalid || undefined}
        className="placeholder:text-muted-foreground/72 h-full min-w-0 flex-1 bg-transparent px-0 text-base outline-none sm:text-lg"
        disabled={disabled}
        id={DESTINATION_FIELD_ID}
        name="destination"
        placeholder="https://example.com/a/very/long/page"
        ref={ref}
        required
        type="url"
      />
    </>
  );
}
