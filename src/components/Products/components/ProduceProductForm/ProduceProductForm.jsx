// src/components/Products/components/ProduceProductForm/ProduceProductForm.jsx
//
// Formulario de producción: sólo recolecta cantidad a producir + receta
// seleccionada. No descuenta ingredientes ni modifica stock — únicamente
// entrega la intención del usuario para que, en el futuro, la API
// ejecute el proceso real. Mismo comportamiento de validación/vibración/
// foco/descarte que IngredientForm y ProductForm.

import { useRef, useState } from "react";

import useProduceProductForm from "../../hooks/useProduceProductForm";
import useRecipes from "../../hooks/useRecipes";
import ConfirmDialog from "../../../ConfirmDialog/ConfirmDialog";

import "./ProduceProductForm.css";

const FIELD_ORDER = ["quantity", "recipeId"];

export default function ProduceProductForm({

    product,

    onCancel,

    onSubmit

}) {

    const {

        fields,

        setField,

        errors,

        isDirty,

        validateForm,

        buildProducePayload

    } = useProduceProductForm();

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

        onSubmit(buildProducePayload());

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
                className={`ProduceProductForm ${shake ? "shake" : ""}`}
                onSubmit={handleSubmit}
                onAnimationEnd={() => setShake(false)}
                noValidate
            >

                <p className="ProduceProductForm-Hint">
                    {product?.name} — stock actual: {product?.quantity} {product?.unit}
                </p>

                <label className="ProduceProductForm-Field">

                    <span>Cantidad a producir</span>

                    <input
                        ref={el => { fieldRefs.current.quantity = el; }}
                        type="number"
                        value={fields.quantity}
                        onChange={event => setField("quantity", event.target.value)}
                        className={errors.quantity ? "invalid" : ""}
                        placeholder="0"
                    />

                    {errors.quantity && (
                        <small className="ProduceProductForm-Error">{errors.quantity}</small>
                    )}

                </label>

                <label className="ProduceProductForm-Field">

                    <span>Receta</span>

                    <select
                        ref={el => { fieldRefs.current.recipeId = el; }}
                        value={fields.recipeId}
                        onChange={event => setField("recipeId", event.target.value)}
                        className={errors.recipeId ? "invalid" : ""}
                    >
                        <option value="" disabled>Seleccionar receta...</option>
                        {recipes.map(recipe => (
                            <option key={recipe.id} value={recipe.id}>
                                {recipe.name}
                            </option>
                        ))}
                    </select>

                    {errors.recipeId && (
                        <small className="ProduceProductForm-Error">{errors.recipeId}</small>
                    )}

                </label>

                <div className="ProduceProductForm-Footer">

                    <button
                        type="button"
                        className="ProduceProductForm-Cancel"
                        onClick={handleCancelClick}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="ProduceProductForm-Submit"
                    >
                        Producir
                    </button>

                </div>

            </form>

            <ConfirmDialog
                isOpen={showDiscardConfirm}
                title="Descartar producción"
                message="Tenés datos sin confirmar. ¿Querés descartarlos?"
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
