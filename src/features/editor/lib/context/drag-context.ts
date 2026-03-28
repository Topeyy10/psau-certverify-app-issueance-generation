import { createContext, type RefObject, useContext } from "react";

type DragConstraintsRef = RefObject<HTMLDivElement | null>;

const DragConstraintsContext = createContext<DragConstraintsRef | null>(null);

export const useDragConstraints = (): DragConstraintsRef => {
  const ctx = useContext(DragConstraintsContext);
  if (!ctx) {
    throw new Error(
      "useDragConstraints must be used inside DragConstraintsProvider",
    );
  }
  return ctx;
};

export const DragConstraintsProvider = DragConstraintsContext.Provider;
