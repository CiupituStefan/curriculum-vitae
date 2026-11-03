import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { PdfEntry, PdfModel } from "../model";

/*
 * ATS-optimised CV: single column, standard section headings, no images, no tables, no columns,
 * no icons, real text only. Dates sit on the same line as the role so parsers associate them.
 */
const s = {
  page: { fontFamily: "Inter", fontSize: 10, lineHeight: 1.45, color: "#000000", paddingTop: 44, paddingBottom: 44, paddingHorizontal: 50 },
  h1: { fontSize: 18, fontWeight: 700 },
  h2: { fontSize: 11, fontWeight: 700, marginTop: 12, marginBottom: 4, textTransform: "uppercase" as const },
  role: { fontSize: 10, fontWeight: 700 },
  meta: { fontSize: 9.5 },
  text: { fontSize: 9.5 },
};

function Entry({ entry }: { entry: PdfEntry }) {
  return (
    <View style={{ marginBottom: 7 }}>
      <Text style={s.role}>
        {entry.title}
        {entry.organization ? ` | ${entry.organization}` : ""}
      </Text>
      <Text style={s.meta}>{[entry.period, entry.location].filter(Boolean).join(" | ")}</Text>
      {entry.summary ? <Text style={s.text}>{entry.summary}</Text> : null}
      {entry.bullets.map((bullet, index) => (
        <Text key={index} style={s.text}>
          - {bullet}
        </Text>
      ))}
      {entry.tags.length > 0 ? <Text style={s.text}>{entry.tags.join(", ")}</Text> : null}
    </View>
  );
}

export function AtsCv({ model }: { model: PdfModel }) {
  const L = model.labels.sections;
  return (
    <Document title={`${model.name} — CV`} author={model.name} subject={model.headline} language={model.locale} creator={model.siteUrl} producer={model.siteUrl}>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>{model.name}</Text>
        <Text style={s.text}>{model.headline}</Text>
        {model.contact.map((item) => (
          <Text key={item.label} style={s.text}>
            {item.label}: {item.href?.startsWith("http") ? item.href : item.value}
          </Text>
        ))}

        <Text style={s.h2}>{L.profile}</Text>
        <Text style={s.text}>{model.summary}</Text>

        <Text style={s.h2}>{L.experience}</Text>
        {model.experience.map((entry, index) => (
          <Entry key={index} entry={entry} />
        ))}

        <Text style={s.h2}>{L.education}</Text>
        {model.education.map((entry, index) => (
          <Entry key={index} entry={entry} />
        ))}

        <Text style={s.h2}>{L.skills}</Text>
        {model.skills.map((group) => (
          <Text key={group.group} style={s.text}>
            {group.group}: {group.items.join(", ")}
          </Text>
        ))}

        <Text style={s.h2}>{L.personalSkills}</Text>
        <Text style={s.text}>{model.personalSkills.join(", ")}</Text>

        <Text style={s.h2}>{L.languages}</Text>
        {model.languages.map((language) => (
          <Text key={language.name} style={s.text}>
            {language.name}: {language.native ? model.labels.native : [...new Set(language.levels.map((level) => level.value).filter(Boolean))].join(" / ")}
          </Text>
        ))}

        <Text style={s.h2}>{L.certifications}</Text>
        {model.certifications.map((group) => (
          <Text key={group.group} style={s.text}>
            {group.group}: {group.items.join(", ")}
          </Text>
        ))}

        {model.courses.length > 0 ? <Text style={s.h2}>{L.courses}</Text> : null}
        {model.courses.map((entry, index) => (
          <Entry key={index} entry={entry} />
        ))}

        {model.projects.length + model.otherProjects.length > 0 ? <Text style={s.h2}>{L.projects}</Text> : null}
        {model.projects.map((project) => (
          <View key={project.title} style={{ marginBottom: 5 }}>
            <Text style={s.role}>
              {project.title} | {project.year}
            </Text>
            <Text style={s.text}>{project.summary}</Text>
          </View>
        ))}

        {model.otherProjects.length > 0 ? (
          <Text style={s.text}>
            {model.locale === "ro" ? "Alte proiecte" : "Other projects"}: {model.otherProjects.join(", ")}
          </Text>
        ) : null}

        {model.volunteering.length > 0 ? <Text style={s.h2}>{L.volunteering}</Text> : null}
        {model.volunteering.map((entry, index) => (
          <Entry key={index} entry={entry} />
        ))}

        {model.awards.length > 0 ? <Text style={s.h2}>{L.awards}</Text> : null}
        {model.awards.map((entry, index) => (
          <Entry key={index} entry={entry} />
        ))}

        {model.otherInfo.length > 0 ? <Text style={s.h2}>{L.otherInfo}</Text> : null}
        {model.otherInfo.map((info) => (
          <Text key={info.title} style={s.text}>
            {info.title}: {info.description}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
