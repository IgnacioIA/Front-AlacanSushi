// src/components/Products/hooks/useRecipes.js
//
// Catálogo de recetas para poblar selects (ProductForm, ProduceProductForm)
// y resolver el nombre de la receta activa en ProductDetails. Centraliza el
// acceso a recipeService para que ningún componente importe el mock
// directamente (mismo criterio que el resto del módulo: la UI no debe
// acoplarse a la forma interna del mock).

import { useEffect, useState } from "react";

import recipeService from "../services/recipeService";

export default function useRecipes() {

    const [recipes, setRecipes] = useState([]);

    useEffect(() => {

        async function loadRecipes() {

            const data = await recipeService.getRecipes();

            setRecipes(data);

        }

        loadRecipes();

    }, []);

    return recipes;

}
