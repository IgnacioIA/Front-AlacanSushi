// src/components/Ingredients/hooks/useMeasurementUnits.js
//
// Consume el catálogo compartido de Unidades de Medida (ver
// src/services/catalogs/measurementUnitService.js). El service ya memoiza
// la respuesta a nivel de módulo; este hook sólo expone el estado de React
// para un componente. Único consumidor previsto por ahora: IngredientForm
// (Etapa 3) — si Productos/Recetas necesitan lo mismo más adelante, recién
// ahí se justifica promoverlo a un hook compartido (no antes).

import { useEffect, useState } from "react";

import measurementUnitService from "../../../services/catalogs/measurementUnitService";

export default function useMeasurementUnits() {

    const [units, setUnits] = useState([]);

    useEffect(() => {

        async function loadUnits() {

            const data = await measurementUnitService.getMeasurementUnits();

            setUnits(data);

        }

        loadUnits();

    }, []);

    return units;

}
