import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          <Link to="/">Home</Link>
        </nav>
        <div className="flex items-center gap-2"></div>
      </div>
      <hr />
    </div>
  );
}
