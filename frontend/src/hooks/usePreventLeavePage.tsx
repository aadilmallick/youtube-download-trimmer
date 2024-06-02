import { useEffect } from "react";

export const usePreventLeavePage = (message: string, letLeavePage: boolean) => {
  useEffect(() => {
    const listener = (event: BeforeUnloadEvent) => {
      // let user leave page if some condition is true
      if (letLeavePage) {
        return;
      }
      event.preventDefault();
      event.returnValue = message;
    };
    window.addEventListener("beforeunload", listener);
    return () => {
      window.removeEventListener("beforeunload", listener);
    };
  }, [letLeavePage]);
};
