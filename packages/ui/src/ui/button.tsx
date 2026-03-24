"use client";

import { cn } from "@atl/ui/lib/utils";
import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { buttonVariants } from "./button-variants";
import type { ButtonVariants } from "./button-variants";

function Button({
  className,
  variant = "default",
  size = "default",
  render,
  nativeButton,
  ...props
}: ButtonPrimitive.Props & ButtonVariants) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      render={render}
      nativeButton={nativeButton ?? render === undefined}
      {...props}
    />
  );
}

export { Button };
export { buttonVariants } from "./button-variants";