"use client";

import { useEffect, useRef, useState } from "react";
import { useModalPortalContext } from "../Providers/ModalPortalProvider";
import { FaTimes } from "react-icons/fa";
import { createPortal } from "react-dom";

import "./SidePanel.scss";

const delay = (timeout = 100) =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, timeout);
    });

export interface SidePanelState {
    children: React.ReactNode;
    isOpen?: boolean;
    heading?: string | React.ReactNode;
    clickBgToClose?: boolean;
    stackable?: boolean;
    id?: string;
    index?: number;
    align?: "left" | "right";
    width?: number;
    transitionDuration?: number;
    onOpen?: () => Promise<void>;
    onClose?: () => Promise<void>;
}

export interface SidePanelProps extends SidePanelState {
    onOpen: () => Promise<void>;
    onClose: () => Promise<void>;
    isOpen: boolean;
    transitionDuration: number;
    zindex: number;
    width: number;
    align: "left" | "right";
}

export interface SidePanelMethods {
    open: () => void;
    close: () => void;
}

export function useSidePanel(props: Omit<SidePanelState, "children">): {
    props: Omit<SidePanelProps, "children">;
    methods: SidePanelMethods;
} {
    const context = useModalPortalContext();
    const [state, setState] = useState({
        align: "right" as "right",
        stackable: true,
        clickBgToClose: true,
        transitionDuration: 300,
        width: 600,
        id: "sidebar-modal",
        ...props,
    });

    const [zindex, setZindex] = useState((props.index || 0) + 100);
    const [isOpen, setIsOpen] = useState(props.isOpen || false);

    const registerModal = (overrideId?: string) => {
        const newIndex = context.registerModal({
            id: overrideId || state.id,
            stackable: state.stackable,
            close: () => {
                onClose();
            },
        });

        if (newIndex !== zindex) {
            setZindex(newIndex + 100);
        }
    };

    const onOpen = async (id?: string) => {
        registerModal(id);

        setIsOpen(true);

        if (state.onOpen) {
            await state.onOpen();
        }
    };

    const onClose = async () => {
        context.unregisterModal(state.id);
        setIsOpen(false);

        if (state.onClose) {
            await state.onClose();
        }
    };

    const open = (extra: Partial<SidePanelState> = {}) => {
        let id = state.id;
        if (Object.keys(extra).length) {
            const toSet = { ...state, ...extra };
            id = toSet.id;
            setState(toSet);
        }

        return onOpen(id);
    };

    const close = () => {
        return onClose();
    };

    return {
        props: {
            ...state,
            isOpen,
            zindex,
            onOpen,
            onClose,
        },
        methods: {
            open,
            close,
        },
    };
}

export function SidePanel({
    children,
    heading,
    align = "right",
    clickBgToClose = true,
    transitionDuration,
    isOpen,
    zindex,
    width,
    onOpen,
    onClose,
}: SidePanelProps) {
    const { target } = useModalPortalContext();

    const parentRef = useRef<HTMLDivElement | null>(null);

    const onClickBg = () => {
        if (clickBgToClose) {
            onClose();
        }
    };

    const onClickClose = () => {
        onClose();
    };

    useEffect(() => {
        if (parentRef.current) {
            if (isOpen) {
                parentRef.current.classList.add("open");
            } else {
                parentRef.current.classList.remove("open");
            }
        }
    }, [isOpen]);

    if (!target.current) {
        return null;
    }

    return createPortal(
        <div
            className={`side-panel side-panel--${align} animate`}
            ref={parentRef}
            style={{
                "--z-index": zindex,
                "--transition-duration": `${transitionDuration}ms`,
                "--width": `${width}px`,
            }}
        >
            <div className="side-panel__bg" onClick={onClickBg}></div>
            <div className="side-panel__panel bg-white text-gray-700">
                <div className="side-panel__top flex w-full justify-end">
                    <div className="pr-2 pt-2">
                        <div
                            className="p-1 cursor-pointer text-gray-500 hover:text-gray-700"
                            onClick={onClickClose}
                        >
                            <FaTimes />
                        </div>
                    </div>
                </div>

                {heading && (
                    <div className="side-panel__heading p-4 text-lg mb-4 font-semibold border-b border-b-2 border-gray-500">
                        {heading}
                    </div>
                )}

                <div className="side-panel__body p-4">{isOpen && children}</div>
            </div>
        </div>,
        target.current
    );
}
