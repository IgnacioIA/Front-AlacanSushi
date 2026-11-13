// src/components/Comercial/CombosComerciales/hooks/useComboComercialForm.js
//
// Validaciones de formato reflejando INV-COM-003 a INV-COM-006 (ver
// crear-combo-comercial.md): nombre no vacío, precio > 0, al menos un
// componente, cantidad de cada componente > 0. `componentes` en `fields` ya
// trae `name` (sólo para mostrarlo en el picker) además de
// `productoComercialId`/`quantity` — el mapper descarta `name` al armar el
// request real.

import { useState } from "react";

function componentesFrom(initialData) {

    if (!initialData?.componentes) return [];

    return initialData.componentes.map(componente => ({

        productoComercialId: componente.productoComercialId,

        name: componente.name,

        quantity: String(componente.quantity)

    }));

}

function initialFieldsFrom(initialData) {

    return {

        name: initialData?.name ?? "",

        description: initialData?.description ?? "",

        price: initialData?.price != null ? String(initialData.price) : "",

        image: initialData?.image ?? "",

        componentes: componentesFrom(initialData)

    };

}

function validate(fields) {

    const errors = {};

    if (!fields.name.trim()) errors.name = "El nombre es obligatorio.";

    if (fields.price.trim() === "" ||
        Number.isNaN(Number(fields.price)) || Number(fields.price) <= 0) {

        errors.price = "Ingresá un precio mayor a cero.";

    }

    if (fields.componentes.length === 0) {

        errors.componentes = "Agregá al menos un producto comercial al combo.";

    } else if (fields.componentes.some(componente =>
        !componente.productoComercialId ||
        componente.quantity.trim() === "" ||
        Number.isNaN(Number(componente.quantity)) ||
        Number(componente.quantity) <= 0
    )) {

        errors.componentes = "Cada componente necesita un producto y una cantidad mayor a cero.";

    }

    return errors;

}

export default function useComboComercialForm(initialData) {

    const [initialFields] = useState(() => initialFieldsFrom(initialData));

    const [fields, setFields] = useState(initialFields);

    const [errors, setErrors] = useState({});

    function setField(field, value) {

        setFields(current => ({ ...current, [field]: value }));

    }

    function addComponente() {

        setFields(current => ({

            ...current,

            componentes: [...current.componentes, { productoComercialId: "", name: "", quantity: "1" }]

        }));

    }

    function updateComponente(index, changes) {

        setFields(current => ({

            ...current,

            componentes: current.componentes.map((componente, i) =>
                i === index ? { ...componente, ...changes } : componente
            )

        }));

    }

    function removeComponente(index) {

        setFields(current => ({

            ...current,

            componentes: current.componentes.filter((_, i) => i !== index)

        }));

    }

    const isDirty = JSON.stringify(fields) !== JSON.stringify(initialFields);

    function validateForm() {

        const nextErrors = validate(fields);

        setErrors(nextErrors);

        return nextErrors;

    }

    function buildPayload() {

        return {

            name: fields.name.trim(),

            description: fields.description.trim(),

            price: Number(fields.price),

            image: fields.image.trim(),

            componentes: fields.componentes.map(componente => ({

                productoComercialId: Number(componente.productoComercialId),

                quantity: Number(componente.quantity)

            }))

        };

    }

    return {

        fields,

        setField,

        addComponente,

        updateComponente,

        removeComponente,

        errors,

        isDirty,

        validateForm,

        buildPayload

    };

}
