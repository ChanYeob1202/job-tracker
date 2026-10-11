// Monogram square for a company. Colour is derived from the name, so the same
// company always gets the same colour — in the table and the follow-up cards.
const AVATAR_COLORS = [
  "bg-brand-100 text-brand-700",
  "bg-accent-200 text-accent-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-lime-100 text-lime-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
};

function CompanyAvatar({ company, size = "md" }: { company: string; size?: keyof typeof SIZES }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg font-bold ${SIZES[size]} ${avatarColor(company)}`}
    >
      {company.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

export default CompanyAvatar;
