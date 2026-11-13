// src/components/Comercial/ProductosComerciales/components/ProductoComercialForm/ProductoComercialForm.jsx
//
// Formulario compartido entre alta y edición, mismo patrón que
// Ingredients/components/IngredientForm/IngredientForm.jsx. `submitError` es
// el error normalizado (apiError.js) de un intento fallido contra la API real.

import { useRef, useState } from "react";

import useProductoComercialForm from "../../hooks/useProductoComercialForm";
import ConfirmDialog from "../../../../ConfirmDialog/ConfirmDialog";

import "./ProductoComercialForm.css";

const FIELD_ORDER = ["name", "price"];

export default function ProductoComercialForm({

    initialData,

    submitError,

    onCancel,

    onSubmit

}) {

    const {

        fields,

        setField,

        errors,

        isDirty,

        validateForm,

        buildPayload

    } = useProductoComercialForm(initialData);

    const [shake, setShake] = useState(false);

    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

    const fieldRefs = useRef({});

    const genericSubmitError = submitError ? (submitError.detail || submitError.title) : null;

    function handleSubmit(event) {

        event.preventDefault();

        const nextErrors = validateForm();

        const firstErrorField = FIELD_ORDER.find(field => nextErrors[field]);

        if (firstErrorField) {

            setShake(true);

            fieldRefs.current[firstErrorField]?.focus();

            return;

        }

        onSubmit(buildPayload());

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
                className={`ProductoComercialForm ${shake ? "shake" : ""}`}
                onSubmit={handleSubmit}
                onAnimationEnd={() => setShake(false)}
                noValidate
            >

                {genericSubmitError && (
                    <p className="ProductoComercialForm-SubmitError">{genericSubmitError}</p>
                )}

                <label className="ProductoComercialForm-Field">

                    <span>Nombre</span>

                    <input
                        ref={el => { fieldRefs.current.name = el; }}
                        type="text"
                        value={fields.name}
                        onChange={event => setField("name", event.target.value)}
                        className={errors.name ? "invalid" : ""}
                        placeholder="Ej: Hamburguesa completa"
                    />

                    {errors.name && (
                        <small className="ProductoComercialForm-Error">{errors.name}</small>
                    )}

                </label>

                <label className="ProductoComercialForm-Field">

                    <span>Precio</span>

                    <input
                        ref={el => { fieldRefs.current.price = el; }}
                        type="number"
                        value={fields.price}
                        onChange={event => setField("price", event.target.value)}
                        className={errors.price ? "invalid" : ""}
                        placeholder="0"
                        min="0"
                        step="0.01"
                    />

                    {errors.price && (
                        <small className="ProductoComercialForm-Error">{errors.price}</small>
                    )}

                </label>

                <label className="ProductoComercialForm-Field">

                    <span>Imagen (URL, opcional)</span>

                    <input
                        type="text"
                        value={fields.image}
                        onChange={event => setField("image", event.target.value)}
                        placeholder="https://..."
                    />

                </label>

                <label className="ProductoComercialForm-Field">

                    <span>Descripción (opcional)</span>

                    <textarea
                        value={fields.description}
                        onChange={event => setField("description", event.target.value)}
                        placeholder="Descripción visible para el cliente"
                        rows={3}
                    />

                </label>

                <div className="ProductoComercialForm-Footer">

                    <button
                        type="button"
                        className="ProductoComercialForm-Cancel"
                        onClick={handleCancelClick}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="ProductoComercialForm-Submit"
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
