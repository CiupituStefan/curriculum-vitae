import { Link, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/stylesheet";
import type { PdfEntry } from "../model";

export type Theme = {
  ink: string;
  muted: string;
  accent: string;
  rule: string;
  heading: string;
  body: string;
};

export const MODERN: Theme = {
  ink: "#16171b",
  muted: "#5d6068",
  accent: "#a8582c",
  rule: "#e3ded6",
  heading: "Fraunces",
  body: "Inter",
};

export const PRINT: Theme = {
  ink: "#000000",
  muted: "#3a3a3a",
  accent: "#000000",
  rule: "#9a9a9a",
  heading: "Fraunces",
  body: "Inter",
};

export function PageFooter({ theme, left }: { theme: Theme; left: string }) {
  return (
    <View
      fixed
      style={{
        position: "absolute",
        bottom: 22,
        left: 46,
        right: 46,
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize: 7.5,
        color: theme.muted,
        fontFamily: theme.body,
      }}
    >
      <Text>{left}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

export function SectionTitle({ theme, children }: { theme: Theme; children: string }) {
  return (
    <View minPresenceAhead={60} style={{ marginTop: 14, marginBottom: 6 }}>
      <Text style={{ fontFamily: theme.heading, fontSize: 13, color: theme.ink }}>{children}</Text>
      <View style={{ marginTop: 4, height: 0.8, backgroundColor: theme.rule }} />
    </View>
  );
}

/** Timeline entry: period column on the left, details on the right. */
export function TimelineEntry({ theme, entry, labels }: { theme: Theme; entry: PdfEntry; labels?: { skills: string } }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 8 }}>
      <View style={{ width: 92, paddingRight: 8 }}>
        <Text style={{ fontSize: 8, color: theme.muted, lineHeight: 1.35 }}>{entry.period}</Text>
        {entry.location ? <Text style={{ fontSize: 7.5, color: theme.muted, marginTop: 2 }}>{entry.location}</Text> : null}
      </View>
      <View style={{ flex: 1 }}>
        <View wrap={false}>
          <Text style={{ fontSize: 10, fontWeight: 600, color: theme.ink }}>{entry.title}</Text>
          {entry.organization ? (
            <Text style={{ fontSize: 9, color: theme.accent, marginTop: 1 }}>{entry.organization}</Text>
          ) : null}
        </View>
        {entry.summary ? <Text style={styles(theme).paragraph}>{entry.summary}</Text> : null}
        {entry.bullets.map((bullet, index) => (
          <Bullet key={index} theme={theme}>
            {bullet}
          </Bullet>
        ))}
        {labels && entry.tags.length > 0 ? (
          <Text style={{ fontSize: 7.8, color: theme.muted, marginTop: 3, lineHeight: 1.4 }}>
            {labels.skills}: {entry.tags.join(" · ")}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function Bullet({ theme, children }: { theme: Theme; children: string }) {
  return (
    <View wrap={false} style={{ flexDirection: "row", marginTop: 2.5 }}>
      <Text style={{ width: 9, fontSize: 9, color: theme.accent }}>•</Text>
      <Text style={{ flex: 1, fontSize: 8.8, lineHeight: 1.45, color: theme.ink }}>{children}</Text>
    </View>
  );
}

export function ContactRow({ theme, items }: { theme: Theme; items: { label: string; value: string; href?: string }[] }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
      {items.map((item) => (
        <View key={item.label} style={{ flexDirection: "row", marginRight: 12, marginBottom: 3 }}>
          <Text style={{ fontSize: 8, color: theme.muted }}>{item.label}: </Text>
          {item.href ? (
            <Link src={item.href} style={{ fontSize: 8, color: theme.ink, textDecoration: "none" }}>
              {item.value}
            </Link>
          ) : (
            <Text style={{ fontSize: 8, color: theme.ink }}>{item.value}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

export const styles = (theme: Theme) => ({
  paragraph: { fontSize: 8.8, lineHeight: 1.5, color: theme.ink, marginTop: 3 } satisfies Style,
});
