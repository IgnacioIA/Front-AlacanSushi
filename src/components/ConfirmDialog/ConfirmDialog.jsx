// src/components/ConfirmDialog/ConfirmDialog.jsx

import Modal from "../Modal/Modal";

import "./ConfirmDialog.css";

export default function ConfirmDialog({

    isOpen,

    title,

    message,

    confirmLabel = "Confirmar",

    cancelLabel = "Cancelar",

    variant = "default",

    irreversible = true,

    onConfirm,

    onCancel

}) {

    return (

        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title={title}
            size="sm"
        >

            <div className="ConfirmDialog">

                <p className="ConfirmDialog-Message">{message}</p>

                {irreversible && (

                    <p className="ConfirmDialog-Warning">
                        Esta acción no se puede deshacer.
                    </p>

                )}

                <div className="ConfirmDialog-Footer">

                    <button
                        type="button"
                        className="ConfirmDialog-Cancel"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        className={`ConfirmDialog-Confirm ${variant}`}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>

                </div>

            </div>

        </Modal>

    );

}
