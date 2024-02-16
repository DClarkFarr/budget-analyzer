"use client";

import { Modal, Button } from "flowbite-react";
import { useState } from "react";
import { useModalContext } from "../Providers/ModalProvider";

export type ConfirmModalProps = {
    show: boolean;
    onClose: () => Promise<void>;
    onConfirm: () => Promise<void>;
    title: string;
    message: string | React.ReactNode;
    accept?: string;
    decline?: string;
    buttons?: (buttonProps: {
        accept: string;
        decline: string;
        onClose: () => Promise<void>;
        onConfirm: () => Promise<void>;
    }) => React.ReactNode;
};
export default function ConfirmModal({
    accept = "Accept",
    decline = "Cancel",
    buttons,
    ...props
}: ConfirmModalProps) {
    const [busy, setBusy] = useState(false);

    const onConfirm = async () => {
        setBusy(true);
        props.onConfirm().finally(() => {
            setBusy(false);
        });
    };

    const onClose = async () => {
        setBusy(true);
        props.onClose().finally(() => {
            setBusy(false);
        });
    };

    return (
        <Modal show={props.show} onClose={props.onClose}>
            <Modal.Header>{props.title}</Modal.Header>
            <Modal.Body>
                <div>{props.message}</div>
            </Modal.Body>
            <Modal.Footer>
                {buttons && buttons({ accept, decline, onClose, onConfirm })}
                {!buttons && (
                    <>
                        <Button isProcessing={busy} onClick={() => onConfirm()}>
                            {accept}
                        </Button>
                        <Button
                            isProcessing={busy}
                            color="gray"
                            onClick={() => onClose()}
                        >
                            {decline}
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
}

export function useConfirmModal() {
    const { register, unregister, modals } = useModalContext();

    console.log("rendering onclickclose", "had modals", modals);
    const onClickClose = async (key: string, onClose: () => Promise<void>) => {
        console.log("clicked on close", modals);
        await onClose();

        console.log("closed", key);

        unregister(key);
    };

    const onClickConfirm = async (
        key: string,
        onConfirm: () => Promise<void>
    ) => {
        await onConfirm();
        console.log("confirmed", key);

        unregister(key);
    };

    const showConfirmModal = (key: string, { ...props }: ConfirmModalProps) => {
        register({
            key,
            props: { ...props, show: true },
            component: (instanceProps) => (
                <ConfirmModal
                    {...instanceProps}
                    onClose={() => props.onClose()}
                    onConfirm={() => props.onConfirm()}
                />
            ),
        });
    };

    return {
        showConfirmModal,
        onClickConfirm,
        onClickClose,
    };
}
