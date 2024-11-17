import Link from "next/link";
import "@styles/NavBar.css";

interface NavLink {
    href: string;
    label: string;
}

const links: NavLink[] = [
    { href: '/', label: 'Project0' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
];

export default function NavBar() {
    return (
        <div className="navs">
            {links.map((link) => (
                <Link key={link.href} href={link.href}>{link.label}</Link>
            ))
            }
            < Link href="https://github.com/Caderk/project0/tree/develop" target="_blank" rel="noopener noreferrer">Github</Link>
        </div >
    );
}
