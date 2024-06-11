import { Button, extendVariants } from "@nextui-org/react";

const GSButton = extendVariants(Button, {
  variants: {
    size: {
      xl: ["h-auto", "p-4", "text-5xl"].join(" "),
    },
    color: {
      gold: ["border-[#f5c400]", "text-[#f5c400]", "text-md"].join(" "),
      goldSolid: [
        "text-[#1d1f24]",
        "bg-[length:200%_100%]",
        "bg-gradient-to-r from-[#ffb400] via-[#e4c519] to-[#edd75c]",
        "border-[#ffd700]",
        "font-bold bg-[#e4c519]",
        "shadow-[0_0_6px_0_rgba(255,234,0,0.5)]",
      ].join(" "),
    },
    isDisabled: {
      true: [
        "bg-[#333333]",
        "bg-none",
        "border-[#efefef]",
        "cursor-not-allowed",
        "shadow-none",
        "text-[#efefef]",
      ].join(" "),
    },
    isLoading: {
      true: ["cursor-progress"].join(" "),
    },
  },
  defaultVariants: {
    color: "gold",
  },
  compoundVariants: [
    {
      class: ["border", "cursor-pointer", "font-bold", "rounded-[--nextui-radius-small]"].join(" "),
    },
  ],
});

export default GSButton;
