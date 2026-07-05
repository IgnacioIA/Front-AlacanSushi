// src/components/Products/hooks/useProductForm.js
//
// Validaciones únicamente de formato/obligatoriedad. Las reglas de negocio
// sobre stock pertenecen a la API. `activeRecipeId` es una referencia mock
// opcional (ver mocks/mockRecipes.js), sin validación de negocio.

import { useState } from "react";

function initialFieldsFrom(initialData) {

    return {

        name: initialData?.name ?? "",

        unit: initialData?.unit ?? "",

        quantity: initialData?.quantity != null ? String(initialData.quantity) : "",

        minStock: initialData?.minStock != null ? String(initialData.minStock) : "",

        description: initialData?.description ?? "",

        activeRecipeId: initialData?.activeRecipeId != null ? String(initialData.activeRecipeId) : ""

    };

}

function validate(fields) {

    const errors = {};

    if (!fields.name.trim()) errors.name = "El nombre es obligatorio.";

    if (!fields.unit.trim()) errors.unit = "La unidad es obligatoria.";

    if (fields.quantity.trim() === "" || Number.isNaN(Number(fields.quantity))) {

        errors.quantity = "Ingresá una cantidad válida.";

    } else if (Number(fields.quantity) < 0) {

        errors.quantity = "La cantidad no puede ser negativa.";

    }

    if (fields.minStock.trim() === "" || Number.isNaN(Number(fields.minStock))) {

        errors.minStock = "Ingresá un stock mínimo válido.";

    } else if (Number(fields.minStock) < 0) {

        errors.minStock = "El stock mínimo no puede ser negativo.";

    }

    return errors;

}

export default function useProductForm(initialData) {

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

    function buildProductPayload() {

        return {

            name: fields.name.trim(),

            unit: fields.unit.trim(),

            quantity: Number(fields.quantity),

            minStock: Number(fields.minStock),

            description: fields.description.trim(),

            activeRecipeId: fields.activeRecipeId ? Number(fields.activeRecipeId) : null

        };

    }

    return {

        fields,

        setField,

        errors,

        isDirty,

        validateForm,

        buildProductPayload

    };

}
