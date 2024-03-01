"use client";

import { createContext, useContext, useRef } from "react";

const ModalPortalContext = createContext({
    target: null as HTMLElement | null,
});

export { ModalPortalContext };

export function useModalPortalContext() {
    return useContext(ModalPortalContext);
}

export function ModalPortalProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const targetRef = useRef<HTMLDivElement | null>(null);

    return (
        <ModalPortalContext.Provider value={{ target: targetRef.current }}>
            {children}
            <div id="modal-portal" ref={targetRef}></div>
        </ModalPortalContext.Provider>
    );
}
