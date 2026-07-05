// src/components/Modal/Modal.jsx
//
// Modal genérico e independiente del contenido: sólo administra overlay,
// cierre por ESC/click afuera, foco y animación. Cualquier formulario o
// vista de sólo lectura puede renderizarse dentro como children.

import { useEffect, useRef } from "react";

import "./Modal.css";

export default function Modal({

    isOpen,

    onClose,

    title,

    size = "md",

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
                className={`Modal-Overlay ${isOpen ? "show" : ""}`}
                onClick={onClose}
                aria-hidden={!isOpen}
            />

            <div
                ref={dialogRef}
                className={`Modal Modal-${size} ${isOpen ? "open" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                aria-hidden={!isOpen}
                tabIndex={-1}
            >

                <header className="Modal-Header">

                    <h2>{title}</h2>

                    <button
                        type="button"
                        className="Modal-Close"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>

                </header>

                <div className="Modal-Body">

                    {children}

                </div>

            </div>

        </>

    );

}
