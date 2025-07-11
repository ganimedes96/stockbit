"use client";
import { Toaster as Sonner } from "sonner";



type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  

  return (
    <Sonner
      position="top-right"
      
      {...props}
    />
  );
};

export { Toaster };