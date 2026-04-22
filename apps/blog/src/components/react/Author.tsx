import { Avatar, AvatarImage, AvatarFallback } from "@elcokiin/ui/avatar";
import type { PublicAuthor } from "@elcokiin/backend/lib/types/authors";

type AuthorProps = {
  author: PublicAuthor;
  date: string;
  minDuration: string;
  isDark: boolean;
};

export default function Author({ author, date, minDuration, isDark }: AuthorProps) {
  const authorColor = isDark ? "text-gray-100" : "text-[#0a192f]";
  const authorSubColor = isDark ? "text-gray-400" : "text-[#0a192f]/60";

  return (
    <div className="flex items-center gap-3 mt-4">
      <Avatar>
        {author.avatarUrl && (
          <AvatarImage src={author.avatarUrl} alt={author.name} />
        )}
        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className={`text-sm font-bold uppercase ${authorColor}`}>
          {author.name}
        </span>
        <span className={`text-xs ${authorSubColor}`}>
          {date} • {minDuration} min read
        </span>
      </div>
    </div>
  );
}
