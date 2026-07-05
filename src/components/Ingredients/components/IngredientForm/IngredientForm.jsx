// src/components/Ingredients/components/IngredientForm/IngredientForm.jsx
//
// Formulario compartido entre alta y edición de ingredientes, diferenciado
// únicamente por `initialData` (mismo patrón que OrderForm). Las
// validaciones son sólo de formato/obligatoriedad: las reglas de negocio
// sobre stock pertenecen a la API.

import { useRef, useState } from "react";

import useIngredientForm from "../../hooks/useIngredientForm";
import ConfirmDialog from "../../../ConfirmDialog/ConfirmDialog";

import "./IngredientForm.css";

const FIELD_ORDER = ["name", "unit", "quantity", "minStock", "description"];

export default function IngredientForm({

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

        buildIngredientPayload

    } = useIngredientForm(initialData);

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

        onSubmit(buildIngredientPayload());

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
                className={`IngredientForm ${shake ? "shake" : ""}`}
                onSubmit={handleSubmit}
                onAnimationEnd={() => setShake(false)}
                noValidate
            >

                <label className="IngredientForm-Field">

                    <span>Nombre</span>

                    <input
                        ref={el => { fieldRefs.current.name = el; }}
                        type="text"
                        value={fields.name}
                        onChange={event => setField("name", event.target.value)}
                        className={errors.name ? "invalid" : ""}
                        placeholder="Ej: Harina 000"
                    />

                    {errors.name && (
                        <small className="IngredientForm-Error">{errors.name}</small>
                    )}

                </label>

                <div className="IngredientForm-Row">

                    <label className="IngredientForm-Field">

                        <span>Unidad</span>

                        <input
                            ref={el => { fieldRefs.current.unit = el; }}
                            type="text"
                            value={fields.unit}
                            onChange={event => setField("unit", event.target.value)}
                            className={errors.unit ? "invalid" : ""}
                            placeholder="Ej: kg, L, unidad"
                        />

                        {errors.unit && (
                            <small className="IngredientForm-Error">{errors.unit}</small>
                        )}

                    </label>

                    <label className="IngredientForm-Field">

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
                            <small className="IngredientForm-Error">{errors.quantity}</small>
                        )}

                    </label>

                    <label className="IngredientForm-Field">

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
                            <small className="IngredientForm-Error">{errors.minStock}</small>
                        )}

                    </label>

                </div>

                <label className="IngredientForm-Field">

                    <span>Descripción (opcional)</span>

                    <textarea
                        ref={el => { fieldRefs.current.description = el; }}
                        value={fields.description}
                        onChange={event => setField("description", event.target.value)}
                        placeholder="Notas adicionales sobre el ingrediente"
                        rows={3}
                    />

                </label>

                <div className="IngredientForm-Footer">

                    <button
                        type="button"
                        className="IngredientForm-Cancel"
                        onClick={handleCancelClick}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="IngredientForm-Submit"
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
