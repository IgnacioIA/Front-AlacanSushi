// src/components/Ingredients/hooks/useIngredientForm.js
//
// Validaciones únicamente de formato/obligatoriedad, reflejando qué campos
// exige cada endpoint real (ver docs/frontend/integration/ingredients.md):
// en el alta, "stock mínimo" y "stock inicial" son opcionales; en la
// edición, "stock mínimo" es obligatorio y no existe ningún campo de stock
// inicial (el backend no acepta modificar el stock actual al editar).
// buildIngredientPayload() devuelve una forma intermedia (no un DTO): es
// ingredientMapper.js quien la traduce a la request real de cada endpoint.

import { useState } from "react";

function initialFieldsFrom(initialData) {

    return {

        name: initialData?.name ?? "",

        unitId: initialData?.unitId != null ? String(initialData.unitId) : "",

        quantity: "",

        minStock: initialData?.minStock != null ? String(initialData.minStock) : "",

        description: initialData?.description ?? ""

    };

}

function validate(fields, isCreateMode) {

    const errors = {};

    if (!fields.name.trim()) errors.name = "El nombre es obligatorio.";

    if (!fields.unitId) errors.unitId = "Seleccioná una unidad.";

    if (isCreateMode) {

        // Stock inicial y stock mínimo son opcionales en el alta — sólo se
        // validan si el usuario efectivamente escribió algo.
        if (fields.quantity.trim() !== "" &&
            (Number.isNaN(Number(fields.quantity)) || Number(fields.quantity) < 0)) {

            errors.quantity = "Ingresá una cantidad válida.";

        }

        if (fields.minStock.trim() !== "" &&
            (Number.isNaN(Number(fields.minStock)) || Number(fields.minStock) < 0)) {

            errors.minStock = "El stock mínimo no puede ser negativo.";

        }

    } else {

        // La edición sí exige stock mínimo (PUT /ingredients/{id} lo requiere).
        if (fields.minStock.trim() === "" ||
            Number.isNaN(Number(fields.minStock)) || Number(fields.minStock) < 0) {

            errors.minStock = "Ingresá un stock mínimo válido.";

        }

    }

    return errors;

}

export default function useIngredientForm(initialData) {

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

        const nextErrors = validate(fields, isCreateMode);

        setErrors(nextErrors);

        return nextErrors;

    }

    function buildIngredientPayload() {

        return {

            name: fields.name.trim(),

            unitId: Number(fields.unitId),

            description: fields.description.trim(),

            minStock: fields.minStock.trim() === "" ? null : Number(fields.minStock),

            quantity: fields.quantity.trim() === "" ? null : Number(fields.quantity)

        };

    }

    return {

        fields,

        setField,

        errors,

        isCreateMode,

        isDirty,

        validateForm,

        buildIngredientPayload

    };

}
