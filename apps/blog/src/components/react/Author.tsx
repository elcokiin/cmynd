import { Avatar, AvatarImage, AvatarFallback } from "@elcokiin/ui/avatar";

type AuthorProps = {
  name: string;
  avatarUrl?: string;
  date: string;
  minDuration?: string;
  isDark: boolean;
};

export default function Author({
  name,
  avatarUrl,
  date,
  minDuration,
  isDark,
}: AuthorProps) {
  const authorColor = isDark ? "text-gray-100" : "text-[#0a192f]";
  const authorSubColor = isDark ? "text-gray-400" : "text-[#0a192f]/60";

  return (
    <div className="flex items-center gap-3 mt-4">
      <Avatar>
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className={`text-sm font-bold uppercase ${authorColor}`}>
          {name}
        </span>
        <span className={`text-xs ${authorSubColor}`}>
          {date}{minDuration ? ` \u2022 ${minDuration} min de lectura` : ""}
        </span>
      </div>
    </div>
  );
}
