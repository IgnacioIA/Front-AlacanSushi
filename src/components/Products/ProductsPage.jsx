// src/components/Products/ProductsPage.jsx

import ProductsHeader from "./components/ProductsHeader/ProductsHeader";
import ProductsToolbar from "./components/ProductsToolbar/ProductsToolbar";
import ProductGrid from "./components/ProductGrid/ProductGrid";
import ProductForm from "./components/ProductForm/ProductForm";
import ProductDetails from "./components/ProductDetails/ProductDetails";
import ProduceProductForm from "./components/ProduceProductForm/ProduceProductForm";

import Modal from "../Modal/Modal";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";

import useProducts from "./hooks/useProducts";
import useProductFilters from "./hooks/useProductFilters";
import useProductsPanel from "./hooks/useProductsPanel";

import "./ProductsPage.css";

export default function ProductsPage() {

    const {

        loading,

        products,

        stats,

        createProduct,

        updateProduct,

        deleteProduct,

        produceProduct

    } = useProducts();

    const {

        searchTerm,

        setSearchTerm,

        stockFilter,

        setStockFilter,

        sortBy,

        setSortBy,

        filteredProducts

    } = useProductFilters(products);

    const {

        isFormOpen,

        editingProduct,

        formSessionId,

        openCreateForm,

        openEditForm,

        closeForm,

        viewingProduct,

        openDetails,

        closeDetails,

        deletingProduct,

        openDeleteConfirm,

        closeDeleteConfirm,

        producingProduct,

        produceSessionId,

        openProduceForm,

        closeProduceForm

    } = useProductsPanel();

    if (loading) {

        return (

            <section className="ProductsPage">

                <p>Cargando productos...</p>

            </section>

        );

    }

    async function handleSubmit(data) {

        if (editingProduct) {

            await updateProduct(editingProduct.id, data);

        } else {

            await createProduct(data);

        }

        closeForm();

    }

    async function handleConfirmDelete() {

        await deleteProduct(deletingProduct.id);

        closeDeleteConfirm();

    }

    async function handleProduceSubmit(data) {

        await produceProduct(producingProduct.id, data);

        closeProduceForm();

    }

    return (

        <section className="ProductsPage">

            <ProductsHeader
                stats={stats}
                onCreateProduct={openCreateForm}
            />

            <ProductsToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                stockFilter={stockFilter}
                onStockFilterChange={setStockFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onCreateProduct={openCreateForm}
            />

            <ProductGrid
                products={filteredProducts}
                onAddNew={openCreateForm}
                onOpenDetails={openDetails}
                onEdit={openEditForm}
                onDelete={openDeleteConfirm}
                onProduce={openProduceForm}
            />

            <Modal
                isOpen={isFormOpen}
                onClose={closeForm}
                title={editingProduct ? `Editar ${editingProduct.name}` : "Nuevo producto"}
            >

                <ProductForm
                    key={formSessionId}
                    initialData={editingProduct}
                    onCancel={closeForm}
                    onSubmit={handleSubmit}
                />

            </Modal>

            <Modal
                isOpen={!!viewingProduct}
                onClose={closeDetails}
                title={viewingProduct?.name ?? ""}
            >

                {viewingProduct && <ProductDetails product={viewingProduct} />}

            </Modal>

            <Modal
                isOpen={!!producingProduct}
                onClose={closeProduceForm}
                title={producingProduct ? `Producir ${producingProduct.name}` : ""}
            >

                {producingProduct && (

                    <ProduceProductForm
                        key={produceSessionId}
                        product={producingProduct}
                        onCancel={closeProduceForm}
                        onSubmit={handleProduceSubmit}
                    />

                )}

            </Modal>

            <ConfirmDialog
                isOpen={!!deletingProduct}
                title="Eliminar producto"
                message={`¿Seguro que querés eliminar "${deletingProduct?.name}"?`}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                variant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteConfirm}
            />

        </section>

    );

}
