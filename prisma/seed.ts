import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
// Categories come from the product areas listed on yellowcodebd.com. Descriptions are neutral; edit in admin.
const cats: [string, string, string[]][] = [
  ["Woven Labels","Woven main, care and size labels for garments.",["Damask Woven Label","Satin Woven Label","Taffeta Woven Label"]],
  ["Printed Labels","Printed labels for garment branding and care information.",["Printed Care Label","Printed Main Label"]],
  ["Heat Transfer Labels","Labels applied by heat for tagless, soft-feel finishes.",["Heat Transfer Label"]],
  ["Hang Tags","Hang tags for presenting brand and product details.",["Custom Hang Tag"]],
  ["PVC / Silicone Patches","PVC, silicone and rubber labels and patches.",["PVC Label","Silicone Patch","Rubber Patch"]],
  ["Leather & Faux Leather","Leather and faux leather labels and patches.",["Leather Patch","Faux Leather Label"]],
  ["Metal Labels & Tags","Metal patches and tags.",["Metal Tag","Metal Patch"]],
  ["Woven Zipper Pulls","Woven pulls for zippers.",["Woven Zipper Pull"]],
  ["Custom Trims","Other trims made to your specification.",["Custom Trim"]],
];
const slug = (s: string) => s.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
import bcrypt from "bcryptjs";
async function main() {
  const em = process.env.ADMIN_EMAIL, pw = process.env.ADMIN_PASSWORD;
  if (em && pw) await db.adminUser.upsert({ where:{email:em.toLowerCase()}, update:{}, create:{ email:em.toLowerCase(), name:"Admin", role:"ADMIN", passwordHash: await bcrypt.hash(pw,12) }});
  let i = 0;
  for (const [name, description, products] of cats) {
    const c = await db.category.upsert({ where:{slug:slug(name)}, update:{}, create:{ slug:slug(name), name, description, status:"PUBLISHED", sortOrder:i++ }});
    for (const p of products) await db.product.upsert({ where:{categoryId_slug:{categoryId:c.id, slug:slug(p)}}, update:{}, create:{
      slug:slug(p), name:p, categoryId:c.id, status:"PUBLISHED", shortDescription:`${p} made to your artwork and specification.`,
      applications:{ create:[{name:"Apparel"}] },
      options:{ create:[{name:"Size",values:["Custom"]},{name:"Colour",values:["Custom"]}] }}});
  }

  const ph = (t: string) => `Placeholder: ${t} Replace this text in Admin > Pages.`;
  const pages: Record<string, unknown> = {
    about: { title: "About Yellow Code Trims", intro: ph("Short company introduction."), sections: [
      { heading: "Our story", body: ph("Company history.") }, { heading: "Mission", body: ph("Mission statement.") }, { heading: "Vision", body: ph("Vision statement.") },
      { heading: "Values", body: ph("Company values.") }, { heading: "Team", body: ph("Team overview.") }, { heading: "Facilities", body: ph("Factory and facilities.") }] },
    capabilities: { title: "Capabilities", intro: ph("Overview of manufacturing capability."), sections: ["Design and digitization","Sampling","Material selection","Customization","Manufacturing","Quality control","Finishing and packaging","Delivery"].map(h => ({ heading: h, body: ph(`Describe ${h.toLowerCase()}.`) })) },
    sustainability: { title: "Sustainability", intro: ph("Our approach. Publish only claims you can verify."), sections: ["Materials","Responsible production","Waste reduction","Sustainable options","Future goals"].map(h => ({ heading: h, body: ph(`Describe ${h.toLowerCase()}.`) })) },
  };
  for (const [key, data] of Object.entries(pages)) await db.pageContent.upsert({ where: { key }, update: {}, create: { key, data: data as never } });
  await db.siteSetting.upsert({ where: { key: "contact" }, update: {}, create: { key: "contact", value: { office: "Placeholder: office address", factory: "Placeholder: factory address", phone: "Placeholder: phone", email: "Placeholder: email", hours: "Placeholder: business hours" } } });
  const steps = ["Tell us what you need","Share artwork and specifications","Quotation","Digital proof","Sample approval","Production","Quality inspection","Delivery"];
  if (!(await db.processStep.count())) await db.processStep.createMany({ data: steps.map((title,n)=>({kind:"order",title,sortOrder:n})) });
}
main().finally(()=>db.$disconnect());
