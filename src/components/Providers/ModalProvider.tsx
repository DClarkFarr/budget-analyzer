"use client";

import {
    SetStateAction,
    createContext,
    useContext,
    useState,
    Dispatch,
} from "react";

type ModalEntry<T extends { show: boolean }> = {
    key: string;
    props: T;
    component: (props: T) => React.ReactNode;
};

type SetModals = Dispatch<SetStateAction<ModalEntry<any>[]>>;

const ModalContext = createContext({
    modals: [] as ModalEntry<any>[],
    setModals: (() => {}) as SetModals,
});

export { ModalContext };

export function useModalContext() {
    const { modals, setModals } = useContext(ModalContext);

    const register: <T extends { show: boolean }>(
        entry: ModalEntry<T>
    ) => void = (entry) => {
        setModals((modals) => {
            const foundIndex = modals.findIndex(
                (modal) => modal.key === entry.key
            );
            if (foundIndex > -1) {
                modals.splice(foundIndex, 1, entry);
                return [...modals];
            }

            return [...modals, entry];
        });
    };

    const unregister = (key: string) => {
        const found = modals.find((modal) => modal.key === key);
        console.log("unregister found", found, "from", key, "in", modals);
        if (found) {
            setModals((modals) => {
                const foundIndex = modals.findIndex(
                    (modal) => modal.key === key
                );

                console.log(
                    "unregister found index",
                    foundIndex,
                    "from",
                    key,
                    "in",
                    modals
                );
                if (foundIndex > -1) {
                    modals.splice(foundIndex, 1);
                    return [...modals];
                }
                return modals;
            });
        }
    };

    const showModal = (key: string) => {
        setModals((modals) => {
            const foundIndex = modals.findIndex((modal) => modal.key === key);
            if (foundIndex > -1) {
                modals[foundIndex].props.show = true;
                return [...modals];
            }
            return modals;
        });
    };

    const hideModal = (key: string) => {
        setModals((modals) => {
            const foundIndex = modals.findIndex((modal) => modal.key === key);
            if (foundIndex > -1) {
                modals[foundIndex].props.show = false;
                return [...modals];
            }
            return modals;
        });
    };

    return { register, unregister, showModal, hideModal, modals, setModals };
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [modals, setModals] = useState<ModalEntry<any>[]>([]);

    return (
        <ModalContext.Provider value={{ modals, setModals }}>
            {children}
            <div id="modals">
                {modals.map((modal) => (
                    <div key={modal.key} className="modal">
                        {modal.component(modal.props)}
                    </div>
                ))}
            </div>
        </ModalContext.Provider>
    );
}
