// src/components/Ingredients/components/IngredientForm/IngredientForm.jsx
//
// Formulario compartido entre alta y edición de ingredientes, diferenciado
// por `initialData` (mismo patrón que OrderForm). La unidad sale de un
// selector real (catálogo de Unidades de Medida — Etapa 2), ya no es texto
// libre. "Stock inicial" sólo se muestra en el alta: el backend no lo
// acepta al editar. `submitError` es el error normalizado (apiError.js) de
// un intento fallido contra la API real — distinto de `errors`, que son
// validaciones de formato locales.

import { useRef, useState } from "react";

import useIngredientForm from "../../hooks/useIngredientForm";
import useMeasurementUnits from "../../hooks/useMeasurementUnits";
import ConfirmDialog from "../../../ConfirmDialog/ConfirmDialog";

import "./IngredientForm.css";

const FIELD_ORDER = ["name", "unitId", "quantity", "minStock"];

export default function IngredientForm({

    initialData,

    submitError,

    onCancel,

    onSubmit

}) {

    const {

        fields,

        setField,

        errors,

        isCreateMode,

        isDirty,

        validateForm,

        buildIngredientPayload

    } = useIngredientForm(initialData);

    const units = useMeasurementUnits();

    const [shake, setShake] = useState(false);

    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

    const fieldRefs = useRef({});

    const unitSubmitError = submitError?.code === "UNIDAD_MEDIDA_BLOQUEADA"
        ? submitError.title
        : null;

    const genericSubmitError = submitError && !unitSubmitError
        ? (submitError.detail || submitError.title)
        : null;

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

                {genericSubmitError && (
                    <p className="IngredientForm-SubmitError">{genericSubmitError}</p>
                )}

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

                        <select
                            ref={el => { fieldRefs.current.unitId = el; }}
                            value={fields.unitId}
                            onChange={event => setField("unitId", event.target.value)}
                            className={(errors.unitId || unitSubmitError) ? "invalid" : ""}
                        >
                            <option value="" disabled>Seleccionar...</option>
                            {units.map(unit => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.nombre} ({unit.abreviatura})
                                </option>
                            ))}
                        </select>

                        {(errors.unitId || unitSubmitError) && (
                            <small className="IngredientForm-Error">
                                {errors.unitId || unitSubmitError}
                            </small>
                        )}

                    </label>

                    <label className="IngredientForm-Field">

                        <span>Stock mínimo{isCreateMode ? " (opcional)" : ""}</span>

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

                    {isCreateMode && (

                        <label className="IngredientForm-Field">

                            <span>Stock inicial (opcional)</span>

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

                    )}

                </div>

                <label className="IngredientForm-Field">

                    <span>Descripción (opcional)</span>

                    <textarea
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
