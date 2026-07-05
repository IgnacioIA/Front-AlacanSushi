// src/components/Products/components/ProductForm/ProductForm.jsx
//
// Formulario compartido entre alta y edición de productos, diferenciado
// únicamente por `initialData` (mismo patrón que
// Ingredients/components/IngredientForm). Agrega el select de "Receta
// activa" (mock, opcional) sin alterar el resto del comportamiento.

import { useRef, useState } from "react";

import useProductForm from "../../hooks/useProductForm";
import useRecipes from "../../hooks/useRecipes";
import ConfirmDialog from "../../../ConfirmDialog/ConfirmDialog";

import "./ProductForm.css";

const FIELD_ORDER = ["name", "unit", "quantity", "minStock"];

export default function ProductForm({

    initialData,

    onCancel,

    onSubmit

}) {

    const {

        fields,

        setField,

        errors,

        isDirty,

        validateForm,

        buildProductPayload

    } = useProductForm(initialData);

    const recipes = useRecipes();

    const [shake, setShake] = useState(false);

    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

    const fieldRefs = useRef({});

    function handleSubmit(event) {

        event.preventDefault();

        const nextErrors = validateForm();

        const firstErrorField = FIELD_ORDER.find(field => nextErrors[field]);

        if (firstErrorField) {

            setShake(true);

            fieldRefs.current[firstErrorField]?.focus();

            return;

        }

        onSubmit(buildProductPayload());

    }

    function handleCancelClick() {

        if (isDirty) {

            setShowDiscardConfirm(true);

            return;

        }

        onCancel();

    }

    return (

        <>

            <form
                className={`ProductForm ${shake ? "shake" : ""}`}
                onSubmit={handleSubmit}
                onAnimationEnd={() => setShake(false)}
                noValidate
            >

                <label className="ProductForm-Field">

                    <span>Nombre</span>

                    <input
                        ref={el => { fieldRefs.current.name = el; }}
                        type="text"
                        value={fields.name}
                        onChange={event => setField("name", event.target.value)}
                        className={errors.name ? "invalid" : ""}
                        placeholder="Ej: Pizza Muzzarella"
                    />

                    {errors.name && (
                        <small className="ProductForm-Error">{errors.name}</small>
                    )}

                </label>

                <div className="ProductForm-Row">

                    <label className="ProductForm-Field">

                        <span>Unidad</span>

                        <input
                            ref={el => { fieldRefs.current.unit = el; }}
                            type="text"
                            value={fields.unit}
                            onChange={event => setField("unit", event.target.value)}
                            className={errors.unit ? "invalid" : ""}
                            placeholder="Ej: unidades, porciones"
                        />

                        {errors.unit && (
                            <small className="ProductForm-Error">{errors.unit}</small>
                        )}

                    </label>

                    <label className="ProductForm-Field">

                        <span>Stock inicial</span>

                        <input
                            ref={el => { fieldRefs.current.quantity = el; }}
                            type="number"
                            value={fields.quantity}
                            onChange={event => setField("quantity", event.target.value)}
                            className={errors.quantity ? "invalid" : ""}
                            placeholder="0"
                        />

                        {errors.quantity && (
                            <small className="ProductForm-Error">{errors.quantity}</small>
                        )}

                    </label>

                    <label className="ProductForm-Field">

                        <span>Stock mínimo</span>

                        <input
                            ref={el => { fieldRefs.current.minStock = el; }}
                            type="number"
                            value={fields.minStock}
                            onChange={event => setField("minStock", event.target.value)}
                            className={errors.minStock ? "invalid" : ""}
                            placeholder="0"
                        />

                        {errors.minStock && (
                            <small className="ProductForm-Error">{errors.minStock}</small>
                        )}

                    </label>

                </div>

                <label className="ProductForm-Field">

                    <span>Receta activa (opcional)</span>

                    <select
                        value={fields.activeRecipeId}
                        onChange={event => setField("activeRecipeId", event.target.value)}
                    >
                        <option value="">Sin receta activa</option>
                        {recipes.map(recipe => (
                            <option key={recipe.id} value={recipe.id}>
                                {recipe.name}
                            </option>
                        ))}
                    </select>

                </label>

                <label className="ProductForm-Field">

                    <span>Descripción (opcional)</span>

                    <textarea
                        value={fields.description}
                        onChange={event => setField("description", event.target.value)}
                        placeholder="Notas adicionales sobre el producto"
                        rows={3}
                    />

                </label>

                <div className="ProductForm-Footer">

                    <button
                        type="button"
                        className="ProductForm-Cancel"
                        onClick={handleCancelClick}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="ProductForm-Submit"
                    >
                        Guardar
                    </button>

                </div>

            </form>

            <ConfirmDialog
                isOpen={showDiscardConfirm}
                title="Descartar cambios"
                message="Tenés cambios sin guardar. ¿Querés descartarlos?"
                confirmLabel="Descartar"
                cancelLabel="Seguir editando"
                variant="danger"
                onConfirm={() => {
                    setShowDiscardConfirm(false);
                    onCancel();
                }}
                onCancel={() => setShowDiscardConfirm(false)}
            />

        </>

    );

}
