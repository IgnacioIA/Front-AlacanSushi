// src/components/Recipes/hooks/useRecipeForm.js
//
// Validaciones únicamente de formato/obligatoriedad. La construcción de
// la lista de ingredientes sigue el mismo patrón de
// OrderPanel/hooks/useOrderForm.js (addItem/removeItem/updateItemQuantity)
// aplicado a ingredientes en lugar de productos de pedido.

import { useState } from "react";

function buildInitialIngredients(initialData) {

    return initialData?.ingredients
        ? initialData.ingredients.map(ingredient => ({ ...ingredient }))
        : [];

}

function initialFieldsFrom(initialData) {

    return {

        name: initialData?.name ?? "",

        productId: initialData?.productId != null ? String(initialData.productId) : "",

        description: initialData?.description ?? "",

        ingredients: buildInitialIngredients(initialData)

    };

}

function validate(fields) {

    const errors = {};

    if (!fields.name.trim()) errors.name = "El nombre es obligatorio.";

    if (!fields.productId) errors.productId = "Seleccioná el producto asociado.";

    if (fields.ingredients.length === 0) {

        errors.ingredients = "Agregá al menos un ingrediente.";

    }

    return errors;

}

export default function useRecipeForm(initialData) {

    const [initialFields] = useState(() => initialFieldsFrom(initialData));

    const [name, setName] = useState(initialFields.name);

    const [productId, setProductId] = useState(initialFields.productId);

    const [description, setDescription] = useState(initialFields.description);

    const [ingredients, setIngredients] = useState(initialFields.ingredients);

    const [errors, setErrors] = useState({});

    function addIngredient(ingredient) {

        setIngredients(current => {

            const existing = current.find(item => item.ingredientId === ingredient.id);

            if (existing) {

                return current.map(item =>
                    item.ingredientId === ingredient.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );

            }

            return [
                ...current,
                {
                    ingredientId: ingredient.id,
                    name: ingredient.name,
                    unit: ingredient.unit,
                    quantity: 1
                }
            ];

        });

    }

    function removeIngredient(ingredientId) {

        setIngredients(current => current.filter(item => item.ingredientId !== ingredientId));

    }

    function updateIngredientQuantity(ingredientId, quantity) {

        if (quantity < 1) return;

        setIngredients(current => current.map(item =>
            item.ingredientId === ingredientId
                ? { ...item, quantity }
                : item
        ));

    }

    function updateIngredientUnit(ingredientId, unit) {

        setIngredients(current => current.map(item =>
            item.ingredientId === ingredientId
                ? { ...item, unit }
                : item
        ));

    }

    const isDirty = name !== initialFields.name
        || productId !== initialFields.productId
        || description !== initialFields.description
        || JSON.stringify(ingredients) !== JSON.stringify(initialFields.ingredients);

    function validateForm() {

        const nextErrors = validate({ name, productId, ingredients });

        setErrors(nextErrors);

        return nextErrors;

    }

    function buildRecipePayload() {

        return {

            name: name.trim(),

            productId: Number(productId),

            description: description.trim(),

            ingredients

        };

    }

    return {

        name,

        setName,

        productId,

        setProductId,

        description,

        setDescription,

        ingredients,

        addIngredient,

        removeIngredient,

        updateIngredientQuantity,

        updateIngredientUnit,

        errors,

        isDirty,

        validateForm,

        buildRecipePayload

    };

}
