import ItemsDemo from "@/components/items/ItemsDemo";
import { itemsMock } from "@/mocks/items.mock";

export default function ItemsPage() {
    return (
        <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-6 text-2xl font-bold text-usco-ink">
            Objetos (demo de modales)
        </h1>
        <ItemsDemo items={itemsMock} />
        </main>
    );
}