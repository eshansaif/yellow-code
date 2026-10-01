import Badge from "@/components/admin/Badge";
import SubmitButton from "@/components/admin/SubmitButton";
import SearchSelect from "@/components/SearchSelect";
import { db } from "@/lib/db";
import { saveProduct, setStatus } from "../actions";
import Link from "next/link";
export default async function P() {
  const [ps, cs] = await Promise.all([
    db.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <>
      <h1 className="text-3xl font-bold">Products</h1>
      <form action={saveProduct} className="mt-6 flex flex-wrap gap-2">
        <input
          name="name"
          required
          placeholder="Product name"
          className="rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink"
        />
        <SearchSelect
          name="categoryId"
          required
          options={cs.map((c) => ({ value: c.id, label: c.name }))}
        />
        <input
          name="shortDescription"
          placeholder="Short description"
          className="flex-1 rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink"
        />
        <SubmitButton className="rounded-full bg-ink text-paper px-4">
          Create draft
        </SubmitButton>
      </form>
      <table className="mt-6 w-full text-sm">
        <tbody>
          {ps.map((p) => (
            <tr key={p.id} className="border-t border-line">
              <td className="py-2">
                <Link className="underline" href={`/admin/products/${p.id}`}>
                  {p.name}
                </Link>
              </td>
              <td>{p.category.name}</td>
              <td>
                <Badge s={p.status} />
              </td>
              <td>
                <form
                  action={setStatus.bind(
                    null,
                    "product",
                    p.id,
                    p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                  )}
                >
                  <SubmitButton className="underline">
                    {p.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                  </SubmitButton>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
