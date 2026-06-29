import "../../styles/ActionButton.css";

export default function ActionButton({

    label,

    variant,

    onClick

}) {

    return (

        <button

            className={`ActionButton ${variant}`}

            onClick={onClick}

            type="button"

        >

            {label}

        </button>

    );

}