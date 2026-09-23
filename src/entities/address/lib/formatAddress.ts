import type {AddressSuggestion} from "../model/types";

export function formatAddress({title, subtitle}: AddressSuggestion): string {
  return [title, subtitle].filter(Boolean).join(", ");
}
