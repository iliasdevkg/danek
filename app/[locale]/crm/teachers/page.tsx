import { notFound } from "next/navigation";
import { Users } from "lucide-react";

import { VisibilityToggle } from "@/components/crm/teachers/visibility-toggle";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth/session";
import { getCrmTeachers } from "@/lib/crm/teachers-data";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function CrmTeachersPage({ params }: PageProps<"/[locale]/crm/teachers">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await requireRole(locale, "admin", "manager");
  const t = await getDictionary(locale);
  const teachers = await getCrmTeachers(locale);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-h1 text-ink">{t.crm.teachers.title}</h1>
        <p className="text-small text-ink-muted mt-1">{t.crm.teachers.lead}</p>
      </div>

      {teachers.length === 0 ? (
        <EmptyState
          icon={<Users className="size-7" />}
          title={t.crm.teachers.title}
          description={t.crm.teachers.empty}
        />
      ) : (
        <div className="border-rule bg-paper-raised overflow-x-auto rounded-md border">
          <table className="text-small w-full text-left">
            <thead>
              <tr className="border-rule text-caption text-ink-faint border-b">
                <th className="px-4 py-3 font-medium">{t.crm.teachers.table.name}</th>
                <th className="px-4 py-3 font-medium">{t.crm.teachers.table.position}</th>
                <th className="px-4 py-3 font-medium">{t.crm.teachers.table.subjects}</th>
                <th className="px-4 py-3 font-medium">{t.crm.teachers.table.visibility}</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="border-rule hover:bg-paper-sunken border-b last:border-b-0"
                >
                  <td className="text-ink px-4 py-3 font-medium">{teacher.fullName}</td>
                  <td className="text-ink-muted px-4 py-3">{teacher.position}</td>
                  <td className="text-ink-muted px-4 py-3">{teacher.subjects.join(", ") || "—"}</td>
                  <td className="px-4 py-3">
                    <VisibilityToggle
                      locale={locale}
                      t={t}
                      teacherId={teacher.id}
                      isPublic={teacher.isPublic}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
