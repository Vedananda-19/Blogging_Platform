import { NavLink } from "react-router-dom";
import {
    LuNewspaper,
    LuFileText,
    LuThumbsUp,
    LuBookmark,
    LuSquarePen,
    LuUser,
} from "react-icons/lu";
import type { IconType } from "react-icons";

type Item = { to: string; label: string; icon: IconType; end?: boolean };

const TOP: Item[] = [
    { to: "/blogs", label: "View Blogs", icon: LuNewspaper },
    { to: "/profile/blogs", label: "Your Blogs", icon: LuFileText },
    { to: "/profile/liked", label: "Liked Blogs", icon: LuThumbsUp },
    { to: "/profile/saved", label: "Saved Blogs", icon: LuBookmark },
    { to: "/create", label: "Create", icon: LuSquarePen },
];

const link = ({ to, label, icon: Icon, end }: Item) => (
    <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
            `sidebarLink${isActive ? " active" : ""}`
        }
    >
        <Icon />
        <span>{label}</span>
    </NavLink>
);

const Sidebar = () => (
    <aside className="sidebar">
        <nav className="sidebarNav">{TOP.map(link)}</nav>
        <nav className="sidebarBottom">
            {link({ to: "/profile", label: "Profile", icon: LuUser })}
        </nav>
    </aside>
);

export default Sidebar;
