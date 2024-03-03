"use client";

import {
    MutableRefObject,
    createContext,
    useContext,
    useRef,
    useState,
} from "react";

type ModalPayload = {
    index: number;
    id: string;
    stackable: boolean;
    close: () => void;
};
type ModalPortalProps = {
    target: MutableRefObject<HTMLElement | null>;
    openModals: ModalPayload[];
    registerModal: (data: Omit<ModalPayload, "index">) => number;
    unregisterModal: (id: string) => void;
};

const ModalPortalContext = createContext<ModalPortalProps>({
    target: null as any,
    openModals: [],
    registerModal: (data: Omit<ModalPayload, "index">) => -1,
    unregisterModal: (id: string) => {},
});

export function useModalPortalContext() {
    return useContext(ModalPortalContext);
}

export function ModalPortalProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const targetRef = useRef<HTMLDivElement | null>(null);
    const [openModals, setOpenModals] = useState<ModalPayload[]>([]);

    const registerModal = (data: Omit<ModalPayload, "index">) => {
        if (!data.stackable) {
            openModals.forEach((m) => m.close());
            setOpenModals([{ ...data, index: 0 }]);

            return 0;
        }

        let foundIndex = openModals.findIndex((m) => m.id === data.id);
        if (foundIndex < 0) {
            foundIndex = openModals.length;
        }

        setOpenModals((oms) => {
            oms.splice(foundIndex, 0, { ...data, index: foundIndex });

            return oms;
        });

        return foundIndex;
    };

    const unregisterModal = (id: string) => {
        // const found = openModals.find((m) => m.id === id);
        // if (found) {
        //     found.close();
        // }
        setOpenModals((old) => old.filter((m) => m.id !== id));
    };

    return (
        <ModalPortalContext.Provider
            value={{
                target: targetRef,
                openModals,
                registerModal,
                unregisterModal,
            }}
        >
            <div id="modal-portal" ref={targetRef}></div>
            {children}
        </ModalPortalContext.Provider>
    );
}
