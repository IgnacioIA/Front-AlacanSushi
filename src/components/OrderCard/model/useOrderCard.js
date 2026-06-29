// src/components/OrderCard/model/useOrderCard.js

import { useCallback, useState } from "react";

export default function useOrderCard() {

    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = useCallback(() => {

        setExpanded(previous => !previous);

    }, []);

    return {

        expanded,

        toggleExpanded

    };

}