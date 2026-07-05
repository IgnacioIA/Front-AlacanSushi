// src/components/Products/hooks/useProduceProductForm.js
//
// Formulario de producción: sólo recolecta la intención del usuario
// (cantidad a producir + receta). No calcula ni descuenta stock —
// la ejecución real del proceso de producción pertenece a la API.

import { useState } from "react";

const INITIAL_FIELDS = {

    quantity: "",

    recipeId: ""

};

function validate(fields) {

    const errors = {};

    if (fields.quantity.trim() === "" || Number.isNaN(Number(fields.quantity))) {

        errors.quantity = "Ingresá una cantidad válida.";

    } else if (Number(fields.quantity) <= 0) {

        errors.quantity = "La cantidad debe ser mayor a cero.";

    }

    if (!fields.recipeId) errors.recipeId = "Seleccioná una receta.";

    return errors;

}

export default function useProduceProductForm() {

    const [fields, setFields] = useState(INITIAL_FIELDS);

    const [errors, setErrors] = useState({});

    function setField(field, value) {

        setFields(current => ({ ...current, [field]: value }));

    }

    const isDirty = Object.keys(INITIAL_FIELDS).some(
        key => fields[key] !== INITIAL_FIELDS[key]
    );

    function validateForm() {

        const nextErrors = validate(fields);

        setErrors(nextErrors);

        return nextErrors;

    }

    function buildProducePayload() {

        return {

            quantity: Number(fields.quantity),

            recipeId: Number(fields.recipeId)

        };

    }

    return {

        fields,

        setField,

        errors,

        isDirty,

        validateForm,

        buildProducePayload

    };

}
