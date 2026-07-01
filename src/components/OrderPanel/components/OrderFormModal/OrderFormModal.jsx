// src/components/OrderPanel/components/OrderFormModal/OrderFormModal.jsx

import { useEffect, useRef } from "react";

import "./OrderFormModal.css";

export default function OrderFormModal({

    isOpen,

    onClose,

    title,

    children

}) {

    const dialogRef = useRef(null);

    useEffect(() => {

        if (!isOpen) return;

        function handleKeyDown(event) {

            if (event.key === "Escape") onClose();

        }

        document.addEventListener("keydown", handleKeyDown);

        return () => document.removeEventListener("keydown", handleKeyDown);

    }, [isOpen, onClose]);

    useEffect(() => {

        if (isOpen) dialogRef.current?.focus();

    }, [isOpen]);

    return (

        <>

            <div
                className={`OrderFormModal-Overlay ${isOpen ? "show" : ""}`}
                onClick={onClose}
                aria-hidden={!isOpen}
            />

            <div
                ref={dialogRef}
                className={`OrderFormModal ${isOpen ? "open" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                aria-hidden={!isOpen}
                tabIndex={-1}
            >

                <header className="OrderFormModal-Header">

                    <h2>{title}</h2>

                    <button
                        type="button"
                        className="OrderFormModal-Close"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>

                </header>

                <div className="OrderFormModal-Body">

                    {children}

                </div>

            </div>

        </>

    );

}
