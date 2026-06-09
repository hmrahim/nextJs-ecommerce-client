
import ProductFormPage from '@/components/admin/products/ProductFormPage';

export const metadata = { title: 'Edit Product — Moom24 Admin' };

export default function EditProductPage({ params }) {
  return <ProductFormPage mode="edit" productId={params.id} />;
}
