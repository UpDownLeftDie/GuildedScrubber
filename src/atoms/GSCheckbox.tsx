import { Checkbox, extendVariants } from "@nextui-org/react";

export const GSCheckbox = extendVariants(Checkbox, {
  variants: {
    color: {
      warning: {
        wrapper: [
          "before:border-0",
          "after:rounded-none",

          "border-warning",
          "border-solid",
          "border-2",
          "box-border",
          "border-warning",
        ],
      },
    },
  },
  defaultVariants: {
    color: "warning",
  },
  compoundVariants: [],
});
