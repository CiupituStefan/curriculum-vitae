/* eslint-disable jsx-a11y/alt-text -- react-pdf <Image> renders into a PDF and has no alt attribute */
import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import type { PdfModel } from "../model";
import { Bullet, ContactRow, MODERN, PRINT, PageFooter, SectionTitle, TimelineEntry, type Theme } from "./shared";

type Props = { model: PdfModel; photo?: Buffer | null; variant: "modern" | "print" };

/** "Modern" and "Print" CVs share one layout; Print swaps in a monochrome theme and wider margins. */
export function ModernCv({ model, photo, variant }: Props) {
  const theme: Theme = variant === "print" ? PRINT : MODERN;
  const L = model.labels;
  const padding = variant === "print" ? 56 : 46;

  return (
    <Document title={`${model.name} — CV`} author={model.name} subject={model.headline} language={model.locale} creator={model.siteUrl} producer={model.siteUrl}>
      <Page size="A4" style={{ fontFamily: theme.body, color: theme.ink, paddingTop: padding - 6, paddingBottom: 54, paddingHorizontal: padding }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: theme.heading, fontSize: 25, letterSpacing: -0.3 }}>{model.name}</Text>
            <Text style={{ fontSize: 10.5, color: theme.accent, marginTop: 4 }}>{model.headline}</Text>
          </View>
          {photo && variant === "modern" ? (
            <Image src={photo} style={{ width: 62, height: 62, borderRadius: 31, marginLeft: 16 }} />
          ) : null}
        </View>
        <ContactRow theme={theme} items={model.contact} />
        <View style={{ height: 1.2, backgroundColor: theme.accent, marginTop: 8, width: 48 }} />

        <SectionTitle theme={theme}>{L.sections.profile}</SectionTitle>
        <Text style={{ fontSize: 9.2, lineHeight: 1.55 }}>{model.summary}</Text>

        <SectionTitle theme={theme}>{L.sections.experience}</SectionTitle>
        {model.experience.map((entry, index) => (
          <TimelineEntry key={index} theme={theme} entry={entry} labels={{ skills: L.skillsUsed }} />
        ))}

        <SectionTitle theme={theme}>{L.sections.education}</SectionTitle>
        {model.education.map((entry, index) => (
          <TimelineEntry key={index} theme={theme} entry={entry} />
        ))}

        <SectionTitle theme={theme}>{L.sections.skills}</SectionTitle>
        {model.skills.map((group) => (
          <View key={group.group} style={{ flexDirection: "row", marginBottom: 5 }} wrap={false}>
            <Text style={{ width: 92, paddingRight: 8, fontSize: 8.5, fontWeight: 600 }}>{group.group}</Text>
            <Text style={{ flex: 1, fontSize: 8.6, lineHeight: 1.5 }}>{group.items.join("  ·  ")}</Text>
          </View>
        ))}

        <SectionTitle theme={theme}>{L.sections.personalSkills}</SectionTitle>
        <Text style={{ fontSize: 8.8, lineHeight: 1.5 }}>{model.personalSkills.join("  ·  ")}</Text>

        <SectionTitle theme={theme}>{L.sections.languages}</SectionTitle>
        {model.languages.map((language) => (
          <View key={language.name} style={{ flexDirection: "row", marginBottom: 3 }} wrap={false}>
            <Text style={{ width: 92, paddingRight: 8, fontSize: 8.8, fontWeight: 600 }}>{language.name}</Text>
            <Text style={{ flex: 1, fontSize: 8.6, color: theme.muted }}>
              {language.native
                ? L.native
                : language.levels.map((level) => `${level.label} ${level.value}`).join("  ·  ")}
            </Text>
          </View>
        ))}

        <SectionTitle theme={theme}>{L.sections.certifications}</SectionTitle>
        {model.certifications.map((group) => (
          <View key={group.group} style={{ flexDirection: "row", marginBottom: 5 }} wrap={false}>
            <Text style={{ width: 92, paddingRight: 8, fontSize: 8.5, fontWeight: 600 }}>
              {group.group} ({group.items.length})
            </Text>
            <Text style={{ flex: 1, fontSize: 8.4, lineHeight: 1.5 }}>{group.items.join("  ·  ")}</Text>
          </View>
        ))}

        {model.courses.length > 0 ? <SectionTitle theme={theme}>{L.sections.courses}</SectionTitle> : null}
        {model.courses.map((entry, index) => (
          <TimelineEntry key={index} theme={theme} entry={entry} />
        ))}

        {model.projects.length + model.otherProjects.length > 0 ? <SectionTitle theme={theme}>{L.sections.projects}</SectionTitle> : null}
        {model.projects.map((project) => (
          <View key={project.title} style={{ marginBottom: 5 }} wrap={false}>
            <Text style={{ fontSize: 9, fontWeight: 600 }}>
              {project.title} <Text style={{ fontWeight: 400, color: theme.muted }}>· {project.year}</Text>
            </Text>
            <Text style={{ fontSize: 8.5, lineHeight: 1.45, marginTop: 1 }}>{project.summary}</Text>
          </View>
        ))}

        {model.otherProjects.length > 0 ? (
          <Text style={{ fontSize: 8.5, lineHeight: 1.5, marginTop: 2 }}>
            <Text style={{ fontWeight: 600 }}>{model.locale === "ro" ? "Alte proiecte: " : "Other projects: "}</Text>
            {model.otherProjects.join(" · ")}
          </Text>
        ) : null}

        {model.volunteering.length > 0 ? <SectionTitle theme={theme}>{L.sections.volunteering}</SectionTitle> : null}
        {model.volunteering.map((entry, index) => (
          <TimelineEntry key={index} theme={theme} entry={entry} />
        ))}

        {model.awards.length > 0 ? <SectionTitle theme={theme}>{L.sections.awards}</SectionTitle> : null}
        {model.awards.map((entry, index) => (
          <TimelineEntry key={index} theme={theme} entry={entry} />
        ))}

        {model.otherInfo.length > 0 ? <SectionTitle theme={theme}>{L.sections.otherInfo}</SectionTitle> : null}
        {model.otherInfo.map((info) => (
          <Bullet key={info.title} theme={theme}>{`${info.title}: ${info.description}`}</Bullet>
        ))}

        <PageFooter theme={theme} left={`${model.name} · ${model.siteUrl.replace(/^https?:\/\//, "")}`} />
      </Page>
    </Document>
  );
}
