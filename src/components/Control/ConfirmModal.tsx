"use client";

import { Modal, Button } from "flowbite-react";
import { useState } from "react";
import { useModalPortalContext } from "../Providers/ModalPortalProvider";
import { createPortal } from "react-dom";

export type ConfirmModalProps = {
    show: boolean;
    busy: boolean;
    onClose: () => Promise<void>;
    onConfirm: () => Promise<void>;
    acceptText?: string;
    declineText?: string;
    title: string | React.ReactNode;
    message: string | React.ReactNode;
    buttons?: string | React.ReactNode;
};

export function useConfirmModal() {
    const getInitialState = (): ConfirmModalProps => {
        return {
            show: false,
            busy: false,
            onClose: async () => {},
            onConfirm: async () => {},
            acceptText: "Accept",
            declineText: "Cancel",
            title: "Really delete this?",
            message: "This action may or may not be reversable",
            buttons: null,
        };
    };
    const [modalProps, setModalProps] = useState<ConfirmModalProps>(
        getInitialState()
    );
    const resetModal = () => setModalProps(getInitialState());

    const wrapBusyMethod = (method: () => Promise<void>) => {
        return async () => {
            setModalProps({ ...modalProps, busy: true });
            await method();
            setModalProps({ ...modalProps, busy: false });
        };
    };

    const show = (props: Partial<ConfirmModalProps>) => {
        const onClose = props.onClose
            ? wrapBusyMethod(props.onClose)
            : modalProps.onClose;

        const onConfirm = props.onConfirm
            ? wrapBusyMethod(props.onConfirm)
            : modalProps.onConfirm;

        setModalProps({
            ...modalProps,
            ...props,
            onClose,
            onConfirm,
            show: true,
        });
    };
    const hide = () => {
        resetModal();
    };
    return { modalProps, setModalProps, resetModal, show, hide };
}
export default function ConfirmModal({
    acceptText = "Accept",
    declineText = "Cancel",
    buttons,
    message,
    title,
    onConfirm,
    onClose,
    ...props
}: ConfirmModalProps) {
    const { target } = useModalPortalContext();

    if (!target) {
        return null;
    }

    return createPortal(
        <Modal show={props.show} onClose={onClose}>
            <Modal.Header>{title}</Modal.Header>
            <Modal.Body>
                <div>{message}</div>
            </Modal.Body>
            <Modal.Footer>
                {buttons && buttons}
                {!buttons && (
                    <>
                        <Button isProcessing={props.busy} onClick={onConfirm}>
                            {acceptText}
                        </Button>
                        <Button
                            isProcessing={props.busy}
                            color="gray"
                            onClick={onClose}
                        >
                            {declineText}
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>,
        target
    );
}
