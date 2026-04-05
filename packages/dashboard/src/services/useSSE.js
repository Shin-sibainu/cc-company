import { useEffect, useRef } from "react";

export function useSSE(onUpdate) {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    const es = new EventSource("/api/events");

    es.addEventListener("update", (e) => {
      callbackRef.current(JSON.parse(e.data));
    });

    return () => es.close();
  }, []);
}
