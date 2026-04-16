import { useEffect, useRef, useState } from "react";

export function useSSE(onUpdate) {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource("/api/events");

    es.addEventListener("connected", () => setConnected(true));
    es.addEventListener("update", (e) => {
      callbackRef.current(JSON.parse(e.data));
    });
    es.onerror = () => setConnected(false);
    es.onopen = () => setConnected(true);

    return () => es.close();
  }, []);

  return connected;
}
