import { ExternalLink } from "lucide-react";
import type { Contact } from "@/domain/content/schema";
import { GitHubIcon, LinkedInIcon, YouTubeIcon } from "@/components/icons/brand";

/** External profile links. `rel="noopener noreferrer"` prevents reverse tabnabbing. */
export function SocialLinks({ contact, size = 18, withLabels = false }: { contact: Contact; size?: number; withLabels?: boolean }) {
  const links = [
    contact.linkedin && { href: contact.linkedin, label: "LinkedIn", icon: <LinkedInIcon size={size} /> },
    contact.github && { href: contact.github, label: "GitHub", icon: <GitHubIcon size={size} /> },
    contact.youtube && { href: contact.youtube, label: "YouTube", icon: <YouTubeIcon size={size} /> },
    ...contact.otherLinks.map((link) => ({ href: link.url, label: link.label, icon: <ExternalLink size={size} aria-hidden="true" /> })),
  ].filter((link): link is { href: string; label: string; icon: React.ReactElement } => Boolean(link));

  return (
    <ul className={withLabels ? "grid gap-2" : "flex items-center gap-1"}>
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer me"
            aria-label={withLabels ? undefined : link.label}
            title={withLabels ? undefined : link.label}
            className={
              withLabels
                ? "group flex items-center gap-3 rounded-xl px-1 py-1.5 text-muted transition-colors hover:text-ink"
                : "grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            }
          >
            {link.icon}
            {withLabels ? <span className="link-underline">{link.label}</span> : null}
          </a>
        </li>
      ))}
    </ul>
  );
}
