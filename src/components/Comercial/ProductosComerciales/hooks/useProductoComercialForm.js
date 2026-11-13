// src/components/Comercial/ProductosComerciales/hooks/useProductoComercialForm.js
//
// Validaciones de formato/obligatoriedad reflejando INV-COM-001 (nombre no
// vacío) e INV-COM-002 (precio > 0) — ver crear-producto-comercial.md. La
// regla de negocio real la aplica el backend (400 VALIDATION_ERROR); esto es
// sólo UX para no dejar viajar un request que ya sabemos inválido.

import { useState } from "react";

function initialFieldsFrom(initialData) {

    return {

        name: initialData?.name ?? "",

        description: initialData?.description ?? "",

        price: initialData?.price != null ? String(initialData.price) : "",

        image: initialData?.image ?? ""

    };

}

function validate(fields) {

    const errors = {};

    if (!fields.name.trim()) errors.name = "El nombre es obligatorio.";

    if (fields.price.trim() === "" ||
        Number.isNaN(Number(fields.price)) || Number(fields.price) <= 0) {

        errors.price = "Ingresá un precio mayor a cero.";

    }

    return errors;

}

export default function useProductoComercialForm(initialData) {

    const isCreateMode = !initialData;

    const [initialFields] = useState(() => initialFieldsFrom(initialData));

    const [fields, setFields] = useState(initialFields);

    const [errors, setErrors] = useState({});

    function setField(field, value) {

        setFields(current => ({ ...current, [field]: value }));

    }

    const isDirty = Object.keys(initialFields).some(
        key => fields[key] !== initialFields[key]
    );

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

            image: fields.image.trim()

        };

    }

    return {

        fields,

        setField,

        errors,

        isCreateMode,

        isDirty,

        validateForm,

        buildPayload

    };

}
