import "./PanelHeader.css";

export default function PanelHeader({ onCreateOrder }) {

    return (

        <header className="PanelHeader">

            <h1>

                <span className="PanelHeader-Black">
                    Panel
                </span>

                {" "}

                <span className="PanelHeader-Orange">
                    Alacan
                </span>

            </h1>

            <button
                type="button"
                className="PanelHeader-CreateButton"
                onClick={onCreateOrder}
            >
                + Nuevo pedido
            </button>

        </header>

    );

}