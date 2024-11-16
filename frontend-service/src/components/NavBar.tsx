import Link from "next/link";

import "@styles/NavBar.css";

interface NavLink {
    href: string;
    label: string;
}

const links: NavLink[] = 
    [
        {href: '/', label: 'Project0'},
        {href: '/about', label: 'Abouts'},
        {href: '/contact', label: 'Contact'}
    ]

export default function NavBar() {
    return (
        <div className="navs">
            {links.map((links) => 
            <Link href={links.href}>{links.label}</Link>
            )}
        </div>
    )
}