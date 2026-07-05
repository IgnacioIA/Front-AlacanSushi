// src/components/Recipes/components/RecipeForm/RecipeForm.jsx
//
// Formulario compartido entre alta y edición de recetas, diferenciado
// únicamente por `initialData` (mismo patrón que IngredientForm/
// ProductForm). El select de producto se resuelve inline (único
// consumidor de productService en este módulo, mismo criterio que
// RecipeIngredientPicker con ingredientService).

import { useEffect, useRef, useState } from "react";

import useRecipeForm from "../../hooks/useRecipeForm";
import productService from "../../services/productService";
import RecipeIngredientPicker from "../RecipeIngredientPicker/RecipeIngredientPicker";
import RecipeIngredientList from "../RecipeIngredientList/RecipeIngredientList";
import ConfirmDialog from "../../../ConfirmDialog/ConfirmDialog";

import "./RecipeForm.css";

const FIELD_ORDER = ["name", "productId", "ingredients"];

export default function RecipeForm({

    initialData,

    onCancel,

    onSubmit

}) {

    const {

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

    } = useRecipeForm(initialData);

    const [products, setProducts] = useState([]);

    const [shake, setShake] = useState(false);

    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

    const fieldRefs = useRef({});

    useEffect(() => {

        async function loadProducts() {

            setProducts(await productService.getProducts());

        }

        loadProducts();

    }, []);

    function handleSubmit(event) {

        event.preventDefault();

        const nextErrors = validateForm();

        const firstErrorField = FIELD_ORDER.find(field => nextErrors[field]);

        if (firstErrorField) {

            setShake(true);

            fieldRefs.current[firstErrorField]?.focus();

            return;

        }

        onSubmit(buildRecipePayload());

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
                className={`RecipeForm ${shake ? "shake" : ""}`}
                onSubmit={handleSubmit}
                onAnimationEnd={() => setShake(false)}
                noValidate
            >

                <label className="RecipeForm-Field">

                    <span>Nombre</span>

                    <input
                        ref={el => { fieldRefs.current.name = el; }}
                        type="text"
                        value={name}
                        onChange={event => setName(event.target.value)}
                        className={errors.name ? "invalid" : ""}
                        placeholder="Ej: Receta Tradicional"
                    />

                    {errors.name && (
                        <small className="RecipeForm-Error">{errors.name}</small>
                    )}

                </label>

                <label className="RecipeForm-Field">

                    <span>Producto asociado</span>

                    <select
                        ref={el => { fieldRefs.current.productId = el; }}
                        value={productId}
                        onChange={event => setProductId(event.target.value)}
                        className={errors.productId ? "invalid" : ""}
                    >
                        <option value="" disabled>Seleccionar producto...</option>
                        {products.map(product => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>

                    {errors.productId && (
                        <small className="RecipeForm-Error">{errors.productId}</small>
                    )}

                </label>

                <label className="RecipeForm-Field">

                    <span>Descripción (opcional)</span>

                    <textarea
                        value={description}
                        onChange={event => setDescription(event.target.value)}
                        placeholder="Observaciones sobre la receta"
                        rows={3}
                    />

                </label>

                <div
                    ref={el => { fieldRefs.current.ingredients = el; }}
                    className="RecipeForm-Ingredients"
                    tabIndex={-1}
                >

                    <RecipeIngredientPicker onSelectIngredient={addIngredient} />

                    <RecipeIngredientList
                        ingredients={ingredients}
                        onUpdateQuantity={updateIngredientQuantity}
                        onUpdateUnit={updateIngredientUnit}
                        onRemoveIngredient={removeIngredient}
                    />

                    {errors.ingredients && (
                        <small className="RecipeForm-Error">{errors.ingredients}</small>
                    )}

                </div>

                <div className="RecipeForm-Footer">

                    <button
                        type="button"
                        className="RecipeForm-Cancel"
                        onClick={handleCancelClick}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="RecipeForm-Submit"
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
