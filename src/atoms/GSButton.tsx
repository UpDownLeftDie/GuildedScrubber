import { Button, extendVariants } from "@nextui-org/react";

const GSButton = extendVariants(Button, {
  variants: {
    size: {
      xl: "text-5xl p-4 h-auto",
    },
    color: {
      gold: "text-md text-[#f5c400] border-[#f5c400]",
      goldSolid:
        "text-[#1d1f24] font-bold bg-[#e4c519] bg-[length:200%_100%] bg-gradient-to-r from-[#ffb400] via-[#e4c519] to-[#edd75c] border-[#ffd700] shadow-[0_0_6px_0_rgba(255,234,0,0.5)]",
    },
    isDisabled: {
      true: "bg-none shadow-none text-[#efefef] border-[#efefef] bg-[#333333] ",
    },
  },
  defaultVariants: {
    color: "gold",
  },
  compoundVariants: [{ class: "border font-bold rounded-[--nextui-radius-small]" }],
});

export default GSButton;
