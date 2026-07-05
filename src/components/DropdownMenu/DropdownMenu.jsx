// src/components/DropdownMenu/DropdownMenu.jsx
//
// Menú contextual genérico (⋮). Recibe una lista de acciones ya resueltas
// por el llamador ({ id, label, onClick, variant? }); no conoce a qué
// entidad de dominio pertenecen.

import { useEffect, useRef, useState } from "react";

import "./DropdownMenu.css";

export default function DropdownMenu({ items }) {

    const [isOpen, setIsOpen] = useState(false);

    const containerRef = useRef(null);

    useEffect(() => {

        if (!isOpen) return;

        function handleClickOutside(event) {

            if (containerRef.current && !containerRef.current.contains(event.target)) {

                setIsOpen(false);

            }

        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, [isOpen]);

    function handleTriggerClick(event) {

        event.stopPropagation();

        setIsOpen(current => !current);

    }

    function handleItemClick(event, item) {

        event.stopPropagation();

        setIsOpen(false);

        item.onClick();

    }

    return (

        <div className="DropdownMenu" ref={containerRef}>

            <button
                type="button"
                className="DropdownMenu-Trigger"
                onClick={handleTriggerClick}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Más acciones"
            >
                ⋮
            </button>

            {isOpen && (

                <ul
                    className="DropdownMenu-List"
                    onClick={event => event.stopPropagation()}
                >

                    {items.map(item => (

                        <li key={item.id}>

                            <button
                                type="button"
                                className={`DropdownMenu-Item ${item.variant ?? ""}`}
                                onClick={event => handleItemClick(event, item)}
                            >
                                {item.label}
                            </button>

                        </li>

                    ))}

                </ul>

            )}

        </div>

    );

}
