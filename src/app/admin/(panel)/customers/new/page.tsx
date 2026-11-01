import CustomerForm from "@/components/admin/CustomerForm"; import { createCustomer } from "@/app/admin/(panel)/commercial-actions";
export default function New() { return <><h1 className="mb-6">New customer</h1><CustomerForm action={createCustomer} c={{ company: "", name: "", email: "", phone: "", country: "", address: "", taxId: "" }} /></>; }
